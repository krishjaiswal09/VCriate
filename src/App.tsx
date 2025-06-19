import React, { useState } from 'react';
import Toolbar from './components/Toolbar';
import Canvas from './components/Canvas';
import { Shape, Annotation, Tool, Point } from './types';

function App() {
  // Drawing state
  const [shapes, setShapes] = useState<Shape[]>([]);
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [selectedShapeId, setSelectedShapeId] = useState<string | null>(null);
  const [currentTool, setCurrentTool] = useState<Tool>('select');

  // UI state
  const [showAnnotations, setShowAnnotations] = useState(true);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState<Point>({ x: 100, y: 100 });

  // History for undo/redo
  const [history, setHistory] = useState<Shape[][]>([[]]);
  const [currentHistoryIndex, setCurrentHistoryIndex] = useState(0);

  // Update shapes and add to history
  function updateShapes(newShapes: Shape[]) {
    setShapes(newShapes);

    // Add to history
    const newHistory = history.slice(0, currentHistoryIndex + 1);
    newHistory.push([...newShapes]);
    setHistory(newHistory);
    setCurrentHistoryIndex(newHistory.length - 1);
  }

  function handleUndo() {
    if (currentHistoryIndex > 0) {
      const newIndex = currentHistoryIndex - 1;
      setCurrentHistoryIndex(newIndex);
      setShapes(history[newIndex]);
    }
  }

  function handleRedo() {
    if (currentHistoryIndex < history.length - 1) {
      const newIndex = currentHistoryIndex + 1;
      setCurrentHistoryIndex(newIndex);
      setShapes(history[newIndex]);
    }
  }

  function clearCanvas() {
    setShapes([]);
    setAnnotations([]);
    setSelectedShapeId(null);
    updateShapes([]);
  }

  function zoomIn() {
    setZoom(currentZoom => Math.min(currentZoom * 1.2, 3));
  }

  function zoomOut() {
    setZoom(currentZoom => Math.max(currentZoom / 1.2, 0.1));
  }

  function deleteSelectedShape() {
    if (selectedShapeId) {
      const updatedShapes = shapes.filter(shape => shape.id !== selectedShapeId);
      updateShapes(updatedShapes);
      setSelectedShapeId(null);
    }
  }

  const canUndo = currentHistoryIndex > 0;
  const canRedo = currentHistoryIndex < history.length - 1;
  const selectedShape = shapes.find(shape => shape.id === selectedShapeId);

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
        onClear={clearCanvas}
        showAnnotations={showAnnotations}
        onToggleAnnotations={() => setShowAnnotations(!showAnnotations)}
        onZoomIn={zoomIn}
        onZoomOut={zoomOut}
        canUndo={canUndo}
        canRedo={canRedo}
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
          onShapesChange={updateShapes}
          onAnnotationsChange={setAnnotations}
          onSelectedShapeChange={setSelectedShapeId}
          onOffsetChange={setOffset}
        />

        {/* Properties Panel */}
        <div className="w-64 bg-gray-900 border-l border-gray-700 p-4">
          <h3 className="font-semibold text-white mb-4">Properties</h3>

          {selectedShape ? (
            <div className="space-y-3">
              <div>
                <label className="text-sm text-gray-400">Selected Shape</label>
                <p className="text-white capitalize">{selectedShape.type}</p>
              </div>

              <div>
                <label className="text-sm text-gray-400">Actions</label>
                <button
                  onClick={deleteSelectedShape}
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
        </div>
      </div>
    </div>
  );
}

export default App;