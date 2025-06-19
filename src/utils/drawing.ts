
import { Shape, Point } from '../types';

export function drawShape(
  ctx: CanvasRenderingContext2D,
  shape: Shape,
  zoom: number = 1,
  offset: Point = { x: 0, y: 0 }
): void {
  if (shape.points.length === 0) return;

  ctx.save();
  
  // Apply zoom and offset transformations
  ctx.translate(offset.x, offset.y);
  ctx.scale(zoom, zoom);
  
  // Set drawing style
  ctx.strokeStyle = shape.color;
  ctx.lineWidth = shape.strokeWidth;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  // Add glow effect for selected shapes
  if (shape.selected) {
    ctx.shadowColor = shape.color;
    ctx.shadowBlur = 10;
  }

  ctx.beginPath();

  // Draw the shape based on its type
  switch (shape.type) {
    case 'line':
      drawLine(ctx, shape.points);
      break;
    case 'rectangle':
      drawRectangle(ctx, shape.points);
      break;
    case 'circle':
      drawCircle(ctx, shape.points);
      break;
    case 'triangle':
      drawTriangle(ctx, shape.points);
      break;
    case 'freehand':
      drawFreehandLine(ctx, shape.points);
      break;
  }

  ctx.stroke();
  ctx.restore();
}

function drawLine(ctx: CanvasRenderingContext2D, points: Point[]): void {
  if (points.length < 2) return;
  
  const [start, end] = points;
  ctx.moveTo(start.x, start.y);
  ctx.lineTo(end.x, end.y);
}

function drawRectangle(ctx: CanvasRenderingContext2D, points: Point[]): void {
  if (points.length < 2) return;
  
  const [start, end] = points;
  const width = end.x - start.x;
  const height = end.y - start.y;
  ctx.rect(start.x, start.y, width, height);
}

function drawCircle(ctx: CanvasRenderingContext2D, points: Point[]): void {
  if (points.length < 2) return;
  
  const [center, edge] = points;
  const radius = Math.sqrt(
    Math.pow(edge.x - center.x, 2) + Math.pow(edge.y - center.y, 2)
  );
  ctx.arc(center.x, center.y, radius, 0, 2 * Math.PI);
}

function drawTriangle(ctx: CanvasRenderingContext2D, points: Point[]): void {
  if (points.length < 2) return;
  
  const [start, end] = points;
  const width = end.x - start.x;
  const height = end.y - start.y;
  
  // Calculate triangle vertices
  const centerX = start.x + width / 2;
  const topY = start.y;
  const bottomY = start.y + height;
  const leftX = start.x;
  const rightX = end.x;
  
  // Draw triangle
  ctx.moveTo(centerX, topY);
  ctx.lineTo(leftX, bottomY);
  ctx.lineTo(rightX, bottomY);
  ctx.closePath();
}

function drawFreehandLine(ctx: CanvasRenderingContext2D, points: Point[]): void {
  if (points.length < 2) return;
  
  ctx.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < points.length; i++) {
    ctx.lineTo(points[i].x, points[i].y);
  }
}

export function drawGrid(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  zoom: number,
  offset: Point
): void {
  ctx.save();
  
  ctx.strokeStyle = '#374151';
  ctx.lineWidth = 0.5;
  ctx.globalAlpha = 0.3;

  const gridSize = 20 * zoom;
  const startX = (-offset.x) % gridSize;
  const startY = (-offset.y) % gridSize;

  ctx.beginPath();
  
  // Draw vertical grid lines
  for (let x = startX; x < width; x += gridSize) {
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
  }
  
  // Draw horizontal grid lines
  for (let y = startY; y < height; y += gridSize) {
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
  }
  
  ctx.stroke();
  ctx.restore();
}

export function getCanvasCoordinates(
  event: React.MouseEvent<HTMLCanvasElement>,
  canvas: HTMLCanvasElement,
  zoom: number,
  offset: Point
): Point {
  const rect = canvas.getBoundingClientRect();
  
  // Convert screen coordinates to canvas coordinates
  const x = (event.clientX - rect.left - offset.x) / zoom;
  const y = (event.clientY - rect.top - offset.y) / zoom;
  
  return { x, y };
}
