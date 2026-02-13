import { create } from "zustand";
import type { DrawMode, Point, SnapState } from "@/types";

interface CanvasState {
  imageUrl: string | null;
  imageSize: { width: number; height: number } | null;

  scale: number;
  position: Point;

  drawMode: DrawMode;
  cursorPosition: Point | null;

  snapState: SnapState;
  shiftPressed: boolean;

  loadImage: (url: string, width: number, height: number) => void;
  clearImage: () => void;

  setScale: (scale: number) => void;
  setPosition: (position: Point) => void;
  resetView: () => void;

  setDrawMode: (mode: DrawMode) => void;
  setCursorPosition: (point: Point | null) => void;

  setSnapState: (state: SnapState) => void;
  setShiftPressed: (pressed: boolean) => void;
}

export const useCanvasStore = create<CanvasState>()((set) => ({
  imageUrl: null,
  imageSize: null,

  scale: 1.0,
  position: { x: 0, y: 0 },

  drawMode: "idle",
  cursorPosition: null,

  snapState: {
    active: false,
    snappedPoint: null,
    guideLines: [],
  },
  shiftPressed: false,

  loadImage: (url, width, height) => {
    set({ imageUrl: url, imageSize: { width, height } });
  },

  clearImage: () => {
    set({ imageUrl: null, imageSize: null });
  },

  setScale: (scale) => {
    set({ scale: Math.min(10.0, Math.max(0.1, scale)) });
  },

  setPosition: (position) => {
    set({ position });
  },

  resetView: () => {
    set({ scale: 1.0, position: { x: 0, y: 0 } });
  },

  setDrawMode: (mode) => {
    set({ drawMode: mode });
  },

  setCursorPosition: (point) => {
    set({ cursorPosition: point });
  },

  setSnapState: (snapState) => {
    set({ snapState });
  },

  setShiftPressed: (pressed) => {
    set({ shiftPressed: pressed });
  },
}));
