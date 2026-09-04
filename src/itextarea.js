import { createTransliterator } from './itransliterator.js';

let pageConfig;
let pageTarget;
let pageFont;
const settingsIcon = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19.43 12.98c.04-.32.07-.65.07-.98s-.02-.66-.07-.98l2.11-1.65a.5.5 0 0 0 .12-.64l-2-3.46a.5.5 0 0 0-.61-.22l-2.49 1a7.36 7.36 0 0 0-1.69-.98L14.5 2.42A.49.49 0 0 0 14 2h-4a.49.49 0 0 0-.49.42l-.38 2.65c-.61.25-1.18.59-1.69.98l-2.49-1a.49.49 0 0 0-.61.22l-2 3.46a.5.5 0 0 0 .12.64l2.11 1.65c-.04.32-.08.65-.08.98s.03.66.08.98l-2.11 1.65a.5.5 0 0 0-.12.64l2 3.46c.12.22.38.31.61.22l2.49-1c.51.4 1.08.73 1.69.98l.38 2.65c.04.24.24.42.49.42h4c.25 0 .46-.18.49-.42l.38-2.65c.61-.25 1.18-.58 1.69-.98l2.49 1c.23.09.49 0 .61-.22l2-3.46a.5.5 0 0 0-.12-.64l-2.11-1.65ZM12 15.5A3.5 3.5 0 1 1 12 8a3.5 3.5 0 0 1 0 7.5Z"/></svg>';
const copyIcon = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1Zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2Zm0 16H8V7h11v14Z"/></svg>';
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

function indicator(widget) { return widget.querySelector('[data-mode-indicator]'); }

export class ITranslatorTextarea extends HTMLElement {
  connectedCallback() {
    if (!pageConfig) throw new Error('Call configureITranslator(config) before adding i-translator-textarea elements.');
    const label = this.getAttribute('label') || 'Text';
    const targets = Object.entries(pageConfig.targets)
      .filter(([id]) => id !== 'sanskrit-iast')
      .map(([id, target]) => `<option value="${id}">${target.label}</option>`).join('');
    const fonts = Object.entries(pageConfig.fonts?.options || { system: { label: 'System default' } })
      .map(([id, font]) => `<option value="${id}">${font.label}</option>`).join('');
    this.innerHTML = `<section class="itarea"><div class="itarea__bar"><button type="button" data-mode="itrans" class="active">iTrans</button><button type="button" data-mode="roman">Roman (IAST)</button><button type="button" data-mode="english">English</button></div><div class="itarea__editor"><textarea spellcheck="false" aria-label="${label}" placeholder="Type Sanskrit with ITRANS"></textarea><div class="itarea__resize-handle" data-resize-handle title="Drag to resize text area" aria-label="Drag to resize text area" role="separator"></div><span class="itarea__mode-tab"><span data-mode-indicator></span><button type="button" class="itarea__tab-settings" data-settings title="Target language settings" aria-label="Target language settings">${settingsIcon}</button></span><div class="itarea__actions"><button type="button" class="itarea__icon" data-copy title="Copy text" aria-label="Copy text">${copyIcon}</button></div><div class="itarea__settings" hidden><label>Target language <select data-target-select>${targets}</select></label><label>Font <select data-font-select>${fonts}</select></label><label class="itarea__auto-expand">Auto-expand <input type="checkbox" data-auto-expand checked></label><label class="itarea__global-settings">Apply target and font globally <input type="checkbox" data-apply-globally></label></div></div></section>`;
    this.mode = 'itrans';
    this.rawBuffer = '';
    this.bufferStart = null;
    this.autoExpand = true;
    this.target = pageTarget;
    this.font = pageFont;
    this.input = this.querySelector('textarea');
    this.querySelector('[data-target-select]').value = this.target;
    this.querySelector('[data-font-select]').value = this.font;
    this.applyFont();
    this.setMode('itrans');
    this.querySelector('.itarea__bar').addEventListener('click', event => {
      const button = event.target.closest('button');
      if (button) this.setMode(button.dataset.mode);
    });
    const settingsButton = this.querySelector('[data-settings]');
    const settingsPanel = this.querySelector('.itarea__settings');
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
    const applyGlobally = this.querySelector('[data-apply-globally]');
    this.querySelector('[data-target-select]').addEventListener('change', event => {
      if (applyGlobally.checked) setITranslatorTarget(event.target.value); else this.setTarget(event.target.value);
    });
    this.querySelector('[data-font-select]').addEventListener('change', event => {
      if (applyGlobally.checked) setITranslatorFont(event.target.value); else this.setFont(event.target.value);
    });
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
    this.input.addEventListener('input', () => this.adjustHeight());
    this.input.addEventListener('paste', event => this.handlePaste(event));
    this.input.addEventListener('blur', () => this.flushBuffer());
    this.adjustHeight();
  }

  get transliterate() { return createTransliterator(pageConfig, this.mode === 'roman' ? 'sanskrit-iast' : this.target); }

  disconnectedCallback() {
    document.removeEventListener('click', this.closeSettingsWhenClickedOutside);
    document.removeEventListener('keydown', this.closeSettingsOnEscape, true);
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

  setMode(mode) {
    this.flushBuffer();
    this.mode = mode;
    this.querySelectorAll('button').forEach(button => button.classList.toggle('active', button.dataset.mode === mode));
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
    if (event.ctrlKey && ['s', 'i'].includes(event.key.toLowerCase())) {
      event.preventDefault(); this.setMode('itrans'); return;
    }
    if ((event.ctrlKey && ['e', 'o'].includes(event.key.toLowerCase())) || event.key === 'Escape') {
      event.preventDefault(); this.setMode('english'); return;
    }
    if (event.ctrlKey && event.key.toLowerCase() === 'r') {
      event.preventDefault(); this.setMode('roman'); return;
    }
    if (this.mode === 'english') return;
    if (event.key === 'Backspace' && this.rawBuffer) {
      event.preventDefault(); this.rawBuffer = this.rawBuffer.slice(0, -1); this.replaceBuffer(); return;
    }
    if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End', 'Delete'].includes(event.key)) {
      this.flushBuffer(); return;
    }
    if (event.key.length === 1 && !event.metaKey && !event.altKey) {
      event.preventDefault();
      if (this.bufferStart === null) this.bufferStart = this.input.selectionStart;
      this.rawBuffer += event.key;
      this.replaceBuffer();
    } else if (event.key === 'Enter' || event.key === 'Tab') {
      this.flushBuffer();
    }
  }

  handlePaste(event) {
    if (this.mode === 'english') return;
    const text = event.clipboardData?.getData('text/plain');
    if (text === undefined) return;
    event.preventDefault();
    this.flushBuffer();
    const start = this.input.selectionStart;
    this.input.setRangeText(this.transliterate(text), start, this.input.selectionEnd, 'end');
    this.adjustHeight();
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
}

customElements.define('i-translator-textarea', ITranslatorTextarea);
