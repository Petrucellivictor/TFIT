import { useState } from "react";
import { Link, useRouter } from "expo-router";
import { useSignUp } from "@clerk/expo/legacy";
import { Button, Stack, Text, TextField } from "@tfit/ui";
import { Screen } from "@/components/Screen";

export default function SignUpScreen() {
  const { signUp, setActive, isLoaded } = useSignUp();
  const router = useRouter();
  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [pendingVerification, setPendingVerification] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const onSignUp = async () => {
    if (!isLoaded) return;
    setError(null);
    setSubmitting(true);
    try {
      await signUp.create({ emailAddress, password });
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      setPendingVerification(true);
    } catch {
      setError("Não foi possível criar sua conta. Verifique os dados e tente novamente.");
    } finally {
      setSubmitting(false);
    }
  };

  const onVerify = async () => {
    if (!isLoaded) return;
    setError(null);
    setSubmitting(true);
    try {
      const result = await signUp.attemptEmailAddressVerification({ code });
      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        router.replace("/onboarding");
      } else {
        setError("Código inválido.");
      }
    } catch {
      setError("Código inválido ou expirado.");
    } finally {
      setSubmitting(false);
    }
  };

  if (pendingVerification) {
    return (
      <Screen>
        <Stack gap="lg" style={{ flex: 1, justifyContent: "center", padding: 24 }}>
          <Stack gap="xs">
            <Text variant="title">Confirme seu e-mail</Text>
            <Text color="secondary">Enviamos um código para {emailAddress}.</Text>
          </Stack>
          <TextField label="Código" keyboardType="number-pad" value={code} onChangeText={setCode} />
          {error ? <Text style={{ color: "#C0362C" }}>{error}</Text> : null}
          <Button label={submitting ? "Confirmando..." : "Confirmar"} onPress={onVerify} disabled={submitting} />
        </Stack>
      </Screen>
    );
  }

  return (
    <Screen>
      <Stack gap="lg" style={{ flex: 1, justifyContent: "center", padding: 24 }}>
        <Stack gap="xs">
          <Text variant="title">Criar conta</Text>
          <Text color="secondary">Seu personal trainer com IA começa aqui.</Text>
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

        <Button label={submitting ? "Criando..." : "Criar conta"} onPress={onSignUp} disabled={submitting} />

        <Link href="/(auth)/sign-in" asChild>
          <Text color="secondary" style={{ textAlign: "center" }}>
            Já tem conta? Entrar
          </Text>
        </Link>
      </Stack>
    </Screen>
  );
}
