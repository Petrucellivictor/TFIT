import { Image } from "react-native";
import { Surface, Text, useTheme } from "@tfit/ui";

export function Avatar({ uri, name, size = 40 }: { uri: string | null; name: string; size?: number }) {
  const theme = useTheme();

  if (uri) {
    return <Image source={{ uri }} style={{ width: size, height: size, borderRadius: theme.radius.pill }} />;
  }

  return (
    <Surface
      level="sunken"
      style={{
        width: size,
        height: size,
        borderRadius: theme.radius.pill,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Text variant={size >= 56 ? "title" : "bodyStrong"}>{name.charAt(0).toUpperCase() || "?"}</Text>
    </Surface>
  );
}
