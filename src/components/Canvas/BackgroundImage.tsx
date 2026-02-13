import { useEffect, useState } from "react";
import { Image as KonvaImage } from "react-konva";
import { useCanvasStore } from "@/stores/useCanvasStore";

export function BackgroundImage() {
  const imageUrl = useCanvasStore((s) => s.imageUrl);
  const [image, setImage] = useState<HTMLImageElement | null>(null);

  useEffect(() => {
    if (!imageUrl) {
      setImage(null);
      return;
    }
    const img = new window.Image();
    img.src = imageUrl;
    img.onload = () => setImage(img);
  }, [imageUrl]);

  if (!image) return null;

  return <KonvaImage image={image} listening={false} />;
}
