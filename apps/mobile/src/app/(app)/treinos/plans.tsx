import { useState } from "react";
import { ActivityIndicator, FlatList, Modal, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Button, Stack, Surface, Text, TextField, useTheme } from "@tfit/ui";
import type { WorkoutPlanSummary } from "@tfit/types";
import { Screen } from "@/components/Screen";
import { useActivatePlan, useDuplicatePlan, useSharePlan, useWorkoutPlans } from "@/hooks/useWorkoutPlans";
import { ApiRequestError } from "@/lib/api";

const SOURCE_LABELS: Record<string, string> = {
  ai_generated: "Gerado por IA",
  manual: "Criado por você",
  copied: "Cópia",
  shared: "Recebido",
};

function ShareModal({ planId, onClose }: { planId: string | null; onClose: () => void }) {
  const theme = useTheme();
  const [handle, setHandle] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const sharePlan = useSharePlan();

  const onSend = () => {
    if (!planId || !handle.trim()) return;
    sharePlan.mutate(
      { planId, handle: handle.trim() },
      { onSuccess: (res) => setResult(`Enviado para @${res.sentTo}!`) },
    );
  };

  return (
    <Modal visible={planId !== null} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable
        style={{ flex: 1, backgroundColor: theme.colors.overlay, justifyContent: "center", padding: 24 }}
        onPress={onClose}
        accessibilityRole="button"
        accessibilityLabel="Fechar"
      >
        <Pressable onPress={(e) => e.stopPropagation()}>
          <Surface level="raised" style={{ padding: theme.space.lg, gap: theme.space.md }}>
            <Text variant="headline">Enviar treino</Text>
            {result ? (
              <Text color="secondary">{result}</Text>
            ) : (
              <>
                <TextField label="Nome de usuário (@handle)" autoCapitalize="none" value={handle} onChangeText={setHandle} />
                {sharePlan.isError ? (
                  <Text style={{ color: theme.colors.feedback.danger }}>
                    {sharePlan.error instanceof ApiRequestError ? sharePlan.error.message : "Não conseguimos enviar."}
                  </Text>
                ) : null}
                <Button label={sharePlan.isPending ? "Enviando..." : "Enviar"} onPress={onSend} disabled={sharePlan.isPending} />
              </>
            )}
          </Surface>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function PlanCard({ plan }: { plan: WorkoutPlanSummary }) {
  const theme = useTheme();
  const router = useRouter();
  const activatePlan = useActivatePlan();
  const duplicatePlan = useDuplicatePlan();
  const [sharingPlanId, setSharingPlanId] = useState<string | null>(null);

  return (
    <Surface level="raised" style={{ padding: theme.space.md, gap: theme.space.sm }}>
      <Pressable onPress={() => router.push(`/(app)/treinos/plan/${plan.id}`)}>
        <Stack direction="row" justify="space-between" align="center">
          <Stack>
            <Text variant="bodyStrong">{plan.splitName}</Text>
            <Text variant="caption" color="secondary">
              {SOURCE_LABELS[plan.source] ?? plan.source}
              {plan.sharedByHandle ? ` de @${plan.sharedByHandle}` : ""}
            </Text>
          </Stack>
          {plan.status === "active" ? (
            <Surface level="sunken" style={{ paddingHorizontal: theme.space.sm, paddingVertical: theme.space.xxs, borderRadius: theme.radius.pill }}>
              <Text variant="caption" style={{ color: theme.colors.accent.primary }}>
                Ativo
              </Text>
            </Surface>
          ) : null}
        </Stack>
      </Pressable>

      <Stack direction="row" gap="sm" style={{ flexWrap: "wrap" }}>
        {plan.status !== "active" ? (
          <Button label="Ativar" variant="secondary" onPress={() => activatePlan.mutate(plan.id)} disabled={activatePlan.isPending} />
        ) : null}
        <Button label="Duplicar" variant="secondary" onPress={() => duplicatePlan.mutate(plan.id)} disabled={duplicatePlan.isPending} />
        <Button label="Compartilhar" variant="secondary" onPress={() => setSharingPlanId(plan.id)} />
      </Stack>

      <ShareModal planId={sharingPlanId} onClose={() => setSharingPlanId(null)} />
      {activatePlan.isError ? (
        <Text style={{ color: theme.colors.feedback.danger }} variant="caption">
          Não foi possível ativar este plano.
        </Text>
      ) : null}
    </Surface>
  );
}

export default function WorkoutPlansScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { data, isLoading } = useWorkoutPlans();

  return (
    <Screen>
      <Stack gap="md" style={{ flex: 1, padding: 24 }}>
        <Stack direction="row" justify="space-between" align="center">
          <Text variant="title">Meus planos</Text>
          <Ionicons name="albums-outline" size={22} color={theme.colors.text.secondary} />
        </Stack>

        <Stack direction="row" gap="sm">
          <Stack style={{ flex: 1 }}>
            <Button label="Criar treino" onPress={() => router.push("/(app)/treinos/builder")} />
          </Stack>
          <Stack style={{ flex: 1 }}>
            <Button label="Gerar com IA" variant="secondary" onPress={() => router.push("/(app)/treinos")} />
          </Stack>
        </Stack>

        {isLoading ? (
          <ActivityIndicator />
        ) : (
          <FlatList
            data={data?.plans ?? []}
            keyExtractor={(p) => p.id}
            contentContainerStyle={{ gap: theme.space.sm }}
            ListEmptyComponent={
              <Text color="secondary" style={{ textAlign: "center", marginTop: theme.space.lg }}>
                Você ainda não tem planos salvos.
              </Text>
            }
            renderItem={({ item }) => <PlanCard plan={item} />}
          />
        )}
      </Stack>
    </Screen>
  );
}
