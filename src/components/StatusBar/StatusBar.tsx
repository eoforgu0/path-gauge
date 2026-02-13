import { useCanvasStore } from "@/stores/useCanvasStore";

export function StatusBar() {
  const cursorPosition = useCanvasStore((s) => s.cursorPosition);
  const scale = useCanvasStore((s) => s.scale);

  return (
    <div className="flex h-7 items-center justify-between border-t border-border bg-surface px-4">
      <span className="text-xs text-text-muted">
        {cursorPosition ? `カーソル: (${cursorPosition.x}, ${cursorPosition.y})` : "カーソル: —"}
      </span>
      <span className="text-xs text-text-muted">ズーム: {Math.round(scale * 100)}%</span>
    </div>
  );
}
