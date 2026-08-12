import { ActivityIndicator, Linking } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Button, Stack, Surface, Text, useTheme } from "@tfit/ui";
import { Screen } from "@/components/Screen";
import { useProfessionalDirectory } from "@/hooks/useProfessionals";

export default function ProfessionalDetailScreen() {
  const { userId } = useLocalSearchParams<{ userId: string }>();
  const theme = useTheme();
  const { data, isLoading } = useProfessionalDirectory();

  const professional = data?.professionals.find((p) => p.userId === userId);

  if (isLoading || !professional) {
    return (
      <Screen>
        <Stack align="center" justify="center" style={{ flex: 1 }}>
          <ActivityIndicator />
        </Stack>
      </Screen>
    );
  }

  const { contact } = professional;

  return (
    <Screen>
      <Stack gap="lg" style={{ flex: 1, padding: 24 }}>
        <Stack gap="xxs">
          <Text variant="title">{professional.displayName}</Text>
          <Text color="secondary">
            {professional.specialty}
            {professional.city ? ` · ${professional.city}` : ""}
          </Text>
        </Stack>

        <Surface level="raised" style={{ padding: theme.space.md }}>
          <Text color="secondary">{professional.bio}</Text>
        </Surface>

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
            Informações fornecidas pelo próprio profissional — a TFIT não verifica credenciais.
          </Text>
        </Stack>
      </Stack>
    </Screen>
  );
}
