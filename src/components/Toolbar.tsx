
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

function Toolbar({
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
}: ToolbarProps) {
  
  const drawingTools = [
    { id: 'select' as Tool, icon: MousePointer2, label: 'Select' },
    { id: 'line' as Tool, icon: Minus, label: 'Line' },
    { id: 'rectangle' as Tool, icon: Square, label: 'Rectangle' },
    { id: 'circle' as Tool, icon: Circle, label: 'Circle' },
    { id: 'triangle' as Tool, icon: Triangle, label: 'Triangle' },
    { id: 'freehand' as Tool, icon: Pencil, label: 'Freehand' },
    { id: 'annotate' as Tool, icon: MessageSquare, label: 'Annotate' },
    { id: 'pan' as Tool, icon: Hand, label: 'Pan' },
  ];

  function ToolButton({ tool }: { tool: typeof drawingTools[0] }) {
    const Icon = tool.icon;
    const isActive = currentTool === tool.id;
    
    return (
      <button
        onClick={() => onToolChange(tool.id)}
        className={`
          p-2 rounded-lg transition-all duration-200 group relative
          ${isActive 
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
  }

  function ActionButton({ 
    onClick, 
    disabled = false, 
    title, 
    children, 
    variant = 'default' 
  }: { 
    onClick: () => void;
    disabled?: boolean;
    title: string;
    children: React.ReactNode;
    variant?: 'default' | 'danger';
  }) {
    const baseClasses = "p-2 rounded-lg transition-all duration-200";
    const variantClasses = variant === 'danger' 
      ? "bg-red-700 text-white hover:bg-red-600"
      : "bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white";
    const disabledClasses = "disabled:opacity-50 disabled:cursor-not-allowed";
    
    return (
      <button
        onClick={onClick}
        disabled={disabled}
        className={`${baseClasses} ${variantClasses} ${disabledClasses}`}
        title={title}
      >
        {children}
      </button>
    );
  }

  return (
    <div className="bg-gray-900 border-b border-gray-700 p-4">
      <div className="flex items-center justify-between max-w-6xl mx-auto">
        {/* Drawing Tools */}
        <div className="flex items-center space-x-2">
          {drawingTools.map((tool) => (
            <ToolButton key={tool.id} tool={tool} />
          ))}
        </div>

        {/* Action Tools */}
        <div className="flex items-center space-x-2">
          {/* Undo/Redo */}
          <ActionButton onClick={onUndo} disabled={!canUndo} title="Undo">
            <Undo2 size={20} />
          </ActionButton>
          
          <ActionButton onClick={onRedo} disabled={!canRedo} title="Redo">
            <Redo2 size={20} />
          </ActionButton>

          {/* Separator */}
          <div className="w-px h-6 bg-gray-700" />

          {/* Zoom Controls */}
          <ActionButton onClick={onZoomIn} title="Zoom In">
            <ZoomIn size={20} />
          </ActionButton>
          
          <span className="text-sm text-gray-400 min-w-[3rem] text-center">
            {Math.round(zoom * 100)}%
          </span>
          
          <ActionButton onClick={onZoomOut} title="Zoom Out">
            <ZoomOut size={20} />
          </ActionButton>

          {/* Separator */}
          <div className="w-px h-6 bg-gray-700" />

          {/* Toggle Annotations */}
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

          {/* Clear All */}
          <ActionButton onClick={onClear} title="Clear All" variant="danger">
            <RotateCcw size={20} />
          </ActionButton>
        </div>
      </div>
    </div>
  );
}

export default Toolbar;
