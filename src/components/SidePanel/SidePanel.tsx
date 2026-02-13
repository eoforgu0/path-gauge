import { useCallback } from "react";
import { useCanvasStore } from "@/stores/useCanvasStore";
import { usePathStore } from "@/stores/usePathStore";
import { PathList } from "./PathList";
import { UnitSettings } from "./UnitSettings";

export function SidePanel() {
  const imageUrl = useCanvasStore((s) => s.imageUrl);
  const drawMode = useCanvasStore((s) => s.drawMode);
  const setDrawMode = useCanvasStore((s) => s.setDrawMode);
  const addPath = usePathStore((s) => s.addPath);

  const handleNewPath = useCallback(() => {
    addPath();
    setDrawMode("drawing");
  }, [addPath, setDrawMode]);

  return (
    <div className="flex w-70 flex-col border-l border-border bg-surface">
      <div className="border-b border-border px-3 py-2 text-xs font-medium text-text-muted">パスリスト</div>
      <div className="flex-1 overflow-y-auto p-2">
        <PathList />
        <button
          type="button"
          className="mt-2 w-full rounded-sm px-3 py-1.5 text-sm text-accent hover:bg-surface-hover transition-colors disabled:opacity-40 disabled:pointer-events-none"
          disabled={!imageUrl || drawMode !== "idle"}
          onClick={handleNewPath}
        >
          + 新規パス
        </button>
      </div>
      <div className="border-t border-border px-3 py-2">
        <div className="mb-2 text-xs font-medium text-text-muted">単位設定</div>
        <UnitSettings />
      </div>
    </div>
  );
}
