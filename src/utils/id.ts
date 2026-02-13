/** crypto.randomUUID のラッパー */
export function generateId(): string {
  return crypto.randomUUID();
}
