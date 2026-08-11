import { useState } from "react";
import { Link, useRouter } from "expo-router";
import { useSignIn } from "@clerk/expo/legacy";
import { Button, Stack, Text, TextField } from "@tfit/ui";
import { Screen } from "@/components/Screen";

export default function SignInScreen() {
  const { signIn, setActive, isLoaded } = useSignIn();
  const router = useRouter();
  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async () => {
    if (!isLoaded) return;
    setError(null);
    setSubmitting(true);
    try {
      const result = await signIn.create({ identifier: emailAddress, password });
      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        router.replace("/");
      } else {
        setError("Não foi possível entrar. Verifique seus dados.");
      }
    } catch {
      setError("E-mail ou senha incorretos.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Screen>
      <Stack gap="lg" style={{ flex: 1, justifyContent: "center", padding: 24 }}>
        <Stack gap="xs">
          <Text variant="title">Bem-vindo de volta</Text>
          <Text color="secondary">Entre para continuar seu treino.</Text>
        </Stack>

        <Stack gap="md">
          <TextField
            label="E-mail"
            autoCapitalize="none"
            keyboardType="email-address"
            value={emailAddress}
            onChangeText={setEmailAddress}
          />
          <TextField label="Senha" secureTextEntry value={password} onChangeText={setPassword} />
        </Stack>

        {error ? <Text style={{ color: "#C0362C" }}>{error}</Text> : null}

        <Button label={submitting ? "Entrando..." : "Entrar"} onPress={onSubmit} disabled={submitting} />

        <Link href="/(auth)/sign-up" asChild>
          <Text color="secondary" style={{ textAlign: "center" }}>
            Não tem conta? Criar conta
          </Text>
        </Link>
      </Stack>
    </Screen>
  );
}
