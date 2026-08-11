import { ActivityIndicator } from "react-native";
import { Redirect } from "expo-router";
import { useAuth } from "@clerk/expo";
import { Stack } from "@tfit/ui";
import { useMe } from "@/hooks/useMe";
import { Screen } from "@/components/Screen";

export default function Index() {
  const { isLoaded, isSignedIn } = useAuth();
  const me = useMe();

  if (!isLoaded || (isSignedIn && me.isLoading)) {
    return (
      <Screen>
        <Stack align="center" justify="center" style={{ flex: 1 }}>
          <ActivityIndicator />
        </Stack>
      </Screen>
    );
  }

  if (!isSignedIn) {
    return <Redirect href="/(auth)/sign-in" />;
  }

  if (!me.data?.onboardingCompleted) {
    return <Redirect href="/onboarding" />;
  }

  return <Redirect href="/(app)" />;
}
