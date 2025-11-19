# 📦 Block Editor Guide - Notion Clone Implementation

## 🎯 Overview

MDNotes Pro ora include un **sistema di editor a blocchi** completo stile Notion, implementato in **Vanilla JavaScript** che convive con l'editor Markdown esistente.

### Architettura

```
┌─────────────────────────────────────────┐
│          MDNotes Pro v2.1.0             │
├─────────────────────────────────────────┤
│                                         │
│  ┌───────────────┐  ┌────────────────┐ │
│  │   Markdown    │  │  Block Editor  │ │
│  │    Editor     │  │  (NEW - Notion)│ │
│  │  (Existing)   │  │                │ │
│  └───────────────┘  └────────────────┘ │
│         │                    │          │
│         ▼                    ▼          │
│  localStorage          IndexedDB        │
│  (markdown text)       (blocks data)    │
└─────────────────────────────────────────┘
```

---

## 📁 Struttura File Creati

### **Database & Core**
```
src/js/modules/
├── blocks-db.js          # IndexedDB con Dexie.js
├── block.js              # Componente singolo blocco
└── block-editor.js       # Gestore collezione blocchi
```

### **Stili**
```
src/css/
└── blocks.css            # Stili Notion-style
```

### **Dipendenze Esterne**
- **Dexie.js** v3.0+ (caricato da CDN)
  - URL: `https://cdn.jsdelivr.net/npm/dexie@3/dist/dexie.min.js`
  - Già aggiunto in `template.html`

---

## 🗄️ Database Schema (IndexedDB)

### **Table: pages**
```javascript
{
  id: number (auto-increment),
  title: string,
  icon: string (emoji),
  coverImage: string | null,
  createdAt: number (timestamp),
  updatedAt: number (timestamp),
  isFavorite: boolean,
  parentId: number | null
}
```

### **Table: blocks**
```javascript
{
  id: number (auto-increment),
  pageId: number,
  type: string ('text' | 'h1' | 'h2' | 'h3' | 'todo' | 'bullet' | 'numbered' | 'quote' | 'code' | 'toggle'),
  content: string,
  properties: object,
  parentId: number | null,
  childIds: array<number>,
  position: number,
  createdAt: number,
  updatedAt: number
}
```

---

## 🎨 Tipi di Blocchi Supportati

| Tipo | Descrizione | Prefisso | Shortcut |
|------|-------------|----------|----------|
| `text` | Testo normale | - | `/text` |
| `h1` | Heading 1 | `#` | `/h1` |
| `h2` | Heading 2 | `##` | `/h2` |
| `h3` | Heading 3 | `###` | `/h3` |
| `todo` | To-do list | `☐` | `/todo` |
| `bullet` | Lista puntata | `•` | `/bullet` |
| `numbered` | Lista numerata | `1.` | `/numbered` |
| `quote` | Citazione | `❝` | `/quote` |
| `code` | Codice | - | `/code` |
| `toggle` | Toggle/Collapsible | `▶` | `/toggle` |

---

## ⌨️ Keyboard Shortcuts

### **Navigazione**
- `Enter` → Crea nuovo blocco sotto
- `Backspace` (all'inizio) → Elimina blocco e unisci con quello sopra
- `ArrowUp` (all'inizio) → Focus blocco precedente
- `Tab` → Indenta blocco (lo rende figlio del precedente)
- `Shift + Tab` → Rimuovi indentazione (torna al livello parent)

### **Slash Commands**
- `/` → Apri menu comandi
- Digita `/h1`, `/todo`, etc. → Cambia tipo blocco
- `Escape` → Chiudi menu

### **Editing**
- `Shift + Enter` → Vai a capo senza creare nuovo blocco
- Standard copy/paste → Supportato (solo testo)

---

## 🔧 API Usage

### **Inizializzare Database**
```javascript
// Database è globale, si auto-inizializza
// Accessibile come: window.db

// Creare una nuova pagina
const pageId = await db.createPage('My First Page');

// Creare un blocco
const blockId = await db.createBlock(pageId, 'text', 'Hello World');
```

### **Usare Block Editor**
```javascript
// Nel tuo codice app.js
const container = document.getElementById('editorPanel');
const editor = new BlockEditor(container);

// Inizializza con una pagina
await editor.init(pageId);

// Callbacks
editor.onPageUpdate = (updates) => {
    console.log('Page updated:', updates);
};

editor.onBlockUpdate = (blockId, updates) => {
    console.log('Block updated:', blockId, updates);
};
```

### **Conversione Markdown ↔ Blocks**
```javascript
// Markdown → Blocks
const markdown = `# Hello\nThis is **markdown**`;
await db.markdownToBlocks(pageId, markdown);

// Blocks → Markdown
const markdown = await db.blocksToMarkdown(pageId);
console.log(markdown);
```

---

## 🚀 Integrazione con App Esistente

### **Opzione 1: Modalità Ibrida** (Consigliata per transizione)
Mantieni entrambi gli editor e permetti all'utente di scegliere:

```javascript
// In app.js, aggiungi toggle
toggleEditorMode() {
    if (this.editorMode === 'markdown') {
        // Passa a block editor
        this.editorMode = 'blocks';
        this.showBlockEditor();
    } else {
        // Torna a markdown
        this.editorMode = 'markdown';
        this.showMarkdownEditor();
    }
}

showBlockEditor() {
    // Nascondi CodeMirror
    this.editor.container.style.display = 'none';

    // Mostra block editor
    if (!this.blockEditor) {
        this.blockEditor = new BlockEditor(this.editorContainer);
    }

    // Converti markdown corrente in blocchi
    const markdown = this.editor.getValue();
    const pageId = await db.createPage(this.fileManager.currentFile);
    await db.markdownToBlocks(pageId, markdown);
    await this.blockEditor.init(pageId);
}
```

### **Opzione 2: Solo Block Editor** (Full Notion Clone)
Sostituisci completamente l'editor markdown:

```javascript
// In app.js, modifica init()
async init() {
    // ... existing code ...

    // Sostituisci editor con block editor
    this.blockEditor = new BlockEditor(
        document.getElementById('editorPanel')
    );

    // Crea pagina iniziale se non esiste
    const pages = await db.getAllPages();
    if (pages.length === 0) {
        const pageId = await db.createPage('Welcome');
        await this.blockEditor.init(pageId);
    } else {
        await this.blockEditor.init(pages[0].id);
    }
}
```

---

## 🎨 Personalizzazione Stili

### **Modificare Colori Blocchi**
In `src/css/blocks.css`:

```css
/* Cambia colore heading */
.block-type-h1 {
    color: #your-color;
    font-size: 36px; /* Personalizza dimensione */
}

/* Cambia stile quote */
.block-type-quote {
    border-left-color: #your-accent-color;
    background: rgba(your-color, 0.1);
}
```

### **Modificare Slash Menu**
In `src/js/modules/block.js`, metodo `openSlashMenu()`:

```javascript
// Aggiungi nuovi tipi di blocco
<div class="slash-menu-item" data-type="callout">
    <span class="slash-menu-icon">💡</span>
    <div>
        <div class="slash-menu-title">Callout</div>
        <div class="slash-menu-desc">Highlight box</div>
    </div>
</div>
```

---

## 📊 Migration Path

### **Da Markdown Files a Block Pages**

```javascript
// Script di migrazione
async function migrateMarkdownToBlocks() {
    const files = fileManager.getAllFiles();

    for (const [filename, fileData] of Object.entries(files)) {
        // Crea pagina
        const pageId = await db.createPage(filename.replace('.md', ''));

        // Converti markdown in blocchi
        await db.markdownToBlocks(pageId, fileData.content);

        console.log(`Migrated: ${filename} → Page ${pageId}`);
    }

    console.log('Migration complete!');
}

// Esegui migrazione
await migrateMarkdownToBlocks();
```

### **Esportazione da Blocks a Markdown**

```javascript
// Per retrocompatibilità
async function exportPageToMarkdown(pageId) {
    const markdown = await db.blocksToMarkdown(pageId);
    const page = await db.getPage(pageId);

    // Salva come file markdown
    fileManager.createFile(page.title + '.md', markdown);
}
```

---

## 🧪 Testing

### **Test Manuale**
1. Apri `dist/index.html` nel browser
2. Apri DevTools Console
3. Esegui:

```javascript
// Test creazione pagina
const pageId = await db.createPage('Test Page');
console.log('Page created:', pageId);

// Test creazione blocco
const blockId = await db.createBlock(pageId, 'h1', 'Hello World');
console.log('Block created:', blockId);

// Visualizza tutti i blocchi
const blocks = await db.getPageBlocks(pageId);
console.log('Blocks:', blocks);

// Test inizializzazione editor
const container = document.createElement('div');
document.body.appendChild(container);
const editor = new BlockEditor(container);
await editor.init(pageId);
```

### **Test Conversione Markdown**

```javascript
const testMarkdown = `# Title
This is a paragraph.

## Heading 2
- Item 1
- Item 2

> Quote here
`;

const pageId = await db.createPage('Markdown Test');
await db.markdownToBlocks(pageId, testMarkdown);

// Verifica conversione
const blocks = await db.getAllPageBlocks(pageId);
console.log('Converted blocks:', blocks);
```

---

## 🐛 Troubleshooting

### **Dexie non caricato**
**Errore:** `Dexie is not defined`

**Soluzione:**
- Verifica che `template.html` abbia il CDN di Dexie
- Controlla DevTools Network per errori di caricamento
- Prova a caricare manualmente:
  ```html
  <script src="https://cdn.jsdelivr.net/npm/dexie@3/dist/dexie.min.js"></script>
  ```

### **Blocchi non salvano**
**Problema:** Le modifiche ai blocchi non persistono

**Debug:**
```javascript
// Verifica database
const dbExists = await Dexie.exists('MDNotesBlocks');
console.log('DB exists:', dbExists);

// Controlla tabelle
const pages = await db.pages.toArray();
const blocks = await db.blocks.toArray();
console.log('Pages:', pages.length);
console.log('Blocks:', blocks.length);
```

### **Slash menu non appare**
**Problema:** Digitando `/` non appare il menu

**Fix:**
- Verifica che il focus sia sul blocco
- Controlla console per errori JavaScript
- Assicurati che `blocks.css` sia compilato nel build

---

## 📈 Performance Considerations

### **Ottimizzazioni Implementate**
1. **Lazy Loading**: Blocchi caricati on-demand
2. **IndexedDB**: Molto più veloce di localStorage per grandi quantità di dati
3. **Batched Updates**: Aggiornamenti multipli raggruppati
4. **Virtual Scrolling**: Da implementare per pagine con 1000+ blocchi

### **Limits**
- **Max blocchi per pagina**: ~10,000 (raccomandata < 1,000 per UX ottimale)
- **IndexedDB quota**: ~50-100MB (browser dependent)
- **Contenuto blocco**: ~5MB per blocco (teorico, raccomandato < 10KB)

---

## 🔮 Future Enhancements

### **Priorità Alta**
- [ ] Drag & drop per riordinare blocchi
- [ ] Selezione multipla blocchi
- [ ] Rich text formatting inline (bold, italic, link)
- [ ] Blocco immagine con upload
- [ ] Blocco embed (video, iframe)

### **Priorità Media**
- [ ] Collaborazione real-time (con WebRTC)
- [ ] Versioning e cronologia modifiche
- [ ] Templates di pagina
- [ ] Database properties (Notion-style)
- [ ] Views (Table, Board, Calendar)

### **Priorità Bassa**
- [ ] Export to PDF con blocchi
- [ ] Sync cloud (Firebase/Supabase)
- [ ] Mobile app wrapper
- [ ] Offline-first PWA

---

## 📚 Additional Resources

- **Dexie.js Docs**: https://dexie.org/
- **IndexedDB Guide**: https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API
- **ContentEditable Best Practices**: https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/contenteditable
- **Notion API (reference)**: https://developers.notion.com/

---

## 🎓 Learning Path

### **Per Utenti**
1. Apri l'app e crea una nuova pagina
2. Digita `/` per vedere i comandi disponibili
3. Prova a creare diversi tipi di blocchi
4. Usa `Tab` e `Shift+Tab` per indentare
5. Esplora l'esportazione in Markdown

### **Per Sviluppatori**
1. Studia `blocks-db.js` per capire lo schema dati
2. Analizza `block.js` per vedere come funziona un blocco
3. Esamina `block-editor.js` per la gestione collezione
4. Sperimenta con nuovi tipi di blocchi custom
5. Contribuisci con PR per nuove funzionalità!

---

**MDNotes Pro** - Now with Notion-style Block Editor! 🎉
**Version**: 2.1.0 (Block Editor Beta)
**Build**: 270.92 KB
**Status**: Functional, Ready for Integration ✅
