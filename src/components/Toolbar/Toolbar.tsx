import type React from "react";
import { useCallback } from "react";
import { useImageLoader } from "@/hooks/useImageLoader";
import { useCanvasStore } from "@/stores/useCanvasStore";

export function Toolbar() {
  const { fileInputRef, loadFromFile, openFilePicker } = useImageLoader();
  const imageUrl = useCanvasStore((s) => s.imageUrl);

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

  const requestFitToScreen = useCanvasStore((s) => s.requestFitToScreen);

  const handleZoomReset = useCallback(() => {
    requestFitToScreen();
  }, [requestFitToScreen]);

  return (
    <div className="flex h-12 items-center gap-2 border-b border-border bg-surface px-4">
      <button
        type="button"
        className="rounded-sm bg-surface-hover px-3 py-1.5 text-sm text-text hover:bg-accent hover:text-white transition-colors"
        onClick={openFilePicker}
      >
        画像読込
      </button>
      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />

      <div className="mx-1 h-5 w-px bg-border" />

      <button
        type="button"
        className="rounded-sm bg-surface-hover px-3 py-1.5 text-sm text-text hover:bg-accent hover:text-white transition-colors disabled:opacity-40 disabled:pointer-events-none"
        disabled={!imageUrl}
        onClick={handleZoomReset}
      >
        ズームリセット
      </button>
    </div>
  );
}
