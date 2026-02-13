import { Group, Rect, Text } from "react-konva";
import type { PathNode, UnitConfig } from "@/types";
import { formatDistance, pixelDistance } from "@/utils/distance";

interface Props {
  fromNode: PathNode;
  toNode: PathNode;
  color: string;
  scale: number;
  unitConfig: UnitConfig | null;
}

export function EdgeLabel({ fromNode, toNode, color, scale, unitConfig }: Props) {
  const dist = pixelDistance(fromNode, toNode);
  const text = formatDistance(dist, unitConfig);

  const midX = (fromNode.x + toNode.x) / 2;
  const midY = (fromNode.y + toNode.y) / 2;

  // Offset perpendicular to the edge
  const dx = toNode.x - fromNode.x;
  const dy = toNode.y - fromNode.y;
  const len = Math.sqrt(dx * dx + dy * dy);
  const offsetDist = 12 / scale;
  // Normal direction (perpendicular)
  const nx = len > 0 ? -dy / len : 0;
  const ny = len > 0 ? dx / len : 1;

  const labelX = midX + nx * offsetDist;
  const labelY = midY + ny * offsetDist;

  const fontSize = 11 / scale;
  const padX = 4 / scale;
  const padY = 2 / scale;
  const textWidth = text.length * fontSize * 0.6;
  const textHeight = fontSize;

  return (
    <Group x={labelX} y={labelY} listening={false}>
      <Rect
        x={-padX}
        y={-padY}
        width={textWidth + padX * 2}
        height={textHeight + padY * 2}
        fill="#0f1117cc"
        cornerRadius={2 / scale}
      />
      <Text text={text} fontSize={fontSize} fill={color} width={textWidth} align="center" />
    </Group>
  );
}
