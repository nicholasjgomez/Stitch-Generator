import React, { useState, useEffect, useRef, useCallback } from 'react';
import { generatePdf } from '../services/pdfService';
import { getCrossStitchInstructions } from '../services/geminiService';
import Spinner from './Spinner';
import { DownloadIcon, CircleIcon, SquareIcon } from './Icons';
import { DmcColor } from '../types';

interface EditorScreenProps {
  imageFile: File;
}

type FillShape = 'circle' | 'square';

const DMC_COLORS: DmcColor[] = [
  { name: 'Red', dmc: '#321', hex: '#DE313A' },
  { name: 'Bright Orange', dmc: '#608', hex: '#FF6C00' },
  { name: 'Dark Lemon', dmc: '#444', hex: '#FFBF00' },
  { name: 'Green', dmc: '#699', hex: '#008848' },
  { name: 'Dark Delft Blue', dmc: '#798', hex: '#40548B' },
  { name: 'Black', dmc: '#310', hex: '#000000' },
];

const EditorScreen: React.FC<EditorScreenProps> = ({ imageFile }) => {
  const [gridSize, setGridSize] = useState(32);
  const [threshold, setThreshold] = useState(128);
  const [fillShape, setFillShape] = useState<FillShape>('circle');
  const [outlineOffset, setOutlineOffset] = useState(0);
  const [selectedColor, setSelectedColor] = useState(DMC_COLORS[5]); // Default to black
  const [loading, setLoading] = useState(true);
  const [loadingMessage, setLoadingMessage] = useState('Preparing image...');
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const patternCanvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(new Image());

  const generatePattern = useCallback((image: HTMLImageElement, currentGridSize: number, currentThreshold: number) => {
    setLoading(true);
    setLoadingMessage('Generating pattern...');
    
    requestAnimationFrame(() => {
      const canvas = patternCanvasRef.current;
      if (!canvas) {
        setLoading(false);
        return;
      }

      const aspectRatio = image.width / image.height;
      const container = canvas.parentElement;
      if (!container) return;

      const canvasWidth = container.clientWidth;
      const canvasHeight = container.clientHeight;
      
      let renderWidth = canvasWidth;
      let renderHeight = canvasWidth / aspectRatio;

      if (renderHeight > canvasHeight) {
        renderHeight = canvasHeight;
        renderWidth = canvasHeight * aspectRatio;
      }

      canvas.width = renderWidth;
      canvas.height = renderHeight;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      const stitchesX = currentGridSize;
      const stitchesY = Math.floor(currentGridSize / aspectRatio);
      
      const smallCanvas = document.createElement('canvas');
      smallCanvas.width = stitchesX;
      smallCanvas.height = stitchesY;
      const smallCtx = smallCanvas.getContext('2d', { willReadFrequently: true });
      if (!smallCtx) return;

      smallCtx.imageSmoothingEnabled = true;
      smallCtx.imageSmoothingQuality = 'high';
      smallCtx.drawImage(image, 0, 0, stitchesX, stitchesY);

      const imageData = smallCtx.getImageData(0, 0, stitchesX, stitchesY).data;
      
      const stitchGrid: boolean[][] = Array.from({ length: stitchesY }, () => Array(stitchesX).fill(false));
      for (let y = 0; y < stitchesY; y++) {
        for (let x = 0; x < stitchesX; x++) {
          const i = (y * stitchesX + x) * 4;
          const r = imageData[i];
          const g = imageData[i + 1];
          const b = imageData[i + 2];
          const a = imageData[i + 3];
          const gray = r * 0.299 + g * 0.587 + b * 0.114;
          if (a > 128 && gray < currentThreshold) {
            stitchGrid[y][x] = true;
          }
        }
      }
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const stitchWidth = canvas.width / stitchesX;
      const stitchHeight = canvas.height / stitchesY;
      const stitchSize = Math.min(stitchWidth, stitchHeight);
      const circleRadius = stitchSize / 3.0;
      const squareSize = stitchSize * 2 / 3.0;

      if (outlineOffset > 0) {
        // Flood-fill from edges to find exterior space
        const backgroundGrid = Array.from({ length: stitchesY }, () => Array(stitchesX).fill(false));
        const queue: [number, number][] = [];

        for (let y = 0; y < stitchesY; y++) {
          if (!stitchGrid[y][0]) { backgroundGrid[y][0] = true; queue.push([y, 0]); }
          if (!stitchGrid[y][stitchesX - 1]) { backgroundGrid[y][stitchesX - 1] = true; queue.push([y, stitchesX - 1]); }
        }
        for (let x = 0; x < stitchesX; x++) {
          if (!stitchGrid[0][x]) { backgroundGrid[0][x] = true; queue.push([0, x]); }
          if (!stitchGrid[stitchesY - 1][x]) { backgroundGrid[stitchesY - 1][x] = true; queue.push([stitchesY - 1, x]); }
        }

        while (queue.length > 0) {
          const [y, x] = queue.shift()!;
          const neighbors = [[y - 1, x], [y + 1, x], [y, x - 1], [y, x + 1]];
          for (const [ny, nx] of neighbors) {
            if (ny >= 0 && ny < stitchesY && nx >= 0 && nx < stitchesX && !backgroundGrid[ny][nx] && !stitchGrid[ny][nx]) {
              backgroundGrid[ny][nx] = true;
              queue.push([ny, nx]);
            }
          }
        }
        
        ctx.strokeStyle = selectedColor.hex;
        ctx.lineWidth = 1;
        ctx.beginPath();
        const offset = outlineOffset;

        for (let y = 0; y < stitchesY; y++) {
          for (let x = 0; x < stitchesX; x++) {
            if (!stitchGrid[y][x]) continue;

            const sx = x * stitchWidth;
            const sy = y * stitchHeight;
            const ex = (x + 1) * stitchWidth;
            const ey = (y + 1) * stitchHeight;

            // Check if neighbors are in the exterior background
            const hasExternalN = (y === 0) || backgroundGrid[y - 1][x];
            const hasExternalS = (y === stitchesY - 1) || backgroundGrid[y + 1][x];
            const hasExternalW = (x === 0) || backgroundGrid[y][x - 1];
            const hasExternalE = (x === stitchesX - 1) || backgroundGrid[y][x + 1];

            // Straight edges
            if (hasExternalN) { ctx.moveTo(sx, sy - offset); ctx.lineTo(ex, sy - offset); }
            if (hasExternalS) { ctx.moveTo(sx, ey + offset); ctx.lineTo(ex, ey + offset); }
            if (hasExternalW) { ctx.moveTo(sx - offset, sy); ctx.lineTo(sx - offset, ey); }
            if (hasExternalE) { ctx.moveTo(ex + offset, sy); ctx.lineTo(ex + offset, ey); }

            // Convex (outer) corners
            if (hasExternalN && hasExternalW) { ctx.moveTo(sx - offset, sy); ctx.arc(sx, sy, offset, Math.PI, 1.5 * Math.PI); }
            if (hasExternalN && hasExternalE) { ctx.moveTo(ex, sy - offset); ctx.arc(ex, sy, offset, 1.5 * Math.PI, 2 * Math.PI); }
            if (hasExternalS && hasExternalW) { ctx.moveTo(sx, ey + offset); ctx.arc(sx, ey, offset, 0.5 * Math.PI, Math.PI); }
            if (hasExternalS && hasExternalE) { ctx.moveTo(ex + offset, ey); ctx.arc(ex, ey, offset, 0, 0.5 * Math.PI); }

            // Concave (inner) corners on the exterior path
            const hasExternalNW = (y > 0 && x > 0) && backgroundGrid[y-1][x-1];
            const hasExternalNE = (y > 0 && x < stitchesX - 1) && backgroundGrid[y-1][x+1];
            const hasExternalSW = (y < stitchesY - 1 && x > 0) && backgroundGrid[y+1][x-1];
            const hasExternalSE = (y < stitchesY - 1 && x < stitchesX - 1) && backgroundGrid[y+1][x+1];

            if (hasExternalNW && !hasExternalN && !hasExternalW) { ctx.moveTo(sx, sy - offset); ctx.arc(sx - offset, sy - offset, offset, 0, 0.5 * Math.PI); }
            if (hasExternalNE && !hasExternalN && !hasExternalE) { ctx.moveTo(ex + offset, sy); ctx.arc(ex + offset, sy - offset, offset, 0.5 * Math.PI, Math.PI); }
            if (hasExternalSW && !hasExternalS && !hasExternalW) { ctx.moveTo(sx - offset, ey); ctx.arc(sx - offset, ey + offset, offset, 1.5 * Math.PI, 2 * Math.PI); }
            if (hasExternalSE && !hasExternalS && !hasExternalE) { ctx.moveTo(ex, ey + offset); ctx.arc(ex + offset, ey + offset, offset, Math.PI, 1.5 * Math.PI); }
          }
        }
        ctx.stroke();
      }
      
      ctx.fillStyle = selectedColor.hex;

      for (let y = 0; y < stitchesY; y++) {
        for (let x = 0; x < stitchesX; x++) {
          if (stitchGrid[y][x]) {
            if (fillShape === 'circle') {
              ctx.beginPath();
              ctx.arc(x * stitchWidth + stitchWidth / 2, y * stitchHeight + stitchHeight / 2, circleRadius, 0, 2 * Math.PI, false);
              ctx.fill();
            } else { // square
              const rectX = x * stitchWidth + (stitchWidth - squareSize) / 2;
              const rectY = y * stitchHeight + (stitchHeight - squareSize) / 2;
              ctx.fillRect(rectX, rectY, squareSize, squareSize);
            }
          }
        }
      }
      
      setLoading(false);
    });
  }, [fillShape, outlineOffset, selectedColor]);

  useEffect(() => {
    setLoading(true);
    setLoadingMessage('Preparing image...');
    setIsImageLoaded(false);

    const img = imageRef.current;
    let objectUrl: string | null = null;

    const handleImageLoad = () => {
        setIsImageLoaded(true);
    };

    img.addEventListener('load', handleImageLoad);
    img.onerror = () => {
        alert("Failed to load image.");
        setLoading(false);
    };

    if (imageFile) {
        objectUrl = URL.createObjectURL(imageFile);
        img.src = objectUrl;
    }

    return () => {
        img.removeEventListener('load', handleImageLoad);
        img.onerror = null;
        img.src = '';
        if (objectUrl) {
            URL.revokeObjectURL(objectUrl);
        }
    };
  }, [imageFile]);


  useEffect(() => {
    if (isImageLoaded && imageRef.current.complete) {
      generatePattern(imageRef.current, gridSize, threshold);
    }
  }, [isImageLoaded, gridSize, threshold, generatePattern]);

  const handleDownloadPdfWithInstructions = async () => {
    if (patternCanvasRef.current && imageRef.current.complete) {
      setLoading(true);

      const savedThreadCount = localStorage.getItem('settings:threadCount');
      const threadCount = savedThreadCount ? JSON.parse(savedThreadCount) : '14-count';

      const image = imageRef.current;
      const aspectRatio = image.width / image.height;
      const stitchesX = gridSize;
      const stitchesY = Math.floor(gridSize / aspectRatio);

      setLoadingMessage('Generating instructions...');
      let instructions = 'Failed to generate instructions.';
      try {
        instructions = await getCrossStitchInstructions(
            stitchesX, 
            stitchesY, 
            threadCount,
            selectedColor.name,
            selectedColor.dmc
        );
      } catch (e) {
        console.error(e);
        alert('There was an issue generating the stitching instructions. The PDF will be created without them.');
      }
      
      setLoadingMessage('Creating PDF...');
      await generatePdf(patternCanvasRef.current, instructions);
      setLoading(false);
    }
  };
  
  const handleDownloadPdfWithoutInstructions = async () => {
    if (patternCanvasRef.current) {
        setLoading(true);
        setLoadingMessage('Creating PDF...');
        await generatePdf(patternCanvasRef.current, '');
        setLoading(false);
    }
  };
  
  const handleDownloadSvg = () => {
    if (!isImageLoaded || !imageRef.current.complete || !patternCanvasRef.current) {
        alert("Pattern not ready to be downloaded.");
        return;
    }

    const image = imageRef.current;
    const canvas = patternCanvasRef.current;

    const aspectRatio = image.width / image.height;
    const svgWidth = 600;
    const svgHeight = svgWidth / aspectRatio;

    const stitchesX = gridSize;
    const stitchesY = Math.floor(gridSize / aspectRatio);

    const smallCanvas = document.createElement('canvas');
    smallCanvas.width = stitchesX;
    smallCanvas.height = stitchesY;
    const smallCtx = smallCanvas.getContext('2d', { willReadFrequently: true });
    if (!smallCtx) return;

    smallCtx.imageSmoothingEnabled = true;
    smallCtx.imageSmoothingQuality = 'high';
    smallCtx.drawImage(image, 0, 0, stitchesX, stitchesY);
    const imageData = smallCtx.getImageData(0, 0, stitchesX, stitchesY).data;
    
    const stitchGrid: boolean[][] = Array.from({ length: stitchesY }, () => Array(stitchesX).fill(false));
    for (let y = 0; y < stitchesY; y++) {
      for (let x = 0; x < stitchesX; x++) {
        const i = (y * stitchesX + x) * 4;
        const gray = imageData[i] * 0.299 + imageData[i + 1] * 0.587 + imageData[i + 2] * 0.114;
        const alpha = imageData[i + 3];
        if (alpha > 128 && gray < threshold) {
          stitchGrid[y][x] = true;
        }
      }
    }
    
    const stitchWidth = svgWidth / stitchesX;
    const stitchHeight = svgHeight / stitchesY;
    const stitchSize = Math.min(stitchWidth, stitchHeight);
    const circleRadius = stitchSize / 3.0;
    const squareSize = stitchSize * 2 / 3.0;

    let svgParts: string[] = [`<svg width="${svgWidth}" height="${svgHeight}" xmlns="http://www.w3.org/2000/svg">`];

    if (outlineOffset > 0) {
      const backgroundGrid = Array.from({ length: stitchesY }, () => Array(stitchesX).fill(false));
      const queue: [number, number][] = [];
      for (let y = 0; y < stitchesY; y++) {
        if (!stitchGrid[y][0]) { backgroundGrid[y][0] = true; queue.push([y, 0]); }
        if (!stitchGrid[y][stitchesX - 1]) { backgroundGrid[y][stitchesX - 1] = true; queue.push([y, stitchesX - 1]); }
      }
      for (let x = 0; x < stitchesX; x++) {
        if (!stitchGrid[0][x]) { backgroundGrid[0][x] = true; queue.push([0, x]); }
        if (!stitchGrid[stitchesY - 1][x]) { backgroundGrid[stitchesY - 1][x] = true; queue.push([stitchesY - 1, x]); }
      }
      while (queue.length > 0) {
        const [y, x] = queue.shift()!;
        const neighbors = [[y - 1, x], [y + 1, x], [y, x - 1], [y, x + 1]];
        for (const [ny, nx] of neighbors) {
          if (ny >= 0 && ny < stitchesY && nx >= 0 && nx < stitchesX && !backgroundGrid[ny][nx] && !stitchGrid[ny][nx]) {
            backgroundGrid[ny][nx] = true;
            queue.push([ny, nx]);
          }
        }
      }

      const offset = outlineOffset;
      let pathData = '';
      for (let y = 0; y < stitchesY; y++) {
        for (let x = 0; x < stitchesX; x++) {
          if (!stitchGrid[y][x]) continue;
          
          const sx = x * stitchWidth;
          const sy = y * stitchHeight;
          const ex = (x + 1) * stitchWidth;
          const ey = (y + 1) * stitchHeight;

          const hasExternalN = (y === 0) || backgroundGrid[y - 1][x];
          const hasExternalS = (y === stitchesY - 1) || backgroundGrid[y + 1][x];
          const hasExternalW = (x === 0) || backgroundGrid[y][x - 1];
          const hasExternalE = (x === stitchesX - 1) || backgroundGrid[y][x + 1];

          if (hasExternalN) pathData += ` M ${sx},${sy-offset} L ${ex},${sy-offset}`;
          if (hasExternalS) pathData += ` M ${sx},${ey+offset} L ${ex},${ey+offset}`;
          if (hasExternalW) pathData += ` M ${sx-offset},${sy} L ${sx-offset},${ey}`;
          if (hasExternalE) pathData += ` M ${ex+offset},${sy} L ${ex+offset},${ey}`;
          
          if (hasExternalN && hasExternalW) pathData += ` M ${sx-offset},${sy} A ${offset},${offset} 0 0 1 ${sx},${sy-offset}`;
          if (hasExternalN && hasExternalE) pathData += ` M ${ex},${sy-offset} A ${offset},${offset} 0 0 1 ${ex+offset},${sy}`;
          if (hasExternalS && hasExternalW) pathData += ` M ${sx},${ey+offset} A ${offset},${offset} 0 0 1 ${sx-offset},${ey}`;
          if (hasExternalS && hasExternalE) pathData += ` M ${ex+offset},${ey} A ${offset},${offset} 0 0 1 ${ex},${ey+offset}`;

          const hasExternalNW = (y > 0 && x > 0) && backgroundGrid[y-1][x-1];
          const hasExternalNE = (y > 0 && x < stitchesX - 1) && backgroundGrid[y-1][x+1];
          const hasExternalSW = (y < stitchesY - 1 && x > 0) && backgroundGrid[y+1][x-1];
          const hasExternalSE = (y < stitchesY - 1 && x < stitchesX - 1) && backgroundGrid[y+1][x+1];

          if (hasExternalNW && !hasExternalN && !hasExternalW) pathData += ` M ${sx},${sy - offset} A ${offset},${offset} 0 0 0 ${sx - offset},${sy}`;
          if (hasExternalNE && !hasExternalN && !hasExternalE) pathData += ` M ${ex + offset},${sy} A ${offset},${offset} 0 0 0 ${ex},${sy - offset}`;
          if (hasExternalSW && !hasExternalS && !hasExternalW) pathData += ` M ${sx - offset},${ey} A ${offset},${offset} 0 0 0 ${sx},${ey + offset}`;
          if (hasExternalSE && !hasExternalS && !hasExternalE) pathData += ` M ${ex},${ey + offset} A ${offset},${offset} 0 0 0 ${ex + offset},${ey}`;
        }
      }
      svgParts.push(`<path d="${pathData}" stroke="${selectedColor.hex}" stroke-width="1" fill="none" />`);
    }

    for (let y = 0; y < stitchesY; y++) {
        for (let x = 0; x < stitchesX; x++) {
            if (stitchGrid[y][x]) {
                if (fillShape === 'circle') {
                    const cx = x * stitchWidth + stitchWidth / 2;
                    const cy = y * stitchHeight + stitchHeight / 2;
                    svgParts.push(`<circle cx="${cx}" cy="${cy}" r="${circleRadius}" fill="${selectedColor.hex}" />`);
                } else {
                    const rectX = x * stitchWidth + (stitchWidth - squareSize) / 2;
                    const rectY = y * stitchHeight + (stitchHeight - squareSize) / 2;
                    svgParts.push(`<rect x="${rectX}" y="${rectY}" width="${squareSize}" height="${squareSize}" fill="${selectedColor.hex}" />`);
                }
            }
        }
    }
    
    svgParts.push('</svg>');
    const svgString = svgParts.join('');

    const blob = new Blob([svgString], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'cross-stitch-silhouette-pattern.svg';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
};


  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {loading && (
        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center z-20 col-span-full">
          <Spinner />
          <p className="mt-4 text-slate-600 font-semibold">{loadingMessage}</p>
        </div>
      )}
      <div className="lg:col-span-2 relative w-full h-[60vh] lg:h-auto rounded-xl overflow-hidden shadow-lg bg-white flex items-center justify-center p-4 border border-slate-200">
        <canvas ref={patternCanvasRef} />
      </div>

      <div className="lg:col-span-1 flex flex-col space-y-6">
        <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-sm">
          <div className="space-y-4">
            <div>
              <label htmlFor="gridSize" className="block text-sm font-medium text-slate-700">Stitch Count (width): {gridSize}</label>
              <input id="gridSize" type="range" min="16" max="100" value={gridSize} onChange={e => setGridSize(Number(e.target.value))} className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-sky-500" />
            </div>
            <div>
              <label htmlFor="threshold" className="block text-sm font-medium text-slate-700">Silhouette Threshold: {threshold}</label>
              <input id="threshold" type="range" min="0" max="255" value={threshold} onChange={e => setThreshold(Number(e.target.value))} className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-sky-500" />
            </div>
            <div>
              <label htmlFor="outlineOffset" className="block text-sm font-medium text-slate-700">Outline Offset: {outlineOffset}px</label>
              <input id="outlineOffset" type="range" min="0" max="10" value={outlineOffset} onChange={e => setOutlineOffset(Number(e.target.value))} className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-sky-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Fill Shape</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setFillShape('circle')}
                  className={`flex items-center justify-center gap-2 p-3 rounded-lg border font-semibold transition-colors ${
                    fillShape === 'circle'
                      ? 'bg-sky-500 border-sky-500 text-white'
                      : 'bg-white border-slate-300 text-slate-700 hover:border-sky-500'
                  }`}
                >
                  <CircleIcon className="w-5 h-5" />
                  <span>Circle</span>
                </button>
                <button
                  onClick={() => setFillShape('square')}
                  className={`flex items-center justify-center gap-2 p-3 rounded-lg border font-semibold transition-colors ${
                    fillShape === 'square'
                      ? 'bg-sky-500 border-sky-500 text-white'
                      : 'bg-white border-slate-300 text-slate-700 hover:border-sky-500'
                  }`}
                >
                  <SquareIcon className="w-5 h-5" />
                  <span>Square</span>
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Thread Color</label>
              <div className="grid grid-cols-6 gap-2">
                {DMC_COLORS.map((color) => (
                  <button
                    key={color.dmc}
                    onClick={() => setSelectedColor(color)}
                    className={`w-full h-10 rounded-lg border-2 transition-all ${
                      selectedColor.dmc === color.dmc
                        ? 'border-sky-500 ring-2 ring-sky-500 ring-offset-1'
                        : 'border-slate-300 hover:border-sky-400'
                    }`}
                    style={{ backgroundColor: color.hex }}
                    aria-label={`Select color ${color.name} ${color.dmc}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col space-y-4">
           <button
            onClick={handleDownloadPdfWithInstructions}
            disabled={loading}
            className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-sky-500 text-white font-semibold rounded-lg shadow-md hover:bg-sky-600 transition-all disabled:bg-sky-300"
          >
            <DownloadIcon className="w-5 h-5" />
            PDF (with Instructions)
          </button>
          <button
            onClick={handleDownloadPdfWithoutInstructions}
            disabled={loading}
            className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-slate-700 text-white font-semibold rounded-lg shadow-md hover:bg-slate-800 transition-all disabled:bg-slate-400"
          >
            <DownloadIcon className="w-5 h-5" />
            PDF (Pattern Only)
          </button>
          <button
            onClick={handleDownloadSvg}
            disabled={loading}
            className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-slate-700 text-white font-semibold rounded-lg shadow-md hover:bg-slate-800 transition-all disabled:bg-slate-400"
          >
            <DownloadIcon className="w-5 h-5" />
            Download SVG
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditorScreen;