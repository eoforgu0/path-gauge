import type React from "react";
import { useCallback } from "react";
import { useImageLoader } from "@/hooks/useImageLoader";

export function Toolbar() {
  const { fileInputRef, loadFromFile, openFilePicker } = useImageLoader();

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        loadFromFile(file);
      }
      // Reset so the same file can be re-selected
      e.target.value = "";
    },
    [loadFromFile],
  );

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
    </div>
  );
}
