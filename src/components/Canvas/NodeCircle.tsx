import type Konva from "konva";
import { useCallback, useState } from "react";
import { Circle } from "react-konva";
import { useCanvasStore } from "@/stores/useCanvasStore";
import { usePathStore } from "@/stores/usePathStore";
import type { PathNode } from "@/types";

interface Props {
  pathId: string;
  node: PathNode;
  color: string;
  scale: number;
}

export function NodeCircle({ pathId, node, color, scale }: Props) {
  const drawMode = useCanvasStore((s) => s.drawMode);
  const moveNode = usePathStore((s) => s.moveNode);
  const removeNode = usePathStore((s) => s.removeNode);

  const [hovered, setHovered] = useState(false);
  const [dragging, setDragging] = useState(false);

  const isInteractive = drawMode === "idle";

  const handleDragStart = useCallback((e: Konva.KonvaEventObject<DragEvent>) => {
    e.cancelBubble = true;
    setDragging(true);
    const container = e.target.getStage()?.container();
    if (container) container.style.cursor = "grabbing";
  }, []);

  const handleDragMove = useCallback(
    (e: Konva.KonvaEventObject<DragEvent>) => {
      e.cancelBubble = true;
      moveNode(pathId, node.id, { x: e.target.x(), y: e.target.y() });
    },
    [pathId, node.id, moveNode],
  );

  const handleDragEnd = useCallback((e: Konva.KonvaEventObject<DragEvent>) => {
    e.cancelBubble = true;
    setDragging(false);
    const container = e.target.getStage()?.container();
    if (container) container.style.cursor = "grab";
  }, []);

  const handleMouseEnter = useCallback((e: Konva.KonvaEventObject<MouseEvent>) => {
    setHovered(true);
    const container = e.target.getStage()?.container();
    if (container) container.style.cursor = "grab";
  }, []);

  const handleMouseLeave = useCallback(
    (e: Konva.KonvaEventObject<MouseEvent>) => {
      setHovered(false);
      if (!dragging) {
        const container = e.target.getStage()?.container();
        if (container) container.style.cursor = "";
      }
    },
    [dragging],
  );

  const handleContextMenu = useCallback(
    (e: Konva.KonvaEventObject<PointerEvent>) => {
      e.evt.preventDefault();
      e.cancelBubble = true;
      if (isInteractive) {
        removeNode(pathId, node.id);
      }
    },
    [isInteractive, pathId, node.id, removeNode],
  );

  const handleClick = useCallback((e: Konva.KonvaEventObject<MouseEvent>) => {
    e.cancelBubble = true;
  }, []);

  const radius = (hovered || dragging ? 8 : 6) / scale;
  const strokeWidth = (dragging ? 3 : 2) / scale;

  return (
    <Circle
      x={node.x}
      y={node.y}
      radius={radius}
      fill={color}
      stroke="#ffffff"
      strokeWidth={strokeWidth}
      draggable={isInteractive}
      listening={isInteractive}
      onDragStart={handleDragStart}
      onDragMove={handleDragMove}
      onDragEnd={handleDragEnd}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onContextMenu={handleContextMenu}
      onClick={handleClick}
    />
  );
}
