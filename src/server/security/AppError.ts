export type AppError = {
  name: "AppError";
  code: string;
  message: string;
  status: number;
};

export const createAppError = (
  code: string,
  message: string,
  status = 400
): AppError => ({
  name: "AppError",
  code,
  message,
  status,
});

export const isAppError = (err: unknown): err is AppError =>
  typeof err === "object" &&
  err !== null &&
  (err as { name?: unknown }).name === "AppError";
