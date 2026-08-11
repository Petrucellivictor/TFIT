import type { ApiResult } from "@tfit/types";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export class ApiRequestError extends Error {
  code: string;
  status: number;

  constructor(code: string, message: string, status: number) {
    super(message);
    this.code = code;
    this.status = status;
  }
}

export async function apiFetch<T>(
  path: string,
  token: string | null,
  init?: RequestInit,
): Promise<T> {
  if (!API_URL) {
    throw new Error("EXPO_PUBLIC_API_URL is not set — see .env.example");
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init?.headers,
    },
  });

  const body = (await response.json()) as ApiResult<T>;

  if (!response.ok || "error" in body) {
    const error = "error" in body ? body.error : { code: "unknown_error", message: "Something went wrong." };
    throw new ApiRequestError(error.code, error.message, response.status);
  }

  return body.data;
}
