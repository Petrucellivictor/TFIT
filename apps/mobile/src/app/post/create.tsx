import { useEffect, useRef, useState } from "react";
import { Alert, Image, Pressable } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useAuth } from "@clerk/expo";
import { useNavigation, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Button, Stack, Surface, Text, TextField, useTheme, useToast } from "@tfit/ui";
import type { PostType, PostVisibility } from "@tfit/types";
import { Screen } from "@/components/Screen";
import { Chip } from "@/components/Chip";
import { useCreatePost } from "@/hooks/useSocial";
import { uploadPostImage } from "@/lib/upload";

const VISIBILITY_OPTIONS: { value: PostVisibility; label: string }[] = [
  { value: "public", label: "Público" },
  { value: "followers", label: "Seguidores" },
  { value: "friends", label: "Amigos" },
  { value: "private", label: "Privado" },
];

export default function CreatePostScreen() {
  const theme = useTheme();
  const router = useRouter();
  const navigation = useNavigation();
  const { getToken } = useAuth();
  const createPost = useCreatePost();
  const toast = useToast();

  const [asset, setAsset] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [caption, setCaption] = useState("");
  const [visibility, setVisibility] = useState<PostVisibility>("public");
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const publishedRef = useRef(false);

  useEffect(() => {
    const unsubscribe = navigation.addListener("beforeRemove", (e) => {
      const hasUnsavedChanges = !publishedRef.current && (asset !== null || caption.trim().length > 0);
      if (!hasUnsavedChanges) return;
      e.preventDefault();
      Alert.alert("Descartar post?", "Você vai perder a foto e o texto que escreveu.", [
        { text: "Continuar editando", style: "cancel" },
        { text: "Descartar", style: "destructive", onPress: () => navigation.dispatch(e.data.action) },
      ]);
    });
    return unsubscribe;
  }, [navigation, asset, caption]);

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      setError("Precisamos de acesso às suas fotos para continuar.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 1,
      allowsEditing: true,
      aspect: [1, 1],
    });

    if (!result.canceled && result.assets[0]) {
      setAsset(result.assets[0]);
      setError(null);
    }
  };

  const submit = async () => {
    if (!asset && !caption.trim()) {
      setError("Adicione uma foto ou escreva algo para publicar.");
      return;
    }

    setError(null);
    const type: PostType = asset ? "photo" : "text";

    try {
      let mediaUrls: string[] | undefined;
      if (asset) {
        setIsUploading(true);
        const token = await getToken();
        const url = await uploadPostImage(asset, token);
        mediaUrls = [url];
      }

      await createPost.mutateAsync({ type, caption: caption.trim() || undefined, visibility, mediaUrls });
      publishedRef.current = true;
      toast.show("Post publicado.", "success");
      router.back();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não conseguimos publicar agora. Tente novamente.");
    } finally {
      setIsUploading(false);
    }
  };

  const isSubmitting = isUploading || createPost.isPending;

  return (
    <Screen>
      <Stack gap="lg" style={{ flex: 1, padding: 24 }}>
        <Text variant="title">Novo post</Text>

        <Pressable
          onPress={pickImage}
          accessibilityRole="button"
          accessibilityLabel={asset ? "Alterar foto" : "Escolher foto"}
        >
          {asset ? (
            <Image source={{ uri: asset.uri }} style={{ width: "100%", aspectRatio: 1, borderRadius: theme.radius.soft }} />
          ) : (
            <Surface
              level="sunken"
              style={{ width: "100%", aspectRatio: 1, alignItems: "center", justifyContent: "center", gap: theme.space.sm }}
            >
              <Ionicons name="camera-outline" size={32} color={theme.colors.text.secondary} />
              <Text color="secondary">Escolher foto (opcional)</Text>
            </Surface>
          )}
        </Pressable>

        <TextField placeholder="Escreva uma legenda..." value={caption} onChangeText={setCaption} multiline numberOfLines={4} />

        <Stack gap="sm">
          <Text variant="label" color="secondary">
            QUEM PODE VER
          </Text>
          <Stack direction="row" gap="xs" style={{ flexWrap: "wrap" }}>
            {VISIBILITY_OPTIONS.map((option) => (
              <Chip
                key={option.value}
                label={option.label}
                selected={visibility === option.value}
                onPress={() => setVisibility(option.value)}
              />
            ))}
          </Stack>
        </Stack>

        {error ? <Text style={{ color: theme.colors.feedback.danger }}>{error}</Text> : null}

        <Stack style={{ flex: 1 }} />

        <Button label={isSubmitting ? "Publicando..." : "Publicar"} onPress={submit} disabled={isSubmitting} />
      </Stack>
    </Screen>
  );
}
