import { TRPCClientError } from "@trpc/client";

export function handleError(error: unknown) {
  if (error instanceof DOMException && error.name === "AbortError") {
    console.log("Fetch aborted:", error.message);
    return;
  }
  if (error instanceof TRPCClientError) {
    return { message: error.message, name: error.name };
  }
  if (error instanceof Error) {
    return { message: error.message, name: error.name };
  }

  return { message: "Unknown error", name: "UnknownError" };
}
