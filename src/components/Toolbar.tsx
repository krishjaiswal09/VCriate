import React from 'react';
import { 
  MousePointer2, 
  Minus, 
  Square, 
  Circle,
  Triangle,
  Pencil, 
  MessageSquare, 
  Hand,
  Undo2,
  Redo2,
  Eye,
  EyeOff,
  ZoomIn,
  ZoomOut,
  RotateCcw
} from 'lucide-react';
import { Tool } from '../types';

interface ToolbarProps {
  currentTool: Tool;
  onToolChange: (tool: Tool) => void;
  onUndo: () => void;
  onRedo: () => void;
  onClear: () => void;
  showAnnotations: boolean;
  onToggleAnnotations: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  canUndo: boolean;
  canRedo: boolean;
  zoom: number;
}

const Toolbar: React.FC<ToolbarProps> = ({
  currentTool,
  onToolChange,
  onUndo,
  onRedo,
  onClear,
  showAnnotations,
  onToggleAnnotations,
  onZoomIn,
  onZoomOut,
  canUndo,
  canRedo,
  zoom
}) => {
  const tools = [
    { id: 'select' as Tool, icon: MousePointer2, label: 'Select' },
    { id: 'line' as Tool, icon: Minus, label: 'Line' },
    { id: 'rectangle' as Tool, icon: Square, label: 'Rectangle' },
    { id: 'circle' as Tool, icon: Circle, label: 'Circle' },
    { id: 'triangle' as Tool, icon: Triangle, label: 'Triangle' },
    { id: 'freehand' as Tool, icon: Pencil, label: 'Freehand' },
    { id: 'annotate' as Tool, icon: MessageSquare, label: 'Annotate' },
    { id: 'pan' as Tool, icon: Hand, label: 'Pan' },
  ];

  return (
    <div className="bg-gray-900 border-b border-gray-700 p-4">
      <div className="flex items-center justify-between max-w-6xl mx-auto">
        {/* Drawing Tools */}
        <div className="flex items-center space-x-2">
          {tools.map((tool) => {
            const Icon = tool.icon;
            return (
              <button
                key={tool.id}
                onClick={() => onToolChange(tool.id)}
                className={`
                  p-2 rounded-lg transition-all duration-200 group relative
                  ${currentTool === tool.id 
                    ? 'bg-blue-600 text-white shadow-lg' 
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white'
                  }
                `}
                title={tool.label}
              >
                <Icon size={20} />
                <span className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-xs text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  {tool.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* Action Tools */}
        <div className="flex items-center space-x-2">
          <button
            onClick={onUndo}
            disabled={!canUndo}
            className="p-2 rounded-lg bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            title="Undo"
          >
            <Undo2 size={20} />
          </button>
          
          <button
            onClick={onRedo}
            disabled={!canRedo}
            className="p-2 rounded-lg bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            title="Redo"
          >
            <Redo2 size={20} />
          </button>

          <div className="w-px h-6 bg-gray-700" />

          <button
            onClick={onZoomIn}
            className="p-2 rounded-lg bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white transition-all duration-200"
            title="Zoom In"
          >
            <ZoomIn size={20} />
          </button>
          
          <span className="text-sm text-gray-400 min-w-[3rem] text-center">
            {Math.round(zoom * 100)}%
          </span>
          
          <button
            onClick={onZoomOut}
            className="p-2 rounded-lg bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white transition-all duration-200"
            title="Zoom Out"
          >
            <ZoomOut size={20} />
          </button>

          <div className="w-px h-6 bg-gray-700" />

          <button
            onClick={onToggleAnnotations}
            className={`p-2 rounded-lg transition-all duration-200 ${
              showAnnotations 
                ? 'bg-green-600 text-white' 
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white'
            }`}
            title={showAnnotations ? 'Hide Annotations' : 'Show Annotations'}
          >
            {showAnnotations ? <Eye size={20} /> : <EyeOff size={20} />}
          </button>

          <button
            onClick={onClear}
            className="p-2 rounded-lg bg-red-700 text-white hover:bg-red-600 transition-all duration-200"
            title="Clear All"
          >
            <RotateCcw size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Toolbar;