import type React from "react";
import { useCallback } from "react";
import { useImageLoader } from "@/hooks/useImageLoader";
import { useCanvasStore } from "@/stores/useCanvasStore";
import { usePathStore } from "@/stores/usePathStore";

const BTN =
  "rounded-sm bg-surface-hover px-3 py-1.5 text-sm text-text hover:bg-accent hover:text-white transition-colors";
const BTN_DISABLED = `${BTN} disabled:opacity-40 disabled:pointer-events-none`;

export function Toolbar() {
  const { fileInputRef, loadFromFile, openFilePicker } = useImageLoader();
  const imageUrl = useCanvasStore((s) => s.imageUrl);
  const drawMode = useCanvasStore((s) => s.drawMode);
  const setDrawMode = useCanvasStore((s) => s.setDrawMode);
  const requestFitToScreen = useCanvasStore((s) => s.requestFitToScreen);

  const paths = usePathStore((s) => s.paths);
  const activePathId = usePathStore((s) => s.activePathId);
  const addPath = usePathStore((s) => s.addPath);
  const undoLastNode = usePathStore((s) => s.undoLastNode);
  const clearAllPaths = usePathStore((s) => s.clearAllPaths);

  const activePath = paths.find((p) => p.id === activePathId);
  const activeNodeCount = activePath?.nodes.length ?? 0;

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        loadFromFile(file);
      }
      e.target.value = "";
    },
    [loadFromFile],
  );

  const handleNewPath = useCallback(() => {
    addPath();
    setDrawMode("drawing");
  }, [addPath, setDrawMode]);

  const handleConfirm = useCallback(() => {
    setDrawMode("idle");
  }, [setDrawMode]);

  const handleUndo = useCallback(() => {
    if (activePathId) {
      undoLastNode(activePathId);
    }
  }, [activePathId, undoLastNode]);

  const handleClearAll = useCallback(() => {
    clearAllPaths();
    setDrawMode("idle");
  }, [clearAllPaths, setDrawMode]);

  const handleZoomReset = useCallback(() => {
    requestFitToScreen();
  }, [requestFitToScreen]);

  return (
    <div className="flex h-12 items-center gap-2 border-b border-border bg-surface px-4">
      <button type="button" className={BTN} onClick={openFilePicker}>
        画像読込
      </button>
      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />

      <button
        type="button"
        className={BTN_DISABLED}
        disabled={!imageUrl || drawMode !== "idle"}
        onClick={handleNewPath}
      >
        新規パス
      </button>
      <button
        type="button"
        className={BTN_DISABLED}
        disabled={drawMode !== "drawing" || activeNodeCount < 2}
        onClick={handleConfirm}
      >
        確定
      </button>

      <div className="mx-1 h-5 w-px bg-border" />

      <button
        type="button"
        className={BTN_DISABLED}
        disabled={drawMode !== "drawing" || activeNodeCount < 1}
        onClick={handleUndo}
      >
        Undo
      </button>
      <button type="button" className={BTN_DISABLED} disabled={paths.length === 0} onClick={handleClearAll}>
        全クリア
      </button>

      <div className="mx-1 h-5 w-px bg-border" />

      <button type="button" className={BTN_DISABLED} disabled={!imageUrl} onClick={handleZoomReset}>
        ズームリセット
      </button>
    </div>
  );
}
