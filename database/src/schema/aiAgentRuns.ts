import { pgTable, uuid, text, integer, boolean, jsonb, timestamp, index } from "drizzle-orm/pg-core";
import { users } from "./users";

/**
 * Generic observability log for every agent call (docs/AGENTS.md "Cost/
 * latency discipline"). Consolidates what the master spec lists as separate
 * `ai_recommendations`/`ai_workout_reviews` tables — split those back out
 * once a concrete feature needs to query them independently of raw call
 * logs (e.g. a "recommendations" feed). See docs/DATABASE.md.
 */
export const aiAgentRuns = pgTable(
  "ai_agent_runs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
    agentName: text("agent_name").notNull(),
    model: text("model").notNull(),
    input: jsonb("input").notNull(),
    output: jsonb("output"),
    inputTokens: integer("input_tokens"),
    outputTokens: integer("output_tokens"),
    latencyMs: integer("latency_ms").notNull(),
    success: boolean("success").notNull(),
    errorMessage: text("error_message"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("ai_agent_runs_agent_created_idx").on(table.agentName, table.createdAt)],
);

export type AiAgentRun = typeof aiAgentRuns.$inferSelect;
export type NewAiAgentRun = typeof aiAgentRuns.$inferInsert;
