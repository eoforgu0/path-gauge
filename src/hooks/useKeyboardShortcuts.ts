import { useEffect } from "react";
import { useCanvasStore } from "@/stores/useCanvasStore";
import { usePathStore } from "@/stores/usePathStore";

function isInputFocused(): boolean {
  const tag = document.activeElement?.tagName;
  return tag === "INPUT" || tag === "TEXTAREA";
}

export function useKeyboardShortcuts() {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Track shift key
      if (e.key === "Shift") {
        useCanvasStore.getState().setShiftPressed(true);
      }

      // Skip shortcuts when typing in inputs
      if (isInputFocused()) return;

      const drawMode = useCanvasStore.getState().drawMode;
      const activePathId = usePathStore.getState().activePathId;

      // Ctrl+Z / Cmd+Z — Undo last node (drawing mode only)
      if ((e.ctrlKey || e.metaKey) && e.key === "z") {
        if (drawMode === "drawing" && activePathId) {
          e.preventDefault();
          usePathStore.getState().undoLastNode(activePathId);
        }
        return;
      }

      // Escape — Cancel drawing
      if (e.key === "Escape") {
        if (drawMode === "drawing") {
          e.preventDefault();
          // If active path has 0 nodes, remove it
          if (activePathId) {
            const path = usePathStore.getState().paths.find((p) => p.id === activePathId);
            if (path && path.nodes.length === 0) {
              usePathStore.getState().removePath(activePathId);
            }
          }
          useCanvasStore.getState().setDrawMode("idle");
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === "Shift") {
        useCanvasStore.getState().setShiftPressed(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);
}
