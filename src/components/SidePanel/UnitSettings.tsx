import type React from "react";
import { useCallback, useState } from "react";
import { usePathStore } from "@/stores/usePathStore";

const INPUT_CLASS =
  "w-full rounded-sm border border-border bg-bg px-2 py-1 text-sm text-text outline-none focus:border-accent";

export function UnitSettings() {
  const unitConfig = usePathStore((s) => s.unitConfig);
  const setUnitConfig = usePathStore((s) => s.setUnitConfig);

  const [scaleValue, setScaleValue] = useState(unitConfig?.scale.toString() ?? "");
  const [labelValue, setLabelValue] = useState(unitConfig?.label ?? "");

  const commitConfig = useCallback(() => {
    const num = Number.parseFloat(scaleValue);
    if (scaleValue.trim() === "" || Number.isNaN(num) || num <= 0) {
      setUnitConfig(null);
    } else {
      setUnitConfig({ scale: num, label: labelValue.trim() || "px" });
    }
  }, [scaleValue, labelValue, setUnitConfig]);

  const handleScaleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        commitConfig();
        (e.target as HTMLInputElement).blur();
      }
    },
    [commitConfig],
  );

  const handleLabelKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        commitConfig();
        (e.target as HTMLInputElement).blur();
      }
    },
    [commitConfig],
  );

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <label className="text-xs text-text-muted w-8 shrink-0">倍率</label>
        <input
          type="text"
          inputMode="decimal"
          className={INPUT_CLASS}
          value={scaleValue}
          placeholder="1px あたりの実距離"
          onChange={(e) => setScaleValue(e.target.value)}
          onBlur={commitConfig}
          onKeyDown={handleScaleKeyDown}
        />
      </div>
      <div className="flex items-center gap-2">
        <label className="text-xs text-text-muted w-8 shrink-0">単位</label>
        <input
          type="text"
          className={INPUT_CLASS}
          value={labelValue}
          placeholder="m, km, ft ..."
          onChange={(e) => setLabelValue(e.target.value)}
          onBlur={commitConfig}
          onKeyDown={handleLabelKeyDown}
        />
      </div>
    </div>
  );
}
