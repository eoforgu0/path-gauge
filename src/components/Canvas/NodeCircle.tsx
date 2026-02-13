import type Konva from "konva";
import { useCallback, useState } from "react";
import { Circle } from "react-konva";
import { useCanvasStore } from "@/stores/useCanvasStore";
import { usePathStore } from "@/stores/usePathStore";
import type { PathNode } from "@/types";
import { snapDragToNeighbors } from "@/utils/snap";

interface Props {
  pathId: string;
  node: PathNode;
  color: string;
  scale: number;
}

export function NodeCircle({ pathId, node, color, scale }: Props) {
  const drawMode = useCanvasStore((s) => s.drawMode);
  const shiftPressed = useCanvasStore((s) => s.shiftPressed);
  const setSnapState = useCanvasStore((s) => s.setSnapState);
  const moveNode = usePathStore((s) => s.moveNode);
  const removeNode = usePathStore((s) => s.removeNode);
  const paths = usePathStore((s) => s.paths);

  const [hovered, setHovered] = useState(false);
  const [dragging, setDragging] = useState(false);

  const isInteractive = drawMode === "idle";

  const getNeighbors = useCallback(() => {
    const path = paths.find((p) => p.id === pathId);
    if (!path) return { prev: null, next: null };
    const idx = path.nodes.findIndex((n) => n.id === node.id);
    return {
      prev: idx > 0 ? (path.nodes[idx - 1] ?? null) : null,
      next: idx < path.nodes.length - 1 ? (path.nodes[idx + 1] ?? null) : null,
    };
  }, [paths, pathId, node.id]);

  const handleDragStart = useCallback((e: Konva.KonvaEventObject<DragEvent>) => {
    e.cancelBubble = true;
    setDragging(true);
    const container = e.target.getStage()?.container();
    if (container) container.style.cursor = "grabbing";
  }, []);

  const handleDragMove = useCallback(
    (e: Konva.KonvaEventObject<DragEvent>) => {
      e.cancelBubble = true;
      const cursor = { x: e.target.x(), y: e.target.y() };

      if (shiftPressed) {
        const { prev, next } = getNeighbors();
        const result = snapDragToNeighbors(cursor, prev, next, scale);
        moveNode(pathId, node.id, result.point);
        e.target.x(result.point.x);
        e.target.y(result.point.y);
        setSnapState({
          active: result.guides.length > 0,
          snappedPoint: result.guides.length > 0 ? result.point : null,
          guideLines: result.guides,
        });
      } else {
        moveNode(pathId, node.id, cursor);
        setSnapState({ active: false, snappedPoint: null, guideLines: [] });
      }
    },
    [pathId, node.id, moveNode, shiftPressed, getNeighbors, scale, setSnapState],
  );

  const handleDragEnd = useCallback(
    (e: Konva.KonvaEventObject<DragEvent>) => {
      e.cancelBubble = true;
      setDragging(false);
      setSnapState({ active: false, snappedPoint: null, guideLines: [] });
      const container = e.target.getStage()?.container();
      if (container) container.style.cursor = "grab";
    },
    [setSnapState],
  );

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
