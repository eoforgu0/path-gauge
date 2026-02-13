import { Circle } from "react-konva";
import type { PathNode } from "@/types";

interface Props {
  node: PathNode;
  color: string;
  scale: number;
}

export function NodeCircle({ node, color, scale }: Props) {
  return (
    <Circle
      x={node.x}
      y={node.y}
      radius={6 / scale}
      fill={color}
      stroke="#ffffff"
      strokeWidth={2 / scale}
      listening={false}
    />
  );
}
