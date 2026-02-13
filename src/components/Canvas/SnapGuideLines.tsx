import { Line } from "react-konva";
import { useCanvasStore } from "@/stores/useCanvasStore";

export function SnapGuideLines() {
  const snapState = useCanvasStore((s) => s.snapState);
  const scale = useCanvasStore((s) => s.scale);
  const imageSize = useCanvasStore((s) => s.imageSize);

  if (!snapState.active || snapState.guideLines.length === 0 || !imageSize) return null;

  return (
    <>
      {snapState.guideLines.map((guide, i) => {
        const from = guide.from;
        const to = guide.to;

        // Extend guideline to image boundaries
        const x1 = guide.axis === "horizontal" ? 0 : from.x;
        const y1 = guide.axis === "vertical" ? 0 : from.y;
        const x2 = guide.axis === "horizontal" ? imageSize.width : to.x;
        const y2 = guide.axis === "vertical" ? imageSize.height : to.y;

        const key = `${guide.axis}-${i}`;

        return (
          <Line
            key={key}
            points={[x1, y1, x2, y2]}
            stroke="#6366f1"
            strokeWidth={1 / scale}
            dash={[6 / scale, 4 / scale]}
            listening={false}
          />
        );
      })}
    </>
  );
}
