export interface Point {
  x: number;
  y: number;
}

export interface Shape {
  id: string;
  type: 'line' | 'rectangle' | 'circle' | 'triangle' | 'freehand';
  points: Point[];
  color: string;
  strokeWidth: number;
  selected?: boolean;
}

export interface Annotation {
  id: string;
  x: number;
  y: number;
  text: string;
  shapeId?: string;
}

export type Tool = 'select' | 'line' | 'rectangle' | 'circle' | 'triangle' | 'freehand' | 'annotate' | 'pan';

export interface CanvasState {
  shapes: Shape[];
  annotations: Annotation[];
  selectedShapeId: string | null;
  currentTool: Tool;
  isDrawing: boolean;
  currentShape: Shape | null;
  zoom: number;
  offset: Point;
  showAnnotations: boolean;
}