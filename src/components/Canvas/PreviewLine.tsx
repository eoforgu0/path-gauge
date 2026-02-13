import { Line } from "react-konva";
import { useCanvasStore } from "@/stores/useCanvasStore";
import { usePathStore } from "@/stores/usePathStore";

export function PreviewLine() {
  const drawMode = useCanvasStore((s) => s.drawMode);
  const cursorPosition = useCanvasStore((s) => s.cursorPosition);
  const scale = useCanvasStore((s) => s.scale);
  const activePathId = usePathStore((s) => s.activePathId);
  const paths = usePathStore((s) => s.paths);

  if (drawMode !== "drawing" || !activePathId || !cursorPosition) return null;

  const activePath = paths.find((p) => p.id === activePathId);
  if (!activePath || activePath.nodes.length === 0) return null;

  const lastNode = activePath.nodes[activePath.nodes.length - 1]!;

  return (
    <Line
      points={[lastNode.x, lastNode.y, cursorPosition.x, cursorPosition.y]}
      stroke={`${activePath.color}80`}
      strokeWidth={2 / scale}
      dash={[6 / scale, 4 / scale]}
      listening={false}
    />
  );
}
