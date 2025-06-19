
import React, { useRef, useEffect, useState } from "react";
import { Shape, Point, Annotation, Tool } from "../types";
import { drawShape, drawGrid, getCanvasCoordinates } from "../utils/drawing";
import { createShape, updateShapePoints, isPointInShape } from "../utils/shapes";

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

function Canvas({
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
}: CanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Drawing state
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentShape, setCurrentShape] = useState<Shape | null>(null);
  
  // Panning state
  const [isPanning, setIsPanning] = useState(false);
  const [lastPanPoint, setLastPanPoint] = useState<Point>({ x: 0, y: 0 });
  
  // Selection state
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<Point | null>(null);
  
  // Canvas size
  const [canvasSize, setCanvasSize] = useState({ width: 1200, height: 800 });

  // Update canvas size when container resizes
  useEffect(() => {
    function updateCanvasSize() {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setCanvasSize({
          width: rect.width,
          height: rect.height,
        });
      }
    }

    updateCanvasSize();
    window.addEventListener("resize", updateCanvasSize);
    return () => window.removeEventListener("resize", updateCanvasSize);
  }, []);

  // Draw everything on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvasSize.width, canvasSize.height);

    // Draw grid background
    drawGrid(ctx, canvasSize.width, canvasSize.height, zoom, offset);

    // Draw all saved shapes
    shapes.forEach((shape) => {
      const isSelected = shape.id === selectedShapeId;
      drawShape(ctx, { ...shape, selected: isSelected }, zoom, offset);
    });

    // Draw shape being created
    if (currentShape) {
      drawShape(ctx, currentShape, zoom, offset);
    }

    // Draw annotations if enabled
    if (showAnnotations) {
      drawAnnotations(ctx, annotations, zoom, offset);
    }
  }, [shapes, currentShape, selectedShapeId, annotations, showAnnotations, zoom, offset, canvasSize]);

  function drawAnnotations(ctx: CanvasRenderingContext2D, annotations: Annotation[], zoom: number, offset: Point) {
    ctx.save();
    ctx.translate(offset.x, offset.y);
    ctx.scale(zoom, zoom);

    annotations.forEach((annotation) => {
      const textWidth = ctx.measureText(annotation.text).width;
      
      // Draw background
      ctx.fillStyle = "#FCD34D";
      ctx.fillRect(annotation.x - 2, annotation.y - 14, textWidth + 4, 16);
      
      // Draw text
      ctx.fillStyle = "#1F2937";
      ctx.font = "12px Inter, sans-serif";
      ctx.fillText(annotation.text, annotation.x, annotation.y);
    });

    ctx.restore();
  }

  function handleMouseDown(event: React.MouseEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const point = getCanvasCoordinates(event, canvas, zoom, offset);

    // Handle panning
    if (currentTool === "pan") {
      setIsPanning(true);
      setLastPanPoint({ x: event.clientX, y: event.clientY });
      return;
    }

    // Handle selection and dragging
    if (currentTool === "select") {
      const clickedShape = shapes.find((shape) => isPointInShape(point, shape));
      
      if (clickedShape) {
        onSelectedShapeChange(clickedShape.id);
        setIsDragging(true);
        setDragStart(point);
      } else {
        onSelectedShapeChange(null);
      }
      return;
    }

    // Handle annotation creation
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

    // Handle shape drawing
    if (["line", "rectangle", "circle", "triangle", "freehand"].includes(currentTool)) {
      setIsDrawing(true);
      const newShape = createShape(currentTool as Shape["type"], point);
      setCurrentShape(newShape);
    }
  }

  function handleMouseMove(event: React.MouseEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Handle panning
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

    // Handle shape drawing
    if (isDrawing && currentShape) {
      const updatedShape = updateShapePoints(currentShape, point);
      setCurrentShape(updatedShape);
    }

    // Handle shape dragging
    if (isDragging && selectedShapeId && dragStart) {
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
  }

  function handleMouseUp() {
    // Stop panning
    if (isPanning) {
      setIsPanning(false);
      return;
    }

    // Finish drawing shape
    if (isDrawing && currentShape) {
      onShapesChange([...shapes, currentShape]);
      setCurrentShape(null);
      setIsDrawing(false);
    }

    // Stop dragging
    setIsDragging(false);
    setDragStart(null);
  }

  function handleKeyDown(event: React.KeyboardEvent) {
    if (event.key === "Delete" && selectedShapeId) {
      const updatedShapes = shapes.filter((shape) => shape.id !== selectedShapeId);
      onShapesChange(updatedShapes);
      onSelectedShapeChange(null);
    }
  }

  function getCursorStyle() {
    if (currentTool === "pan") return "grab";
    if (currentTool === "select") return "default";
    return "crosshair";
  }

  return (
    <div ref={containerRef} className="flex-1 bg-gray-950 overflow-hidden relative">
      <canvas
        ref={canvasRef}
        width={canvasSize.width}
        height={canvasSize.height}
        className="bg-gray-900"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        style={{ cursor: getCursorStyle() }}
      />

      {/* Zoom indicator */}
      <div className="absolute bottom-4 right-4 bg-gray-800 text-gray-300 px-3 py-1 rounded-lg text-sm">
        Zoom: {Math.round(zoom * 100)}%
      </div>
    </div>
  );
}

export default Canvas;
