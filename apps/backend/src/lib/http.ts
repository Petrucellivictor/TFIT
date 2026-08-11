import { NextResponse } from "next/server";

export function jsonOk<T>(data: T, init?: number) {
  return NextResponse.json({ data }, { status: init ?? 200 });
}

export function jsonError(code: string, message: string, status: number) {
  return NextResponse.json({ error: { code, message } }, { status });
}

export const errors = {
  unauthorized: () => jsonError("unauthorized", "You need to be signed in to do that.", 401),
  notFound: (message = "We couldn't find that.") => jsonError("not_found", message, 404),
  validation: (message: string) => jsonError("validation_error", message, 400),
  internal: () =>
    jsonError(
      "internal_error",
      "Something went wrong on our end. Your data is safe — please try again.",
      500,
    ),
};
