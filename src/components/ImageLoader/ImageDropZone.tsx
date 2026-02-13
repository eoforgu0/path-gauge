import type React from "react";
import { useCallback, useState } from "react";
import { useImageLoader } from "@/hooks/useImageLoader";
import { TemplateSelector } from "./TemplateSelector";

export function ImageDropZone() {
  const { fileInputRef, loadFromFile, loadFromTemplate, openFilePicker } = useImageLoader();
  const [dragging, setDragging] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      const file = e.dataTransfer.files[0];
      if (file?.type.startsWith("image/")) {
        loadFromFile(file);
      }
    },
    [loadFromFile],
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        loadFromFile(file);
      }
    },
    [loadFromFile],
  );

  return (
    <div
      className="flex flex-1 items-center justify-center bg-canvas-bg"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div
        className={`flex flex-col items-center rounded-sm border-2 border-dashed p-12 transition-colors ${
          dragging ? "border-accent bg-accent/10" : "border-border"
        }`}
      >
        <div className="mb-4 text-4xl text-text-dim">&#128193;</div>
        <p className="mb-1 text-text-muted">画像をドラッグ＆ドロップ</p>
        <p className="mb-4 text-sm text-text-dim">または</p>
        <button
          type="button"
          className="rounded-sm bg-accent px-4 py-2 text-sm text-white hover:bg-accent-hover transition-colors"
          onClick={openFilePicker}
        >
          ファイルを選択
        </button>
        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
        <TemplateSelector onSelect={loadFromTemplate} />
      </div>
    </div>
  );
}
