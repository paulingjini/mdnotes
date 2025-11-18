/**
 * Presentation Templates Module
 * JSON-based customizable templates for professional presentations
 */
export class PresentationTemplates {
    constructor() {
        this.templates = this.getDefaultTemplates();
        this.customTemplates = this.loadCustomTemplates();
    }

    /**
     * Get default professional templates
     */
    getDefaultTemplates() {
        return {
            corporate: {
                name: "Corporate Professional",
                description: "Professional corporate presentation",
                config: {
                    theme: "white",
                    transition: "slide",
                    backgroundTransition: "fade"
                },
                styling: {
                    primaryColor: "#003366",
                    secondaryColor: "#0066CC",
                    accentColor: "#FF6600",
                    backgroundColor: "#FFFFFF",
                    textColor: "#333333",
                    headingFont: "'Montserrat', sans-serif",
                    bodyFont: "'Open Sans', sans-serif",
                    fontSize: "28px",
                    headingFontSize: "48px"
                },
                logo: {
                    enabled: true,
                    position: "top-right",
                    url: "",
                    width: "80px",
                    height: "80px"
                },
                footer: {
                    enabled: true,
                    text: "© 2024 Company Name",
                    position: "bottom-right",
                    fontSize: "14px"
                },
                slideLayouts: {
                    title: {
                        background: "linear-gradient(135deg, #003366 0%, #0066CC 100%)",
                        textColor: "#FFFFFF",
                        align: "center"
                    },
                    content: {
                        background: "#FFFFFF",
                        textColor: "#333333",
                        align: "left"
                    },
                    twoColumn: {
                        background: "#FFFFFF",
                        columnGap: "40px"
                    },
                    quote: {
                        background: "#F5F5F5",
                        borderLeft: "5px solid #0066CC"
                    }
                }
            },
            modern: {
                name: "Modern Minimalist",
                description: "Clean and modern design",
                config: {
                    theme: "black",
                    transition: "convex",
                    backgroundTransition: "zoom"
                },
                styling: {
                    primaryColor: "#000000",
                    secondaryColor: "#FFFFFF",
                    accentColor: "#00D9FF",
                    backgroundColor: "#1A1A1A",
                    textColor: "#FFFFFF",
                    headingFont: "'Raleway', sans-serif",
                    bodyFont: "'Lato', sans-serif",
                    fontSize: "26px",
                    headingFontSize: "52px"
                },
                logo: {
                    enabled: false
                },
                footer: {
                    enabled: false
                },
                slideLayouts: {
                    title: {
                        background: "#000000",
                        textColor: "#FFFFFF",
                        align: "center"
                    },
                    content: {
                        background: "#1A1A1A",
                        textColor: "#FFFFFF",
                        align: "left"
                    }
                }
            },
            academic: {
                name: "Academic",
                description: "Classic academic presentation",
                config: {
                    theme: "serif",
                    transition: "fade",
                    backgroundTransition: "none"
                },
                styling: {
                    primaryColor: "#8B0000",
                    secondaryColor: "#2F4F4F",
                    accentColor: "#DAA520",
                    backgroundColor: "#FFFFF0",
                    textColor: "#2F4F4F",
                    headingFont: "'Merriweather', serif",
                    bodyFont: "'Crimson Text', serif",
                    fontSize: "24px",
                    headingFontSize: "44px"
                },
                logo: {
                    enabled: true,
                    position: "top-left",
                    url: "",
                    width: "100px",
                    height: "100px"
                },
                footer: {
                    enabled: true,
                    text: "University Name - Department",
                    position: "bottom-center",
                    fontSize: "16px"
                },
                slideLayouts: {
                    title: {
                        background: "#8B0000",
                        textColor: "#FFFFF0",
                        align: "center"
                    },
                    content: {
                        background: "#FFFFF0",
                        textColor: "#2F4F4F",
                        align: "left"
                    }
                }
            },
            startup: {
                name: "Startup Pitch",
                description: "Dynamic startup pitch deck",
                config: {
                    theme: "night",
                    transition: "zoom",
                    backgroundTransition: "slide"
                },
                styling: {
                    primaryColor: "#7C3AED",
                    secondaryColor: "#EC4899",
                    accentColor: "#F59E0B",
                    backgroundColor: "#0F172A",
                    textColor: "#F1F5F9",
                    headingFont: "'Poppins', sans-serif",
                    bodyFont: "'Inter', sans-serif",
                    fontSize: "28px",
                    headingFontSize: "56px"
                },
                logo: {
                    enabled: true,
                    position: "top-left",
                    url: "",
                    width: "120px",
                    height: "40px"
                },
                footer: {
                    enabled: true,
                    text: "Confidential",
                    position: "bottom-right",
                    fontSize: "12px"
                },
                slideLayouts: {
                    title: {
                        background: "linear-gradient(135deg, #7C3AED 0%, #EC4899 100%)",
                        textColor: "#FFFFFF",
                        align: "center"
                    },
                    content: {
                        background: "#0F172A",
                        textColor: "#F1F5F9",
                        align: "left"
                    },
                    metrics: {
                        background: "#1E293B",
                        gridColumns: "3",
                        cardBackground: "#334155"
                    }
                }
            }
        };
    }

    /**
     * Load custom templates from localStorage
     */
    loadCustomTemplates() {
        try {
            const saved = localStorage.getItem('mdnotes_presentation_templates');
            return saved ? JSON.parse(saved) : {};
        } catch (e) {
            console.error('Failed to load custom templates:', e);
            return {};
        }
    }

    /**
     * Save custom template
     */
    saveCustomTemplate(name, template) {
        this.customTemplates[name] = template;
        localStorage.setItem('mdnotes_presentation_templates', JSON.stringify(this.customTemplates));
    }

    /**
     * Get template by name
     */
    getTemplate(name) {
        return this.templates[name] || this.customTemplates[name] || this.templates.corporate;
    }

    /**
     * Get all templates
     */
    getAllTemplates() {
        return { ...this.templates, ...this.customTemplates };
    }

    /**
     * Apply template to presentation
     */
    applyTemplate(templateName, revealInstance) {
        const template = this.getTemplate(templateName);
        if (!template) return;

        // Apply Reveal.js config
        if (revealInstance && template.config) {
            revealInstance.configure(template.config);
        }

        // Apply custom CSS
        this.injectTemplateStyles(template);

        // Apply logo if enabled
        if (template.logo && template.logo.enabled && template.logo.url) {
            this.injectLogo(template.logo);
        }

        // Apply footer if enabled
        if (template.footer && template.footer.enabled) {
            this.injectFooter(template.footer);
        }
    }

    /**
     * Inject template styles
     */
    injectTemplateStyles(template) {
        const { styling } = template;
        if (!styling) return;

        // Remove existing template styles
        const existingStyle = document.getElementById('presentation-template-styles');
        if (existingStyle) {
            existingStyle.remove();
        }

        // Create new style element
        const styleEl = document.createElement('style');
        styleEl.id = 'presentation-template-styles';
        styleEl.textContent = `
            .reveal {
                font-family: ${styling.bodyFont};
                font-size: ${styling.fontSize};
                color: ${styling.textColor};
            }

            .reveal h1, .reveal h2, .reveal h3, .reveal h4, .reveal h5, .reveal h6 {
                font-family: ${styling.headingFont};
                color: ${styling.primaryColor};
            }

            .reveal h1 {
                font-size: ${styling.headingFontSize};
            }

            .reveal .slides {
                background-color: ${styling.backgroundColor};
            }

            .reveal a {
                color: ${styling.accentColor};
            }

            .reveal .slide-background {
                background-color: ${styling.backgroundColor};
            }

            /* Title slide */
            .reveal .title-slide {
                background: ${template.slideLayouts?.title?.background || styling.backgroundColor};
                color: ${template.slideLayouts?.title?.textColor || styling.textColor};
                text-align: ${template.slideLayouts?.title?.align || 'center'};
            }

            /* Content slides */
            .reveal .content-slide {
                background: ${template.slideLayouts?.content?.background || styling.backgroundColor};
                color: ${template.slideLayouts?.content?.textColor || styling.textColor};
                text-align: ${template.slideLayouts?.content?.align || 'left'};
            }

            /* Code blocks */
            .reveal pre code {
                background: ${styling.primaryColor};
                color: ${styling.backgroundColor};
                padding: 20px;
                border-radius: 8px;
            }

            /* Lists */
            .reveal ul, .reveal ol {
                color: ${styling.textColor};
            }

            .reveal li {
                margin: 10px 0;
            }

            /* Tables */
            .reveal table {
                border-collapse: collapse;
                width: 100%;
            }

            .reveal th {
                background: ${styling.primaryColor};
                color: ${styling.backgroundColor};
                padding: 15px;
            }

            .reveal td {
                border: 1px solid ${styling.secondaryColor};
                padding: 12px;
            }

            /* Blockquotes */
            .reveal blockquote {
                border-left: 5px solid ${styling.accentColor};
                padding-left: 20px;
                font-style: italic;
            }
        `;

        document.head.appendChild(styleEl);
    }

    /**
     * Inject logo into presentation
     */
    injectLogo(logoConfig) {
        // Remove existing logo
        const existingLogo = document.getElementById('presentation-logo');
        if (existingLogo) {
            existingLogo.remove();
        }

        const logoEl = document.createElement('div');
        logoEl.id = 'presentation-logo';
        logoEl.style.position = 'fixed';
        logoEl.style.zIndex = '100';
        logoEl.style.width = logoConfig.width;
        logoEl.style.height = logoConfig.height;

        // Position
        const positions = {
            'top-left': { top: '20px', left: '20px' },
            'top-right': { top: '20px', right: '20px' },
            'bottom-left': { bottom: '20px', left: '20px' },
            'bottom-right': { bottom: '20px', right: '20px' }
        };

        const pos = positions[logoConfig.position] || positions['top-right'];
        Object.assign(logoEl.style, pos);

        logoEl.innerHTML = `<img src="${logoConfig.url}" style="width:100%;height:100%;object-fit:contain;" alt="Logo">`;

        document.querySelector('.reveal').appendChild(logoEl);
    }

    /**
     * Inject footer into presentation
     */
    injectFooter(footerConfig) {
        // Remove existing footer
        const existingFooter = document.getElementById('presentation-footer');
        if (existingFooter) {
            existingFooter.remove();
        }

        const footerEl = document.createElement('div');
        footerEl.id = 'presentation-footer';
        footerEl.style.position = 'fixed';
        footerEl.style.zIndex = '100';
        footerEl.style.fontSize = footerConfig.fontSize;
        footerEl.style.color = '#999';

        // Position
        const positions = {
            'bottom-left': { bottom: '10px', left: '20px' },
            'bottom-center': { bottom: '10px', left: '50%', transform: 'translateX(-50%)' },
            'bottom-right': { bottom: '10px', right: '20px' }
        };

        const pos = positions[footerConfig.position] || positions['bottom-right'];
        Object.assign(footerEl.style, pos);

        footerEl.textContent = footerConfig.text;

        document.querySelector('.reveal').appendChild(footerEl);
    }

    /**
     * Generate CSS from template
     */
    generateCSS(template) {
        // Returns CSS string for export
        return `/* Template: ${template.name} */`;
    }

    /**
     * Export template as JSON
     */
    exportTemplate(templateName) {
        const template = this.getTemplate(templateName);
        const json = JSON.stringify(template, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${templateName}-template.json`;
        link.click();
        URL.revokeObjectURL(url);
    }

    /**
     * Import template from JSON
     */
    importTemplate(jsonString, name) {
        try {
            const template = JSON.parse(jsonString);
            this.saveCustomTemplate(name, template);
            return true;
        } catch (e) {
            console.error('Failed to import template:', e);
            return false;
        }
    }
}
