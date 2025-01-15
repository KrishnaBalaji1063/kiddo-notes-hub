import { useEffect, useRef, useState } from "react";
import { Canvas as FabricCanvas, Circle, Rect } from "fabric";
import { Button } from "./ui/button";
import { Pencil, Square, Circle as CircleIcon, Eraser, Trash2 } from "lucide-react";

interface DrawingCanvasProps {
  onSave: (drawingData: string) => void;
  initialData?: string;
}

export const DrawingCanvas = ({ onSave, initialData }: DrawingCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [fabricCanvas, setFabricCanvas] = useState<FabricCanvas | null>(null);
  const [activeColor, setActiveColor] = useState("#000000");
  const [activeTool, setActiveTool] = useState<"select" | "draw" | "rectangle" | "circle" | "eraser">("draw");

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = new FabricCanvas(canvasRef.current, {
      width: 800,
      height: 400,
      backgroundColor: "#ffffff",
      isDrawingMode: true,
    });

    // Initialize the canvas first
    canvas.renderAll();

    // Then initialize the drawing brush
    if (!canvas.freeDrawingBrush) {
      canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);
    }

    // Now set the brush properties
    canvas.freeDrawingBrush.color = activeColor;
    canvas.freeDrawingBrush.width = 2;

    if (initialData) {
      canvas.loadFromJSON(initialData, () => {
        canvas.renderAll();
      });
    }

    setFabricCanvas(canvas);

    return () => {
      canvas.dispose();
    };
  }, [initialData]);

  useEffect(() => {
    if (!fabricCanvas || !fabricCanvas.freeDrawingBrush) return;

    fabricCanvas.isDrawingMode = activeTool === "draw" || activeTool === "eraser";
    
    if (activeTool === "draw") {
      fabricCanvas.freeDrawingBrush.color = activeColor;
      fabricCanvas.freeDrawingBrush.width = 2;
    } else if (activeTool === "eraser") {
      fabricCanvas.freeDrawingBrush.color = "#ffffff";
      fabricCanvas.freeDrawingBrush.width = 20;
    }
  }, [activeTool, activeColor, fabricCanvas]);

  const handleToolClick = (tool: typeof activeTool) => {
    setActiveTool(tool);

    if (tool === "rectangle") {
      const rect = new Rect({
        left: 100,
        top: 100,
        fill: activeColor,
        width: 100,
        height: 100,
      });
      fabricCanvas?.add(rect);
    } else if (tool === "circle") {
      const circle = new Circle({
        left: 100,
        top: 100,
        fill: activeColor,
        radius: 50,
      });
      fabricCanvas?.add(circle);
    }
  };

  const handleClear = () => {
    if (!fabricCanvas) return;
    fabricCanvas.clear();
    fabricCanvas.backgroundColor = "#ffffff";
    fabricCanvas.renderAll();
  };

  const handleSave = () => {
    if (!fabricCanvas) return;
    const drawingData = JSON.stringify(fabricCanvas.toJSON());
    onSave(drawingData);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-2 items-center">
        <Button
          variant={activeTool === "draw" ? "default" : "outline"}
          size="icon"
          onClick={() => handleToolClick("draw")}
        >
          <Pencil className="h-4 w-4" />
        </Button>
        <Button
          variant={activeTool === "rectangle" ? "default" : "outline"}
          size="icon"
          onClick={() => handleToolClick("rectangle")}
        >
          <Square className="h-4 w-4" />
        </Button>
        <Button
          variant={activeTool === "circle" ? "default" : "outline"}
          size="icon"
          onClick={() => handleToolClick("circle")}
        >
          <CircleIcon className="h-4 w-4" />
        </Button>
        <Button
          variant={activeTool === "eraser" ? "default" : "outline"}
          size="icon"
          onClick={() => handleToolClick("eraser")}
        >
          <Eraser className="h-4 w-4" />
        </Button>
        <input
          type="color"
          value={activeColor}
          onChange={(e) => setActiveColor(e.target.value)}
          className="h-9 w-9 rounded-md border cursor-pointer"
        />
        <Button variant="outline" size="icon" onClick={handleClear}>
          <Trash2 className="h-4 w-4" />
        </Button>
        <Button onClick={handleSave} className="ml-auto">
          Save Drawing
        </Button>
      </div>
      <div className="border border-gray-200 rounded-lg shadow-lg overflow-hidden">
        <canvas ref={canvasRef} className="max-w-full" />
      </div>
    </div>
  );
};