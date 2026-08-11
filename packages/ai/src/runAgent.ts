import { generateText, Output } from "ai";
import type { z } from "zod";
import { getDb, aiAgentRuns } from "@tfit/database";
import { AGENT_MODELS, type AgentName } from "./models";

export class AgentRunError extends Error {
  agentName: AgentName;
  cause?: unknown;

  constructor(agentName: AgentName, message: string, cause?: unknown) {
    super(message);
    this.name = "AgentRunError";
    this.agentName = agentName;
    this.cause = cause;
  }
}

export interface RunAgentOptions<TOutput> {
  agentName: AgentName;
  system: string;
  prompt: string;
  // Pin only the Output type parameter — schemas using `.default()` have a
  // narrower Input type than Output, which otherwise breaks inference here.
  schema: z.ZodType<TOutput, z.ZodTypeDef, any>;
  /** Logged to ai_agent_runs for observability — pass whatever the caller sent the model. */
  input: unknown;
  userId?: string;
}

/**
 * The one place every agent call goes through: picks the assigned model,
 * enforces structured output, and logs cost/latency/outcome to
 * `ai_agent_runs` (docs/AGENTS.md "Cost/latency discipline"). Logging
 * failures never break the caller — observability is best-effort.
 */
export async function runAgent<TOutput>({
  agentName,
  system,
  prompt,
  schema,
  input,
  userId,
}: RunAgentOptions<TOutput>): Promise<TOutput> {
  const model = AGENT_MODELS[agentName];
  const db = getDb();
  const start = Date.now();

  try {
    const result = await generateText({
      model,
      system,
      prompt,
      output: Output.object({ schema }),
    });
    const latencyMs = Date.now() - start;

    void db
      .insert(aiAgentRuns)
      .values({
        userId: userId ?? null,
        agentName,
        model,
        input: input as object,
        output: result.output as object,
        inputTokens: result.usage?.inputTokens ?? null,
        outputTokens: result.usage?.outputTokens ?? null,
        latencyMs,
        success: true,
      })
      .catch(() => {});

    return result.output;
  } catch (error) {
    const latencyMs = Date.now() - start;

    void db
      .insert(aiAgentRuns)
      .values({
        userId: userId ?? null,
        agentName,
        model,
        input: input as object,
        latencyMs,
        success: false,
        errorMessage: error instanceof Error ? error.message : String(error),
      })
      .catch(() => {});

    throw new AgentRunError(agentName, `${agentName} failed to produce a valid result`, error);
  }
}
