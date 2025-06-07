
import React, { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { 
  Pen, 
  Eraser, 
  Circle, 
  Square, 
  Type, 
  Undo, 
  Redo,
  Download,
  Upload,
  Palette,
  Minus
} from "lucide-react";
import { Canvas, FabricObject, Circle as FabricCircle, Rect, Line, IText } from "fabric";
import { supabase } from "@/integrations/supabase/client";

interface LessonWhiteboardProps {
  lessonId: string;
}

export const LessonWhiteboard = ({ lessonId }: LessonWhiteboardProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [canvas, setCanvas] = useState<Canvas | null>(null);
  const [tool, setTool] = useState<string>('pen');
  const [brushSize, setBrushSize] = useState(5);
  const [color, setColor] = useState('#000000');
  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    if (canvasRef.current) {
      const fabricCanvas = new Canvas(canvasRef.current, {
        width: 800,
        height: 600,
        backgroundColor: 'white'
      });
      
      setCanvas(fabricCanvas);
      loadWhiteboardData();

      // Auto-save every 10 seconds
      const saveInterval = setInterval(() => {
        saveWhiteboardData(fabricCanvas);
      }, 10000);

      return () => {
        clearInterval(saveInterval);
        fabricCanvas.dispose();
      };
    }
  }, [lessonId]);

  useEffect(() => {
    if (!canvas) return;

    switch (tool) {
      case 'pen':
        canvas.isDrawingMode = true;
        if (canvas.freeDrawingBrush) {
          canvas.freeDrawingBrush.width = brushSize;
          canvas.freeDrawingBrush.color = color;
        }
        break;
      case 'eraser':
        canvas.isDrawingMode = true;
        if (canvas.freeDrawingBrush) {
          canvas.freeDrawingBrush.width = brushSize * 2;
          canvas.freeDrawingBrush.color = 'white';
        }
        break;
      default:
        canvas.isDrawingMode = false;
        break;
    }
  }, [canvas, tool, brushSize, color]);

  const loadWhiteboardData = async () => {
    try {
      const { data, error } = await supabase
        .from('lessons')
        .select('whiteboard_data')
        .eq('id', lessonId)
        .single();

      if (error || !data?.whiteboard_data) return;

      if (canvas) {
        canvas.loadFromJSON(data.whiteboard_data, () => {
          canvas.renderAll();
        });
      }
    } catch (error) {
      console.error('Error loading whiteboard data:', error);
    }
  };

  const saveWhiteboardData = async (fabricCanvas: Canvas) => {
    try {
      const canvasData = fabricCanvas.toJSON();
      
      await supabase
        .from('lessons')
        .update({ whiteboard_data: canvasData })
        .eq('id', lessonId);
    } catch (error) {
      console.error('Error saving whiteboard data:', error);
    }
  };

  const addShape = (shapeType: string) => {
    if (!canvas) return;

    let shape: FabricObject | null = null;
    switch (shapeType) {
      case 'circle':
        shape = new FabricCircle({
          radius: 50,
          fill: 'transparent',
          stroke: color,
          strokeWidth: 2,
          left: 100,
          top: 100
        });
        break;
      case 'square':
        shape = new Rect({
          width: 100,
          height: 100,
          fill: 'transparent',
          stroke: color,
          strokeWidth: 2,
          left: 100,
          top: 100
        });
        break;
      case 'line':
        shape = new Line([50, 100, 200, 100], {
          stroke: color,
          strokeWidth: 2
        });
        break;
    }

    if (shape) {
      canvas.add(shape);
      canvas.setActiveObject(shape);
    }
  };

  const addText = () => {
    if (!canvas) return;

    const text = new IText('Текст', {
      left: 100,
      top: 100,
      fontFamily: 'Arial',
      fontSize: 20,
      fill: color
    });

    canvas.add(text);
    canvas.setActiveObject(text);
  };

  const clearCanvas = () => {
    if (canvas) {
      canvas.clear();
      canvas.backgroundColor = 'white';
      canvas.renderAll();
    }
  };

  const undo = () => {
    // Simple undo implementation
    if (canvas && canvas.getObjects().length > 0) {
      const objects = canvas.getObjects();
      canvas.remove(objects[objects.length - 1]);
    }
  };

  const exportCanvas = () => {
    if (canvas) {
      const dataURL = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `whiteboard-${lessonId}.png`;
      link.href = dataURL;
      link.click();
    }
  };

  const colors = ['#000000', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF', '#FFA500'];

  return (
    <div className="h-full flex flex-col">
      {/* Tools */}
      <div className="flex items-center space-x-2 mb-4 p-2 bg-gray-50 rounded-lg">
        <Button
          variant={tool === 'pen' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setTool('pen')}
        >
          <Pen className="h-4 w-4" />
        </Button>
        
        <Button
          variant={tool === 'eraser' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setTool('eraser')}
        >
          <Eraser className="h-4 w-4" />
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => addShape('circle')}
        >
          <Circle className="h-4 w-4" />
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => addShape('square')}
        >
          <Square className="h-4 w-4" />
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => addShape('line')}
        >
          <Minus className="h-4 w-4" />
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={addText}
        >
          <Type className="h-4 w-4" />
        </Button>
        
        <div className="flex items-center space-x-2">
          <span className="text-sm">Размер:</span>
          <Slider
            value={[brushSize]}
            onValueChange={(value) => setBrushSize(value[0])}
            max={20}
            min={1}
            step={1}
            className="w-20"
          />
        </div>
        
        <div className="flex space-x-1">
          {colors.map(c => (
            <button
              key={c}
              className={`w-6 h-6 rounded border-2 ${color === c ? 'border-gray-800' : 'border-gray-300'}`}
              style={{ backgroundColor: c }}
              onClick={() => setColor(c)}
            />
          ))}
        </div>
        
        <Button variant="outline" size="sm" onClick={undo}>
          <Undo className="h-4 w-4" />
        </Button>
        
        <Button variant="outline" size="sm" onClick={clearCanvas}>
          Очистить
        </Button>
        
        <Button variant="outline" size="sm" onClick={exportCanvas}>
          <Download className="h-4 w-4" />
        </Button>
      </div>
      
      {/* Canvas */}
      <div className="flex-1 border rounded-lg overflow-auto">
        <canvas ref={canvasRef} />
      </div>
    </div>
  );
};
