import { useState, useRef } from "react";
import { Download, Upload, Delete } from "lucide-react";

export default function MemeEditor() {
  const [uploadedImage, setUploadedImage] = useState(null);
  const [stickers, setStickers] = useState([]);
  const [selectedSticker, setSelectedSticker] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const fileInputRef = useRef(null);
  const canvasRef = useRef(null);
  const [selectedStickerForDelete, setSelectedStickerForDelete] =
    useState(null);

  const stickerEmojis = ["😂", "😎", "🔥", "💯", "👀", "🤣"];

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setUploadedImage(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const addSticker = (emoji) => {
    const newSticker = {
      id: Date.now(),
      emoji,
      x: 150,
      y: 150,
      size: 80,
      rotation: 0,
    };
    setStickers([...stickers, newSticker]);
  };

  const deleteSticker = () => {
    if (selectedStickerForDelete) {
      setStickers(stickers.filter((s) => s.id !== selectedStickerForDelete));
      setSelectedStickerForDelete(null);
    }
  };

  const handleStickerMouseDown = (e, sticker) => {
    e.stopPropagation();
    setSelectedSticker(sticker.id);
    setSelectedStickerForDelete(sticker.id);
    const rect = canvasRef.current.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left - sticker.x,
      y: e.clientY - rect.top - sticker.y,
    });
  };

  const handleMouseMove = (e) => {
    if (selectedSticker) {
      const rect = canvasRef.current.getBoundingClientRect();
      const newX = e.clientX - rect.left - dragOffset.x;
      const newY = e.clientY - rect.top - dragOffset.y;

      setStickers(
        stickers.map((s) =>
          s.id === selectedSticker ? { ...s, x: newX, y: newY } : s
        )
      );
    }
  };

  const handleMouseUp = () => {
    setSelectedSticker(null);
  };

  const handleResize = (e, stickerId, direction) => {
    e.stopPropagation();
    const sticker = stickers.find((s) => s.id === stickerId);
    const startSize = sticker.size;
    const startY = e.clientY;

    const onMouseMove = (moveEvent) => {
      const delta = moveEvent.clientY - startY;
      const newSize = Math.max(30, startSize + delta);
      setStickers(
        stickers.map((s) => (s.id === stickerId ? { ...s, size: newSize } : s))
      );
    };

    const onMouseUp = () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  };

  const handleRotate = (e, stickerId) => {
    e.stopPropagation();
    const sticker = stickers.find((s) => s.id === stickerId);
    const stickerElement = e.target.parentElement;
    const rect = stickerElement.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const onMouseMove = (moveEvent) => {
      const deltaX = moveEvent.clientX - centerX;
      const deltaY = moveEvent.clientY - centerY;
      const angle = Math.atan2(deltaY, deltaX) * (180 / Math.PI);

      setStickers(
        stickers.map((s) =>
          s.id === stickerId ? { ...s, rotation: angle } : s
        )
      );
    };

    const onMouseUp = () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  };

  const downloadMeme = () => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const canvasDiv = canvasRef.current;

    canvas.width = canvasDiv.offsetWidth;
    canvas.height = canvasDiv.offsetHeight;

    if (uploadedImage) {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        drawStickersOnCanvas(ctx);
        downloadCanvas(canvas);
      };
      img.src = uploadedImage;
    } else {
      ctx.fillStyle = "#f3f4f6";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      drawStickersOnCanvas(ctx);
      downloadCanvas(canvas);
    }
  };

  const drawStickersOnCanvas = (ctx) => {
    stickers.forEach((sticker) => {
      ctx.font = `${sticker.size}px Arial`;
      ctx.fillText(sticker.emoji, sticker.x, sticker.y + sticker.size);
    });
  };

  const downloadCanvas = (canvas) => {
    const link = document.createElement("a");
    link.download = "meme.png";
    link.href = canvas.toDataURL();
    link.click();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 to-pink-100 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Canvas Section */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold text-gray-800">Canvas</h2>
              <div className="flex gap-2">
                <button
                  onClick={() => fileInputRef.current.click()}
                  className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition"
                >
                  <Upload size={20} />
                  Upload Image
                </button>
                <button
                  onClick={downloadMeme}
                  className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
                >
                  <Download size={20} />
                  Download
                </button>
                <button
                  onClick={deleteSticker}
                  disabled={!selectedStickerForDelete}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                    selectedStickerForDelete
                      ? "bg-red-600 text-white hover:bg-red-700"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  <Download size={20} />
                  Delete Sticker
                </button>
              </div>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />

            <div
              ref={canvasRef}
              className="relative w-full aspect-video bg-gray-100 rounded-xl overflow-hidden cursor-move border-4 border-gray-200"
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              style={{
                backgroundImage: uploadedImage
                  ? `url(${uploadedImage})`
                  : "none",
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            >
              {!uploadedImage && (
                <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                  <div className="text-center">
                    <Upload size={48} className="mx-auto mb-2" />
                    <p className="text-lg">Upload an image to get started</p>
                  </div>
                </div>
              )}

              {stickers.map((sticker) => (
                <div
                  key={sticker.id}
                  className="absolute cursor-move select-none"
                  style={{
                    left: sticker.x,
                    top: sticker.y,
                    fontSize: `${sticker.size}px`,
                    lineHeight: 1,
                    transform: `rotate(${sticker.rotation || 0}deg)`,
                    border:
                      selectedStickerForDelete === sticker.id
                        ? "2px dashed red"
                        : "none",
                    padding: "4px",
                  }}
                  onMouseDown={(e) => handleStickerMouseDown(e, sticker)}
                >
                  {sticker.emoji}
                  {/* Resize handle */}
                  <div
                    className="absolute bottom-0 right-0 w-4 h-4 bg-blue-500 rounded-full cursor-nwse-resize border-2 border-white"
                    onMouseDown={(e) => handleResize(e, sticker.id, "se")}
                    style={{ transform: "translate(50%, 50%)" }}
                  />

                  {/* Rotate handle - Add this */}
                  <div
                    className="absolute top-0 left-1/2 w-4 h-4 bg-green-500 rounded-full cursor-grab border-2 border-white"
                    onMouseDown={(e) => handleRotate(e, sticker.id)}
                    style={{ transform: "translate(-50%, -50%)" }}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Sticker Section */}
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Stickers
            </h2>
            <div className="grid grid-cols-3 gap-4">
              {stickerEmojis.map((emoji, index) => (
                <button
                  key={index}
                  onClick={() => addSticker(emoji)}
                  className="aspect-square bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl hover:from-purple-100 hover:to-pink-100 transition flex items-center justify-center text-5xl border-2 border-purple-200 hover:border-purple-400 hover:scale-105 transform"
                >
                  {emoji}
                </button>
              ))}
            </div>
            <p className="text-sm text-gray-500 mt-4 text-center">
              Click a sticker to add it to your meme. Drag and resize on canvas!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
