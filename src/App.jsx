import React, { useRef, useState, useEffect } from "react";
import { fabric } from "fabric";
import "./App.css";

function App() {
  const canvasRef = useRef(null);
  const [canvas, setCanvas] = useState(null);

  const addRectangle = () => {
    if (canvas) {
      const rect = new fabric.Rect({
        left: 100,
        top: 100,
        width: 100,
        height: 80,
        fill: "red",
        stroke: "black",
        strokeWidth: 2,
      });

      canvas.add(rect);
      canvas.renderAll();
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file || !canvas) return;

    const reader = new FileReader();

    reader.onload = (event) => {
      fabric.Image.fromURL(event.target.result, (img) => {
        img.scaleToWidth(300);
        canvas.add(img);
        canvas.setActiveObject(img);
        canvas.renderAll();
      });
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    if (canvasRef.current) {
      const initCanvas = new fabric.Canvas(canvasRef.current, {
        width: 500,
        height: 500,
      });

      initCanvas.backgroundColor = "#fff";
      initCanvas.renderAll();

      setCanvas(initCanvas);

      return () => {
        initCanvas.dispose();
      };
    }
  }, []);

  return (
    <div className="App">
      <div>
        <button className="btn" onClick={addRectangle}>
          Add Rectangle
        </button>
        <input type="file" accept="image/*" onChange={handleImageUpload} />
      </div>
      <canvas id="canvas" ref={canvasRef} />
    </div>
  );
}

export default App;
