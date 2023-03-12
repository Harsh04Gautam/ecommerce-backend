class AppError extends Error {
  public status: "fail" | "error";
  readonly isOperational: boolean;
  constructor(readonly message: string, public statusCode: number) {
    super(message);

    this.statusCode = statusCode;
    this.status = statusCode.toString().startsWith("4") ? "fail" : "error";
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

export default AppError;
