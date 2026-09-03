import { createTransliterator } from './itransliterator.js';

let pageConfig;
export function configureITranslator(config) { pageConfig = config; }

export class ITranslatorTextarea extends HTMLElement {
  connectedCallback() {
    if (!pageConfig) throw new Error('Call configureITranslator(config) before adding i-translator-textarea elements.');
    const label = this.getAttribute('label') || 'Text';
    this.innerHTML = `<section class="itarea"><label>${label}</label><div class="itarea__bar"><button type="button" data-mode="itrans" class="active">iTrans</button><button type="button" data-mode="english">English</button></div><textarea spellcheck="false" aria-label="${label} input" placeholder="Type ITRANS here"></textarea><output aria-live="polite"></output></section>`;
    this.mode = 'itrans'; this.input = this.querySelector('textarea'); this.output = this.querySelector('output');
    this.render();
    this.querySelector('.itarea__bar').addEventListener('click', event => {
      const button = event.target.closest('button'); if (!button) return;
      this.mode = button.dataset.mode; this.querySelectorAll('button').forEach(b => b.classList.toggle('active', b === button));
      this.input.placeholder = this.mode === 'itrans' ? 'Type ITRANS here' : 'Type English here'; this.render();
    });
    this.input.addEventListener('input', () => this.render());
  }
  render() { this.output.textContent = this.mode === 'itrans' ? createTransliterator(pageConfig)(this.input.value) : this.input.value; }
  get value() { return this.output.textContent; }
}
customElements.define('i-translator-textarea', ITranslatorTextarea);
