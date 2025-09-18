import React, { useRef, useEffect, useState, useCallback } from 'react';
import type { Point } from '../types';

interface ImageEditorProps {
  imageSrc: string;
  onLassoComplete: (points: Point[], dimensions: { width: number; height: number }) => void;
}

export const ImageEditor: React.FC<ImageEditorProps> = ({ imageSrc, onLassoComplete }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [points, setPoints] = useState<Point[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const imageRef = useRef<HTMLImageElement | null>(null);

  const redrawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const image = imageRef.current;
    if (!canvas || !image) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

    if (points.length > 1) {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i].x, points[i].y);
      }
      if (!isDrawing && points.length > 2) {
        ctx.closePath();
      }
      ctx.stroke();
    }
  }, [points, isDrawing]);

  useEffect(() => {
    const image = new Image();
    image.src = imageSrc;
    const handleResize = () => {
        imageRef.current = image;
        const canvas = canvasRef.current;
        const container = containerRef.current;
        if (!canvas || !container || !imageRef.current) return;

        const containerAspect = container.clientWidth / container.clientHeight;
        const imageAspect = image.naturalWidth / image.naturalHeight;
        
        let newWidth, newHeight;
        if (imageAspect > containerAspect) {
            newWidth = container.clientWidth;
            newHeight = newWidth / imageAspect;
        } else {
            newHeight = container.clientHeight;
            newWidth = newHeight * imageAspect;
        }

        canvas.width = newWidth;
        canvas.height = newHeight;

        redrawCanvas();
    };

    image.onload = handleResize;
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [imageSrc, redrawCanvas]);

   useEffect(() => {
    redrawCanvas();
  }, [points, redrawCanvas]);

  const getCanvasPoint = useCallback((e: React.MouseEvent | React.TouchEvent): Point | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0]?.clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0]?.clientY : e.clientY;
    if (clientX === undefined || clientY === undefined) return null;
    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  }, []);

  const handleDrawStart = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    const point = getCanvasPoint(e);
    if (!point) return;
    setIsDrawing(true);
    setPoints([point]);
  }, [getCanvasPoint]);
  
  const handleDrawMove = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    e.preventDefault();
    const point = getCanvasPoint(e);
    if (!point) return;
    setPoints(prevPoints => [...prevPoints, point]);
  }, [isDrawing, getCanvasPoint]);

  const handleDrawEnd = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    if (!isDrawing) return;
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (canvas && points.length > 2) {
      onLassoComplete(points, { width: canvas.width, height: canvas.height });
    }
  }, [isDrawing, points, onLassoComplete]);

  return (
    <div ref={containerRef} className="w-full h-full flex items-center justify-center">
      <canvas
        ref={canvasRef}
        onMouseDown={handleDrawStart}
        onMouseMove={handleDrawMove}
        onMouseUp={handleDrawEnd}
        onMouseLeave={handleDrawEnd}
        onTouchStart={handleDrawStart}
        onTouchMove={handleDrawMove}
        onTouchEnd={handleDrawEnd}
        className="cursor-crosshair rounded-lg touch-none"
        style={{ touchAction: 'none' }}
      />
    </div>
  );
};