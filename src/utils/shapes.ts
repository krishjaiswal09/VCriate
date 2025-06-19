
import { Shape, Point } from '../types';

export function createShape(
  type: Shape['type'],
  startPoint: Point,
  color: string = '#3B82F6',
  strokeWidth: number = 2
): Shape {
  return {
    id: crypto.randomUUID(),
    type,
    points: [startPoint],
    color,
    strokeWidth,
  };
}

export function updateShapePoints(shape: Shape, newPoint: Point): Shape {
  switch (shape.type) {
    case 'line':
    case 'rectangle':
    case 'circle':
    case 'triangle':
      // For these shapes, we only need start and end points
      return { ...shape, points: [shape.points[0], newPoint] };
      
    case 'freehand':
      // For freehand, add each point to create a continuous line
      return { ...shape, points: [...shape.points, newPoint] };
      
    default:
      return shape;
  }
}

export function isPointInShape(point: Point, shape: Shape): boolean {
  const { points, type } = shape;
  
  switch (type) {
    case 'line':
      return isPointNearLine(point, points);
      
    case 'rectangle':
      return isPointInRectangle(point, points);
      
    case 'circle':
      return isPointNearCircle(point, points);

    case 'triangle':
      return isPointInTriangle(point, points);
      
    case 'freehand':
      return isPointNearFreehandLine(point, points);
      
    default:
      return false;
  }
}

function isPointNearLine(point: Point, points: Point[]): boolean {
  if (points.length < 2) return false;
  
  const [start, end] = points;
  const distance = getDistanceToLine(point, start, end);
  return distance < 10; // 10px tolerance
}

function isPointInRectangle(point: Point, points: Point[]): boolean {
  if (points.length < 2) return false;
  
  const [topLeft, bottomRight] = points;
  const minX = Math.min(topLeft.x, bottomRight.x);
  const maxX = Math.max(topLeft.x, bottomRight.x);
  const minY = Math.min(topLeft.y, bottomRight.y);
  const maxY = Math.max(topLeft.y, bottomRight.y);
  
  return point.x >= minX && point.x <= maxX && point.y >= minY && point.y <= maxY;
}

function isPointNearCircle(point: Point, points: Point[]): boolean {
  if (points.length < 2) return false;
  
  const [center, edge] = points;
  const radius = getDistance(center, edge);
  const distanceFromCenter = getDistance(point, center);
  
  return Math.abs(distanceFromCenter - radius) < 10; // 10px tolerance
}

function isPointInTriangle(point: Point, points: Point[]): boolean {
  if (points.length < 2) return false;
  
  const [start, end] = points;
  const width = end.x - start.x;
  const height = end.y - start.y;
  
  // Calculate triangle vertices
  const top = { x: start.x + width / 2, y: start.y };
  const bottomLeft = { x: start.x, y: start.y + height };
  const bottomRight = { x: end.x, y: start.y + height };
  
  return isPointInsideTriangle(point, top, bottomLeft, bottomRight);
}

function isPointNearFreehandLine(point: Point, points: Point[]): boolean {
  return points.some(p => getDistance(point, p) < 10);
}

function getDistanceToLine(point: Point, lineStart: Point, lineEnd: Point): number {
  const A = point.x - lineStart.x;
  const B = point.y - lineStart.y;
  const C = lineEnd.x - lineStart.x;
  const D = lineEnd.y - lineStart.y;

  const dot = A * C + B * D;
  const lengthSquared = C * C + D * D;
  
  if (lengthSquared === 0) return Math.sqrt(A * A + B * B);
  
  let param = dot / lengthSquared;
  param = Math.max(0, Math.min(1, param));
  
  const closestX = lineStart.x + param * C;
  const closestY = lineStart.y + param * D;
  
  return getDistance(point, { x: closestX, y: closestY });
}

function getDistance(point1: Point, point2: Point): number {
  const dx = point1.x - point2.x;
  const dy = point1.y - point2.y;
  return Math.sqrt(dx * dx + dy * dy);
}

function isPointInsideTriangle(point: Point, v1: Point, v2: Point, v3: Point): boolean {
  const denom = (v2.y - v3.y) * (v1.x - v3.x) + (v3.x - v2.x) * (v1.y - v3.y);
  const a = ((v2.y - v3.y) * (point.x - v3.x) + (v3.x - v2.x) * (point.y - v3.y)) / denom;
  const b = ((v3.y - v1.y) * (point.x - v3.x) + (v1.x - v3.x) * (point.y - v3.y)) / denom;
  const c = 1 - a - b;
  
  return a >= 0 && b >= 0 && c >= 0;
}

export function getShapeBounds(shape: Shape): { x: number; y: number; width: number; height: number } {
  if (shape.points.length === 0) {
    return { x: 0, y: 0, width: 0, height: 0 };
  }
  
  const xValues = shape.points.map(p => p.x);
  const yValues = shape.points.map(p => p.y);
  
  const minX = Math.min(...xValues);
  const maxX = Math.max(...xValues);
  const minY = Math.min(...yValues);
  const maxY = Math.max(...yValues);
  
  return {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY
  };
}
