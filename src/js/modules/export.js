/**
 * Export Module - Handles file exports
 */
export class ExportManager {
    constructor(preview, presentation) {
        this.preview = preview;
        this.presentation = presentation;
    }

    /**
     * Export file in specified format
     */
    async export(format, content, filename = 'document') {
        switch (format) {
            case 'md':
                return this.exportMarkdown(content, filename);
            case 'html':
                return this.exportHTML(content, filename);
            case 'pdf-preview':
                return await this.exportPDFPreview(filename);
            case 'pdf-slides':
                return await this.exportPDFSlides(filename);
            case 'pptx':
                return await this.exportPPTX(filename);
            default:
                console.error('Unknown export format:', format);
                return false;
        }
    }

    /**
     * Export as Markdown
     */
    exportMarkdown(content, filename) {
        this.download(content, `${filename}.md`, 'text/markdown');
        return true;
    }

    /**
     * Export as HTML
     */
    exportHTML(content, filename) {
        const html = this.preview.exportHTML(content, 'dark');
        this.download(html, `${filename}.html`, 'text/html');
        return true;
    }

    /**
     * Export preview as PDF
     */
    async exportPDFPreview(filename) {
        if (!window.html2canvas || !window.jspdf) {
            alert('PDF export libraries not loaded');
            return false;
        }

        try {
            const { jsPDF } = window.jspdf;
            const previewEl = document.getElementById('preview');

            // Create canvas from preview
            const canvas = await window.html2canvas(previewEl, {
                scale: 2,
                useCORS: true,
                logging: false
            });

            const imgData = canvas.toDataURL('image/png');
            const imgWidth = 210; // A4 width in mm
            const imgHeight = (canvas.height * imgWidth) / canvas.width;

            const pdf = new jsPDF('p', 'mm', 'a4');
            let heightLeft = imgHeight;
            let position = 0;

            // Add first page
            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= 297; // A4 height in mm

            // Add additional pages if needed
            while (heightLeft > 0) {
                position = heightLeft - imgHeight;
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
                heightLeft -= 297;
            }

            pdf.save(`${filename}_preview.pdf`);
            return true;

        } catch (error) {
            console.error('PDF preview export error:', error);
            alert('Failed to export PDF preview');
            return false;
        }
    }

    /**
     * Export presentation as PDF slides
     */
    async exportPDFSlides(filename) {
        if (!this.presentation.isActive) {
            alert('Please enter presentation mode first');
            return false;
        }

        return await this.presentation.exportPDF(`${filename}_slides.pdf`);
    }

    /**
     * Export presentation as PowerPoint
     */
    async exportPPTX(filename) {
        if (!this.presentation.isActive) {
            // Start presentation silently
            const editor = window.app?.editor;
            if (editor) {
                const content = editor.getValue();
                await this.presentation.start(content);
            }
        }

        const result = await this.presentation.exportPPTX(`${filename}.pptx`);

        // Stop presentation if we started it
        if (this.presentation.isActive) {
            this.presentation.stop();
        }

        return result;
    }

    /**
     * Download helper
     */
    download(content, filename, mimeType) {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.click();
        URL.revokeObjectURL(url);
    }

    /**
     * Show export menu
     */
    showMenu() {
        const menu = document.getElementById('exportMenu');
        if (menu) {
            menu.classList.toggle('show');
        }
    }

    /**
     * Hide export menu
     */
    hideMenu() {
        const menu = document.getElementById('exportMenu');
        if (menu) {
            menu.classList.remove('show');
        }
    }
}
