import type React from "react";
import { useCallback, useRef, useState } from "react";
import { usePathStore } from "@/stores/usePathStore";
import type { Path } from "@/types";
import { calcPathMetrics, formatDistance } from "@/utils/distance";

interface Props {
  path: Path;
  isActive: boolean;
}

export function PathListItem({ path, isActive }: Props) {
  const unitConfig = usePathStore((s) => s.unitConfig);
  const setActivePathId = usePathStore((s) => s.setActivePathId);
  const updatePathName = usePathStore((s) => s.updatePathName);
  const updatePathColor = usePathStore((s) => s.updatePathColor);
  const removePath = usePathStore((s) => s.removePath);
  const metrics = calcPathMetrics(path);

  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(path.name);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const colorInputRef = useRef<HTMLInputElement>(null);

  const handleClick = useCallback(() => {
    setActivePathId(path.id);
  }, [path.id, setActivePathId]);

  const handleNameClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      setEditValue(path.name);
      setIsEditing(true);
      requestAnimationFrame(() => nameInputRef.current?.select());
    },
    [path.name],
  );

  const commitName = useCallback(() => {
    const trimmed = editValue.trim();
    if (trimmed && trimmed !== path.name) {
      updatePathName(path.id, trimmed);
    }
    setIsEditing(false);
  }, [editValue, path.id, path.name, updatePathName]);

  const handleNameKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        commitName();
      } else if (e.key === "Escape") {
        setIsEditing(false);
      }
    },
    [commitName],
  );

  const handleColorClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    colorInputRef.current?.click();
  }, []);

  const handleColorChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      updatePathColor(path.id, e.target.value);
    },
    [path.id, updatePathColor],
  );

  const handleDelete = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      removePath(path.id);
    },
    [path.id, removePath],
  );

  return (
    <div
      className={`flex items-center justify-between rounded-sm px-3 py-2 cursor-pointer hover:bg-surface-hover ${
        isActive ? "border border-accent bg-surface-hover" : "border border-transparent"
      }`}
      onClick={handleClick}
    >
      <div className="flex items-center gap-2 min-w-0">
        <button
          type="button"
          className="text-lg shrink-0 cursor-pointer"
          style={{ color: path.color }}
          onClick={handleColorClick}
        >
          ●
        </button>
        <input ref={colorInputRef} type="color" value={path.color} className="sr-only" onChange={handleColorChange} />
        {isEditing ? (
          <input
            ref={nameInputRef}
            type="text"
            value={editValue}
            className="w-full rounded-sm border border-accent bg-bg px-1 py-0.5 text-sm text-text outline-none"
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={commitName}
            onKeyDown={handleNameKeyDown}
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <span className="text-sm text-text truncate cursor-text" onClick={handleNameClick}>
            {path.name}
          </span>
        )}
      </div>
      <div className="flex items-center gap-2 shrink-0 ml-2">
        <span className="text-sm text-text-muted">{formatDistance(metrics.totalDistance, unitConfig)}</span>
        <button
          type="button"
          className="text-text-dim hover:text-danger text-sm transition-colors"
          onClick={handleDelete}
          title="削除"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
