"use client";

import { useState, useRef, useEffect } from "react";
import { Eraser, Pencil, Trash2, Undo, Redo } from "lucide-react";

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

    if (tool === "eraser") {
      context.strokeStyle = "white"; // Eraser uses white color
    } else {
      context.strokeStyle = color; // Pencil uses selected color
    }

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

  const undo = () => {
    if (historyIndex > 0) {
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");
      const previousState = drawingHistory[historyIndex - 1];
      const img = new Image();
      img.src = previousState;
      img.onload = () => {
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.drawImage(img, 0, 0);
        setHistoryIndex(historyIndex - 1);
      };
    }
  };

  const redo = () => {
    if (historyIndex < drawingHistory.length - 1) {
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");
      const nextState = drawingHistory[historyIndex + 1];
      const img = new Image();
      img.src = nextState;
      img.onload = () => {
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.drawImage(img, 0, 0);
        setHistoryIndex(historyIndex + 1);
      };
    }
  };

  return (
    <div className="whiteboard-container h-full flex flex-col">
      {/* Toolbar */}
      <div className="whiteboard-toolbar flex space-x-2 mb-2 p-2 bg-indigo-50 rounded-lg">
        {/* Pencil Tool */}
        <button
          className={`whiteboard-tool ${tool === "pencil" ? "active" : ""}`}
          onClick={() => setTool("pencil")}
        >
          <Pencil size={20} />
        </button>

        {/* Eraser Tool */}
        <button
          className={`whiteboard-tool ${tool === "eraser" ? "active" : ""}`}
          onClick={() => setTool("eraser")}
        >
          <Eraser size={20} />
        </button>

        {/* Divider */}
        <div className="border-r border-indigo-200 mx-1 h-6"></div>

        {/* Color Picker */}
        <input
          type="color"
          value={color}
          onChange={(e) => setColor(e.target.value)}
          className="h-8 w-8 cursor-pointer rounded"
        />

        {/* Line Width Selector */}
        <input
          type="range"
          min="1"
          max="20"
          value={lineWidth}
          onChange={(e) => setLineWidth(e.target.value)}
          className="w-24"
        />

        {/* Divider */}
        <div className="border-r border-indigo-200 mx-1 h-6"></div>

        {/* Undo Button */}
        <button
          className="whiteboard-tool text-indigo-600 hover:bg-indigo-50"
          onClick={undo}
          disabled={historyIndex <= 0}
        >
          <Undo size={20} />
        </button>

        {/* Redo Button */}
        <button
          className="whiteboard-tool text-indigo-600 hover:bg-indigo-50"
          onClick={redo}
          disabled={historyIndex >= drawingHistory.length - 1}
        >
          <Redo size={20} />
        </button>

        {/* Divider */}
        <div className="border-r border-indigo-200 mx-1 h-6"></div>

        {/* Clear Canvas */}
        <button
          className="whiteboard-tool text-red-500 hover:bg-red-50"
          onClick={clearCanvas}
        >
          <Trash2 size={20} />
        </button>
      </div>

      {/* Canvas */}
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