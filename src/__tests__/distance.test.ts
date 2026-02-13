import { describe, expect, it } from "vitest";
import type { Path } from "@/types";
import { calcPathMetrics, formatDistance, pixelDistance } from "@/utils/distance";

describe("pixelDistance", () => {
  it("returns 0 for the same point", () => {
    expect(pixelDistance({ x: 5, y: 5 }, { x: 5, y: 5 })).toBe(0);
  });

  it("calculates horizontal distance", () => {
    expect(pixelDistance({ x: 0, y: 0 }, { x: 10, y: 0 })).toBe(10);
  });

  it("calculates vertical distance", () => {
    expect(pixelDistance({ x: 0, y: 0 }, { x: 0, y: 7 })).toBe(7);
  });

  it("calculates 3-4-5 triangle", () => {
    expect(pixelDistance({ x: 0, y: 0 }, { x: 3, y: 4 })).toBe(5);
  });
});

describe("formatDistance", () => {
  it("formats as pixels when unitConfig is null", () => {
    expect(formatDistance(142.7, null)).toBe("143px");
  });

  it("formats with unit when unitConfig is provided", () => {
    expect(formatDistance(100, { scale: 0.5, label: "m" })).toBe("50.0m");
  });

  it("falls back to pixels when scale is 0", () => {
    expect(formatDistance(100, { scale: 0, label: "m" })).toBe("100px");
  });
});

describe("calcPathMetrics", () => {
  const makePath = (nodes: { x: number; y: number }[]): Path => ({
    id: "test",
    name: "Test",
    color: "#ff0000",
    nodes: nodes.map((n, i) => ({ id: `n${i}`, ...n })),
  });

  it("returns 0 distance for empty path", () => {
    const m = calcPathMetrics(makePath([]));
    expect(m.totalDistance).toBe(0);
    expect(m.edges).toHaveLength(0);
  });

  it("returns 0 distance for single node", () => {
    const m = calcPathMetrics(makePath([{ x: 10, y: 20 }]));
    expect(m.totalDistance).toBe(0);
    expect(m.edges).toHaveLength(0);
  });

  it("calculates distance for two nodes", () => {
    const m = calcPathMetrics(
      makePath([
        { x: 0, y: 0 },
        { x: 3, y: 4 },
      ]),
    );
    expect(m.totalDistance).toBe(5);
    expect(m.edges).toHaveLength(1);
  });

  it("calculates total distance for three nodes", () => {
    const m = calcPathMetrics(
      makePath([
        { x: 0, y: 0 },
        { x: 3, y: 4 },
        { x: 3, y: 14 },
      ]),
    );
    expect(m.totalDistance).toBe(15); // 5 + 10
    expect(m.edges).toHaveLength(2);
  });

  it("calculates correct midpoints", () => {
    const m = calcPathMetrics(
      makePath([
        { x: 0, y: 0 },
        { x: 10, y: 0 },
      ]),
    );
    expect(m.edges[0]?.midPoint).toEqual({ x: 5, y: 0 });
  });
});
