import React from "react";
import { Modal, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Stack, Surface, Text, useTheme } from "@tfit/ui";

interface QuickAction {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  availableFrom: string;
}

const ACTIONS: QuickAction[] = [
  { icon: "barbell-outline", label: "Iniciar treino", availableFrom: "Fase 2" },
  { icon: "camera-outline", label: "Postar", availableFrom: "Fase 5" },
  { icon: "checkmark-circle-outline", label: "Check-in do dia", availableFrom: "Fase 3" },
];

export function QuickActionSheet({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const theme = useTheme();

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
                onPress={onClose}
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
                  <Text variant="caption" color="secondary">
                    Disponível na {action.availableFrom}
                  </Text>
                </Stack>
              </Pressable>
            ))}
          </Stack>
        </Surface>
      </Pressable>
    </Modal>
  );
}
