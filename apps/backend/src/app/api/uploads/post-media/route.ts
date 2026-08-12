import { put } from "@vercel/blob";
import { errors, jsonError, jsonOk } from "@/lib/http";
import { requireUser } from "@/lib/requireUser";

const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
// Vercel's Serverless Function request body ceiling is 4.5 MB regardless of
// plan. Mobile compresses images before upload (see apps/mobile's upload
// helper), so this proxy path — rather than Blob's browser-only client-token
// protocol, which depends on undici/crypto shims Metro doesn't resolve — stays
// well under that ceiling in practice.
const MAX_SIZE_BYTES = 4 * 1024 * 1024;

export async function POST(request: Request) {
  const result = await requireUser();
  if ("errorResponse" in result) return result.errorResponse;

  const form = await request.formData().catch(() => null);
  const file = form?.get("file");
  if (!file || !(file instanceof File)) return errors.validation("Envie um arquivo de imagem.");
  if (!ALLOWED_TYPES.has(file.type)) return errors.validation("Formato de imagem não suportado. Use JPEG, PNG ou WebP.");
  if (file.size > MAX_SIZE_BYTES) return errors.validation("Imagem muito grande. O limite é 4 MB.");

  const extension = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";

  try {
    const blob = await put(`posts/${result.user.id}/${crypto.randomUUID()}.${extension}`, file, {
      access: "public",
      contentType: file.type,
    });

    return jsonOk({ url: blob.url }, 201);
  } catch (error) {
    return jsonError("upload_failed", error instanceof Error ? error.message : "Falha no upload.", 400);
  }
}
