import { TRPC_ERROR_CODE_KEY } from "@trpc/server/rpc";

export class AppError extends Error {
  public readonly code: TRPC_ERROR_CODE_KEY;

  constructor(code: TRPC_ERROR_CODE_KEY, message: string) {
    super(message);
    this.code = code;
    this.name = "AppError";
  }
}
