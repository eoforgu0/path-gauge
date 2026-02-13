import type { EdgeInfo, Path, PathMetrics, Point, UnitConfig } from "@/types";

/** 2点間のユークリッド距離 */
export function pixelDistance(a: Point, b: Point): number {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

/** パスの全エッジ距離と合計距離を計算 */
export function calcPathMetrics(path: Path): PathMetrics {
  const edges: EdgeInfo[] = [];
  for (let i = 0; i < path.nodes.length - 1; i++) {
    const from = path.nodes[i];
    const to = path.nodes[i + 1];
    if (!from || !to) continue;
    const dist = pixelDistance(from, to);
    edges.push({
      fromNode: from,
      toNode: to,
      distance: dist,
      midPoint: { x: (from.x + to.x) / 2, y: (from.y + to.y) / 2 },
    });
  }
  return {
    pathId: path.id,
    totalDistance: edges.reduce((sum, e) => sum + e.distance, 0),
    edges,
  };
}

/** 距離を表示用文字列に変換 */
export function formatDistance(px: number, unit: UnitConfig | null): string {
  if (unit && unit.scale > 0) {
    return `${(px * unit.scale).toFixed(1)}${unit.label}`;
  }
  return `${Math.round(px)}px`;
}
