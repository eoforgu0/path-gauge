import { useCallback, useRef } from "react";
import { useCanvasStore } from "@/stores/useCanvasStore";
import { usePathStore } from "@/stores/usePathStore";
import type { UnitConfig } from "@/types";

function loadImageFromUrl(url: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = url;
  });
}

export function useImageLoader() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const loadFromFile = useCallback(async (file: File) => {
    const url = URL.createObjectURL(file);
    const { width, height } = await loadImageFromUrl(url);
    useCanvasStore.getState().loadImage(url, width, height);
  }, []);

  const loadFromTemplate = useCallback(async (fileUrl: string, unit?: UnitConfig) => {
    const { width, height } = await loadImageFromUrl(fileUrl);
    useCanvasStore.getState().loadImage(fileUrl, width, height);
    if (unit) {
      usePathStore.getState().setUnitConfig(unit);
    }
  }, []);

  const openFilePicker = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  return { fileInputRef, loadFromFile, loadFromTemplate, openFilePicker };
}
