export class AppError extends Error {
  public status: number;
  public code: string;

  constructor(code: string, message: string, status = 400) {
    super(message);
    this.code = code;
    this.status = status;
  }
}
