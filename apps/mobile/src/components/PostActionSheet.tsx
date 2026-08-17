import { Alert, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { BottomSheet, Stack, Text, useTheme } from "@tfit/ui";

export interface PostActionSheetProps {
  visible: boolean;
  onClose: () => void;
  isOwnPost: boolean;
  onDelete?: () => void;
  onReport: () => void;
  onBlockAuthor?: () => void;
}

export function PostActionSheet({ visible, onClose, isOwnPost, onDelete, onReport, onBlockAuthor }: PostActionSheetProps) {
  const theme = useTheme();

  const run = (action: () => void) => {
    onClose();
    action();
  };

  const runWithConfirm = (title: string, message: string, confirmLabel: string, action: () => void) => {
    onClose();
    Alert.alert(title, message, [
      { text: "Cancelar", style: "cancel" },
      { text: confirmLabel, style: "destructive", onPress: action },
    ]);
  };

  return (
    <BottomSheet visible={visible} onClose={onClose}>
      <Stack gap="md">
        {isOwnPost ? (
          <Pressable
            onPress={() =>
              onDelete &&
              runWithConfirm("Excluir post?", "Essa ação não pode ser desfeita.", "Excluir", onDelete)
            }
            style={{ flexDirection: "row", alignItems: "center", gap: theme.space.sm }}
          >
            <Ionicons name="trash-outline" size={22} color={theme.colors.feedback.danger} />
            <Text variant="bodyStrong" style={{ color: theme.colors.feedback.danger }}>
              Excluir post
            </Text>
          </Pressable>
        ) : (
          <>
            <Pressable
              onPress={() => run(onReport)}
              style={{ flexDirection: "row", alignItems: "center", gap: theme.space.sm }}
            >
              <Ionicons name="flag-outline" size={22} color={theme.colors.text.primary} />
              <Text variant="bodyStrong">Denunciar</Text>
            </Pressable>
            {onBlockAuthor ? (
              <Pressable
                onPress={() =>
                  runWithConfirm(
                    "Bloquear usuário?",
                    "Vocês deixarão de se seguir e essa pessoa não poderá mais ver seu conteúdo.",
                    "Bloquear",
                    onBlockAuthor,
                  )
                }
                style={{ flexDirection: "row", alignItems: "center", gap: theme.space.sm }}
              >
                <Ionicons name="person-remove-outline" size={22} color={theme.colors.feedback.danger} />
                <Text variant="bodyStrong" style={{ color: theme.colors.feedback.danger }}>
                  Bloquear usuário
                </Text>
              </Pressable>
            ) : null}
          </>
        )}
      </Stack>
    </BottomSheet>
  );
}
