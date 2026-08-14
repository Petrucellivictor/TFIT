import { Linking, ScrollView } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Button, EmptyState, ErrorState, Skeleton, Stack, Surface, Text, useTheme } from "@tfit/ui";
import { Screen } from "@/components/Screen";
import { Avatar } from "@/components/Avatar";
import { useProfessionalDirectory } from "@/hooks/useProfessionals";

export default function ProfessionalDetailScreen() {
  const { userId } = useLocalSearchParams<{ userId: string }>();
  const theme = useTheme();
  const { data, isLoading, isError } = useProfessionalDirectory();

  if (isLoading) {
    return (
      <Screen>
        <Stack gap="lg" style={{ padding: 24 }}>
          <Stack direction="row" gap="md" align="center">
            <Skeleton width={64} height={64} radius="pill" />
            <Stack gap="xxs" style={{ flex: 1 }}>
              <Skeleton width="55%" height={18} />
              <Skeleton width="35%" height={14} />
            </Stack>
          </Stack>
          <Skeleton height={80} />
          <Skeleton height={120} />
        </Stack>
      </Screen>
    );
  }

  if (isError) {
    return (
      <Screen>
        <Stack style={{ flex: 1 }} justify="center">
          <ErrorState message="Não conseguimos carregar esse perfil agora." />
        </Stack>
      </Screen>
    );
  }

  const professional = data?.professionals.find((p) => p.userId === userId);

  if (!professional) {
    return (
      <Screen>
        <Stack style={{ flex: 1 }} justify="center">
          <EmptyState
            icon={<Ionicons name="person-outline" size={32} color={theme.colors.text.secondary} />}
            title="Profissional não encontrado"
            description="Esse perfil pode ter sido removido do diretório."
          />
        </Stack>
      </Screen>
    );
  }

  const { contact, services } = professional;

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ padding: 24, gap: theme.space.lg }}>
        <Stack direction="row" gap="md" align="center">
          <Avatar uri={professional.avatarUrl} name={professional.displayName} size={64} />
          <Stack gap="xxs" style={{ flex: 1 }}>
            <Text variant="title">{professional.displayName}</Text>
            <Text color="secondary">
              {professional.specialty}
              {professional.city ? ` · ${professional.city}` : ""}
            </Text>
          </Stack>
        </Stack>

        <Surface level="raised" style={{ padding: theme.space.md }}>
          <Text color="secondary">{professional.bio}</Text>
        </Surface>

        {services.length > 0 ? (
          <Stack gap="sm">
            <Text variant="label" color="secondary">
              CARDÁPIO
            </Text>
            <Surface level="raised" style={{ padding: theme.space.md, gap: theme.space.md }}>
              {services.map((service, index) => (
                <Stack key={service.id} gap="xxs" style={index > 0 ? { borderTopWidth: 1, borderTopColor: theme.colors.border.subtle, paddingTop: theme.space.sm } : undefined}>
                  <Stack direction="row" justify="space-between" align="center">
                    <Text variant="bodyStrong" style={{ flex: 1 }}>
                      {service.title}
                    </Text>
                    {service.priceLabel ? <Text color="secondary">{service.priceLabel}</Text> : null}
                  </Stack>
                  {service.description ? (
                    <Text variant="caption" color="secondary">
                      {service.description}
                    </Text>
                  ) : null}
                </Stack>
              ))}
            </Surface>
          </Stack>
        ) : null}

        <Stack gap="sm">
          <Text variant="label" color="secondary">
            CONTATO
          </Text>
          {contact.whatsapp ? (
            <Button
              label="WhatsApp"
              onPress={() => Linking.openURL(`https://wa.me/${contact.whatsapp!.replace(/\D/g, "")}`)}
            />
          )
            : null}
          {contact.phone ? (
            <Button label={`Ligar: ${contact.phone}`} variant="secondary" onPress={() => Linking.openURL(`tel:${contact.phone}`)} />
          ) : null}
          {contact.instagram ? (
            <Button
              label={`Instagram: @${contact.instagram.replace("@", "")}`}
              variant="secondary"
              onPress={() => Linking.openURL(`https://instagram.com/${contact.instagram!.replace("@", "")}`)}
            />
          ) : null}
          {contact.email ? (
            <Button label={`E-mail: ${contact.email}`} variant="secondary" onPress={() => Linking.openURL(`mailto:${contact.email}`)} />
          ) : null}
        </Stack>

        <Stack direction="row" gap="xs" align="center">
          <Ionicons name="information-circle-outline" size={16} color={theme.colors.text.secondary} />
          <Text variant="caption" color="secondary" style={{ flex: 1 }}>
            Informações fornecidas pelo próprio profissional — a TFIT não verifica credenciais nem processa pagamentos.
          </Text>
        </Stack>
      </ScrollView>
    </Screen>
  );
}
