import { usePathStore } from "@/stores/usePathStore";
import type { Path } from "@/types";
import { calcPathMetrics, formatDistance } from "@/utils/distance";

interface Props {
  path: Path;
  isActive: boolean;
}

export function PathListItem({ path, isActive }: Props) {
  const unitConfig = usePathStore((s) => s.unitConfig);
  const metrics = calcPathMetrics(path);

  return (
    <div
      className={`flex items-center justify-between rounded-sm px-3 py-2 ${
        isActive ? "border border-accent bg-surface-hover" : "border border-transparent"
      }`}
    >
      <div className="flex items-center gap-2">
        <span className="text-lg" style={{ color: path.color }}>
          ●
        </span>
        <span className="text-sm text-text">{path.name}</span>
      </div>
      <span className="text-sm text-text-muted">{formatDistance(metrics.totalDistance, unitConfig)}</span>
    </div>
  );
}
