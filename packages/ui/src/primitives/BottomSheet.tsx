import type { ReactNode } from "react";
import { Modal, Pressable } from "react-native";
import { useTheme } from "../theme/ThemeProvider";
import { Surface } from "./Surface";

export interface BottomSheetProps {
  visible: boolean;
  onClose: () => void;
  children: ReactNode;
}

/**
 * Generic bottom sheet shell — consolidates what used to be a hand-rolled
 * Modal+backdrop+Surface pattern duplicated across QuickActionSheet,
 * PostActionSheet, and ReportModal into one component.
 */
export function BottomSheet({ visible, onClose, children }: BottomSheetProps) {
  const theme = useTheme();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable
        style={{ flex: 1, backgroundColor: theme.colors.overlay, justifyContent: "flex-end" }}
        onPress={onClose}
        accessibilityRole="button"
        accessibilityLabel="Fechar"
      >
        <Pressable onPress={(e) => e.stopPropagation()}>
          <Surface
            level="raised"
            style={{
              padding: theme.space.lg,
              borderTopLeftRadius: theme.radius.soft,
              borderTopRightRadius: theme.radius.soft,
              paddingBottom: theme.space.xl,
            }}
          >
            {children}
          </Surface>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
