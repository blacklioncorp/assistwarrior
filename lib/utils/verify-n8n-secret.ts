import { createHash, timingSafeEqual } from 'crypto'

/**
 * Timing-safe comparison of two strings using SHA-256 digests.
 * Both inputs are hashed to equal-length buffers before comparing,
 * so different string lengths cannot leak information via exceptions or timing.
 */
export function timingSafeStringEqual(a: string, b: string): boolean {
  const hashA = createHash('sha256').update(a).digest()
  const hashB = createHash('sha256').update(b).digest()
  return timingSafeEqual(hashA, hashB)
}

/**
 * Validates the Authorization header against the N8N_WEBHOOK_SECRET env var.
 * Returns true if the header is a valid "Bearer <secret>" token.
 */
export function verifyN8nSecret(authHeader: string | null): boolean {
  const secret = process.env.N8N_WEBHOOK_SECRET
  if (!secret || !authHeader) return false
  return timingSafeStringEqual(authHeader, `Bearer ${secret}`)
}
