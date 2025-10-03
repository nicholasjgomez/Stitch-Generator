import React, { useEffect, useRef, useCallback } from 'react';
import { DmcColor } from '../types';

interface MockupViewProps {
  stitchGrid: boolean[][];
  stitchesX: number;
  stitchesY: number;
  selectedColor: DmcColor;
  fillShape: 'circle' | 'square';
  threadCount: number;
}

const generateAidaTexture = (count: number, color: string = '#FBFBF4'): string => {
  const stitchSize = 100 / count; // Size of one stitch block in the SVG
  const holeSize = stitchSize / 5;
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${stitchSize}" height="${stitchSize}" viewBox="0 0 ${stitchSize} ${stitchSize}">
      <rect width="${stitchSize}" height="${stitchSize}" fill="${color}" />
      <rect x="${(stitchSize - holeSize) / 2}" y="${(stitchSize - holeSize) / 2}" width="${holeSize}" height="${holeSize}" fill="rgba(0,0,0,0.06)" rx="1" />
    </svg>
  `;
  return `data:image/svg+xml;base64,${btoa(svg)}`;
};


const MockupView: React.FC<MockupViewProps> = ({ stitchGrid, stitchesX, stitchesY, selectedColor, fillShape, threadCount }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const aidaTexture = generateAidaTexture(threadCount);

  const drawMockup = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !stitchGrid) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const container = containerRef.current;
    if (!container) return;
    
    const hoopElement = container.querySelector<HTMLDivElement>('.hoop-inner-content');
    if (!hoopElement) return;

    canvas.width = hoopElement.clientWidth;
    canvas.height = hoopElement.clientHeight;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const patternAspectRatio = stitchesX / stitchesY;
    let renderWidth, renderHeight, offsetX, offsetY;
    
    if (patternAspectRatio > canvas.width / canvas.height) {
        renderWidth = canvas.width;
        renderHeight = canvas.width / patternAspectRatio;
        offsetX = 0;
        offsetY = (canvas.height - renderHeight) / 2;
    } else {
        renderHeight = canvas.height;
        renderWidth = canvas.height * patternAspectRatio;
        offsetY = 0;
        offsetX = (canvas.width - renderWidth) / 2;
    }

    const stitchSize = renderWidth / stitchesX;
    ctx.fillStyle = selectedColor.hex;

    const circleRadius = stitchSize / 2.5;
    const squareSize = stitchSize / 1.5;

    for (let y = 0; y < stitchesY; y++) {
      for (let x = 0; x < stitchesX; x++) {
        if (stitchGrid[y][x]) {
           const centerX = offsetX + x * stitchSize + stitchSize / 2;
           const centerY = offsetY + y * stitchSize + stitchSize / 2;
          if (fillShape === 'circle') {
            ctx.beginPath();
            ctx.arc(centerX, centerY, circleRadius, 0, 2 * Math.PI);
            ctx.fill();
          } else {
            ctx.fillRect(centerX - squareSize / 2, centerY - squareSize / 2, squareSize, squareSize);
          }
        }
      }
    }
  }, [stitchGrid, stitchesX, stitchesY, selectedColor, fillShape]);

  useEffect(() => {
    const timeoutId = setTimeout(drawMockup, 0);
    return () => clearTimeout(timeoutId);
  }, [drawMockup, threadCount]);

  useEffect(() => {
    const containerElement = containerRef.current;
    if (!containerElement) return;

    const resizeObserver = new ResizeObserver(() => {
      drawMockup();
    });

    resizeObserver.observe(containerElement);

    return () => {
      resizeObserver.disconnect();
    };
  }, [drawMockup]);


  return (
    <div ref={containerRef} className="w-full h-full flex items-center justify-center bg-transparent">
        <div className="relative w-[95%] aspect-square p-5 bg-[#e6c8a8] rounded-full shadow-xl shadow-black/20" style={{ boxShadow: 'inset 0 0 15px rgba(0,0,0,0.3), 0 10px 20px rgba(0,0,0,0.2)'}}>
            <div className="absolute top-[-10px] left-1/2 -translate-x-1/2 w-8 h-8 bg-gray-300 border-2 border-gray-400 rounded-md shadow-sm">
                 <div className="absolute top-1/2 left-[-6px] -translate-y-1/2 w-3 h-3 bg-gray-400 rounded-sm rotate-45"></div>
                 <div className="absolute top-1/2 right-[-6px] -translate-y-1/2 w-3 h-3 bg-gray-400 rounded-sm rotate-45"></div>
            </div>

            <div className="hoop-inner-content w-full h-full bg-[#d8b898] rounded-full shadow-inner overflow-hidden" style={{boxShadow: 'inset 0 0 20px rgba(0,0,0,0.4)'}}>
                <div 
                    className="relative w-full h-full"
                    style={{
                        backgroundImage: `url("${aidaTexture}")`,
                        backgroundSize: `${100 / threadCount}%`,
                        imageRendering: 'pixelated',
                    }}
                >
                    <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
                </div>
            </div>
        </div>
    </div>
  );
};

export default MockupView;