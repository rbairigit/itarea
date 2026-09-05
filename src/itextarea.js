import { createTransliterator } from './itransliterator.js';

let pageConfig;
let pageTarget;
let pageFont;
const MIN_FONT_SIZE = 14;
const MAX_FONT_SIZE = 48;
const HISTORY_LIMIT = 100;
const WIDGET_VERSION = '1.0.9';
const WIDGET_UPDATED = 'September 5, 2026';
let pageFontSize = '22px';
const settingsIcon = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19.43 12.98c.04-.32.07-.65.07-.98s-.02-.66-.07-.98l2.11-1.65a.5.5 0 0 0 .12-.64l-2-3.46a.5.5 0 0 0-.61-.22l-2.49 1a7.36 7.36 0 0 0-1.69-.98L14.5 2.42A.49.49 0 0 0 14 2h-4a.49.49 0 0 0-.49.42l-.38 2.65c-.61.25-1.18.59-1.69.98l-2.49-1a.49.49 0 0 0-.61.22l-2 3.46a.5.5 0 0 0 .12.64l2.11 1.65c-.04.32-.08.65-.08.98s.03.66.08.98l-2.11 1.65a.5.5 0 0 0-.12.64l2 3.46c.12.22.38.31.61.22l2.49-1c.51.4 1.08.73 1.69.98l.38 2.65c.04.24.24.42.49.42h4c.25 0 .46-.18.49-.42l.38-2.65c.61-.25 1.18-.58 1.69-.98l2.49 1c.23.09.49 0 .61-.22l2-3.46a.5.5 0 0 0-.12-.64l-2.11-1.65ZM12 15.5A3.5 3.5 0 1 1 12 8a3.5 3.5 0 0 1 0 7.5Z"/></svg>';
const copyIcon = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1Zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2Zm0 16H8V7h11v14Z"/></svg>';
const helpIcon = '<svg viewBox="0 -960 960 960" aria-hidden="true"><path d="M513.5-254.5Q528-269 528-290t-14.5-35.5Q499-340 478-340t-35.5 14.5Q428-311 428-290t14.5 35.5Q457-240 478-240t35.5-14.5ZM442-394h74q0-33 7.5-52t42.5-52q26-26 41-49.5t15-56.5q0-56-41-86t-97-30q-57 0-92.5 30T342-618l66 26q5-18 22.5-39t53.5-21q32 0 48 17.5t16 38.5q0 20-12 37.5T506-526q-44 39-54 59t-10 73Zm38 314q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z"/></svg>';
const collapseControlsIcon = '<svg viewBox="0 -960 960 960" aria-hidden="true"><path d="m136-80-56-56 264-264H160v-80h320v320h-80v-184L136-80Zm344-400v-320h80v184l264-264 56 56-264 264h184v80H480Z"/></svg>';
const expandControlsIcon = '<svg viewBox="0 -960 960 960" aria-hidden="true"><path d="M120-120v-320h80v184l504-504H520v-80h320v320h-80v-184L256-200h184v80H120Z"/></svg>';
function normalizeFontSize(size) {
  const value = Math.round(Number.parseFloat(size));
  return `${Math.min(MAX_FONT_SIZE, Math.max(MIN_FONT_SIZE, Number.isFinite(value) ? value : 22))}px`;
}
export function configureITranslator(config) {
  pageConfig = config;
  pageTarget = config.defaultTarget;
  pageFont = config.fonts?.default || 'system';
}
export function setITranslatorTarget(target) {
  if (!pageConfig?.targets[target]) throw new Error(`Unsupported target: ${target}`);
  pageTarget = target;
  document.querySelectorAll('i-translator-textarea').forEach(widget => {
    widget.setTarget(target);
  });
}

export function setITranslatorFont(font) {
  if (!pageConfig?.fonts?.options?.[font]) throw new Error(`Unsupported font: ${font}`);
  pageFont = font;
  document.querySelectorAll('i-translator-textarea').forEach(widget => {
    widget.setFont(font);
  });
}

export function setITranslatorFontSize(size) {
  pageFontSize = normalizeFontSize(size);
  document.querySelectorAll('i-translator-textarea').forEach(widget => {
    widget.setFontSize(size);
  });
}

function indicator(widget) { return widget.querySelector('[data-mode-indicator]'); }
function escapeHtml(value) { return String(value).replace(/[&<>'"]/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[character]); }

export class ITranslatorTextarea extends HTMLElement {
  connectedCallback() {
    if (!pageConfig) throw new Error('Call configureITranslator(config) before adding i-translator-textarea elements.');
    const label = this.getAttribute('label') || 'Text';
    const targets = Object.entries(pageConfig.targets)
      .filter(([id]) => id !== 'sanskrit-iast')
      .map(([id, target]) => `<option value="${id}">${target.label}</option>`).join('');
    const fonts = Object.entries(pageConfig.fonts?.options || { system: { label: 'System default' } })
      .map(([id, font]) => `<option value="${id}">${font.label}</option>`).join('');
    const mappingRows = Object.entries({ ...pageConfig.tokens, ...pageConfig.aliases, ...pageConfig.punctuation })
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([input, output]) => `<tr><td><code>${escapeHtml(input)}</code></td><td>${escapeHtml(output)}</td></tr>`).join('');
    this.innerHTML = `<section class="itarea"><div class="itarea__bar"><button type="button" data-mode="itrans" class="active">iTrans</button><button type="button" data-mode="roman">Roman (IAST)</button><button type="button" data-mode="english">English</button><button type="button" class="itarea__help-button" data-help title="Widget help" aria-label="Widget help">${helpIcon}</button><label class="itarea__font-size-control">Text size <input type="range" data-font-size-range min="${MIN_FONT_SIZE}" max="${MAX_FONT_SIZE}" value="22" aria-label="Text size"><input type="number" data-font-size-value min="${MIN_FONT_SIZE}" max="${MAX_FONT_SIZE}" value="22" aria-label="Text size in pixels"></label></div><div class="itarea__editor"><textarea spellcheck="false" aria-label="${label}" placeholder="Type Sanskrit with ITRANS"></textarea><div class="itarea__resize-handle" data-resize-handle title="Drag to resize text area" aria-label="Drag to resize text area" role="separator"></div><span class="itarea__mode-tab"><span data-mode-indicator></span><button type="button" class="itarea__tab-settings" data-settings title="Language settings" aria-label="Language settings">${settingsIcon}</button></span><div class="itarea__actions"><button type="button" class="itarea__icon" data-copy title="Copy text" aria-label="Copy text">${copyIcon}</button></div><div class="itarea__settings" hidden><label>Language <select data-target-select>${targets}</select></label><label>Font <select data-font-select>${fonts}</select></label><label class="itarea__auto-expand">Auto-expand <input type="checkbox" data-auto-expand checked></label><label class="itarea__global-settings">Apply lang, font, size globally <input type="checkbox" data-apply-globally></label></div><div class="itarea__help-overlay" data-help-dialog hidden><section class="itarea__help" role="dialog" aria-modal="true" aria-label="iTranslator Text Area help"><button type="button" class="itarea__help-close" data-help-close aria-label="Close help">×</button><h2>iTranslator Text Area</h2><ul><li><strong>iTrans:</strong> type ASCII ITRANS; use Ctrl+S or Ctrl+I.</li><li><strong>Roman:</strong> creates IAST; use Ctrl+R.</li><li><strong>English:</strong> leaves text unchanged; use Ctrl+E, Ctrl+O, or Escape.</li><li>Use the slider or number field to change text size. The settings tab changes language, font, and auto-expand.</li><li>Use the control below Copy to hide or show the controls above the text area.</li><li>Enable <strong>Apply lang, font, size globally</strong> to synchronize those choices across widgets.</li><li>Drag the bottom edge to set a manual height; this turns off auto-expand for that widget.</li></ul><h3>Current ITRANS mappings</h3><p>These mappings come from the active widget configuration. See <a href="https://en.wikipedia.org/wiki/ITRANS" target="_blank" rel="noopener noreferrer">ITRANS on Wikipedia</a> for background and conventions.</p><table class="itarea__mapping-table"><thead><tr><th>Input</th><th>Output</th></tr></thead><tbody>${mappingRows}</tbody></table></section></div></div></section>`;
    const controlBar = this.querySelector('.itarea__bar');
    const modeTab = this.querySelector('.itarea__mode-tab');
    const settingsPanel = this.querySelector('.itarea__settings');
    settingsPanel.insertAdjacentHTML('beforeend', `<div class="itarea__version">iTranslator ${WIDGET_VERSION}<br>Updated ${WIDGET_UPDATED}</div>`);
    const actions = this.querySelector('.itarea__actions');
    actions.insertAdjacentHTML('beforeend', `<button type="button" class="itarea__icon itarea__controls-toggle" data-controls-toggle title="Hide controls" aria-label="Hide controls">${collapseControlsIcon}</button>`);
    const controlsToggle = this.querySelector('[data-controls-toggle]');
    const setControlsVisible = visible => {
      controlBar.hidden = !visible;
      modeTab.hidden = !visible;
      settingsPanel.hidden = true;
      controlsToggle.innerHTML = visible ? collapseControlsIcon : expandControlsIcon;
      controlsToggle.title = visible ? 'Hide controls' : 'Show controls';
      controlsToggle.setAttribute('aria-label', controlsToggle.title);
    };
    controlsToggle.addEventListener('click', () => setControlsVisible(controlBar.hidden));
    setControlsVisible(false);
    this.mode = 'itrans';
    this.rawBuffer = '';
    this.bufferStart = null;
    this.autoExpand = true;
    this.target = pageTarget;
    this.font = pageFont;
    this.fontSize = pageFontSize;
    this.input = this.querySelector('textarea');
    if (this._initialValue !== undefined) {
      this.input.value = this._initialValue;
      delete this._initialValue;
    }
    this.history = [];
    this.redoHistory = [];
    this.historyBatchActive = false;
    this.historyTimer = null;
    this.querySelector('[data-target-select]').value = this.target;
    this.querySelector('[data-font-select]').value = this.font;
    this.updateFontSizeControls();
    this.applyFont();
    this.applyFontSize();
    this.setMode('itrans');
    controlBar.addEventListener('click', event => {
      const button = event.target.closest('button');
      if (button?.dataset.mode) this.setMode(button.dataset.mode);
    });
    const settingsButton = this.querySelector('[data-settings]');
    settingsButton.addEventListener('click', () => { settingsPanel.hidden = !settingsPanel.hidden; });
    this.closeSettingsWhenClickedOutside = event => {
      if (!settingsPanel.contains(event.target) && !settingsButton.contains(event.target)) settingsPanel.hidden = true;
    };
    this.closeSettingsOnEscape = event => {
      if (event.key === 'Escape' && !settingsPanel.hidden) {
        event.preventDefault(); event.stopPropagation(); settingsPanel.hidden = true;
      }
    };
    document.addEventListener('click', this.closeSettingsWhenClickedOutside);
    document.addEventListener('keydown', this.closeSettingsOnEscape, true);
    const helpDialog = this.querySelector('[data-help-dialog]');
    helpDialog.querySelector('h2').insertAdjacentHTML('afterend', '<p><strong>Shortcuts:</strong> Ctrl+S/Ctrl+I toggle iTrans and English; Ctrl+R toggles Roman and iTrans; Ctrl+O toggles English and iTrans; Ctrl+E and Escape select English. Ctrl+Z/Ctrl+U undo and Ctrl+Shift+Z/Ctrl+Shift+U redo.</p>');
    this.querySelector('[data-help]').addEventListener('click', () => { helpDialog.hidden = false; });
    this.querySelector('[data-help-close]').addEventListener('click', () => { helpDialog.hidden = true; });
    helpDialog.addEventListener('click', event => { if (event.target === helpDialog) helpDialog.hidden = true; });
    this.closeHelpOnEscape = event => {
      if (event.key === 'Escape' && !helpDialog.hidden) {
        event.preventDefault(); event.stopPropagation(); helpDialog.hidden = true;
      }
    };
    document.addEventListener('keydown', this.closeHelpOnEscape, true);
    const applyGlobally = this.querySelector('[data-apply-globally]');
    applyGlobally.addEventListener('change', () => {
      if (applyGlobally.checked) {
        setITranslatorTarget(this.target);
        setITranslatorFont(this.font);
        setITranslatorFontSize(this.fontSize);
      }
    });
    this.querySelector('[data-target-select]').addEventListener('change', event => {
      if (applyGlobally.checked) setITranslatorTarget(event.target.value); else this.setTarget(event.target.value);
    });
    this.querySelector('[data-font-select]').addEventListener('change', event => {
      if (applyGlobally.checked) setITranslatorFont(event.target.value); else this.setFont(event.target.value);
    });
    const setSize = value => {
      if (applyGlobally.checked) setITranslatorFontSize(value); else this.setFontSize(value);
    };
    this.querySelector('[data-font-size-range]').addEventListener('input', event => setSize(event.target.value));
    this.querySelector('[data-font-size-value]').addEventListener('change', event => setSize(event.target.value));
    this.querySelector('[data-auto-expand]').addEventListener('change', event => {
      this.autoExpand = event.target.checked;
      if (this.autoExpand) this.adjustHeight(); else this.input.style.height = '';
    });
    this.querySelector('[data-resize-handle]').addEventListener('pointerdown', event => this.startManualResize(event));
    this.querySelector('[data-copy]').addEventListener('click', async () => {
      this.flushBuffer();
      await navigator.clipboard.writeText(this.input.value);
      const button = this.querySelector('[data-copy]'); const original = button.innerHTML;
      button.textContent = '✓'; setTimeout(() => { button.innerHTML = original; }, 1200);
    });
    this.input.addEventListener('keydown', event => this.handleKeydown(event));
    this.input.addEventListener('input', () => { this.adjustHeight(); this.scheduleHistoryBoundary(); });
    this.input.addEventListener('paste', event => this.handlePaste(event));
    this.input.addEventListener('blur', () => this.flushBuffer());
    this.input.addEventListener('pointerdown', () => this.flushBuffer());
    this.adjustHeight();
  }

  get transliterate() { return createTransliterator(pageConfig, this.mode === 'roman' ? 'sanskrit-iast' : this.target); }

  disconnectedCallback() {
    document.removeEventListener('click', this.closeSettingsWhenClickedOutside);
    document.removeEventListener('keydown', this.closeSettingsOnEscape, true);
    document.removeEventListener('keydown', this.closeHelpOnEscape, true);
    clearTimeout(this.historyTimer);
  }

  applyFont() {
    const family = pageConfig.fonts?.options?.[this.font]?.family || 'system-ui';
    const cssFamily = family === 'system-ui' ? 'system-ui' : `"${family}"`;
    this.style.setProperty('--itarea-font-family', `${cssFamily}, system-ui, sans-serif`);
  }

  setTarget(target) {
    if (!pageConfig.targets[target]) throw new Error(`Unsupported target: ${target}`);
    this.flushBuffer();
    this.target = target;
    this.querySelector('[data-target-select]').value = target;
    this.updateModeIndicator();
  }

  setFont(font) {
    if (!pageConfig.fonts?.options?.[font]) throw new Error(`Unsupported font: ${font}`);
    this.font = font;
    this.querySelector('[data-font-select]').value = font;
    this.applyFont();
  }

  setFontSize(size) {
    this.fontSize = normalizeFontSize(size);
    this.updateFontSizeControls();
    this.applyFontSize();
    this.adjustHeight();
  }

  applyFontSize() {
    this.style.setProperty('--itarea-font-size', this.fontSize);
  }

  updateFontSizeControls() {
    const value = Number.parseInt(this.fontSize, 10);
    this.querySelector('[data-font-size-range]').value = value;
    this.querySelector('[data-font-size-value]').value = value;
  }

  adjustHeight() {
    if (!this.autoExpand) return;
    this.input.style.height = 'auto';
    this.input.style.height = `${Math.max(this.input.scrollHeight, 110)}px`;
  }

  startManualResize(event) {
    event.preventDefault();
    const startY = event.clientY;
    const startHeight = this.input.getBoundingClientRect().height;
    const minHeight = parseFloat(getComputedStyle(this.input).minHeight);
    const toggle = this.querySelector('[data-auto-expand]');
    this.autoExpand = false;
    toggle.checked = false;
    const resize = move => {
      this.input.style.height = `${Math.max(minHeight, startHeight + move.clientY - startY)}px`;
    };
    const finish = () => {
      window.removeEventListener('pointermove', resize);
      window.removeEventListener('pointerup', finish);
    };
    window.addEventListener('pointermove', resize);
    window.addEventListener('pointerup', finish, { once: true });
  }

  updateModeIndicator() {
    const element = indicator(this);
    element.textContent = this.mode === 'english'
      ? 'No transliteration'
      : this.mode === 'roman'
        ? 'Roman'
        : pageConfig.targets[this.target].label;
  }

  snapshot() {
    return { value: this.input.value, start: this.input.selectionStart, end: this.input.selectionEnd };
  }

  snapshotsMatch(left, right) {
    return left && right && left.value === right.value && left.start === right.start && left.end === right.end;
  }

  beginHistoryBatch() {
    if (!this.historyBatchActive) {
      const snapshot = this.snapshot();
      if (!this.snapshotsMatch(this.history.at(-1), snapshot)) {
        this.history.push(snapshot);
        if (this.history.length > HISTORY_LIMIT) this.history.shift();
      }
      this.redoHistory = [];
      this.historyBatchActive = true;
    }
    this.scheduleHistoryBoundary();
  }

  scheduleHistoryBoundary() {
    if (!this.historyBatchActive) return;
    clearTimeout(this.historyTimer);
    this.historyTimer = setTimeout(() => { this.historyBatchActive = false; }, 700);
  }

  endHistoryBatch() {
    clearTimeout(this.historyTimer);
    this.historyBatchActive = false;
  }

  restoreSnapshot(snapshot) {
    this.flushBuffer();
    this.input.value = snapshot.value;
    this.input.setSelectionRange(snapshot.start, snapshot.end);
    this.adjustHeight();
    this.input.dispatchEvent(new Event('input', { bubbles: true }));
  }

  undo() {
    this.flushBuffer();
    this.endHistoryBatch();
    const snapshot = this.history.pop();
    if (!snapshot) return;
    this.redoHistory.push(this.snapshot());
    this.restoreSnapshot(snapshot);
  }

  redo() {
    this.flushBuffer();
    this.endHistoryBatch();
    const snapshot = this.redoHistory.pop();
    if (!snapshot) return;
    this.history.push(this.snapshot());
    this.restoreSnapshot(snapshot);
  }

  clearHistory() {
    this.history = [];
    this.redoHistory = [];
    this.endHistoryBatch();
  }

  isNativeEdit(event) {
    if (event.ctrlKey && ['x', 'v'].includes(event.key.toLowerCase())) return true;
    return !event.ctrlKey && !event.metaKey && !event.altKey && (event.key === 'Backspace' || event.key === 'Delete' || event.key === 'Enter' || event.key.length === 1);
  }

  setMode(mode) {
    this.flushBuffer();
    this.mode = mode;
    this.querySelectorAll('[data-mode]').forEach(button => button.classList.toggle('active', button.dataset.mode === mode));
    this.input.classList.toggle('itarea__english', mode === 'english');
    this.input.classList.toggle('itarea__roman', mode === 'roman');
    this.input.placeholder = mode === 'english' ? 'Type English' : 'Type Sanskrit with ITRANS';
    this.updateModeIndicator();
    this.input.focus();
  }

  handleKeydown(event) {
    const settings = this.querySelector('.itarea__settings');
    if (event.key === 'Escape' && !settings.hidden) {
      event.preventDefault(); settings.hidden = true; return;
    }
    const key = event.key.toLowerCase();
    if (event.ctrlKey && ['z', 'u'].includes(key)) {
      event.preventDefault();
      if (event.shiftKey) this.redo(); else this.undo();
      return;
    }
    if (event.ctrlKey && ['s', 'i'].includes(key)) {
      event.preventDefault(); this.setMode(this.mode === 'itrans' ? 'english' : 'itrans'); return;
    }
    if (event.ctrlKey && key === 'r') {
      event.preventDefault(); this.setMode(this.mode === 'roman' ? 'itrans' : 'roman'); return;
    }
    if (event.ctrlKey && key === 'o') {
      event.preventDefault(); this.setMode(this.mode === 'english' ? 'itrans' : 'english'); return;
    }
    if ((event.ctrlKey && key === 'e') || event.key === 'Escape') {
      event.preventDefault(); this.setMode('english'); return;
    }
    if (this.mode === 'english') {
      if (this.isNativeEdit(event)) this.beginHistoryBatch();
      return;
    }
    if (event.ctrlKey && key === 'x') {
      this.flushBuffer(); this.beginHistoryBatch(); return;
    }
    if (event.key === 'Backspace' && this.rawBuffer) {
      event.preventDefault(); this.beginHistoryBatch(); this.rawBuffer = this.rawBuffer.slice(0, -1); this.replaceBuffer(); return;
    }
    if (event.key === 'Backspace') {
      this.beginHistoryBatch(); return;
    }
    if (event.key === 'Delete') {
      this.flushBuffer(); this.beginHistoryBatch(); return;
    }
    if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'].includes(event.key)) {
      this.flushBuffer(); return;
    }
    if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
      event.preventDefault();
      this.beginHistoryBatch();
      if (this.bufferStart === null) this.bufferStart = this.input.selectionStart;
      this.rawBuffer += event.key;
      this.replaceBuffer();
      if (/\s/.test(event.key)) { this.flushBuffer(); this.endHistoryBatch(); }
    } else if (event.key === 'Enter') {
      this.beginHistoryBatch(); this.flushBuffer();
    } else if (event.key === 'Tab') {
      this.flushBuffer();
    }
  }

  handlePaste(event) {
    if (this.mode === 'english') { this.beginHistoryBatch(); return; }
    const text = event.clipboardData?.getData('text/plain');
    if (text === undefined) return;
    event.preventDefault();
    this.beginHistoryBatch();
    this.flushBuffer();
    const start = this.input.selectionStart;
    this.input.setRangeText(this.transliterate(text), start, this.input.selectionEnd, 'end');
    this.adjustHeight();
    this.endHistoryBatch();
  }

  replaceBuffer() {
    const rendered = this.transliterate(this.rawBuffer);
    const end = this.input.selectionEnd;
    this.input.setRangeText(rendered, this.bufferStart, end, 'end');
    this.adjustHeight();
  }

  flushBuffer() {
    this.rawBuffer = '';
    this.bufferStart = null;
  }

  get value() { this.flushBuffer(); return this.input.value; }

  set value(value) {
    const text = String(value ?? '');
    if (!this.input) {
      this._initialValue = text;
      return;
    }
    this.flushBuffer();
    this.input.value = text;
    this.clearHistory();
    this.adjustHeight();
  }
}

customElements.define('i-translator-textarea', ITranslatorTextarea);
