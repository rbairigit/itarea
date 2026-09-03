import { createTransliterator } from './itransliterator.js';

let pageConfig;
export function configureITranslator(config) { pageConfig = config; }

function indicator() {
  let element = document.querySelector('#itarea-mode-indicator');
  if (!element) {
    element = document.createElement('div');
    element.id = 'itarea-mode-indicator';
    element.textContent = 'iTranArea in English mode';
    element.hidden = true;
    document.body.append(element);
  }
  return element;
}

export class ITranslatorTextarea extends HTMLElement {
  connectedCallback() {
    if (!pageConfig) throw new Error('Call configureITranslator(config) before adding i-translator-textarea elements.');
    const label = this.getAttribute('label') || 'Text';
    this.innerHTML = `<section class="itarea"><label>${label}</label><div class="itarea__bar"><button type="button" data-mode="itrans" class="active">iTrans</button><button type="button" data-mode="roman">Roman (IAST)</button><button type="button" data-mode="english">English</button></div><textarea spellcheck="false" aria-label="${label}" placeholder="Type Sanskrit with ITRANS"></textarea></section>`;
    this.mode = 'itrans';
    this.rawBuffer = '';
    this.bufferStart = null;
    this.input = this.querySelector('textarea');
    this.setMode('itrans');
    this.querySelector('.itarea__bar').addEventListener('click', event => {
      const button = event.target.closest('button');
      if (button) this.setMode(button.dataset.mode);
    });
    this.input.addEventListener('keydown', event => this.handleKeydown(event));
    this.input.addEventListener('paste', event => this.handlePaste(event));
    this.input.addEventListener('blur', () => this.flushBuffer());
  }

  get transliterate() { return createTransliterator(pageConfig, this.mode === 'roman' ? 'sanskrit-iast' : pageConfig.defaultTarget); }

  setMode(mode) {
    this.flushBuffer();
    this.mode = mode;
    this.querySelectorAll('button').forEach(button => button.classList.toggle('active', button.dataset.mode === mode));
    this.input.classList.toggle('itarea__english', mode === 'english');
    this.input.placeholder = mode === 'english' ? 'Type English' : 'Type Sanskrit with ITRANS';
    indicator().hidden = mode !== 'english';
    this.input.focus();
  }

  handleKeydown(event) {
    if (event.ctrlKey && event.key.toLowerCase() === 's') {
      event.preventDefault(); this.setMode('itrans'); return;
    }
    if ((event.ctrlKey && event.key.toLowerCase() === 'e') || event.key === 'Escape') {
      event.preventDefault(); this.setMode('english'); return;
    }
    if (event.ctrlKey && event.key.toLowerCase() === 'r') {
      event.preventDefault(); this.setMode('roman'); return;
    }
    if (this.mode !== 'itrans') return;
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
    if (this.mode !== 'itrans') return;
    const text = event.clipboardData?.getData('text/plain');
    if (text === undefined) return;
    event.preventDefault();
    this.flushBuffer();
    const start = this.input.selectionStart;
    this.input.setRangeText(this.transliterate(text), start, this.input.selectionEnd, 'end');
  }

  replaceBuffer() {
    const rendered = this.transliterate(this.rawBuffer);
    const end = this.input.selectionEnd;
    this.input.setRangeText(rendered, this.bufferStart, end, 'end');
  }

  flushBuffer() {
    this.rawBuffer = '';
    this.bufferStart = null;
  }

  get value() { this.flushBuffer(); return this.input.value; }
}

customElements.define('i-translator-textarea', ITranslatorTextarea);
