import { Circle } from "react-konva";
import { useCanvasStore } from "@/stores/useCanvasStore";

export function SnapGhost() {
  const snapState = useCanvasStore((s) => s.snapState);
  const scale = useCanvasStore((s) => s.scale);

  if (!snapState.active || !snapState.snappedPoint) return null;

  return (
    <Circle
      x={snapState.snappedPoint.x}
      y={snapState.snappedPoint.y}
      radius={6 / scale}
      fill="#6366f180"
      listening={false}
    />
  );
}
