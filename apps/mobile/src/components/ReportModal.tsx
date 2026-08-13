import { useState } from "react";
import { BottomSheet, Button, Stack, Text, TextField } from "@tfit/ui";
import type { CreateReportInput } from "@tfit/validation";
import { Chip } from "./Chip";

const REASONS = ["Spam", "Conteúdo impróprio", "Assédio ou bullying", "Informação falsa", "Outro"];

export interface ReportModalProps {
  visible: boolean;
  onClose: () => void;
  targetType: CreateReportInput["targetType"];
  targetId: string;
  onSubmit: (input: CreateReportInput) => void;
  isSubmitting?: boolean;
}

export function ReportModal({ visible, onClose, targetType, targetId, onSubmit, isSubmitting }: ReportModalProps) {
  const [reason, setReason] = useState<string | null>(null);
  const [details, setDetails] = useState("");

  const handleClose = () => {
    setReason(null);
    setDetails("");
    onClose();
  };

  const handleSubmit = () => {
    if (!reason) return;
    onSubmit({ targetType, targetId, reason, details: details.trim() || undefined });
  };

  return (
    <BottomSheet visible={visible} onClose={handleClose}>
      <Stack gap="md">
        <Text variant="headline">Por que você está denunciando isso?</Text>
        <Stack direction="row" gap="xs" style={{ flexWrap: "wrap" }}>
          {REASONS.map((option) => (
            <Chip key={option} label={option} selected={reason === option} onPress={() => setReason(option)} />
          ))}
        </Stack>
        <TextField
          label="Detalhes (opcional)"
          placeholder="Conte mais sobre o que aconteceu"
          value={details}
          onChangeText={setDetails}
          multiline
          numberOfLines={3}
        />
        <Button label="Enviar denúncia" onPress={handleSubmit} disabled={!reason || isSubmitting} />
      </Stack>
    </BottomSheet>
  );
}
