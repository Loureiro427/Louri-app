/** Bounded retries avoid hammering the free quota or retrying configuration errors. */
export function accountRetryDelay(
  code: string | undefined,
  attempt: number,
): number | null {
  if (code === "louri/revision-changed") return attempt < 4 ? 750 : null;
  if (
    ![
      "unavailable",
      "deadline-exceeded",
      "aborted",
      "unknown",
      "auth/network-request-failed",
    ].includes(code || "")
  )
    return null;
  return attempt < 4 ? Math.min(15_000 * 2 ** attempt, 120_000) : null;
}
