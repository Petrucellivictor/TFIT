import { useState } from "react";
import { View } from "react-native";
import { Redirect, Tabs } from "expo-router";
import { useAuth } from "@clerk/expo";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@tfit/ui";
import { FloatingActionButton } from "@/components/FloatingActionButton";
import { QuickActionSheet } from "@/components/QuickActionSheet";

const TAB_ICONS: Record<string, string> = {
  index: "home",
  treinos: "barbell",
  personal: "school",
  feed: "people",
  perfil: "person",
};

export default function AppLayout() {
  const { isSignedIn } = useAuth();
  const theme = useTheme();
  const [actionSheetOpen, setActionSheetOpen] = useState(false);

  if (!isSignedIn) {
    return <Redirect href="/(auth)/sign-in" />;
  }

  return (
    <View style={{ flex: 1 }}>
      <Tabs
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarActiveTintColor: theme.colors.accent.primary,
          tabBarInactiveTintColor: theme.colors.text.secondary,
          tabBarStyle: {
            backgroundColor: theme.colors.background.raised,
            borderTopColor: theme.colors.border.subtle,
            height: 64,
            paddingBottom: 8,
            paddingTop: 8,
          },
          tabBarIcon: ({ size, focused }) => {
            const base = TAB_ICONS[route.name] ?? "ellipse";
            const iconName = (focused ? base : `${base}-outline`) as keyof typeof Ionicons.glyphMap;
            return (
              <View
                style={{
                  width: 40,
                  height: 32,
                  borderRadius: theme.radius.pill,
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: focused ? theme.colors.accent.primary : "transparent",
                }}
              >
                <Ionicons
                  name={iconName}
                  color={focused ? theme.colors.accent.onPrimary : theme.colors.text.secondary}
                  size={size - 2}
                />
              </View>
            );
          },
        })}
      >
        <Tabs.Screen name="index" options={{ title: "Home" }} />
        <Tabs.Screen name="treinos" options={{ title: "Treinos" }} />
        <Tabs.Screen name="personal" options={{ title: "Personal" }} />
        <Tabs.Screen name="feed" options={{ title: "Feed" }} />
        <Tabs.Screen name="perfil" options={{ title: "Perfil" }} />
      </Tabs>

      <FloatingActionButton onPress={() => setActionSheetOpen(true)} />
      <QuickActionSheet visible={actionSheetOpen} onClose={() => setActionSheetOpen(false)} />
    </View>
  );
}
