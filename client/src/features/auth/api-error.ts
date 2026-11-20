import { showNotification } from "@/components/ui/notifications";

function record(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object";
}

/** API failures are reported by the base query; only handle unexpected local failures here. */
export function notifyUnexpectedRequestError(error: unknown): void {
  if (record(error) && ("status" in error || error.name === "AbortError"))
    return;
  showNotification("danger", "Something went wrong. Please try again.");
}
export function apiErrorCode(error: unknown): string | undefined {
  if (!record(error) || !record(error.data) || !record(error.data.error))
    return;
  return typeof error.data.error.code === "string"
    ? error.data.error.code
    : undefined;
}
export function apiErrorMessage(error: unknown): string {
  if (!record(error)) return "Something went wrong. Please try again.";
  if (
    error.status === "FETCH_ERROR" ||
    error.status === "TIMEOUT_ERROR" ||
    error.status === "PARSING_ERROR" ||
    Number(error.status) >= 500
  ) {
    return "We couldn’t reach Safar right now. Please try again in a moment.";
  }
  if (error.status === 429)
    return "Too many attempts. Please wait before trying again.";
  if (record(error.data) && typeof error.data.message === "string")
    return error.data.message;
  return "We couldn’t complete your request. Please try again.";
}
