import { Shape, Point } from '../types';

export const createShape = (
  type: Shape['type'],
  startPoint: Point,
  color: string = '#3B82F6',
  strokeWidth: number = 2
): Shape => ({
  id: crypto.randomUUID(),
  type,
  points: [startPoint],
  color,
  strokeWidth,
});

export const updateShapePoints = (shape: Shape, newPoint: Point): Shape => {
  switch (shape.type) {
    case 'line':
      return { ...shape, points: [shape.points[0], newPoint] };
    case 'rectangle':
      return { ...shape, points: [shape.points[0], newPoint] };
    case 'circle':
      return { ...shape, points: [shape.points[0], newPoint] };
    case 'triangle':
      return { ...shape, points: [shape.points[0], newPoint] };
    case 'freehand':
      return { ...shape, points: [...shape.points, newPoint] };
    default:
      return shape;
  }
};

export const isPointInShape = (point: Point, shape: Shape): boolean => {
  const { points, type } = shape;
  
  switch (type) {
    case 'line':
      if (points.length < 2) return false;
      const [start, end] = points;
      const distance = distanceToLine(point, start, end);
      return distance < 10; // 10px tolerance
      
    case 'rectangle':
      if (points.length < 2) return false;
      const [topLeft, bottomRight] = points;
      return point.x >= Math.min(topLeft.x, bottomRight.x) &&
             point.x <= Math.max(topLeft.x, bottomRight.x) &&
             point.y >= Math.min(topLeft.y, bottomRight.y) &&
             point.y <= Math.max(topLeft.y, bottomRight.y);
             
    case 'circle':
      if (points.length < 2) return false;
      const [center, edge] = points;
      const radius = Math.sqrt(
        Math.pow(edge.x - center.x, 2) + Math.pow(edge.y - center.y, 2)
      );
      const distanceFromCenter = Math.sqrt(
        Math.pow(point.x - center.x, 2) + Math.pow(point.y - center.y, 2)
      );
      return Math.abs(distanceFromCenter - radius) < 10;

    case 'triangle':
      if (points.length < 2) return false;
      const [triangleStart, triangleEnd] = points;
      const width = triangleEnd.x - triangleStart.x;
      const height = triangleEnd.y - triangleStart.y;
      
      // Triangle vertices
      const centerX = triangleStart.x + width / 2;
      const topY = triangleStart.y;
      const bottomY = triangleStart.y + height;
      const leftX = triangleStart.x;
      const rightX = triangleEnd.x;
      
      const v1 = { x: centerX, y: topY };
      const v2 = { x: leftX, y: bottomY };
      const v3 = { x: rightX, y: bottomY };
      
      return isPointInTriangle(point, v1, v2, v3);
      
    case 'freehand':
      return points.some(p => 
        Math.sqrt(Math.pow(point.x - p.x, 2) + Math.pow(point.y - p.y, 2)) < 10
      );
      
    default:
      return false;
  }
};

const distanceToLine = (point: Point, lineStart: Point, lineEnd: Point): number => {
  const A = point.x - lineStart.x;
  const B = point.y - lineStart.y;
  const C = lineEnd.x - lineStart.x;
  const D = lineEnd.y - lineStart.y;

  const dot = A * C + B * D;
  const lenSq = C * C + D * D;
  
  if (lenSq === 0) return Math.sqrt(A * A + B * B);
  
  let param = dot / lenSq;
  param = Math.max(0, Math.min(1, param));
  
  const xx = lineStart.x + param * C;
  const yy = lineStart.y + param * D;
  
  const dx = point.x - xx;
  const dy = point.y - yy;
  
  return Math.sqrt(dx * dx + dy * dy);
};

const isPointInTriangle = (point: Point, v1: Point, v2: Point, v3: Point): boolean => {
  const denom = (v2.y - v3.y) * (v1.x - v3.x) + (v3.x - v2.x) * (v1.y - v3.y);
  const a = ((v2.y - v3.y) * (point.x - v3.x) + (v3.x - v2.x) * (point.y - v3.y)) / denom;
  const b = ((v3.y - v1.y) * (point.x - v3.x) + (v1.x - v3.x) * (point.y - v3.y)) / denom;
  const c = 1 - a - b;
  
  return a >= 0 && b >= 0 && c >= 0;
};

export const getShapeBounds = (shape: Shape): { x: number; y: number; width: number; height: number } => {
  if (shape.points.length === 0) return { x: 0, y: 0, width: 0, height: 0 };
  
  const xs = shape.points.map(p => p.x);
  const ys = shape.points.map(p => p.y);
  
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  
  return {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY
  };
};