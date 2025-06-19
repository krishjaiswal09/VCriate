import React, { useRef, useEffect, useState } from "react";
import { Shape, Point, Annotation, Tool } from "../types";
import { drawShape, drawGrid, getCanvasCoordinates } from "../utils/drawing";
import {
  createShape,
  updateShapePoints,
  isPointInShape,
} from "../utils/shapes";

interface CanvasProps {
  shapes: Shape[];
  annotations: Annotation[];
  currentTool: Tool;
  selectedShapeId: string | null;
  showAnnotations: boolean;
  zoom: number;
  offset: Point;
  onShapesChange: (shapes: Shape[]) => void;
  onAnnotationsChange: (annotations: Annotation[]) => void;
  onSelectedShapeChange: (shapeId: string | null) => void;
  onOffsetChange: (offset: Point) => void;
}

const Canvas: React.FC<CanvasProps> = ({
  shapes,
  annotations,
  currentTool,
  selectedShapeId,
  showAnnotations,
  zoom,
  offset,
  onShapesChange,
  onAnnotationsChange,
  onSelectedShapeChange,
  onOffsetChange,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentShape, setCurrentShape] = useState<Shape | null>(null);
  const [isPanning, setIsPanning] = useState(false);
  const [lastPanPoint, setLastPanPoint] = useState<Point>({ x: 0, y: 0 });
  const [dragStart, setDragStart] = useState<Point | null>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 1200, height: 800 });

  // Update canvas size when container resizes
  useEffect(() => {
    const updateCanvasSize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setCanvasSize({
          width: rect.width,
          height: rect.height,
        });
      }
    };

    updateCanvasSize();
    window.addEventListener("resize", updateCanvasSize);
    return () => window.removeEventListener("resize", updateCanvasSize);
  }, []);

  const canvasWidth = canvasSize.width;
  const canvasHeight = canvasSize.height;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    // Draw grid
    drawGrid(ctx, canvasWidth, canvasHeight, zoom, offset);

    // Draw all shapes
    shapes.forEach((shape) => {
      const shapeWithSelection = {
        ...shape,
        selected: shape.id === selectedShapeId,
      };
      drawShape(ctx, shapeWithSelection, zoom, offset);
    });

    // Draw current shape being drawn
    if (currentShape) {
      drawShape(ctx, currentShape, zoom, offset);
    }

    // Draw annotations
    if (showAnnotations) {
      ctx.save();
      ctx.translate(offset.x, offset.y);
      ctx.scale(zoom, zoom);

      annotations.forEach((annotation) => {
        ctx.fillStyle = "#FCD34D";
        ctx.font = "12px Inter, sans-serif";
        ctx.fillRect(
          annotation.x - 2,
          annotation.y - 14,
          ctx.measureText(annotation.text).width + 4,
          16
        );
        ctx.fillStyle = "#1F2937";
        ctx.fillText(annotation.text, annotation.x, annotation.y);
      });

      ctx.restore();
    }
  }, [
    shapes,
    currentShape,
    selectedShapeId,
    annotations,
    showAnnotations,
    zoom,
    offset,
    canvasWidth,
    canvasHeight,
  ]);

  const handleMouseDown = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const point = getCanvasCoordinates(event, canvas, zoom, offset);

    if (currentTool === "pan") {
      setIsPanning(true);
      setLastPanPoint({ x: event.clientX, y: event.clientY });
      return;
    }

    if (currentTool === "select") {
      const clickedShape = shapes.find((shape) => isPointInShape(point, shape));
      if (clickedShape) {
        onSelectedShapeChange(clickedShape.id);
        setDragStart(point);
      } else {
        onSelectedShapeChange(null);
      }
      return;
    }

    if (currentTool === "annotate") {
      const text = prompt("Enter annotation text:");
      if (text) {
        const newAnnotation: Annotation = {
          id: crypto.randomUUID(),
          x: point.x,
          y: point.y,
          text,
        };
        onAnnotationsChange([...annotations, newAnnotation]);
      }
      return;
    }

    // Start drawing
    if (
      ["line", "rectangle", "circle", "triangle", "freehand"].includes(
        currentTool
      )
    ) {
      setIsDrawing(true);
      const newShape = createShape(currentTool as Shape["type"], point);
      setCurrentShape(newShape);
    }
  };

  const handleMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (isPanning) {
      const deltaX = event.clientX - lastPanPoint.x;
      const deltaY = event.clientY - lastPanPoint.y;
      onOffsetChange({
        x: offset.x + deltaX,
        y: offset.y + deltaY,
      });
      setLastPanPoint({ x: event.clientX, y: event.clientY });
      return;
    }

    const point = getCanvasCoordinates(event, canvas, zoom, offset);

    if (isDrawing && currentShape) {
      const updatedShape = updateShapePoints(currentShape, point);
      setCurrentShape(updatedShape);
    }

    if (currentTool === "select" && selectedShapeId && dragStart) {
      const deltaX = point.x - dragStart.x;
      const deltaY = point.y - dragStart.y;

      const updatedShapes = shapes.map((shape) => {
        if (shape.id === selectedShapeId) {
          return {
            ...shape,
            points: shape.points.map((p) => ({
              x: p.x + deltaX,
              y: p.y + deltaY,
            })),
          };
        }
        return shape;
      });

      onShapesChange(updatedShapes);
      setDragStart(point);
    }
  };

  const handleMouseUp = () => {
    if (isPanning) {
      setIsPanning(false);
      return;
    }

    if (isDrawing && currentShape) {
      onShapesChange([...shapes, currentShape]);
      setCurrentShape(null);
      setIsDrawing(false);
    }

    setDragStart(null);
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Delete" && selectedShapeId) {
      const updatedShapes = shapes.filter(
        (shape) => shape.id !== selectedShapeId
      );
      onShapesChange(updatedShapes);
      onSelectedShapeChange(null);
    }
  };

  return (
    <div
      ref={containerRef}
      className="flex-1 bg-gray-950 overflow-hidden relative"
    >
      <canvas
        ref={canvasRef}
        width={canvasWidth}
        height={canvasHeight}
        className="cursor-crosshair bg-gray-900"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        style={{
          cursor:
            currentTool === "pan"
              ? "grab"
              : currentTool === "select"
              ? "default"
              : "crosshair",
        }}
      />

      {/* Zoom indicator */}
      <div className="absolute bottom-4 right-4 bg-gray-800 text-gray-300 px-3 py-1 rounded-lg text-sm">
        Zoom: {Math.round(zoom * 100)}%
      </div>
    </div>
  );
};

export default Canvas;
