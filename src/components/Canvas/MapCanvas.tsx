import type Konva from "konva";
import { useCallback, useEffect, useRef, useState } from "react";
import { Layer, Stage } from "react-konva";
import { ImageDropZone } from "@/components/ImageLoader/ImageDropZone";
import { useCanvasStore } from "@/stores/useCanvasStore";
import { BackgroundImage } from "./BackgroundImage";

const ZOOM_FACTOR = 1.1;
const FIT_MARGIN = 20;

export function MapCanvas() {
  const imageUrl = useCanvasStore((s) => s.imageUrl);
  const imageSize = useCanvasStore((s) => s.imageSize);
  const scale = useCanvasStore((s) => s.scale);
  const position = useCanvasStore((s) => s.position);
  const setScale = useCanvasStore((s) => s.setScale);
  const setPosition = useCanvasStore((s) => s.setPosition);
  const setCursorPosition = useCanvasStore((s) => s.setCursorPosition);
  const fitRequestCounter = useCanvasStore((s) => s.fitRequestCounter);

  const [containerEl, setContainerEl] = useState<HTMLDivElement | null>(null);
  const stageRef = useRef<Konva.Stage>(null);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const isPanning = useRef(false);
  const panStart = useRef({ x: 0, y: 0 });

  // Track container size via callback ref
  useEffect(() => {
    if (!containerEl) return;

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) {
        setContainerSize({
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        });
      }
    });
    observer.observe(containerEl);
    return () => observer.disconnect();
  }, [containerEl]);

  // Fit to screen function
  const fitToScreen = useCallback(() => {
    if (!imageSize || containerSize.width === 0 || containerSize.height === 0) return;
    const scaleX = (containerSize.width - FIT_MARGIN * 2) / imageSize.width;
    const scaleY = (containerSize.height - FIT_MARGIN * 2) / imageSize.height;
    const newScale = Math.min(scaleX, scaleY);
    const newX = (containerSize.width - imageSize.width * newScale) / 2;
    const newY = (containerSize.height - imageSize.height * newScale) / 2;
    setScale(newScale);
    setPosition({ x: newX, y: newY });
  }, [imageSize, containerSize, setScale, setPosition]);

  // Auto fit on image load
  useEffect(() => {
    if (imageUrl && imageSize && containerSize.width > 0) {
      fitToScreen();
    }
  }, [imageUrl, imageSize, containerSize.width, fitToScreen]);

  // Fit to screen on toolbar zoom reset request
  useEffect(() => {
    if (fitRequestCounter > 0) {
      fitToScreen();
    }
  }, [fitRequestCounter, fitToScreen]);

  // Zoom with mouse wheel
  const handleWheel = useCallback(
    (e: Konva.KonvaEventObject<WheelEvent>) => {
      e.evt.preventDefault();
      const stage = stageRef.current;
      if (!stage) return;

      const oldScale = scale;
      const pointer = stage.getPointerPosition();
      if (!pointer) return;

      const direction = e.evt.deltaY > 0 ? -1 : 1;
      const newScale = direction > 0 ? oldScale * ZOOM_FACTOR : oldScale / ZOOM_FACTOR;

      const mousePointTo = {
        x: (pointer.x - position.x) / oldScale,
        y: (pointer.y - position.y) / oldScale,
      };

      const newPos = {
        x: pointer.x - mousePointTo.x * newScale,
        y: pointer.y - mousePointTo.y * newScale,
      };

      setScale(newScale);
      setPosition(newPos);
    },
    [scale, position, setScale, setPosition],
  );

  // Pan with middle mouse button
  const handleMouseDown = useCallback(
    (e: Konva.KonvaEventObject<MouseEvent>) => {
      if (e.evt.button === 1) {
        e.evt.preventDefault();
        isPanning.current = true;
        panStart.current = { x: e.evt.clientX - position.x, y: e.evt.clientY - position.y };
      }
    },
    [position],
  );

  const handleMouseMove = useCallback(
    (e: Konva.KonvaEventObject<MouseEvent>) => {
      // Update cursor position for status bar
      const stage = stageRef.current;
      if (stage) {
        const pointer = stage.getPointerPosition();
        if (pointer) {
          const imageX = (pointer.x - position.x) / scale;
          const imageY = (pointer.y - position.y) / scale;
          setCursorPosition({ x: Math.round(imageX), y: Math.round(imageY) });
        }
      }

      if (isPanning.current) {
        setPosition({
          x: e.evt.clientX - panStart.current.x,
          y: e.evt.clientY - panStart.current.y,
        });
      }
    },
    [position, scale, setPosition, setCursorPosition],
  );

  const handleMouseUp = useCallback((e: Konva.KonvaEventObject<MouseEvent>) => {
    if (e.evt.button === 1) {
      isPanning.current = false;
    }
  }, []);

  const handleMouseLeave = useCallback(() => {
    isPanning.current = false;
    setCursorPosition(null);
  }, [setCursorPosition]);

  if (!imageUrl) {
    return <ImageDropZone />;
  }

  return (
    <div
      ref={setContainerEl}
      className="flex-1 overflow-hidden bg-canvas-bg"
      style={{ cursor: isPanning.current ? "move" : "default" }}
      onContextMenu={(e) => e.preventDefault()}
    >
      {containerSize.width > 0 && (
        <Stage
          ref={stageRef}
          width={containerSize.width}
          height={containerSize.height}
          scaleX={scale}
          scaleY={scale}
          x={position.x}
          y={position.y}
          onWheel={handleWheel}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
        >
          <Layer>
            <BackgroundImage />
          </Layer>
        </Stage>
      )}
    </div>
  );
}
