import { ImageDropZone } from "@/components/ImageLoader/ImageDropZone";
import { useCanvasStore } from "@/stores/useCanvasStore";

export function MapCanvas() {
  const imageUrl = useCanvasStore((s) => s.imageUrl);
  const imageSize = useCanvasStore((s) => s.imageSize);

  if (!imageUrl) {
    return <ImageDropZone />;
  }

  return (
    <div className="flex flex-1 items-center justify-center bg-canvas-bg">
      <span className="text-sm text-text-muted">
        画像読込済み ({imageSize?.width} x {imageSize?.height})
      </span>
    </div>
  );
}
