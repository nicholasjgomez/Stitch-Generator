declare global {
    interface Window {
        jspdf: any;
        html2canvas: any;
    }
}

export const generatePdf = async (patternCanvas: HTMLCanvasElement, instructions: string): Promise<void> => {
    const { jsPDF } = window.jspdf;
    const html2canvas = window.html2canvas;

    try {
        const doc = new jsPDF({
            orientation: 'portrait',
            unit: 'px',
            format: 'a4'
        });

        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const margin = 40; // Increased margin for better layout
        const contentWidth = pageWidth - margin * 2;

        // --- Page 1: Pattern Image ---
        doc.setFontSize(20);
        doc.text('Cross-Stitch Silhouette Pattern', margin, margin);

        const canvasImage = await html2canvas(patternCanvas);
        const imgData = canvasImage.toDataURL('image/png');
        const imgWidth = canvasImage.width;
        const imgHeight = canvasImage.height;
        const aspectRatio = imgWidth / imgHeight;

        let pdfImgWidth = contentWidth;
        let pdfImgHeight = contentWidth / aspectRatio;
        
        if (pdfImgHeight > pageHeight * 0.7) { // Adjusted height to leave space
             pdfImgHeight = pageHeight * 0.7;
             pdfImgWidth = pdfImgHeight * aspectRatio;
        }

        doc.addImage(imgData, 'PNG', margin, margin + 20, pdfImgWidth, pdfImgHeight);

        // --- Page 2: Instructions ---
        if (instructions) {
            doc.addPage();
            doc.setFontSize(20);
            doc.text('Instructions', margin, margin);
            
            doc.setFontSize(10);
            const instructionLines = doc.splitTextToSize(instructions, contentWidth);
            doc.text(instructionLines, margin, margin + 20);
        }

        doc.save('cross-stitch-silhouette-pattern.pdf');

    } catch (error) {
        console.error('Error generating PDF:', error);
        alert('Could not generate PDF. Please try again.');
    }
};
