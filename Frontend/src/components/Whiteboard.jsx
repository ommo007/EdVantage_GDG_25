<<<<<<< HEAD
"use client"

import { useState, useRef, useEffect } from "react"
import { Download, Eraser, Circle, Square, Minus } from "lucide-react"

const Whiteboard = () => {
  const canvasRef = useRef(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [color, setColor] = useState("#000000")
  const [brushSize, setBrushSize] = useState(5)
  const [tool, setTool] = useState("pen")

  useEffect(() => {
    const canvas = canvasRef.current
    const context = canvas.getContext("2d")
    context.lineCap = "round"
    context.strokeStyle = color
    context.lineWidth = brushSize
  }, [color, brushSize])

  const startDrawing = (e) => {
    const canvas = canvasRef.current
    const context = canvas.getContext("2d")
    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    context.beginPath()
    context.moveTo(x, y)
    setIsDrawing(true)

    if (tool === "eraser") {
      context.globalCompositeOperation = "destination-out"
    } else {
      context.globalCompositeOperation = "source-over"
    }
  }

  const draw = (e) => {
    if (!isDrawing) return

    const canvas = canvasRef.current
    const context = canvas.getContext("2d")
    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    if (tool === "pen" || tool === "eraser") {
      context.lineTo(x, y)
      context.stroke()
    } else if (tool === "circle") {
      const radius = Math.sqrt(Math.pow(x - context.moveTo.x, 2) + Math.pow(y - context.moveTo.y, 2))
      context.beginPath()
      context.arc(context.moveTo.x, context.moveTo.y, radius, 0, 2 * Math.PI)
      context.stroke()
    } else if (tool === "square") {
      const width = x - context.moveTo.x
      const height = y - context.moveTo.y
      context.strokeRect(context.moveTo.x, context.moveTo.y, width, height)
    } else if (tool === "line") {
      context.beginPath()
      context.moveTo(context.moveTo.x, context.moveTo.y)
      context.lineTo(x, y)
      context.stroke()
    }
  }

  const stopDrawing = () => {
    setIsDrawing(false)
  }

  const clearCanvas = () => {
    const canvas = canvasRef.current
    const context = canvas.getContext("2d")
    context.clearRect(0, 0, canvas.width, canvas.height)
  }

  const downloadCanvas = () => {
    const canvas = canvasRef.current
    const image = canvas.toDataURL("image/png")
    const link = document.createElement("a")
    link.href = image
    link.download = "whiteboard.png"
    link.click()
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center space-x-2">
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="w-8 h-8 rounded-full overflow-hidden"
          />
          <input
            type="range"
            min="1"
            max="20"
            value={brushSize}
            onChange={(e) => setBrushSize(e.target.value)}
            className="w-32"
          />
          <button
            onClick={() => setTool("pen")}
            className={`p-2 rounded-md ${tool === "pen" ? "bg-indigo-200" : "bg-gray-200"}`}
          >
            Pen
          </button>
          <button
            onClick={() => setTool("eraser")}
            className={`p-2 rounded-md ${tool === "eraser" ? "bg-indigo-200" : "bg-gray-200"}`}
          >
            <Eraser size={20} />
          </button>
          <button
            onClick={() => setTool("circle")}
            className={`p-2 rounded-md ${tool === "circle" ? "bg-indigo-200" : "bg-gray-200"}`}
          >
            <Circle size={20} />
          </button>
          <button
            onClick={() => setTool("square")}
            className={`p-2 rounded-md ${tool === "square" ? "bg-indigo-200" : "bg-gray-200"}`}
          >
            <Square size={20} />
          </button>
          <button
            onClick={() => setTool("line")}
            className={`p-2 rounded-md ${tool === "line" ? "bg-indigo-200" : "bg-gray-200"}`}
          >
            <Minus size={20} />
          </button>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={clearCanvas}
            className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition duration-300"
          >
            Clear
          </button>
          <button
            onClick={downloadCanvas}
            className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition duration-300"
          >
            <Download size={20} />
          </button>
        </div>
      </div>
      <canvas
        ref={canvasRef}
        width={800}
        height={600}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseOut={stopDrawing}
        className="border border-gray-300 rounded-lg cursor-crosshair flex-grow"
      />
    </div>
  )
}

export default Whiteboard

=======
"use client"

import { useState, useRef, useEffect } from "react"
import { Download, Eraser, Circle, Square, Minus } from "lucide-react"

const Whiteboard = () => {
  const canvasRef = useRef(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [color, setColor] = useState("#000000")
  const [brushSize, setBrushSize] = useState(5)
  const [tool, setTool] = useState("pen")

  useEffect(() => {
    const canvas = canvasRef.current
    const context = canvas.getContext("2d")
    context.lineCap = "round"
    context.strokeStyle = color
    context.lineWidth = brushSize
  }, [color, brushSize])

  const startDrawing = (e) => {
    const canvas = canvasRef.current
    const context = canvas.getContext("2d")
    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    context.beginPath()
    context.moveTo(x, y)
    setIsDrawing(true)

    if (tool === "eraser") {
      context.globalCompositeOperation = "destination-out"
    } else {
      context.globalCompositeOperation = "source-over"
    }
  }

  const draw = (e) => {
    if (!isDrawing) return

    const canvas = canvasRef.current
    const context = canvas.getContext("2d")
    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    if (tool === "pen" || tool === "eraser") {
      context.lineTo(x, y)
      context.stroke()
    } else if (tool === "circle") {
      const radius = Math.sqrt(Math.pow(x - context.moveTo.x, 2) + Math.pow(y - context.moveTo.y, 2))
      context.beginPath()
      context.arc(context.moveTo.x, context.moveTo.y, radius, 0, 2 * Math.PI)
      context.stroke()
    } else if (tool === "square") {
      const width = x - context.moveTo.x
      const height = y - context.moveTo.y
      context.strokeRect(context.moveTo.x, context.moveTo.y, width, height)
    } else if (tool === "line") {
      context.beginPath()
      context.moveTo(context.moveTo.x, context.moveTo.y)
      context.lineTo(x, y)
      context.stroke()
    }
  }

  const stopDrawing = () => {
    setIsDrawing(false)
  }

  const clearCanvas = () => {
    const canvas = canvasRef.current
    const context = canvas.getContext("2d")
    context.clearRect(0, 0, canvas.width, canvas.height)
  }

  const downloadCanvas = () => {
    const canvas = canvasRef.current
    const image = canvas.toDataURL("image/png")
    const link = document.createElement("a")
    link.href = image
    link.download = "whiteboard.png"
    link.click()
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center space-x-2">
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="w-8 h-8 rounded-full overflow-hidden"
          />
          <input
            type="range"
            min="1"
            max="20"
            value={brushSize}
            onChange={(e) => setBrushSize(e.target.value)}
            className="w-32"
          />
          <button
            onClick={() => setTool("pen")}
            className={`p-2 rounded-md ${tool === "pen" ? "bg-indigo-200" : "bg-gray-200"}`}
          >
            Pen
          </button>
          <button
            onClick={() => setTool("eraser")}
            className={`p-2 rounded-md ${tool === "eraser" ? "bg-indigo-200" : "bg-gray-200"}`}
          >
            <Eraser size={20} />
          </button>
          <button
            onClick={() => setTool("circle")}
            className={`p-2 rounded-md ${tool === "circle" ? "bg-indigo-200" : "bg-gray-200"}`}
          >
            <Circle size={20} />
          </button>
          <button
            onClick={() => setTool("square")}
            className={`p-2 rounded-md ${tool === "square" ? "bg-indigo-200" : "bg-gray-200"}`}
          >
            <Square size={20} />
          </button>
          <button
            onClick={() => setTool("line")}
            className={`p-2 rounded-md ${tool === "line" ? "bg-indigo-200" : "bg-gray-200"}`}
          >
            <Minus size={20} />
          </button>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={clearCanvas}
            className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition duration-300"
          >
            Clear
          </button>
          <button
            onClick={downloadCanvas}
            className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition duration-300"
          >
            <Download size={20} />
          </button>
        </div>
      </div>
      <canvas
        ref={canvasRef}
        width={800}
        height={600}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseOut={stopDrawing}
        className="border border-gray-300 rounded-lg cursor-crosshair flex-grow"
      />
    </div>
  )
}

export default Whiteboard

>>>>>>> ef34c5d (Frontend,Backend)
