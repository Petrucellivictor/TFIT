export type UUID = string;
export type ISODateTime = string;

export interface ApiSuccess<T> {
  data: T;
}

export interface ApiError {
  error: {
    code: string;
    message: string;
  };
}

export type ApiResult<T> = ApiSuccess<T> | ApiError;

export type UnitSystem = "metric" | "imperial";
