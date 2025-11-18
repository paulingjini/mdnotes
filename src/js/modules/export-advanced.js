/**
 * Advanced Export Module
 * Robust export using programmatic generation instead of DOM rendering
 */
export class AdvancedExport {
    constructor() {
        this.initialized = false;
    }

    /**
     * Check if advanced export libraries are loaded
     */
    checkLibraries() {
        const libs = {
            jsPDF: typeof window.jspdf !== 'undefined',
            docx: typeof window.docx !== 'undefined',
            pptxgen: typeof window.PptxGenJS !== 'undefined',
            marked: typeof window.marked !== 'undefined'
        };

        return libs;
    }

    /**
     * Export markdown to PDF programmatically (not screenshot)
     */
    async exportToPDF(markdown, filename = 'document.pdf', options = {}) {
        if (!window.jspdf) {
            throw new Error('jsPDF library not loaded');
        }

        const { jsPDF } = window.jspdf;
        const doc = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
        });

        // Parse markdown to tokens
        const tokens = window.marked.lexer(markdown);

        let yPosition = 20;
        const pageHeight = 297; // A4 height in mm
        const pageWidth = 210; // A4 width in mm
        const margin = 20;
        const maxWidth = pageWidth - (margin * 2);

        // Process each token
        for (const token of tokens) {
            // Check if we need a new page
            if (yPosition > pageHeight - 30) {
                doc.addPage();
                yPosition = 20;
            }

            switch (token.type) {
                case 'heading':
                    const headingSizes = { 1: 24, 2: 20, 3: 16, 4: 14, 5: 12, 6: 10 };
                    const fontSize = headingSizes[token.depth] || 12;
                    doc.setFontSize(fontSize);
                    doc.setFont(undefined, 'bold');
                    doc.text(token.text, margin, yPosition);
                    yPosition += fontSize * 0.6;
                    doc.setFont(undefined, 'normal');
                    break;

                case 'paragraph':
                    doc.setFontSize(11);
                    const lines = doc.splitTextToSize(token.text, maxWidth);
                    doc.text(lines, margin, yPosition);
                    yPosition += lines.length * 5 + 5;
                    break;

                case 'list':
                    doc.setFontSize(11);
                    token.items.forEach(item => {
                        const bullet = token.ordered ? `${item.task ? '☐' : '•'}` : '•';
                        const itemLines = doc.splitTextToSize(`${bullet} ${item.text}`, maxWidth - 5);
                        doc.text(itemLines, margin + 5, yPosition);
                        yPosition += itemLines.length * 5 + 2;
                    });
                    yPosition += 5;
                    break;

                case 'blockquote':
                    doc.setFontSize(11);
                    doc.setFont(undefined, 'italic');
                    doc.setDrawColor(0, 122, 204);
                    doc.line(margin, yPosition - 3, margin, yPosition + 10);
                    const quoteLines = doc.splitTextToSize(token.text, maxWidth - 10);
                    doc.text(quoteLines, margin + 5, yPosition);
                    yPosition += quoteLines.length * 5 + 10;
                    doc.setFont(undefined, 'normal');
                    break;

                case 'code':
                    doc.setFillColor(240, 240, 240);
                    doc.rect(margin, yPosition - 3, maxWidth, 10 + (token.text.split('\n').length * 4), 'F');
                    doc.setFontSize(9);
                    doc.setFont('courier');
                    const codeLines = token.text.split('\n');
                    codeLines.forEach((line, index) => {
                        doc.text(line, margin + 2, yPosition + (index * 4));
                    });
                    yPosition += codeLines.length * 4 + 12;
                    doc.setFont(undefined, 'normal');
                    break;

                case 'table':
                    // Simple table rendering
                    const rows = token.rows.map(r => r.map(c => c.text));
                    const headers = token.header.map(h => h.text);

                    doc.setFontSize(10);
                    doc.setFont(undefined, 'bold');
                    const colWidth = maxWidth / headers.length;

                    // Headers
                    headers.forEach((header, i) => {
                        doc.text(header, margin + (i * colWidth), yPosition);
                    });
                    yPosition += 6;
                    doc.setFont(undefined, 'normal');

                    // Rows
                    rows.forEach(row => {
                        row.forEach((cell, i) => {
                            doc.text(cell, margin + (i * colWidth), yPosition);
                        });
                        yPosition += 5;
                    });
                    yPosition += 5;
                    break;

                case 'hr':
                    doc.setDrawColor(200, 200, 200);
                    doc.line(margin, yPosition, pageWidth - margin, yPosition);
                    yPosition += 10;
                    break;

                case 'space':
                    yPosition += 5;
                    break;

                default:
                    // Handle other types
                    if (token.text) {
                        doc.setFontSize(11);
                        const defaultLines = doc.splitTextToSize(token.text, maxWidth);
                        doc.text(defaultLines, margin, yPosition);
                        yPosition += defaultLines.length * 5 + 3;
                    }
            }
        }

        // Add page numbers
        const pageCount = doc.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(9);
            doc.setTextColor(150);
            doc.text(`Page ${i} of ${pageCount}`, pageWidth - margin - 20, pageHeight - 10);
        }

        doc.save(filename);
    }

    /**
     * Export markdown to DOCX programmatically
     */
    async exportToDOCX(markdown, filename = 'document.docx') {
        if (!window.docx) {
            throw new Error('docx library not loaded');
        }

        const { Document, Paragraph, TextRun, HeadingLevel, AlignmentType, Table, TableCell, TableRow, WidthType } = window.docx;

        const tokens = window.marked.lexer(markdown);
        const children = [];

        // Process each token
        for (const token of tokens) {
            switch (token.type) {
                case 'heading':
                    const headingLevels = {
                        1: HeadingLevel.HEADING_1,
                        2: HeadingLevel.HEADING_2,
                        3: HeadingLevel.HEADING_3,
                        4: HeadingLevel.HEADING_4,
                        5: HeadingLevel.HEADING_5,
                        6: HeadingLevel.HEADING_6
                    };
                    children.push(new Paragraph({
                        text: token.text,
                        heading: headingLevels[token.depth]
                    }));
                    break;

                case 'paragraph':
                    children.push(new Paragraph({
                        children: [new TextRun(token.text)],
                        spacing: { after: 200 }
                    }));
                    break;

                case 'list':
                    token.items.forEach((item, index) => {
                        children.push(new Paragraph({
                            text: item.text,
                            bullet: token.ordered ? undefined : { level: 0 },
                            numbering: token.ordered ? { reference: "default-numbering", level: 0 } : undefined
                        }));
                    });
                    break;

                case 'blockquote':
                    children.push(new Paragraph({
                        children: [new TextRun({ text: token.text, italics: true })],
                        indent: { left: 720 },
                        border: {
                            left: {
                                color: "0066CC",
                                space: 1,
                                value: "single",
                                size: 6
                            }
                        }
                    }));
                    break;

                case 'code':
                    children.push(new Paragraph({
                        children: [new TextRun({
                            text: token.text,
                            font: "Courier New",
                            size: 20
                        })],
                        shading: {
                            fill: "F0F0F0"
                        }
                    }));
                    break;

                case 'table':
                    const tableRows = token.rows.map(row =>
                        new TableRow({
                            children: row.map(cell =>
                                new TableCell({
                                    children: [new Paragraph(cell.text)]
                                })
                            )
                        })
                    );

                    const headerRow = new TableRow({
                        children: token.header.map(cell =>
                            new TableCell({
                                children: [new Paragraph({
                                    children: [new TextRun({ text: cell.text, bold: true })]
                                })],
                                shading: { fill: "CCCCCC" }
                            })
                        )
                    });

                    children.push(new Table({
                        rows: [headerRow, ...tableRows],
                        width: {
                            size: 100,
                            type: WidthType.PERCENTAGE
                        }
                    }));
                    break;

                case 'hr':
                    children.push(new Paragraph({
                        border: {
                            bottom: {
                                color: "CCCCCC",
                                space: 1,
                                value: "single",
                                size: 6
                            }
                        }
                    }));
                    break;

                case 'space':
                    children.push(new Paragraph({ text: "" }));
                    break;
            }
        }

        const doc = new Document({
            sections: [{
                properties: {},
                children: children
            }]
        });

        // Generate and download
        const blob = await window.docx.Packer.toBlob(doc);
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.click();
        URL.revokeObjectURL(url);
    }

    /**
     * Export markdown to PowerPoint programmatically
     */
    async exportToPPTX(markdown, filename = 'presentation.pptx', template = null) {
        if (!window.PptxGenJS) {
            throw new Error('PptxGenJS library not loaded');
        }

        const pptx = new window.PptxGenJS();

        // Apply template if provided
        if (template) {
            pptx.layout = 'LAYOUT_16x9';
            // Set default text properties based on template
            if (template.styling) {
                pptx.defineSlideMaster({
                    title: 'MASTER_SLIDE',
                    background: { color: template.styling.backgroundColor },
                    objects: []
                });
            }
        }

        // Split markdown by slides (---)
        const slides = markdown.split(/^---$/m);

        for (const slideContent of slides) {
            if (!slideContent.trim()) continue;

            const slide = pptx.addSlide();

            // Apply template background if available
            if (template && template.slideLayouts) {
                const isFirstSlide = slides[0] === slideContent;
                const layout = isFirstSlide ? template.slideLayouts.title : template.slideLayouts.content;

                if (layout && layout.background) {
                    slide.background = { color: layout.background.replace('#', '') };
                }
            }

            // Parse slide content
            const tokens = window.marked.lexer(slideContent.trim());

            let yPosition = 10; // percentage

            for (const token of tokens) {
                switch (token.type) {
                    case 'heading':
                        const headingSizes = { 1: 44, 2: 36, 3: 28, 4: 24, 5: 20, 6: 18 };
                        slide.addText(token.text, {
                            x: '5%',
                            y: `${yPosition}%`,
                            w: '90%',
                            h: '15%',
                            fontSize: headingSizes[token.depth],
                            bold: true,
                            color: template?.styling?.primaryColor?.replace('#', '') || '000000',
                            fontFace: template?.styling?.headingFont || 'Arial',
                            align: 'center'
                        });
                        yPosition += 18;
                        break;

                    case 'paragraph':
                        slide.addText(token.text, {
                            x: '8%',
                            y: `${yPosition}%`,
                            w: '84%',
                            h: '10%',
                            fontSize: 18,
                            color: template?.styling?.textColor?.replace('#', '') || '333333',
                            fontFace: template?.styling?.bodyFont || 'Arial'
                        });
                        yPosition += 12;
                        break;

                    case 'list':
                        const bulletPoints = token.items.map(item => ({ text: item.text }));
                        slide.addText(bulletPoints, {
                            x: '10%',
                            y: `${yPosition}%`,
                            w: '80%',
                            h: '60%',
                            fontSize: 16,
                            bullet: !token.ordered,
                            color: template?.styling?.textColor?.replace('#', '') || '333333'
                        });
                        yPosition += 50;
                        break;

                    case 'code':
                        slide.addText(token.text, {
                            x: '8%',
                            y: `${yPosition}%`,
                            w: '84%',
                            h: '30%',
                            fontSize: 14,
                            fontFace: 'Courier New',
                            fill: { color: 'F5F5F5' },
                            color: '000000'
                        });
                        yPosition += 35;
                        break;

                    case 'table':
                        const rows = [[...token.header.map(h => h.text)], ...token.rows.map(r => r.map(c => c.text))];
                        slide.addTable(rows, {
                            x: '8%',
                            y: `${yPosition}%`,
                            w: '84%',
                            fontSize: 12,
                            border: { pt: 1, color: 'CCCCCC' }
                        });
                        yPosition += 40;
                        break;
                }

                // Prevent overflow
                if (yPosition > 85) break;
            }

            // Add logo if template has it
            if (template && template.logo && template.logo.enabled && template.logo.url) {
                const logoPos = this.getLogoPosition(template.logo.position);
                slide.addImage({
                    path: template.logo.url,
                    ...logoPos,
                    sizing: { type: 'contain', w: 1, h: 0.5 }
                });
            }

            // Add footer if template has it
            if (template && template.footer && template.footer.enabled) {
                const footerPos = this.getFooterPosition(template.footer.position);
                slide.addText(template.footer.text, {
                    ...footerPos,
                    fontSize: 10,
                    color: '999999'
                });
            }
        }

        await pptx.writeFile({ fileName: filename });
    }

    /**
     * Get logo position for PowerPoint
     */
    getLogoPosition(position) {
        const positions = {
            'top-left': { x: 0.2, y: 0.2 },
            'top-right': { x: 8.8, y: 0.2 },
            'bottom-left': { x: 0.2, y: 7 },
            'bottom-right': { x: 8.8, y: 7 }
        };
        return positions[position] || positions['top-right'];
    }

    /**
     * Get footer position for PowerPoint
     */
    getFooterPosition(position) {
        const positions = {
            'bottom-left': { x: 0.5, y: 7.2, w: 3, h: 0.3 },
            'bottom-center': { x: 4, y: 7.2, w: 3, h: 0.3 },
            'bottom-right': { x: 7, y: 7.2, w: 2.5, h: 0.3 }
        };
        return positions[position] || positions['bottom-right'];
    }

    /**
     * Export markdown to HTML (standalone, enhanced)
     */
    exportToHTML(markdown, filename = 'document.html', template = null) {
        const html = window.marked.parse(markdown);

        const styling = template?.styling || {
            bodyFont: "'Arial', sans-serif",
            headingFont: "'Arial', sans-serif",
            primaryColor: '#333',
            backgroundColor: '#fff',
            textColor: '#333'
        };

        const fullHTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
    <style>
        body {
            font-family: ${styling.bodyFont};
            max-width: 800px;
            margin: 40px auto;
            padding: 20px;
            background: ${styling.backgroundColor};
            color: ${styling.textColor};
            line-height: 1.6;
        }
        h1, h2, h3, h4, h5, h6 {
            font-family: ${styling.headingFont};
            color: ${styling.primaryColor};
            margin-top: 24px;
            margin-bottom: 16px;
        }
        h1 { font-size: 2em; border-bottom: 1px solid #eee; padding-bottom: 0.3em; }
        h2 { font-size: 1.5em; border-bottom: 1px solid #eee; padding-bottom: 0.3em; }
        h3 { font-size: 1.25em; }
        code { background: #f5f5f5; padding: 2px 6px; border-radius: 3px; font-family: 'Courier New', monospace; }
        pre { background: #f5f5f5; padding: 16px; border-radius: 6px; overflow-x: auto; }
        pre code { background: none; padding: 0; }
        blockquote { border-left: 4px solid #ddd; padding-left: 16px; color: #666; margin: 0; }
        table { border-collapse: collapse; width: 100%; margin: 16px 0; }
        th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
        th { background: #f5f5f5; font-weight: bold; }
        img { max-width: 100%; height: auto; }
        a { color: #0066cc; text-decoration: none; }
        a:hover { text-decoration: underline; }
    </style>
</head>
<body>
${html}
</body>
</html>`;

        const blob = new Blob([fullHTML], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.click();
        URL.revokeObjectURL(url);
    }
}
