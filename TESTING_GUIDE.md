# 🧪 Testing Guide - Block Editor Integration

## ✅ Completed Implementation

The Notion-style block editor has been fully integrated into MDNotes Pro v2.1.0 with the following features:

### 1. **Mode Toggle System**
- ✅ Toggle button in toolbar (shows "Markdown" or "Blocks")
- ✅ Seamless switching between modes
- ✅ Auto-migration of content
- ✅ Visual indicator of active mode

### 2. **Block Editor Features**
- ✅ 10 block types (text, h1, h2, h3, todo, bullet, numbered, quote, code, toggle)
- ✅ Keyboard shortcuts (Enter, Backspace, Tab, Shift+Tab, ArrowUp, Escape)
- ✅ Slash commands menu (type `/` to open)
- ✅ ContentEditable blocks
- ✅ Drag handles (⋮⋮)
- ✅ Auto-save to IndexedDB
- ✅ Hierarchical structure (indent/outdent)

### 3. **Database System**
- ✅ IndexedDB with Dexie.js
- ✅ Pages and blocks tables
- ✅ Deferred initialization with error handling
- ✅ Markdown ↔ Blocks conversion

---

## 🚀 How to Test

### **Step 1: Open the Application**

```bash
# Open dist/index.html in your browser
open dist/index.html

# Or use Python HTTP server
cd dist
python3 -m http.server 8000
# Then navigate to http://localhost:8000
```

### **Step 2: Basic Mode Switching**

1. **Start in Markdown Mode** (default)
   - You should see the CodeMirror editor
   - Markdown toolbar is visible
   - Type some markdown:
     ```markdown
     # Welcome to MDNotes Pro

     This is a **test** document.

     ## Features
     - Feature 1
     - Feature 2

     > Quote example
     ```

2. **Switch to Blocks Mode**
   - Click the "Markdown" button in toolbar
   - Label should change to "Blocks"
   - CodeMirror should hide
   - Block editor should appear
   - Your markdown should be converted to blocks automatically

3. **Verify Block Conversion**
   - Heading 1: "Welcome to MDNotes Pro"
   - Text block: "This is a test document."
   - Heading 2: "Features"
   - Two bullet blocks
   - One quote block

### **Step 3: Test Block Editor Features**

#### **A. Slash Commands**
1. Create a new block (press Enter on any block)
2. Type `/`
3. Verify slash menu appears with 10 block types
4. Click "Heading 1" or press Enter
5. Verify block type changes

#### **B. Keyboard Shortcuts**
- **Enter**: Create new block below
- **Backspace** (at start): Delete block and merge with previous
- **Tab**: Indent block (make child of previous)
- **Shift+Tab**: Outdent block (move to parent level)
- **ArrowUp** (at start): Focus previous block
- **Escape**: Close slash menu

#### **C. Block Types**
Test each block type:
1. Type `/text` → Plain text
2. Type `/h1` → Large heading
3. Type `/h2` → Medium heading
4. Type `/h3` → Small heading
5. Type `/todo` → Checkbox (☐)
6. Type `/bullet` → Bullet point (•)
7. Type `/numbered` → Numbered list (1.)
8. Type `/quote` → Quote block (❝)
9. Type `/code` → Code block
10. Type `/toggle` → Collapsible toggle (▶)

### **Step 4: Test Conversion Back to Markdown**

1. **Switch back to Markdown Mode**
   - Click the "Blocks" button in toolbar
   - Label should change to "Markdown"
   - Block editor should hide
   - CodeMirror should show
   - Blocks should be converted to markdown

2. **Verify Markdown Export**
   - Check that all blocks are correctly converted
   - Headings use `#`, `##`, `###`
   - Bullets use `- `
   - Todos use `- [ ]`
   - Quotes use `> `

### **Step 5: Test Database Persistence**

1. **Create content in Blocks mode**
   - Switch to Blocks mode
   - Create several blocks with different types
   - Add some indented blocks (Tab)

2. **Refresh the browser**
   - Reload the page
   - Switch back to Blocks mode
   - Verify all blocks are still there

3. **Check Database in DevTools**
   ```javascript
   // Open browser DevTools Console

   // Check Dexie is loaded
   console.log('Dexie:', typeof Dexie);
   // Should output: "function"

   // Check db is initialized
   console.log('DB:', window.db);
   // Should output: BlocksDatabase instance

   // Check Block and BlockEditor classes
   console.log('Block:', typeof window.Block);
   console.log('BlockEditor:', typeof window.BlockEditor);
   // Both should output: "function"

   // Get all pages
   const pages = await db.getAllPages();
   console.log('Pages:', pages);

   // Get blocks for first page
   if (pages.length > 0) {
       const blocks = await db.getPageBlocks(pages[0].id);
       console.log('Blocks:', blocks);
   }
   ```

### **Step 6: Test File Switching**

1. **Create multiple files**
   - Create File 1 with markdown content
   - Create File 2 with different content

2. **Switch to Blocks mode on File 1**
   - Add some blocks
   - Note the content

3. **Switch to File 2**
   - Switch to Blocks mode
   - Add different blocks

4. **Switch back to File 1**
   - Verify File 1's blocks are preserved
   - Each file should have its own block page

---

## 🐛 Common Issues & Solutions

### **Issue 1: "Dexie is not defined"**
**Cause:** Dexie.js CDN failed to load

**Solution:**
- Check internet connection
- Check browser console for CDN errors
- Try rebuilding: `npm run build`
- Verify Dexie CDN link in template.html

### **Issue 2: "Block editor doesn't appear"**
**Cause:** Toggle not working or CSS issue

**Debug:**
```javascript
// Check if container exists
const container = document.getElementById('blockEditorContainer');
console.log('Container:', container);
console.log('Hidden:', container.classList.contains('hidden'));

// Check editor mode
console.log('Mode:', app.editorMode);
```

**Solution:**
- Check browser console for errors
- Verify blockEditorContainer in HTML
- Check CSS for .hidden class

### **Issue 3: "Blocks not saving"**
**Cause:** Database initialization failed

**Debug:**
```javascript
// Check database
console.log('DB exists:', await Dexie.exists('MDNotesBlocks'));

// Check tables
const pages = await db.pages.count();
const blocks = await db.blocks.count();
console.log(`Pages: ${pages}, Blocks: ${blocks}`);
```

**Solution:**
- Clear IndexedDB and reload
- Check browser permissions for IndexedDB
- Try incognito mode to rule out extensions

### **Issue 4: "Slash menu not appearing"**
**Cause:** JavaScript error or focus issue

**Debug:**
```javascript
// Check if Block class is available
console.log('Block class:', window.Block);

// Check if block is focused
const focused = document.activeElement;
console.log('Focused element:', focused);
```

**Solution:**
- Click on a block to focus it
- Type `/` slowly
- Check console for JavaScript errors

### **Issue 5: "Markdown conversion incorrect"**
**Cause:** Parsing issue in markdownToBlocks

**Debug:**
```javascript
// Test conversion manually
const testMarkdown = `# Test\n- Item 1\n- Item 2`;
const pageId = await db.createPage('Test Conversion');
await db.markdownToBlocks(pageId, testMarkdown);
const blocks = await db.getPageBlocks(pageId);
console.log('Converted blocks:', blocks);
```

**Solution:**
- Check markdown syntax is correct
- Ensure empty lines between blocks
- Check blocks-db.js for parsing rules

---

## 📊 Performance Testing

### **Test with Large Documents**

```javascript
// Create 100 blocks for stress test
const pageId = await db.createPage('Stress Test');
for (let i = 0; i < 100; i++) {
    await db.createBlock(pageId, 'text', `Block ${i}`);
}

// Measure render time
console.time('Render 100 blocks');
const editor = new BlockEditor(document.body);
await editor.init(pageId);
console.timeEnd('Render 100 blocks');
```

**Expected Performance:**
- 10 blocks: < 50ms
- 100 blocks: < 500ms
- 1000 blocks: < 5s (may feel slow, virtual scrolling recommended)

---

## ✅ Test Checklist

Use this checklist to verify all features:

- [ ] App loads without errors
- [ ] Dexie.js loads successfully
- [ ] db, Block, BlockEditor are globally available
- [ ] Toggle button appears in toolbar
- [ ] Clicking toggle switches modes
- [ ] Label changes between "Markdown" and "Blocks"
- [ ] Markdown editor hides in Blocks mode
- [ ] Block editor shows in Blocks mode
- [ ] Markdown toolbar hides in Blocks mode
- [ ] Markdown content converts to blocks
- [ ] Blocks convert back to markdown
- [ ] Slash menu opens with `/`
- [ ] All 10 block types work
- [ ] Enter creates new block
- [ ] Backspace deletes block
- [ ] Tab indents block
- [ ] Shift+Tab outdents block
- [ ] ArrowUp focuses previous block
- [ ] Escape closes slash menu
- [ ] Blocks save to IndexedDB
- [ ] Blocks persist after refresh
- [ ] File switching preserves blocks
- [ ] No console errors
- [ ] No popup blocking issues

---

## 📸 Visual Tests

### **Expected UI:**

1. **Toolbar with Toggle Button**
   ```
   [Files] | [Editor] [Preview] [Mindmap] | [Markdown ↔ Blocks] | [Save] [Export] ...
   ```

2. **Block Editor (Blocks Mode)**
   ```
   ┌─────────────────────────────────────────┐
   │ Page Title                              │
   ├─────────────────────────────────────────┤
   │ ⋮⋮ # Heading 1                          │
   │ ⋮⋮ This is text                         │
   │ ⋮⋮ • Bullet point                       │
   │ ⋮⋮   • Indented bullet                  │
   │ ⋮⋮ ☐ Todo item                          │
   └─────────────────────────────────────────┘
   ```

3. **Slash Menu**
   ```
   ┌─────────────────────────────────┐
   │ 📝 Text - Plain text             │
   │ H1 Heading 1 - Large heading     │
   │ H2 Heading 2 - Medium heading    │
   │ H3 Heading 3 - Small heading     │
   │ ☐ To-do list - Track tasks       │
   │ • Bulleted list - Simple list    │
   │ 1. Numbered list - Ordered list  │
   │ ❝ Quote - Quotation block        │
   │ { } Code - Code snippet          │
   │ ▶ Toggle list - Collapsible      │
   └─────────────────────────────────┘
   ```

---

## 🎯 Next Steps After Testing

1. **Report Issues**
   - Document any bugs found
   - Note performance issues
   - Suggest UX improvements

2. **Feature Enhancements** (if needed)
   - [ ] Drag & drop block reordering
   - [ ] Multi-select blocks
   - [ ] Rich text formatting (bold, italic, link)
   - [ ] Image blocks
   - [ ] Embed blocks
   - [ ] Block templates
   - [ ] Export blocks to PDF
   - [ ] Sync across devices

3. **Documentation**
   - Update README.md with block editor features
   - Add screenshots/GIFs
   - Create video tutorial

---

## 📝 Test Report Template

```markdown
# Block Editor Test Report

**Date:** [DATE]
**Browser:** [Chrome/Firefox/Safari] [VERSION]
**OS:** [Windows/macOS/Linux]

## Test Results

### ✅ Passing Tests
- [List features that work correctly]

### ❌ Failing Tests
- [List features that don't work]
- Include error messages and screenshots

### ⚠️ Issues Found
- [List bugs or unexpected behavior]

### 💡 Suggestions
- [List UX improvements or feature requests]

## Performance
- Load time: [TIME]
- 100 blocks render time: [TIME]
- Browser memory usage: [MB]

## Overall Rating
[1-5 stars] ⭐⭐⭐⭐⭐
```

---

**MDNotes Pro v2.1.0** - Block Editor Integration Complete ✅
**Build:** 276.18 KB
**Status:** Ready for Testing

For detailed implementation documentation, see `BLOCK_EDITOR_GUIDE.md`
