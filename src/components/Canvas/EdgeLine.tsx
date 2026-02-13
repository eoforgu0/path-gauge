import { Line } from "react-konva";
import type { PathNode } from "@/types";

interface Props {
  fromNode: PathNode;
  toNode: PathNode;
  color: string;
  scale: number;
}

export function EdgeLine({ fromNode, toNode, color, scale }: Props) {
  return (
    <Line
      points={[fromNode.x, fromNode.y, toNode.x, toNode.y]}
      stroke={color}
      strokeWidth={3 / scale}
      listening={false}
    />
  );
}
