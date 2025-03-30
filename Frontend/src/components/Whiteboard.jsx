"use client"

import { useState, useRef, useEffect } from "react";
import { Eraser, MousePointer, Pencil, Square, Circle, Type, Download, Trash2 } from "lucide-react";

const Whiteboard = () => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState("pencil");
  const [color, setColor] = useState("#000000");
  const [lineWidth, setLineWidth] = useState(5);
  const [drawingHistory, setDrawingHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    
    // Set canvas size
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    
    // Set default styles
    context.lineCap = "round";
    context.lineJoin = "round";
    context.strokeStyle = color;
    context.lineWidth = lineWidth;
    
    // Clear the canvas
    context.fillStyle = "white";
    context.fillRect(0, 0, canvas.width, canvas.height);
    
    // Save initial state
    saveState();
  }, []);
  
  // Update context when color or line width changes
  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    context.strokeStyle = color;
    context.lineWidth = lineWidth;
  }, [color, lineWidth]);
  
  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    context.beginPath();
    context.moveTo(x, y);
    setIsDrawing(true);
  };
  
  const draw = (e) => {
    if (!isDrawing) return;
    
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    context.lineTo(x, y);
    context.stroke();
  };
  
  const stopDrawing = () => {
    if (isDrawing) {
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");
      context.closePath();
      setIsDrawing(false);
      saveState();
    }
  };
  
  const saveState = () => {
    const canvas = canvasRef.current;
    const newState = canvas.toDataURL();
    const newHistory = drawingHistory.slice(0, historyIndex + 1);
    newHistory.push(newState);
    setDrawingHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };
  
  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    context.fillStyle = "white";
    context.fillRect(0, 0, canvas.width, canvas.height);
    saveState();
  };
  
  return (
    <div className="whiteboard-container h-full flex flex-col">
      <div className="whiteboard-toolbar flex space-x-2 mb-2 p-2 bg-indigo-50 rounded-lg">
        <button 
          className={`whiteboard-tool ${tool === "pencil" ? "active" : ""}`} 
          onClick={() => setTool("pencil")}
        >
          <Pencil size={20} />
        </button>
        <button 
          className={`whiteboard-tool ${tool === "eraser" ? "active" : ""}`} 
          onClick={() => setTool("eraser")}
        >
          <Eraser size={20} />
        </button>
        <div className="border-r border-indigo-200 mx-1 h-6"></div>
        <input 
          type="color" 
          value={color} 
          onChange={(e) => setColor(e.target.value)} 
          className="h-8 w-8 cursor-pointer rounded"
        />
        <div className="border-r border-indigo-200 mx-1 h-6"></div>
        <button 
          className="whiteboard-tool text-red-500 hover:bg-red-50" 
          onClick={clearCanvas}
        >
          <Trash2 size={20} />
        </button>
      </div>
      <div className="flex-1 border border-indigo-100 rounded-lg overflow-hidden">
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          className="w-full h-full cursor-crosshair bg-white"
        />
      </div>
    </div>
  );
};

export default Whiteboard;


