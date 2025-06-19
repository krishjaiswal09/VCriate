import React, { useState, useCallback } from 'react';
import Toolbar from './components/Toolbar';
import Canvas from './components/Canvas';
import { Shape, Annotation, Tool, Point } from './types';

function App() {
  const [shapes, setShapes] = useState<Shape[]>([]);
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [selectedShapeId, setSelectedShapeId] = useState<string | null>(null);
  const [currentTool, setCurrentTool] = useState<Tool>('select');
  const [showAnnotations, setShowAnnotations] = useState(true);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState<Point>({ x: 100, y: 100 });
  
  // History for undo/redo
  const [history, setHistory] = useState<Shape[][]>([[]]);
  const [historyIndex, setHistoryIndex] = useState(0);

  const updateHistory = useCallback((newShapes: Shape[]) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push([...newShapes]);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [history, historyIndex]);

  const handleShapesChange = useCallback((newShapes: Shape[]) => {
    setShapes(newShapes);
    updateHistory(newShapes);
  }, [updateHistory]);

  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setShapes(history[historyIndex - 1]);
    }
  }, [history, historyIndex]);

  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setShapes(history[historyIndex + 1]);
    }
  }, [history, historyIndex]);

  const handleClear = useCallback(() => {
    const emptyShapes: Shape[] = [];
    setShapes(emptyShapes);
    setAnnotations([]);
    setSelectedShapeId(null);
    updateHistory(emptyShapes);
  }, [updateHistory]);

  const handleZoomIn = useCallback(() => {
    setZoom(prev => Math.min(prev * 1.2, 3));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoom(prev => Math.max(prev / 1.2, 0.1));
  }, []);

  return (
    <div className="h-screen flex flex-col bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-700 px-6 py-3">
        <h1 className="text-xl font-bold text-white">Building Planner L2</h1>
        <p className="text-sm text-gray-400">Professional 2D Drawing & Annotation Tool</p>
      </div>

      {/* Toolbar */}
      <Toolbar
        currentTool={currentTool}
        onToolChange={setCurrentTool}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onClear={handleClear}
        showAnnotations={showAnnotations}
        onToggleAnnotations={() => setShowAnnotations(!showAnnotations)}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        canUndo={historyIndex > 0}
        canRedo={historyIndex < history.length - 1}
        zoom={zoom}
      />

      {/* Main Canvas Area */}
      <div className="flex-1 flex">
        <Canvas
          shapes={shapes}
          annotations={annotations}
          currentTool={currentTool}
          selectedShapeId={selectedShapeId}
          showAnnotations={showAnnotations}
          zoom={zoom}
          offset={offset}
          onShapesChange={handleShapesChange}
          onAnnotationsChange={setAnnotations}
          onSelectedShapeChange={setSelectedShapeId}
          onOffsetChange={setOffset}
        />

        {/* Properties Panel */}
        <div className="w-64 bg-gray-900 border-l border-gray-700 p-4">
          <h3 className="font-semibold text-white mb-4">Properties</h3>
          
          {selectedShapeId ? (
            <div className="space-y-3">
              <div>
                <label className="text-sm text-gray-400">Selected Shape</label>
                <p className="text-white capitalize">
                  {shapes.find(s => s.id === selectedShapeId)?.type || 'None'}
                </p>
              </div>
              
              <div>
                <label className="text-sm text-gray-400">Actions</label>
                <button
                  onClick={() => {
                    const updatedShapes = shapes.filter(s => s.id !== selectedShapeId);
                    handleShapesChange(updatedShapes);
                    setSelectedShapeId(null);
                  }}
                  className="block w-full mt-1 px-3 py-2 bg-red-700 hover:bg-red-600 text-white text-sm rounded transition-colors"
                >
                  Delete Shape
                </button>
              </div>
            </div>
          ) : (
            <div className="text-gray-500 text-sm">
              <p>Select a shape to view properties</p>
            </div>
          )}

          {/* <div className="mt-6 pt-6 border-t border-gray-700">
            <h4 className="font-medium text-white mb-3">Statistics</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Shapes:</span>
                <span className="text-white">{shapes.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Annotations:</span>
                <span className="text-white">{annotations.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Zoom:</span>
                <span className="text-white">{Math.round(zoom * 100)}%</span>
              </div>
            </div>
          </div> */}

          {/* <div className="mt-6 pt-6 border-t border-gray-700">
            <h4 className="font-medium text-white mb-3">Tips</h4>
            <ul className="space-y-2 text-xs text-gray-400">
              <li>• Use Pan tool to navigate the canvas</li>
              <li>• Press Delete to remove selected shapes</li>
              <li>• Click and drag to draw shapes</li>
              <li>• Add annotations for measurements</li>
            </ul>
          </div> */}
        </div>
      </div>
    </div>
  );
}

export default App;