import type Konva from "konva";
import { useCallback, useState } from "react";
import { Line } from "react-konva";
import { useCanvasStore } from "@/stores/useCanvasStore";
import { usePathStore } from "@/stores/usePathStore";
import type { PathNode } from "@/types";

interface Props {
  pathId: string;
  fromNode: PathNode;
  toNode: PathNode;
  color: string;
  scale: number;
}

export function EdgeLine({ pathId, fromNode, toNode, color, scale }: Props) {
  const drawMode = useCanvasStore((s) => s.drawMode);
  const position = useCanvasStore((s) => s.position);
  const insertNodeAfter = usePathStore((s) => s.insertNodeAfter);

  const [hovered, setHovered] = useState(false);
  const isInteractive = drawMode === "idle";

  const handleClick = useCallback(
    (e: Konva.KonvaEventObject<MouseEvent>) => {
      if (!isInteractive || e.evt.button !== 0) return;
      e.cancelBubble = true;

      const stage = e.target.getStage();
      if (!stage) return;
      const pointer = stage.getPointerPosition();
      if (!pointer) return;

      const imgX = (pointer.x - position.x) / scale;
      const imgY = (pointer.y - position.y) / scale;

      insertNodeAfter(pathId, fromNode.id, { x: imgX, y: imgY });
    },
    [isInteractive, pathId, fromNode.id, position, scale, insertNodeAfter],
  );

  const handleMouseEnter = useCallback((e: Konva.KonvaEventObject<MouseEvent>) => {
    setHovered(true);
    const container = e.target.getStage()?.container();
    if (container) container.style.cursor = "copy";
  }, []);

  const handleMouseLeave = useCallback((e: Konva.KonvaEventObject<MouseEvent>) => {
    setHovered(false);
    const container = e.target.getStage()?.container();
    if (container) container.style.cursor = "";
  }, []);

  const strokeWidth = (hovered ? 4 : 3) / scale;
  const strokeColor = hovered ? brighten(color) : color;

  return (
    <Line
      points={[fromNode.x, fromNode.y, toNode.x, toNode.y]}
      stroke={strokeColor}
      strokeWidth={strokeWidth}
      hitStrokeWidth={20 / scale}
      listening={isInteractive}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    />
  );
}

function brighten(hex: string): string {
  const r = Math.min(255, Number.parseInt(hex.slice(1, 3), 16) + 50);
  const g = Math.min(255, Number.parseInt(hex.slice(3, 5), 16) + 50);
  const b = Math.min(255, Number.parseInt(hex.slice(5, 7), 16) + 50);
  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}
