import React, { useState, useEffect, useRef, useCallback } from 'react';
import { generatePdf } from '../services/pdfService';
import { getCrossStitchInstructions } from '../services/geminiService';
import Spinner from './Spinner';
import { DownloadIcon, SolidCircleIcon, HollowCircleIcon, SolidSquareIcon, HollowSquareIcon, CrossStitchIcon, HalfStitchForwardIcon, HalfStitchBackwardIcon } from './Icons';
import { DmcColor } from '../types';

interface EditorScreenProps {
  imageFile: File;
}

type StitchType = 'circle' | 'square' | 'hollow-circle' | 'hollow-square' | 'cross-stitch' | 'half-stitch-forward' | 'half-stitch-backward';

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
  const [stitchType, setStitchType] = useState<StitchType>('circle');
  const [shapeSize, setShapeSize] = useState(50);
  const [selectedColor, setSelectedColor] = useState(DMC_COLORS[5]); // Default to black
  const [loading, setLoading] = useState(true);
  const [loadingMessage, setLoadingMessage] = useState('Preparing image...');
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [stitchGrid, setStitchGrid] = useState<boolean[][] | null>(null);
  const patternCanvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(new Image());

  const generatePattern = useCallback((image: HTMLImageElement, currentGridSize: number, currentThreshold: number) => {
    setLoading(true);
    setLoadingMessage('Generating pattern...');
    
    requestAnimationFrame(() => {
      const stitchesX = currentGridSize;
      const aspectRatio = image.width / image.height;
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
      
      const currentStitchGrid: boolean[][] = Array.from({ length: stitchesY }, () => Array(stitchesX).fill(false));
      for (let y = 0; y < stitchesY; y++) {
        for (let x = 0; x < stitchesX; x++) {
          const i = (y * stitchesX + x) * 4;
          const r = imageData[i];
          const g = imageData[i + 1];
          const b = imageData[i + 2];
          const a = imageData[i + 3];
          const gray = r * 0.299 + g * 0.587 + b * 0.114;
          if (a > 128 && gray < currentThreshold) {
            currentStitchGrid[y][x] = true;
          }
        }
      }
      setStitchGrid(currentStitchGrid);

      const canvas = patternCanvasRef.current;
      if (!canvas) {
        setLoading(false);
        return;
      }

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
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const stitchWidth = canvas.width / stitchesX;
      const stitchHeight = canvas.height / stitchesY;
      const stitchSize = Math.min(stitchWidth, stitchHeight);
      
      ctx.fillStyle = selectedColor.hex;
      ctx.strokeStyle = selectedColor.hex;
      ctx.lineCap = 'round';

      for (let y = 0; y < stitchesY; y++) {
        for (let x = 0; x < stitchesX; x++) {
          if (currentStitchGrid[y][x]) {
            const sizeMultiplier = shapeSize / 50;

            const cx = x * stitchWidth + stitchWidth / 2;
            const cy = y * stitchHeight + stitchHeight / 2;

            const circleRadius = (stitchSize / 3.0) * sizeMultiplier;
            const squareSize = (stitchSize * 2 / 3.0) * sizeMultiplier;
            const rectX = x * stitchWidth + (stitchWidth - squareSize) / 2;
            const rectY = y * stitchHeight + (stitchHeight - squareSize) / 2;
            
            const strokeWidth = Math.max(1, (stitchSize / 10) * sizeMultiplier);
            ctx.lineWidth = strokeWidth;

            const scale = shapeSize / 100;
            const stitchPaddingX = (stitchWidth * (1 - scale)) / 2;
            const stitchPaddingY = (stitchHeight * (1 - scale)) / 2;
            const startX = x * stitchWidth + stitchPaddingX;
            const startY = y * stitchHeight + stitchPaddingY;
            const endX = (x + 1) * stitchWidth - stitchPaddingX;
            const endY = (y + 1) * stitchHeight - stitchPaddingY;

            switch (stitchType) {
              case 'circle':
                ctx.beginPath();
                ctx.arc(cx, cy, circleRadius, 0, 2 * Math.PI, false);
                ctx.fill();
                break;
              case 'square':
                ctx.fillRect(rectX, rectY, squareSize, squareSize);
                break;
              case 'hollow-circle':
                ctx.beginPath();
                ctx.arc(cx, cy, circleRadius - strokeWidth / 2, 0, 2 * Math.PI, false);
                ctx.stroke();
                break;
              case 'hollow-square':
                ctx.strokeRect(rectX + strokeWidth / 2, rectY + strokeWidth / 2, squareSize - strokeWidth, squareSize - strokeWidth);
                break;
              case 'cross-stitch':
                ctx.beginPath();
                ctx.moveTo(startX, startY);
                ctx.lineTo(endX, endY);
                ctx.moveTo(endX, startY);
                ctx.lineTo(startX, endY);
                ctx.stroke();
                break;
              case 'half-stitch-forward': // /
                ctx.beginPath();
                ctx.moveTo(startX, endY);
                ctx.lineTo(endX, startY);
                ctx.stroke();
                break;
              case 'half-stitch-backward': // \
                ctx.beginPath();
                ctx.moveTo(startX, startY);
                ctx.lineTo(endX, endY);
                ctx.stroke();
                break;
            }
          }
        }
      }
      
      setLoading(false);
    });
  }, [stitchType, selectedColor, shapeSize]);

  useEffect(() => {
    setLoading(true);
    setLoadingMessage('Preparing image...');
    setIsImageLoaded(false);
    setStitchGrid(null);

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
      await generatePdf(patternCanvasRef.current, instructions, stitchesX, stitchesY, threadCount);
      setLoading(false);
    }
  };
  
  const handleDownloadPdfWithoutInstructions = async () => {
    if (patternCanvasRef.current && imageRef.current.complete) {
        setLoading(true);
        setLoadingMessage('Creating PDF...');

        const savedThreadCount = localStorage.getItem('settings:threadCount');
        const threadCount = savedThreadCount ? JSON.parse(savedThreadCount) : '14-count';

        const image = imageRef.current;
        const aspectRatio = image.width / image.height;
        const stitchesX = gridSize;
        const stitchesY = Math.floor(gridSize / aspectRatio);
        await generatePdf(patternCanvasRef.current, '', stitchesX, stitchesY, threadCount);
        setLoading(false);
    }
  };

  const handleDownloadPng = () => {
    if (!stitchGrid || !isImageLoaded || !imageRef.current.complete) {
        alert("Pattern not ready to be downloaded.");
        return;
    }

    const image = imageRef.current;
    
    const aspectRatio = image.width / image.height;
    const stitchesX = gridSize;
    const stitchesY = Math.floor(gridSize / aspectRatio);

    const pngWidth = 1200;
    const pngHeight = Math.floor(pngWidth / aspectRatio);

    const canvas = document.createElement('canvas');
    canvas.width = pngWidth;
    canvas.height = pngHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const stitchWidth = pngWidth / stitchesX;
    const stitchHeight = pngHeight / stitchesY;
    const stitchSize = Math.min(stitchWidth, stitchHeight);
  
    ctx.fillStyle = selectedColor.hex;
    ctx.strokeStyle = selectedColor.hex;
    ctx.lineCap = 'round';
    
    for (let y = 0; y < stitchesY; y++) {
        for (let x = 0; x < stitchesX; x++) {
            if (stitchGrid[y][x]) {
                const sizeMultiplier = shapeSize / 50;

                const cx = x * stitchWidth + stitchWidth / 2;
                const cy = y * stitchHeight + stitchHeight / 2;

                const circleRadius = (stitchSize / 3.0) * sizeMultiplier;
                const squareSize = (stitchSize * 2 / 3.0) * sizeMultiplier;
                const rectX = x * stitchWidth + (stitchWidth - squareSize) / 2;
                const rectY = y * stitchHeight + (stitchHeight - squareSize) / 2;
                
                const strokeWidth = Math.max(1, (stitchSize / 10) * sizeMultiplier);
                ctx.lineWidth = strokeWidth;
    
                const scale = shapeSize / 100;
                const stitchPaddingX = (stitchWidth * (1 - scale)) / 2;
                const stitchPaddingY = (stitchHeight * (1 - scale)) / 2;
                const startX = x * stitchWidth + stitchPaddingX;
                const startY = y * stitchHeight + stitchPaddingY;
                const endX = (x + 1) * stitchWidth - stitchPaddingX;
                const endY = (y + 1) * stitchHeight - stitchPaddingY;
                
                switch (stitchType) {
                    case 'circle':
                        ctx.beginPath();
                        ctx.arc(cx, cy, circleRadius, 0, 2 * Math.PI, false);
                        ctx.fill();
                        break;
                    case 'square':
                        ctx.fillRect(rectX, rectY, squareSize, squareSize);
                        break;
                    case 'hollow-circle':
                        ctx.beginPath();
                        ctx.arc(cx, cy, circleRadius - strokeWidth / 2, 0, 2 * Math.PI, false);
                        ctx.stroke();
                        break;
                    case 'hollow-square':
                        ctx.strokeRect(rectX + strokeWidth / 2, rectY + strokeWidth / 2, squareSize - strokeWidth, squareSize - strokeWidth);
                        break;
                    case 'cross-stitch':
                        ctx.beginPath();
                        ctx.moveTo(startX, startY);
                        ctx.lineTo(endX, endY);
                        ctx.moveTo(endX, startY);
                        ctx.lineTo(startX, endY);
                        ctx.stroke();
                        break;
                    case 'half-stitch-forward':
                        ctx.beginPath();
                        ctx.moveTo(startX, endY);
                        ctx.lineTo(endX, startY);
                        ctx.stroke();
                        break;
                    case 'half-stitch-backward':
                        ctx.beginPath();
                        ctx.moveTo(startX, startY);
                        ctx.lineTo(endX, endY);
                        ctx.stroke();
                        break;
                }
            }
        }
    }

    const dataUrl = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = 'cross-stitch-pattern.png';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };
  
  const handleDownloadSvg = () => {
    if (!stitchGrid || !isImageLoaded || !imageRef.current.complete) {
        alert("Pattern not ready to be downloaded.");
        return;
    }

    const image = imageRef.current;
    
    const aspectRatio = image.width / image.height;
    const svgWidth = 600;
    const svgHeight = svgWidth / aspectRatio;

    const stitchesX = gridSize;
    const stitchesY = Math.floor(gridSize / aspectRatio);
    
    const stitchWidth = svgWidth / stitchesX;
    const stitchHeight = svgHeight / stitchesY;
    const stitchSize = Math.min(stitchWidth, stitchHeight);

    let svgParts: string[] = [`<svg width="${svgWidth}" height="${svgHeight}" xmlns="http://www.w3.org/2000/svg">`];

    for (let y = 0; y < stitchesY; y++) {
        for (let x = 0; x < stitchesX; x++) {
            if (stitchGrid[y][x]) {
                const sizeMultiplier = shapeSize / 50;

                const cx = x * stitchWidth + stitchWidth / 2;
                const cy = y * stitchHeight + stitchHeight / 2;
                const circleRadius = (stitchSize / 3.0) * sizeMultiplier;

                const squareSize = (stitchSize * 2 / 3.0) * sizeMultiplier;
                const rectX = x * stitchWidth + (stitchWidth - squareSize) / 2;
                const rectY = y * stitchHeight + (stitchHeight - squareSize) / 2;

                const strokeWidth = Math.max(0.5, (stitchSize / 10) * sizeMultiplier);
                
                const scale = shapeSize / 100;
                const stitchPaddingX = (stitchWidth * (1 - scale)) / 2;
                const stitchPaddingY = (stitchHeight * (1 - scale)) / 2;
                const startX = x * stitchWidth + stitchPaddingX;
                const startY = y * stitchHeight + stitchPaddingY;
                const endX = (x + 1) * stitchWidth - stitchPaddingX;
                const endY = (y + 1) * stitchHeight - stitchPaddingY;
                
                switch (stitchType) {
                    case 'circle':
                        svgParts.push(`<circle cx="${cx}" cy="${cy}" r="${circleRadius}" fill="${selectedColor.hex}" />`);
                        break;
                    case 'square':
                        svgParts.push(`<rect x="${rectX}" y="${rectY}" width="${squareSize}" height="${squareSize}" fill="${selectedColor.hex}" />`);
                        break;
                    case 'hollow-circle':
                        svgParts.push(`<circle cx="${cx}" cy="${cy}" r="${circleRadius - strokeWidth / 2}" fill="none" stroke="${selectedColor.hex}" stroke-width="${strokeWidth}" />`);
                        break;
                    case 'hollow-square':
                        svgParts.push(`<rect x="${rectX + strokeWidth / 2}" y="${rectY + strokeWidth / 2}" width="${squareSize - strokeWidth}" height="${squareSize - strokeWidth}" fill="none" stroke="${selectedColor.hex}" stroke-width="${strokeWidth}" />`);
                        break;
                    case 'cross-stitch':
                        svgParts.push(`<line x1="${startX}" y1="${startY}" x2="${endX}" y2="${endY}" stroke="${selectedColor.hex}" stroke-width="${strokeWidth}" stroke-linecap="round" />`);
                        svgParts.push(`<line x1="${endX}" y1="${startY}" x2="${startX}" y2="${endY}" stroke="${selectedColor.hex}" stroke-width="${strokeWidth}" stroke-linecap="round" />`);
                        break;
                    case 'half-stitch-forward':
                        svgParts.push(`<line x1="${startX}" y1="${endY}" x2="${endX}" y2="${startY}" stroke="${selectedColor.hex}" stroke-width="${strokeWidth}" stroke-linecap="round" />`);
                        break;
                    case 'half-stitch-backward':
                        svgParts.push(`<line x1="${startX}" y1="${startY}" x2="${endX}" y2="${endY}" stroke="${selectedColor.hex}" stroke-width="${strokeWidth}" stroke-linecap="round" />`);
                        break;
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
    a.download = 'cross-stitch-pattern.svg';
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
      <div className="lg:col-span-2 relative w-full h-[60vh] lg:h-auto lg:aspect-square rounded-xl overflow-hidden shadow-lg bg-slate-50 flex items-center justify-center p-4 border border-slate-200">
        <div className="w-full h-full flex items-center justify-center">
          <canvas
            ref={patternCanvasRef}
            style={{
              maxHeight: '100%',
              maxWidth: '100%'
            }}
          />
        </div>
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
              <label className="block text-sm font-medium text-slate-700 mb-2">Stitch Type</label>
               <div className="grid grid-cols-4 gap-2">
                {(
                    [
                        { type: 'circle', icon: SolidCircleIcon, title: 'Solid Circle' },
                        { type: 'hollow-circle', icon: HollowCircleIcon, title: 'Hollow Circle' },
                        { type: 'square', icon: SolidSquareIcon, title: 'Solid Square' },
                        { type: 'hollow-square', icon: HollowSquareIcon, title: 'Hollow Square' },
                        { type: 'cross-stitch', icon: CrossStitchIcon, title: 'Cross Stitch (X)' },
                        { type: 'half-stitch-forward', icon: HalfStitchForwardIcon, title: 'Half Stitch (/)' },
                        { type: 'half-stitch-backward', icon: HalfStitchBackwardIcon, title: 'Half Stitch (\\)' },
                    ] as const
                ).map(({type, icon: Icon, title}) => (
                    <button
                        key={type}
                        title={title}
                        onClick={() => setStitchType(type)}
                        className={`flex items-center justify-center p-3 rounded-lg border font-semibold transition-colors ${
                            stitchType === type
                            ? 'bg-sky-500 border-sky-500 text-white'
                            : 'bg-white border-slate-300 text-slate-700 hover:border-sky-500'
                        }`}
                    >
                        <Icon className="w-5 h-5" />
                    </button>
                ))}
              </div>
            </div>
            <div>
              <label htmlFor="shapeSize" className="block text-sm font-medium text-slate-700 mt-4">Shape Size: {shapeSize}</label>
              <input
                id="shapeSize"
                type="range"
                min="1"
                max="100"
                value={shapeSize}
                onChange={(e) => setShapeSize(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-sky-500"
              />
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
            onClick={handleDownloadPng}
            disabled={loading}
            className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-slate-700 text-white font-semibold rounded-lg shadow-md hover:bg-slate-800 transition-all disabled:bg-slate-400"
          >
            <DownloadIcon className="w-5 h-5" />
            Download PNG
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