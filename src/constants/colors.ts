/** パスカラーパレット（UI_DESIGN.md §2.1 準拠） */
export const PATH_COLORS = [
  "#ef4444", // red-500
  "#3b82f6", // blue-500
  "#22c55e", // green-500
  "#f59e0b", // amber-500
  "#8b5cf6", // violet-500
  "#ec4899", // pink-500
  "#06b6d4", // cyan-500
  "#84cc16", // lime-500
] as const;

/** インデックスからパスの色を返す（配列長で循環） */
export function getPathColor(index: number): string {
  // biome-ignore lint/style/noNonNullAssertion: modulo guarantees valid index
  return PATH_COLORS[index % PATH_COLORS.length]!;
}
