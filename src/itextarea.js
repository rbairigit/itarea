import { createTransliterator } from './itransliterator.js';

let pageConfig;
export function configureITranslator(config) { pageConfig = config; }

export class ITranslatorTextarea extends HTMLElement {
  connectedCallback() {
    if (!pageConfig) throw new Error('Call configureITranslator(config) before adding i-translator-textarea elements.');
    const label = this.getAttribute('label') || 'Text';
    this.innerHTML = `<section class="itarea"><label>${label}</label><div class="itarea__bar"><button type="button" data-mode="itrans" class="active">iTrans</button><button type="button" data-mode="english">English</button></div><textarea spellcheck="false" aria-label="${label} input" placeholder="Type ITRANS here"></textarea><output aria-live="polite"></output></section>`;
    this.mode = 'itrans'; this.input = this.querySelector('textarea'); this.output = this.querySelector('output');
    if (!document.querySelector('#itarea-mode-indicator')) {
      const indicator = document.createElement('div'); indicator.id = 'itarea-mode-indicator'; indicator.hidden = true;
      indicator.textContent = 'iTranArea in English mode'; document.body.append(indicator);
    }
    this.render();
    this.querySelector('.itarea__bar').addEventListener('click', event => {
      const button = event.target.closest('button'); if (!button) return;
      this.setMode(button.dataset.mode);
    });
    this.input.addEventListener('input', () => this.render());
    this.input.addEventListener('keydown', event => {
      if (event.ctrlKey && event.key.toLowerCase() === 's') { event.preventDefault(); this.setMode('itrans'); }
      if ((event.ctrlKey && event.key.toLowerCase() === 'e') || event.key === 'Escape') { event.preventDefault(); this.setMode('english'); }
    });
  }
  setMode(mode) {
    this.mode = mode;
    this.querySelectorAll('button').forEach(button => button.classList.toggle('active', button.dataset.mode === mode));
    this.input.placeholder = mode === 'itrans' ? 'Type ITRANS here' : 'Type English here';
    this.input.classList.toggle('itarea__english', mode === 'english');
    document.querySelector('#itarea-mode-indicator').hidden = mode !== 'english';
    this.render(); this.input.focus();
  }
  render() { this.output.textContent = this.mode === 'itrans' ? createTransliterator(pageConfig)(this.input.value) : this.input.value; }
  get value() { return this.output.textContent; }
}
customElements.define('i-translator-textarea', ITranslatorTextarea);
