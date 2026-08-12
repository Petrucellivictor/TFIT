import { useState } from "react";
import { ActivityIndicator, FlatList, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Button, Stack, Surface, Text, TextField, useTheme } from "@tfit/ui";
import type { MyProfessionalServiceItem } from "@tfit/types";
import { Screen } from "@/components/Screen";
import {
  useCreateService,
  useDeleteService,
  useMyServices,
  useReorderServices,
  useUpdateService,
} from "@/hooks/useProfessionals";
import { ApiRequestError } from "@/lib/api";

function AddServiceForm({ onDone }: { onDone: () => void }) {
  const theme = useTheme();
  const createService = useCreateService();
  const [title, setTitle] = useState("");
  const [priceLabel, setPriceLabel] = useState("");
  const [description, setDescription] = useState("");

  const onSave = () => {
    if (!title.trim()) return;
    createService.mutate(
      { title: title.trim(), priceLabel: priceLabel.trim() || undefined, description: description.trim() || undefined },
      { onSuccess: onDone },
    );
  };

  return (
    <Surface level="raised" style={{ padding: theme.space.md, gap: theme.space.sm }}>
      <TextField label="Nome do item" placeholder="Ex: Avaliação física" value={title} onChangeText={setTitle} />
      <TextField label="Preço (opcional)" placeholder="Ex: R$150 ou A combinar" value={priceLabel} onChangeText={setPriceLabel} />
      <TextField label="Descrição (opcional)" value={description} onChangeText={setDescription} multiline />
      {createService.isError ? (
        <Text style={{ color: theme.colors.feedback.danger }}>
          {createService.error instanceof ApiRequestError ? createService.error.message : "Não conseguimos salvar. Tente novamente."}
        </Text>
      ) : null}
      <Stack direction="row" gap="sm">
        <Stack style={{ flex: 1 }}>
          <Button label="Salvar" onPress={onSave} disabled={!title.trim() || createService.isPending} />
        </Stack>
        <Stack style={{ flex: 1 }}>
          <Button label="Cancelar" variant="secondary" onPress={onDone} />
        </Stack>
      </Stack>
    </Surface>
  );
}

function ServiceRow({
  service,
  isFirst,
  isLast,
  onMoveUp,
  onMoveDown,
}: {
  service: MyProfessionalServiceItem;
  isFirst: boolean;
  isLast: boolean;
  onMoveUp: () => void;
  onMoveDown: () => void;
}) {
  const theme = useTheme();
  const updateService = useUpdateService();
  const deleteService = useDeleteService();

  return (
    <Surface level="raised" style={{ padding: theme.space.md, gap: theme.space.xs, opacity: service.isActive ? 1 : 0.5 }}>
      <Stack direction="row" justify="space-between" align="flex-start">
        <Stack gap="xxs" style={{ flex: 1 }}>
          <Text variant="bodyStrong">{service.title}</Text>
          {service.priceLabel ? <Text color="secondary">{service.priceLabel}</Text> : null}
          {service.description ? (
            <Text variant="caption" color="secondary">
              {service.description}
            </Text>
          ) : null}
        </Stack>
        <Stack gap="xxs" align="center">
          <Pressable onPress={onMoveUp} disabled={isFirst} hitSlop={6}>
            <Ionicons name="chevron-up" size={20} color={isFirst ? theme.colors.text.disabled : theme.colors.text.secondary} />
          </Pressable>
          <Pressable onPress={onMoveDown} disabled={isLast} hitSlop={6}>
            <Ionicons name="chevron-down" size={20} color={isLast ? theme.colors.text.disabled : theme.colors.text.secondary} />
          </Pressable>
        </Stack>
      </Stack>
      <Stack direction="row" gap="md">
        <Pressable onPress={() => updateService.mutate({ id: service.id, input: { isActive: !service.isActive } })}>
          <Text variant="label" style={{ color: theme.colors.accent.primary }}>
            {service.isActive ? "Ocultar" : "Reativar"}
          </Text>
        </Pressable>
        <Pressable onPress={() => deleteService.mutate(service.id)}>
          <Text variant="label" style={{ color: theme.colors.feedback.danger }}>
            Remover
          </Text>
        </Pressable>
      </Stack>
    </Surface>
  );
}

export default function ProfessionalMenuScreen() {
  const theme = useTheme();
  const { data, isLoading } = useMyServices();
  const reorderServices = useReorderServices();
  const [isAdding, setIsAdding] = useState(false);

  const services = data?.services ?? [];

  const move = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= services.length) return;
    const reordered = [...services];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(target, 0, moved!);
    reorderServices.mutate(reordered.map((s) => s.id));
  };

  if (isLoading) {
    return (
      <Screen>
        <Stack align="center" justify="center" style={{ flex: 1 }}>
          <ActivityIndicator />
        </Stack>
      </Screen>
    );
  }

  return (
    <Screen>
      <FlatList
        data={services}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 24, gap: theme.space.md }}
        ListHeaderComponent={
          <Stack gap="sm" style={{ marginBottom: theme.space.md }}>
            <Text variant="title">Meu cardápio</Text>
            <Text color="secondary">
              Liste seus serviços e preços, como um cardápio — o contato para fechar continua sendo direto pelo
              WhatsApp, telefone ou e-mail que você já cadastrou. A TFIT não processa pagamentos.
            </Text>
            {isAdding ? (
              <AddServiceForm onDone={() => setIsAdding(false)} />
            ) : (
              <Button label="+ Adicionar item" variant="secondary" onPress={() => setIsAdding(true)} />
            )}
          </Stack>
        }
        ListEmptyComponent={
          <Text color="secondary" style={{ textAlign: "center", marginTop: theme.space.lg }}>
            Nenhum item no cardápio ainda.
          </Text>
        }
        renderItem={({ item, index }) => (
          <ServiceRow
            service={item}
            isFirst={index === 0}
            isLast={index === services.length - 1}
            onMoveUp={() => move(index, -1)}
            onMoveDown={() => move(index, 1)}
          />
        )}
      />
    </Screen>
  );
}
