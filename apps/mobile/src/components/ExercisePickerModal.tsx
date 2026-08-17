import { useState } from "react";
import { ActivityIndicator, FlatList, Modal, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { IconButton, Stack, Surface, Text, TextField, useTheme } from "@tfit/ui";
import { useExercises, type ExerciseListItem } from "@/hooks/useExercises";

const MUSCLE_OPTIONS = [
  { value: undefined, label: "Todos" },
  { value: "chest", label: "Peito" },
  { value: "back", label: "Costas" },
  { value: "shoulders", label: "Ombros" },
  { value: "biceps", label: "Bíceps" },
  { value: "triceps", label: "Tríceps" },
  { value: "quadriceps", label: "Quadríceps" },
  { value: "hamstrings", label: "Posterior" },
  { value: "glutes", label: "Glúteos" },
  { value: "calves", label: "Panturrilha" },
  { value: "abs", label: "Abdômen" },
  { value: "cardio", label: "Cardio" },
] as const;

export function ExercisePickerModal({
  visible,
  onClose,
  onSelect,
}: {
  visible: boolean;
  onClose: () => void;
  onSelect: (exercise: ExerciseListItem) => void;
}) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [muscle, setMuscle] = useState<string | undefined>(undefined);
  const { data, isLoading } = useExercises(search, muscle);

  const openDetail = (exerciseId: string) => {
    onClose();
    router.push({ pathname: "/exercise/[id]", params: { id: exerciseId } });
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <Surface level="base" style={{ flex: 1, paddingTop: insets.top + theme.space.md, paddingHorizontal: theme.space.lg }}>
        <Stack gap="md" style={{ flex: 1 }}>
          <Stack direction="row" justify="space-between" align="center">
            <Text variant="title">Escolher exercício</Text>
            <Pressable onPress={onClose}>
              <Text style={{ color: theme.colors.accent.primary }}>Fechar</Text>
            </Pressable>
          </Stack>

          <TextField placeholder="Buscar exercício" value={search} onChangeText={setSearch} />

          <FlatList
            data={MUSCLE_OPTIONS}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item.label}
            contentContainerStyle={{ gap: theme.space.xs }}
            renderItem={({ item }) => (
              <Pressable
                onPress={() => setMuscle(item.value)}
                accessibilityRole="button"
                accessibilityState={{ selected: muscle === item.value }}
                style={{
                  paddingVertical: theme.space.xxs,
                  paddingHorizontal: theme.space.sm,
                  borderRadius: theme.radius.pill,
                  backgroundColor: muscle === item.value ? theme.colors.accent.primaryMuted : theme.colors.background.raised,
                  borderWidth: 1,
                  borderColor: muscle === item.value ? theme.colors.accent.primary : theme.colors.border.subtle,
                }}
              >
                <Text variant="caption">{item.label}</Text>
              </Pressable>
            )}
          />

          {isLoading ? (
            <ActivityIndicator />
          ) : (
            <FlatList
              data={data?.exercises ?? []}
              keyExtractor={(e) => e.id}
              contentContainerStyle={{ gap: theme.space.sm, paddingBottom: insets.bottom + theme.space.lg }}
              ListEmptyComponent={
                <Text color="secondary" style={{ textAlign: "center", marginTop: theme.space.lg }}>
                  Nenhum exercício encontrado.
                </Text>
              }
              renderItem={({ item }) => (
                <Pressable onPress={() => onSelect(item)}>
                  <Surface level="raised" style={{ padding: theme.space.sm }}>
                    <Stack direction="row" align="center" gap="sm">
                      <Stack style={{ flex: 1 }}>
                        <Text variant="bodyStrong">{item.name}</Text>
                        <Text variant="caption" color="secondary">
                          {item.primaryMuscle} · {item.equipment} · {item.level}
                        </Text>
                      </Stack>
                      <IconButton
                        icon={<Ionicons name="information-circle-outline" size={22} color={theme.colors.text.secondary} />}
                        accessibilityLabel={`Ver detalhes de ${item.name}`}
                        onPress={() => openDetail(item.id)}
                      />
                    </Stack>
                  </Surface>
                </Pressable>
              )}
            />
          )}
        </Stack>
      </Surface>
    </Modal>
  );
}
