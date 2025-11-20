# 🐛 DEBUG GUIDE - MDNotes Pro

## ⚠️ Problema Riportato: Modale non chiudibile all'avvio

**Sintomi:**
- Modale appare all'avvio
- Testo mostra: `${title}`, `✕`, `${message}`, `Cancel`
- La modale non si può chiudere

## ✅ Fix Applicati

### 1. **Validazione Parametri** (app.js:532-536)
Ora `showConfirmDialog()` verifica che title e message siano definiti:
```javascript
if (!title || !message) {
    console.error('showConfirmDialog called with invalid parameters');
    return; // Non mostra la modale
}
```

### 2. **Error Handler Globale** (app.js:867-884)
L'inizializzazione è ora wrappata in try-catch:
- Se c'è un errore, viene mostrato messaggio chiaro
- Stack trace completo in console
- Pulsante "Reload Page" per recuperare

### 3. **Logging Dettagliato**
Tutti gli errori vengono loggati in console per debugging

---

## 🔍 Come Debuggare

### **Passo 1: Apri Browser DevTools**
```
Chrome/Edge: F12 o Ctrl+Shift+I
Firefox: F12 o Ctrl+Shift+K
Safari: Cmd+Option+I (abilita Developer menu prima)
```

### **Passo 2: Apri la Console**
Clicca sul tab "Console" negli strumenti di sviluppo

### **Passo 3: Apri MDNotes Pro**
```bash
open dist/index.html
```

### **Passo 4: Leggi i Messaggi di Console**

#### ✅ **Messaggi Normali (tutto OK)**
```
Initializing MDNotes Pro...
BlocksDatabase initialized successfully
MDNotes Pro initialized successfully!
```

#### ❌ **Errori di Inizializzazione**
```
Failed to initialize MDNotes Pro: Error: ...
Stack trace: ...
```

#### ⚠️ **Chiamate Invalide a showConfirmDialog**
```
showConfirmDialog called with invalid parameters: {title: undefined, message: undefined}
```

---

## 🎯 Scenari Possibili

### **Scenario A: La modale ${title} ${message} appare ancora**

**Causa:** Qualcosa chiama `showConfirmDialog()` con parametri undefined

**Debug:**
1. Apri console (F12)
2. Dovresti vedere: `showConfirmDialog called with invalid parameters`
3. Lo stack trace ti dirà CHI ha chiamato la funzione
4. Copia tutto il messaggio di errore e inviamelo

**Workaround:** La modale NON dovrebbe più apparire grazie al check

---

### **Scenario B: Schermata rossa di errore**

**Aspetto:**
```
⚠️ Initialization Error
MDNotes Pro failed to start. Please check the browser console (F12) for details.
[messaggio errore specifico]
[Reload Page]
```

**Cosa Fare:**
1. ✅ **Questo è NORMALE** se c'è un errore all'avvio
2. Leggi il messaggio di errore
3. Apri console (F12) per dettagli completi
4. Cerca errori in ROSSO
5. Copia il messaggio di errore completo
6. Copia lo stack trace

**Errori Comuni:**
- **"Dexie is not defined"** → Dexie non si è caricato (problema rete o CDN)
- **"Cannot read property of null"** → Elemento DOM mancante
- **"Module not found"** → Build incompleto
- **"Permission denied"** → Browser blocca localStorage/IndexedDB

---

### **Scenario C: Schermata bianca, nessun errore**

**Debug:**
1. Apri console (F12)
2. Cerca warnings (gialli) o errors (rossi)
3. Controlla tab "Network" per vedere se tutti i file si caricano
4. Cerca eventuali 404 errors (file non trovati)

**Possibili Cause:**
- CDN esterni bloccati (firewall, adblock)
- File dist/index.html corrotto
- Browser troppo vecchio

**Verifica:**
```javascript
// In console, digita:
typeof Dexie
// Dovrebbe rispondere: "function"

typeof window.app
// Dovrebbe rispondere: "object" (dopo caricamento)

typeof window.db
// Dovrebbe rispondere: "object" o "undefined" (se non usato)
```

---

### **Scenario D: App funziona ma modale appare dopo azione**

**Quando:** Modale appare quando clicchi "Delete File" o "Delete Folder"

**Questo è NORMALE** - la modale serve per confermare l'azione.

**Se mostra ${title}:** Bug nelle chiamate da file-system-advanced.js
- Apri console e cerca il messaggio di validazione
- Inviami lo stack trace

---

## 📋 Informazioni da Fornire per Debug

Se il problema persiste, inviami:

### 1. **Screenshot**
- Dello schermo con l'errore
- Della console (F12) con errori visibili

### 2. **Messaggi Console**
Copia TUTTO il testo dalla console, inclusi:
```
- Messaggi rossi (errors)
- Messaggi gialli (warnings)
- Stack traces (righe che iniziano con "at ...")
```

### 3. **Browser Info**
```
Nome: Chrome/Firefox/Safari/Edge
Versione: (vai su chrome://version o about)
OS: Windows/macOS/Linux
```

### 4. **Passi per Riprodurre**
1. Cosa hai fatto
2. Cosa ti aspettavi
3. Cosa è successo invece

### 5. **Tab Network (Opzionale)**
Se la schermata è bianca:
1. Apri DevTools → Tab "Network"
2. Ricarica pagina (F5)
3. Screenshot della lista di file caricati
4. Cerchia eventuali file in rosso (failed)

---

## 🔧 Test Diagnostici

### **Test 1: Verifica Build**
```bash
cd /home/user/mdnotes
ls -lh dist/index.html
```
**Aspettato:** File ~278 KB, modificato di recente

### **Test 2: Verifica Contenuto**
```bash
grep -c "showConfirmDialog" dist/index.html
```
**Aspettato:** Dovrebbe trovare alcune occorrenze (3-5)

### **Test 3: Verifica Validazione**
```bash
grep -A 2 "Validate parameters" dist/index.html
```
**Aspettato:**
```javascript
// Validate parameters
if (!title || !message) {
    console.error('showConfirmDialog called with invalid parameters:', { title, message });
```

### **Test 4: Verifica Error Handler**
```bash
grep -c "Failed to initialize MDNotes Pro" dist/index.html
```
**Aspettato:** Dovrebbe trovare 1 occorrenza

---

## 🎓 Advanced Debugging

### **Breakpoints**

1. Apri DevTools → Tab "Sources"
2. Cerca in Page → dist/index.html
3. Trova `showConfirmDialog` (Ctrl+F)
4. Clicca sul numero di riga per aggiungere breakpoint
5. Ricarica pagina
6. Se la modale appare, il debugger si ferma
7. Guarda la Call Stack a destra per vedere CHI ha chiamato la funzione

### **Monitor Calls**

In console, digita:
```javascript
// Monitora tutte le chiamate a showConfirmDialog
const original = window.app.showConfirmDialog;
window.app.showConfirmDialog = function(...args) {
    console.log('showConfirmDialog called with:', args);
    console.trace();
    return original.apply(this, args);
};
```

Poi ricarica e vedi se viene chiamata.

---

## ✅ Verifica Fix Funzionante

Se tutto funziona correttamente, dovresti vedere in console:

```
✅ Initializing MDNotes Pro...
✅ BlocksDatabase initialized successfully
✅ MDNotes Pro initialized successfully!
```

E NON dovresti vedere:
- ❌ Modale con ${title} ${message}
- ❌ Schermata rossa di errore
- ❌ Errori in console

---

## 🚑 Recovery Quick Fixes

### **Fix 1: Clear Browser Data**
```
Chrome: Ctrl+Shift+Delete
→ Cached images and files
→ Last hour
→ Clear data
```

### **Fix 2: Disable Extensions**
```
Chrome: Incognito mode (Ctrl+Shift+N)
Prova ad aprire MDNotes Pro in incognito
```

### **Fix 3: Hard Refresh**
```
Ctrl+Shift+R (Windows/Linux)
Cmd+Shift+R (macOS)
```

### **Fix 4: Rebuild**
```bash
cd /home/user/mdnotes
npm run build
```

### **Fix 5: Check File Integrity**
```bash
# Verifica che il file non sia corrotto
file dist/index.html
# Dovrebbe dire: HTML document, UTF-8 Unicode text

# Verifica dimensione
du -h dist/index.html
# Dovrebbe essere ~278K
```

---

## 📞 Support

Se nessuna di queste soluzioni funziona:

1. **Raccogli tutte le info** dalla sezione "Informazioni da Fornire"
2. **Inviamele** con screenshot della console
3. **Descrivi esattamente** cosa succede step-by-step

Ti aiuterò a risolvere il problema specifico!

---

**Last Updated:** 2025-11-19
**Version:** 2.1.0
**Build:** 278.04 KB
**Commit:** b28c41f
