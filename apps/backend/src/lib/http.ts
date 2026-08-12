import { NextResponse } from "next/server";

export function jsonOk<T>(data: T, init?: number) {
  return NextResponse.json({ data }, { status: init ?? 200 });
}

export function jsonError(code: string, message: string, status: number) {
  return NextResponse.json({ error: { code, message } }, { status });
}

export const errors = {
  unauthorized: () => jsonError("unauthorized", "Você precisa estar conectado para fazer isso.", 401),
  notFound: (message = "Não encontramos o que você procurava.") => jsonError("not_found", message, 404),
  validation: (message: string) => jsonError("validation_error", message, 400),
  rateLimited: (message = "Você atingiu o limite de ações por hora. Tente novamente mais tarde.") =>
    jsonError("rate_limited", message, 429),
  internal: () =>
    jsonError(
      "internal_error",
      "Algo deu errado do nosso lado. Seus dados estão seguros — tente novamente.",
      500,
    ),
};

export const ACCOUNT_PROVISIONING_MESSAGE = "Sua conta ainda está sendo configurada. Tente novamente em instantes.";
