import { describe, expect, it } from "vitest";
import { SNAP_THRESHOLD, snapDragToNeighbors, snapToNode } from "@/utils/snap";

const scale = 1;

describe("snapToNode", () => {
  const ref = { x: 100, y: 200 };

  it("snaps horizontally when Y is within threshold", () => {
    const result = snapToNode({ x: 150, y: 200 + SNAP_THRESHOLD - 1 }, ref, scale);
    expect(result.point.y).toBe(200);
    expect(result.guides).toHaveLength(1);
    expect(result.guides[0]?.axis).toBe("horizontal");
  });

  it("snaps vertically when X is within threshold", () => {
    const result = snapToNode({ x: 100 + SNAP_THRESHOLD - 1, y: 250 }, ref, scale);
    expect(result.point.x).toBe(100);
    expect(result.guides).toHaveLength(1);
    expect(result.guides[0]?.axis).toBe("vertical");
  });

  it("snaps both axes when both are within threshold", () => {
    const result = snapToNode({ x: 100 + 1, y: 200 + 1 }, ref, scale);
    expect(result.point).toEqual({ x: 100, y: 200 });
    expect(result.guides).toHaveLength(2);
  });

  it("does not snap when outside threshold", () => {
    const result = snapToNode({ x: 150, y: 250 }, ref, scale);
    expect(result.point).toEqual({ x: 150, y: 250 });
    expect(result.guides).toHaveLength(0);
  });

  it("adjusts threshold by scale", () => {
    const largeScale = 2;
    // threshold becomes SNAP_THRESHOLD / 2 = 4
    const result = snapToNode({ x: 100 + 5, y: 250 }, ref, largeScale);
    expect(result.point.x).toBe(100 + 5); // outside adjusted threshold
    expect(result.guides).toHaveLength(0);
  });
});

describe("snapDragToNeighbors", () => {
  const prev = { x: 50, y: 100 };
  const next = { x: 200, y: 100 };

  it("snaps to prev node horizontally", () => {
    const result = snapDragToNeighbors({ x: 120, y: 100 + 2 }, prev, null, scale);
    expect(result.point.y).toBe(100);
    expect(result.guides).toHaveLength(1);
  });

  it("snaps to next node vertically", () => {
    const result = snapDragToNeighbors({ x: 200 + 2, y: 150 }, null, next, scale);
    expect(result.point.x).toBe(200);
    expect(result.guides).toHaveLength(1);
  });

  it("snaps to both neighbors", () => {
    // Y close to prev.y (100), X close to next.x (200)
    const result = snapDragToNeighbors({ x: 200 + 1, y: 100 + 1 }, prev, next, scale);
    expect(result.point.y).toBe(100);
    expect(result.point.x).toBe(200);
    // Both prev and next produce horizontal guide (same y), plus next produces vertical
    expect(result.guides.length).toBeGreaterThanOrEqual(2);
  });

  it("does not snap when both are null", () => {
    const result = snapDragToNeighbors({ x: 120, y: 150 }, null, null, scale);
    expect(result.point).toEqual({ x: 120, y: 150 });
    expect(result.guides).toHaveLength(0);
  });
});
