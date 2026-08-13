import { useState } from "react";
import { ActivityIndicator, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { Button, Stack, Text, TextField, useTheme, useToast } from "@tfit/ui";
import type { MyProfessionalProfile } from "@tfit/types";
import { Screen } from "@/components/Screen";
import {
  useDeactivateProfessionalProfile,
  useMyProfessionalProfile,
  useSaveProfessionalProfile,
} from "@/hooks/useProfessionals";
import { ApiRequestError } from "@/lib/api";

function ProfileForm({ initialProfile }: { initialProfile: MyProfessionalProfile | null }) {
  const theme = useTheme();
  const router = useRouter();
  const toast = useToast();
  const saveProfile = useSaveProfessionalProfile();
  const deactivateProfile = useDeactivateProfessionalProfile();

  const [specialty, setSpecialty] = useState(initialProfile?.specialty ?? "");
  const [bio, setBio] = useState(initialProfile?.bio ?? "");
  const [city, setCity] = useState(initialProfile?.city ?? "");
  const [contactPhone, setContactPhone] = useState(initialProfile?.contactPhone ?? "");
  const [contactWhatsapp, setContactWhatsapp] = useState(initialProfile?.contactWhatsapp ?? "");
  const [contactInstagram, setContactInstagram] = useState(initialProfile?.contactInstagram ?? "");
  const [contactEmail, setContactEmail] = useState(initialProfile?.contactEmail ?? "");

  const canSubmit =
    specialty.trim().length > 0 &&
    bio.trim().length > 0 &&
    (contactPhone || contactWhatsapp || contactInstagram || contactEmail);

  const onSubmit = () => {
    saveProfile.mutate(
      {
        specialty: specialty.trim(),
        bio: bio.trim(),
        city: city.trim() || undefined,
        contactPhone: contactPhone.trim() || undefined,
        contactWhatsapp: contactWhatsapp.trim() || undefined,
        contactInstagram: contactInstagram.trim() || undefined,
        contactEmail: contactEmail.trim() || undefined,
      },
      {
        onSuccess: () => {
          toast.show("Perfil salvo.", "success");
          router.back();
        },
      },
    );
  };

  return (
    <ScrollView contentContainerStyle={{ padding: 24, gap: theme.space.lg }}>
      <Stack gap="xs">
        <Text variant="title">Perfil profissional</Text>
        <Text color="secondary">
          Essas informações ficam visíveis no diretório de personal trainers. A TFIT não verifica credenciais —
          você é responsável pelas informações que fornecer.
        </Text>
      </Stack>

      <TextField label="Especialidade" placeholder="Ex: Musculação, Corrida, Reabilitação" value={specialty} onChangeText={setSpecialty} />
      <TextField label="Sobre você" value={bio} onChangeText={setBio} multiline />
      <TextField label="Cidade (opcional)" value={city} onChangeText={setCity} />

      <Stack gap="sm">
        <Text variant="label" color="secondary">
          CONTATO (PREENCHA AO MENOS UM)
        </Text>
        <TextField label="WhatsApp" keyboardType="phone-pad" value={contactWhatsapp} onChangeText={setContactWhatsapp} />
        <TextField label="Telefone" keyboardType="phone-pad" value={contactPhone} onChangeText={setContactPhone} />
        <TextField label="Instagram" autoCapitalize="none" value={contactInstagram} onChangeText={setContactInstagram} />
        <TextField label="E-mail" autoCapitalize="none" keyboardType="email-address" value={contactEmail} onChangeText={setContactEmail} />
      </Stack>

      {saveProfile.isError ? (
        <Text style={{ color: theme.colors.feedback.danger }}>
          {saveProfile.error instanceof ApiRequestError ? saveProfile.error.message : "Não conseguimos salvar. Tente novamente."}
        </Text>
      ) : null}

      <Button label={saveProfile.isPending ? "Salvando..." : "Salvar"} onPress={onSubmit} disabled={!canSubmit || saveProfile.isPending} />

      {initialProfile ? (
        <>
          <Button label="Editar meu cardápio" variant="secondary" onPress={() => router.push("/(app)/personal/menu")} />
          <Button
            label="Remover do diretório"
            variant="secondary"
            onPress={() => deactivateProfile.mutate(undefined, { onSuccess: () => router.back() })}
            disabled={deactivateProfile.isPending}
          />
        </>
      ) : null}
    </ScrollView>
  );
}

export default function RegisterProfessionalScreen() {
  const { data, isLoading } = useMyProfessionalProfile();

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
      <ProfileForm initialProfile={data?.profile ?? null} />
    </Screen>
  );
}
