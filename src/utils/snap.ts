import type { Point, SnapGuideLine } from "@/types";

/** スナップ閾値（画面上のピクセル数） */
export const SNAP_THRESHOLD = 8;

/** スナップ計算結果 */
export interface SnapResult {
  readonly point: Point;
  readonly guides: readonly SnapGuideLine[];
}

/**
 * 新規ノード配置時のスナップ計算
 * 基準: 直前のノード
 */
export function snapToNode(cursor: Point, referenceNode: Point, scale: number): SnapResult {
  const threshold = SNAP_THRESHOLD / scale;
  const guides: SnapGuideLine[] = [];
  let { x, y } = cursor;

  // 水平スナップ（Y座標を揃える）
  if (Math.abs(cursor.y - referenceNode.y) < threshold) {
    y = referenceNode.y;
    guides.push({
      from: referenceNode,
      to: { x: cursor.x, y: referenceNode.y },
      axis: "horizontal",
    });
  }

  // 垂直スナップ（X座標を揃える）
  if (Math.abs(cursor.x - referenceNode.x) < threshold) {
    x = referenceNode.x;
    guides.push({
      from: referenceNode,
      to: { x: referenceNode.x, y: cursor.y },
      axis: "vertical",
    });
  }

  return { point: { x, y }, guides };
}

/**
 * ノードドラッグ時のスナップ計算
 * 基準: 前後のノード（両方チェック）
 */
export function snapDragToNeighbors(
  cursor: Point,
  prevNode: Point | null,
  nextNode: Point | null,
  scale: number,
): SnapResult {
  const threshold = SNAP_THRESHOLD / scale;
  const guides: SnapGuideLine[] = [];
  let { x, y } = cursor;

  for (const ref of [prevNode, nextNode]) {
    if (!ref) continue;

    if (Math.abs(cursor.y - ref.y) < threshold) {
      y = ref.y;
      guides.push({ from: ref, to: { x: cursor.x, y: ref.y }, axis: "horizontal" });
    }
    if (Math.abs(cursor.x - ref.x) < threshold) {
      x = ref.x;
      guides.push({ from: ref, to: { x: ref.x, y: cursor.y }, axis: "vertical" });
    }
  }

  return { point: { x, y }, guides };
}
