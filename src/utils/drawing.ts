import { Shape, Point } from '../types';

export const drawShape = (
  ctx: CanvasRenderingContext2D,
  shape: Shape,
  zoom: number = 1,
  offset: Point = { x: 0, y: 0 }
): void => {
  if (shape.points.length === 0) return;

  ctx.save();
  ctx.translate(offset.x, offset.y);
  ctx.scale(zoom, zoom);
  
  ctx.strokeStyle = shape.color;
  ctx.lineWidth = shape.strokeWidth;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  if (shape.selected) {
    ctx.shadowColor = shape.color;
    ctx.shadowBlur = 10;
  }

  ctx.beginPath();

  switch (shape.type) {
    case 'line':
      if (shape.points.length >= 2) {
        const [start, end] = shape.points;
        ctx.moveTo(start.x, start.y);
        ctx.lineTo(end.x, end.y);
      }
      break;

    case 'rectangle':
      if (shape.points.length >= 2) {
        const [start, end] = shape.points;
        const width = end.x - start.x;
        const height = end.y - start.y;
        ctx.rect(start.x, start.y, width, height);
      }
      break;

    case 'circle':
      if (shape.points.length >= 2) {
        const [center, edge] = shape.points;
        const radius = Math.sqrt(
          Math.pow(edge.x - center.x, 2) + Math.pow(edge.y - center.y, 2)
        );
        ctx.arc(center.x, center.y, radius, 0, 2 * Math.PI);
      }
      break;

    case 'triangle':
      if (shape.points.length >= 2) {
        const [start, end] = shape.points;
        const width = end.x - start.x;
        const height = end.y - start.y;
        
        // Draw an equilateral-style triangle
        const centerX = start.x + width / 2;
        const topY = start.y;
        const bottomY = start.y + height;
        const leftX = start.x;
        const rightX = end.x;
        
        ctx.moveTo(centerX, topY);
        ctx.lineTo(leftX, bottomY);
        ctx.lineTo(rightX, bottomY);
        ctx.closePath();
      }
      break;

    case 'freehand':
      if (shape.points.length > 1) {
        ctx.moveTo(shape.points[0].x, shape.points[0].y);
        for (let i = 1; i < shape.points.length; i++) {
          ctx.lineTo(shape.points[i].x, shape.points[i].y);
        }
      }
      break;
  }

  ctx.stroke();
  ctx.restore();
};

export const drawGrid = (
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  zoom: number,
  offset: Point
): void => {
  ctx.save();
  ctx.strokeStyle = '#374151';
  ctx.lineWidth = 0.5;
  ctx.globalAlpha = 0.3;

  const gridSize = 20 * zoom;
  const startX = (-offset.x) % gridSize;
  const startY = (-offset.y) % gridSize;

  ctx.beginPath();
  
  // Vertical lines
  for (let x = startX; x < width; x += gridSize) {
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
  }
  
  // Horizontal lines
  for (let y = startY; y < height; y += gridSize) {
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
  }
  
  ctx.stroke();
  ctx.restore();
};

export const getCanvasCoordinates = (
  event: React.MouseEvent<HTMLCanvasElement>,
  canvas: HTMLCanvasElement,
  zoom: number,
  offset: Point
): Point => {
  const rect = canvas.getBoundingClientRect();
  const x = (event.clientX - rect.left - offset.x) / zoom;
  const y = (event.clientY - rect.top - offset.y) / zoom;
  return { x, y };
};