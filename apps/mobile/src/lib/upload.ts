import { ImageManipulator, SaveFormat } from "expo-image-manipulator";

const API_URL = process.env.EXPO_PUBLIC_API_URL;
const MAX_EDGE = 1600;

/**
 * Downscales to the same ceiling the backend enforces (see
 * apps/backend's uploads/post-media route) so a full-resolution camera photo
 * never trips the 4 MB proxy limit — client uploads straight to Blob would
 * dodge that ceiling, but @vercel/blob/client depends on undici/Node crypto
 * shims Metro doesn't resolve, so this proxy-through-backend + compress
 * approach is the reliable path for Expo.
 */
export async function uploadPostImage(
  asset: { uri: string; width: number; height: number },
  token: string | null,
): Promise<string> {
  if (!API_URL) throw new Error("EXPO_PUBLIC_API_URL is not set — see .env.example");

  const context = ImageManipulator.manipulate(asset.uri);
  const longestEdge = Math.max(asset.width, asset.height);
  if (longestEdge > MAX_EDGE) {
    if (asset.width >= asset.height) context.resize({ width: MAX_EDGE });
    else context.resize({ height: MAX_EDGE });
  }
  const rendered = await context.renderAsync();
  const compressed = await rendered.saveAsync({ compress: 0.7, format: SaveFormat.JPEG });

  const form = new FormData();
  form.append(
    "file",
    {
      uri: compressed.uri,
      name: "post.jpg",
      type: "image/jpeg",
    } as unknown as Blob,
  );

  const response = await fetch(`${API_URL}/api/uploads/post-media`, {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    body: form,
  });

  const body = await response.json();
  if (!response.ok || "error" in body) {
    throw new Error(body?.error?.message ?? "Falha ao enviar imagem.");
  }

  return body.data.url as string;
}
