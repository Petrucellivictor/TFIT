import React from "react";
import { Modal, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Stack, Surface, Text, useTheme } from "@tfit/ui";

interface QuickAction {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  route?: string;
  availableFrom?: string;
}

const ACTIONS: QuickAction[] = [
  { icon: "barbell-outline", label: "Iniciar treino", route: "/(app)/treinos" },
  { icon: "checkmark-circle-outline", label: "Check-in do dia", route: "/checkin" },
  { icon: "camera-outline", label: "Postar", availableFrom: "Fase 5" },
];

export function QuickActionSheet({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const theme = useTheme();
  const router = useRouter();

  const onPressAction = (action: QuickAction) => {
    onClose();
    if (action.route) router.push(action.route as never);
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable
        style={{ flex: 1, backgroundColor: theme.colors.overlay, justifyContent: "flex-end" }}
        onPress={onClose}
      >
        <Surface
          level="raised"
          style={{
            padding: theme.space.lg,
            borderTopLeftRadius: theme.radius.soft,
            borderTopRightRadius: theme.radius.soft,
            paddingBottom: theme.space.xl,
          }}
        >
          <Stack gap="md">
            <Text variant="headline">O que você quer fazer?</Text>
            {ACTIONS.map((action) => (
              <Pressable
                key={action.label}
                onPress={() => onPressAction(action)}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: theme.space.sm,
                  paddingVertical: theme.space.sm,
                }}
              >
                <Ionicons name={action.icon} size={22} color={theme.colors.accent.primary} />
                <Stack style={{ flex: 1 }}>
                  <Text variant="bodyStrong">{action.label}</Text>
                  {action.availableFrom ? (
                    <Text variant="caption" color="secondary">
                      Disponível na {action.availableFrom}
                    </Text>
                  ) : null}
                </Stack>
              </Pressable>
            ))}
          </Stack>
        </Surface>
      </Pressable>
    </Modal>
  );
}
