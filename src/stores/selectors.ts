import type { PathMetrics } from "@/types";
import { calcPathMetrics } from "@/utils/distance";
import { usePathStore } from "./usePathStore";

/** 全パスのメトリクスを取得するセレクタ */
export function useAllPathMetrics(): PathMetrics[] {
  return usePathStore((state) => state.paths.map(calcPathMetrics));
}

/** 特定パスのメトリクスを取得するセレクタ */
export function usePathMetrics(pathId: string): PathMetrics | null {
  return usePathStore((state) => {
    const path = state.paths.find((p) => p.id === pathId);
    return path ? calcPathMetrics(path) : null;
  });
}
