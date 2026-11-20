const REDACTED = '[REDACTED]';
const sensitiveKey =
  /authorization|cookie|password|passwd|secret|token|otp|api.?key|encryption.?key|signature|account.?number|account.?holder|ifsc|aadhaar|document.?number|email|phone|address|headers|body|query|responseData|parameters|params|detail|internalQuery|content_base64/i;

/** Console summaries keep one application frame instead of framework stacks. */
export function summarizeLogValue(value: unknown, depth = 0): unknown {
  const safe = sanitizeLogValue(value);
  return compact(safe, depth);
}

function compact(value: unknown, depth: number): unknown {
  if (depth > 5) return '[Truncated]';
  if (Array.isArray(value))
    return value.slice(0, 3).map((item) => compact(item, depth + 1));
  if (!value || typeof value !== 'object') return value;

  const record = value as Record<string, unknown>;
  const result: Record<string, unknown> = {};
  for (const [key, entry] of Object.entries(record)) {
    // Winston's fatal-error handlers add large process/OS dumps and duplicate stacks.
    if (['stack', 'trace', 'process', 'os', 'date'].includes(key)) continue;
    if (entry === undefined || entry === '') continue;
    result[key] =
      typeof entry === 'string' && key === 'message'
        ? entry.split('\n')[0].slice(0, 500)
        : compact(entry, depth + 1);
  }
  const stack =
    typeof record.stack === 'string'
      ? record.stack
      : typeof record.trace === 'string'
        ? record.trace
        : undefined;
  if (stack) {
    const frames = stack.split('\n').slice(1);
    const frame =
      frames.find(
        (line) => /\/(libs|src)\//.test(line) && !line.includes('node_modules'),
      ) ??
      frames.find(
        (line) =>
          !line.includes('node_modules') && !line.includes('node:internal'),
      );
    if (frame)
      result.location = frame
        .trim()
        .replace(/(?:file:\/\/|webpack:\/\/)?[^\s(]*?\/(libs|src)\//, '$1/');
  }
  return result;
}

/** Defense in depth for error text; payloads must never be logged in the first place. */
function sanitizeText(value: string): string {
  return value
    .replace(/\b(Bearer|Basic)\s+[^\s,;]+/gi, '$1 [REDACTED]')
    .replace(/(https?:\/\/[^\s?#]+)\?[^\s#]*/gi, '$1?[REDACTED]')
    .replace(/(\b[a-z][a-z0-9+.-]*:\/\/)[^\s/@]+:[^\s/@]+@/gi, '$1[REDACTED]@')
    .replace(
      /\b(password|passwd|secret|token|otp|api[_-]?key|authorization|cookie)["']?\s*[:=]\s*(?:"[^"]*"|'[^']*'|[^\s,;]+)/gi,
      '$1=[REDACTED]',
    )
    .replace(/Key\s*\([^)]+\)=\([\s\S]*?\)/gi, 'Key ([REDACTED])=([REDACTED])')
    .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, REDACTED)
    .slice(0, 16000);
}

/** Handles cycles and Error.cause without copying provider response bodies. */
export function sanitizeLogValue(
  value: unknown,
  depth = 0,
  seen = new WeakSet<object>(),
): unknown {
  if (typeof value === 'string') return sanitizeText(value);
  if (typeof value === 'bigint') return String(value);
  if (value === null || typeof value !== 'object') return value;
  if (depth > 8 || seen.has(value)) return '[Truncated]';
  seen.add(value);
  if (value instanceof Error) {
    const error = value as Error & { code?: unknown };
    return sanitizeLogValue(
      {
        name: error.name,
        message: error.message,
        stack: error.stack,
        code: error.code,
        cause:
          error.cause instanceof Error
            ? error.cause
            : error.cause === undefined
              ? undefined
              : '[Non-Error cause]',
      },
      depth + 1,
      seen,
    );
  }
  if (Array.isArray(value))
    return value
      .slice(0, 100)
      .map((item) => sanitizeLogValue(item, depth + 1, seen));
  return Object.fromEntries(
    Object.entries(value)
      .slice(0, 100)
      .map(([key, entry]) => [
        key,
        sensitiveKey.test(key)
          ? REDACTED
          : sanitizeLogValue(entry, depth + 1, seen),
      ]),
  );
}
