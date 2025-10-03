declare global {
    interface Window {
        jspdf: any;
        html2canvas: any;
    }
}

const logoSvgString = (size: number, color: string) => `
<svg
  xmlns="http://www.w3.org/2000/svg"
  viewBox="0 0 24 24"
  width="${size}"
  height="${size}"
  fill="none"
  stroke="${color}"
  stroke-width="1.5"
  stroke-linecap="round"
  stroke-linejoin="round"
>
  <path d="M12 2a10 10 0 1 0 10 10" />
  <path d="M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z" />
  <path d="M16 12h-4" />
  <path d="M18 16l-2.12-2.12" />
  <path d="M22 22l-4-4" />
  <path d="M18 22l4-4" />
</svg>`;

const svgToPngDataUrl = (svgString: string, width: number, height: number): Promise<string> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(svgBlob);

        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            if (!ctx) {
                URL.revokeObjectURL(url);
                reject(new Error('Could not get canvas context'));
                return;
            }
            ctx.drawImage(img, 0, 0, width, height);
            const dataUrl = canvas.toDataURL('image/png');
            URL.revokeObjectURL(url);
            resolve(dataUrl);
        };

        img.onerror = (err) => {
            URL.revokeObjectURL(url);
            reject(err);
        };

        img.src = url;
    });
};

const addFooter = async (doc: any) => {
    const pageCount = doc.internal.getNumberOfPages();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 40;
    const footerY = pageHeight - 25;
    const logoSize = 12;

    try {
        const logoImgData = await svgToPngDataUrl(logoSvgString(logoSize * 2, '#334155'), logoSize * 2, logoSize * 2);

        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            
            doc.addImage(logoImgData, 'PNG', margin, footerY - logoSize / 2, logoSize, logoSize);
            
            doc.setFontSize(10);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor('#334155'); // slate-700
            doc.text('© Cross Stitch Genie 2025', margin + logoSize + 5, footerY, { baseline: 'middle' });
        }
    } catch (error) {
        console.error("Failed to render footer logo, adding text-only footer.", error);
        // Fallback to text-only footer if SVG rendering fails
        for (let i = 1; i <= pageCount; i++) {
             doc.setPage(i);
             doc.setFontSize(10);
             doc.setFont('helvetica', 'bold');
             doc.setTextColor('#334155');
             doc.text('© Cross Stitch Genie 2025', margin, footerY, { baseline: 'middle' });
        }
    }
};


export const generatePdf = async (
    patternCanvas: HTMLCanvasElement, 
    instructions: string, 
    stitchesX: number, 
    stitchesY: number,
    threadCount: string
): Promise<void> => {
    const { jsPDF } = window.jspdf;
    const html2canvas = window.html2canvas;

    const fabricCount = parseInt(threadCount.split('-')[0], 10) || 14;

    try {
        const doc = new jsPDF({
            orientation: 'portrait',
            unit: 'px',
            format: 'a4'
        });

        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const margin = 40;
        const contentWidth = pageWidth - margin * 2;

        // --- Page 1: Pattern Image ---
        doc.setFontSize(20);
        doc.text('Cross-Stitch Silhouette Pattern', margin, margin);

        const canvasImage = await html2canvas(patternCanvas, { backgroundColor: null });
        const imgData = canvasImage.toDataURL('image/png');
        const imgWidth = canvasImage.width;
        const imgHeight = canvasImage.height;
        const aspectRatio = imgWidth / imgHeight;

        let pdfImgWidth = contentWidth;
        let pdfImgHeight = contentWidth / aspectRatio;
        
        if (pdfImgHeight > pageHeight * 0.7) {
             pdfImgHeight = pageHeight * 0.7;
             pdfImgWidth = pdfImgHeight * aspectRatio;
        }

        const imgX = margin;
        const imgY = margin + 30; // More space for grid numbers

        // Add the pattern image
        doc.addImage(imgData, 'PNG', imgX, imgY, pdfImgWidth, pdfImgHeight);

        // --- Add Grid Overlays ---
        const cellWidth = pdfImgWidth / stitchesX;
        const cellHeight = pdfImgHeight / stitchesY;
        
        // 1. Draw fine grid for every stitch
        doc.setDrawColor(220, 220, 220); // Light gray
        doc.setLineWidth(0.5);
        // Vertical lines
        for (let i = 0; i <= stitchesX; i++) {
            const x = imgX + i * cellWidth;
            doc.line(x, imgY, x, imgY + pdfImgHeight);
        }
        // Horizontal lines
        for (let i = 0; i <= stitchesY; i++) {
            const y = imgY + i * cellHeight;
            doc.line(imgX, y, imgX + pdfImgWidth, y);
        }

        // 2. Draw major grid lines based on fabric count
        doc.setDrawColor(150, 150, 150); // Darker gray for major lines
        doc.setLineWidth(1);
        // Vertical major lines
        for (let i = fabricCount; i < stitchesX; i += fabricCount) {
            const x = imgX + i * cellWidth;
            doc.line(x, imgY, x, imgY + pdfImgHeight);
        }
        // Horizontal major lines
        for (let i = fabricCount; i < stitchesY; i += fabricCount) {
            const y = imgY + i * cellHeight;
            doc.line(imgX, y, imgX + pdfImgWidth, y);
        }
        
        // 3. Add grid numbers based on fabric count
        doc.setFontSize(8);
        doc.setTextColor(100, 100, 100);
        
        // Top and bottom numbers
        for (let i = fabricCount; i < stitchesX; i += fabricCount) {
            const x = imgX + i * cellWidth;
            doc.text(String(i), x, imgY - 5, { align: 'center' });
            doc.text(String(i), x, imgY + pdfImgHeight + 10, { align: 'center' });
        }
        // Left and right numbers
        for (let i = fabricCount; i < stitchesY; i += fabricCount) {
            const y = imgY + i * cellHeight;
            doc.text(String(i), imgX - 5, y, { align: 'right', baseline: 'middle' });
            doc.text(String(i), imgX + pdfImgWidth + 5, y, { baseline: 'middle' });
        }


        // --- Page 2: Instructions ---
        if (instructions) {
            doc.addPage();
            doc.setFontSize(20);
            doc.text('Instructions', margin, margin);
            
            doc.setFontSize(10);
            const instructionLines = doc.splitTextToSize(instructions, contentWidth);
            doc.text(instructionLines, margin, margin + 20);
        }

        // --- Add Footer ---
        await addFooter(doc);

        doc.save('cross-stitch-silhouette-pattern.pdf');

    } catch (error) {
        console.error('Error generating PDF:', error);
        alert('Could not generate PDF. Please try again.');
    }
};