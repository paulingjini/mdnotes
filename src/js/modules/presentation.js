/**
 * Presentation Module - Handles Reveal.js presentations
 */
export class Presentation {
    constructor() {
        this.reveal = null;
        this.isActive = false;
        this.container = null;
    }

    /**
     * Initialize presentation container
     */
    init() {
        this.container = document.getElementById('preview');
        return true;
    }

    /**
     * Start presentation mode
     */
    async start(markdown) {
        if (!markdown.includes('---')) {
            alert('Use --- to separate slides');
            return false;
        }

        try {
            // Extract frontmatter if present
            let content = markdown;
            if (markdown.startsWith('---')) {
                const parts = markdown.split('---');
                if (parts.length >= 3) {
                    content = parts.slice(2).join('---').trim();
                }
            }

            // Create Reveal.js container
            this.container.innerHTML = `
                <div class="reveal">
                    <div class="slides">
                        <section data-markdown data-separator="^---$" data-separator-vertical="^--$">
                            <textarea data-template>${content}</textarea>
                        </section>
                    </div>
                </div>
            `;

            // Initialize Reveal.js
            const config = {
                embedded: true,
                hash: false,
                plugins: [window.RevealMarkdown],
                width: 960,
                height: 700,
                margin: 0.04,
                minScale: 0.2,
                maxScale: 2.0,
                // Auto-fit content
                center: true,
                transition: 'slide',
                backgroundTransition: 'fade'
            };

            this.reveal = new window.Reveal(document.querySelector('.reveal'), config);
            await this.reveal.initialize();

            this.isActive = true;
            return true;

        } catch (error) {
            console.error('Presentation start error:', error);
            return false;
        }
    }

    /**
     * Stop presentation mode
     */
    stop() {
        if (this.reveal) {
            this.reveal.destroy();
            this.reveal = null;
        }
        this.isActive = false;
        this.container.innerHTML = '';
    }

    /**
     * Toggle presentation mode
     */
    async toggle(markdown) {
        if (this.isActive) {
            this.stop();
            return false;
        } else {
            return await this.start(markdown);
        }
    }

    /**
     * Navigate to slide
     */
    slideTo(h, v = 0) {
        if (this.reveal) {
            this.reveal.slide(h, v);
        }
    }

    /**
     * Get total slides
     */
    getTotalSlides() {
        return this.reveal ? this.reveal.getTotalSlides() : 0;
    }

    /**
     * Get current slide index
     */
    getCurrentSlide() {
        if (!this.reveal) return { h: 0, v: 0 };
        const indices = this.reveal.getIndices();
        return indices;
    }

    /**
     * Export to PDF slides
     */
    async exportPDF(filename = 'slides.pdf') {
        if (!this.reveal || !window.jspdf) {
            console.error('Reveal or jsPDF not available');
            return false;
        }

        try {
            const { jsPDF } = window.jspdf;
            const totalSlides = this.getTotalSlides();
            const config = this.reveal.getConfig();
            const pdf = new jsPDF('l', 'px', [config.width, config.height]);
            const slidesContainer = document.querySelector('.reveal .slides');

            for (let i = 0; i < totalSlides; i++) {
                await this.reveal.slide(i, 0, 0);
                await new Promise(r => setTimeout(r, 500));

                const canvas = await window.html2canvas(slidesContainer, {
                    width: config.width,
                    height: config.height,
                    x: 0,
                    y: 0,
                    scale: 2 // Higher quality
                });

                if (i > 0) {
                    pdf.addPage([config.width, config.height], 'l');
                }

                pdf.addImage(
                    canvas.toDataURL('image/png'),
                    'PNG',
                    0, 0,
                    config.width,
                    config.height
                );
            }

            pdf.save(filename);
            return true;

        } catch (error) {
            console.error('PDF export error:', error);
            return false;
        }
    }

    /**
     * Export to PowerPoint (via PptxGenJS)
     */
    async exportPPTX(filename = 'presentation.pptx') {
        if (!this.reveal || !window.PptxGenJS) {
            console.error('Reveal or PptxGenJS not available');
            return false;
        }

        try {
            const pptx = new window.PptxGenJS();
            const totalSlides = this.getTotalSlides();
            const config = this.reveal.getConfig();

            for (let i = 0; i < totalSlides; i++) {
                await this.reveal.slide(i, 0, 0);
                await new Promise(r => setTimeout(r, 500));

                const slidesContainer = document.querySelector('.reveal .slides section.present');

                // Convert slide to image
                const canvas = await window.html2canvas(slidesContainer, {
                    scale: 2
                });

                const imgData = canvas.toDataURL('image/png');

                // Add slide to PPTX
                const slide = pptx.addSlide();
                slide.addImage({
                    data: imgData,
                    x: 0,
                    y: 0,
                    w: '100%',
                    h: '100%'
                });
            }

            await pptx.writeFile({ fileName: filename });
            return true;

        } catch (error) {
            console.error('PPTX export error:', error);
            return false;
        }
    }

    /**
     * Set theme
     */
    setTheme(theme) {
        const themeLink = document.getElementById('revealTheme');
        if (themeLink) {
            themeLink.href = `https://cdn.jsdelivr.net/npm/reveal.js@4.6.1/dist/theme/${theme}.css`;
        }
    }

    /**
     * Toggle fullscreen
     */
    toggleFullscreen() {
        const panel = document.getElementById('previewPanel');
        if (panel) {
            panel.classList.toggle('fullscreen-mode');

            if (this.reveal) {
                setTimeout(() => this.reveal.layout(), 100);
            }
        }
    }
}
