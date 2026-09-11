import { createTransliterator } from './itransliterator.js';
import { audioDialogMarkup, audioIcons, createAudioController } from './itaudio.js';
import { createDocumentController, documentIcons } from './itdocument.js';
import { createRichTextController, richTextToolbarMarkup, sanitizeRichHtml } from './itrichtext.js';

let pageConfig;
let pageTarget;
let pageFont;
let disableSequenceEnabled = false;
let disableSequence = ' = ';
const MIN_FONT_SIZE = 14;
const MAX_FONT_SIZE = 48;
const HISTORY_LIMIT = 100;
const WIDGET_VERSION = '1.3.0';
const WIDGET_UPDATED = 'September 11, 2026 at 2:45 AM (UTC+8)';
const WIDGET_UPDATED_ISO = '2026-09-11T02:45:04+08:00';
let pageFontSize = '24px';
const settingsIcon = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19.43 12.98c.04-.32.07-.65.07-.98s-.02-.66-.07-.98l2.11-1.65a.5.5 0 0 0 .12-.64l-2-3.46a.5.5 0 0 0-.61-.22l-2.49 1a7.36 7.36 0 0 0-1.69-.98L14.5 2.42A.49.49 0 0 0 14 2h-4a.49.49 0 0 0-.49.42l-.38 2.65c-.61.25-1.18.59-1.69.98l-2.49-1a.49.49 0 0 0-.61.22l-2 3.46a.5.5 0 0 0 .12.64l2.11 1.65c-.04.32-.08.65-.08.98s.03.66.08.98l-2.11 1.65a.5.5 0 0 0-.12.64l2 3.46c.12.22.38.31.61.22l2.49-1c.51.4 1.08.73 1.69.98l.38 2.65c.04.24.24.42.49.42h4c.25 0 .46-.18.49-.42l.38-2.65c.61-.25 1.18-.58 1.69-.98l2.49 1c.23.09.49 0 .61-.22l2-3.46a.5.5 0 0 0-.12-.64l-2.11-1.65ZM12 15.5A3.5 3.5 0 1 1 12 8a3.5 3.5 0 0 1 0 7.5Z"/></svg>';
const copyIcon = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1Zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2Zm0 16H8V7h11v14Z"/></svg>';
const copiedIcon = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 16.2-3.5-3.5-1.4 1.4L9 19 20.3 7.7l-1.4-1.4L9 16.2Z"/></svg>';
const helpIcon = '<svg viewBox="0 -960 960 960" aria-hidden="true"><path d="M513.5-254.5Q528-269 528-290t-14.5-35.5Q499-340 478-340t-35.5 14.5Q428-311 428-290t14.5 35.5Q457-240 478-240t35.5-14.5ZM442-394h74q0-33 7.5-52t42.5-52q26-26 41-49.5t15-56.5q0-56-41-86t-97-30q-57 0-92.5 30T342-618l66 26q5-18 22.5-39t53.5-21q32 0 48 17.5t16 38.5q0 20-12 37.5T506-526q-44 39-54 59t-10 73Zm38 314q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z"/></svg>';
const collapseControlsIcon = '<svg viewBox="0 -960 960 960" aria-hidden="true"><path d="m136-80-56-56 264-264H160v-80h320v320h-80v-184L136-80Zm344-400v-320h80v184l264-264 56 56-264 264h184v80H480Z"/></svg>';
const expandControlsIcon = '<svg viewBox="0 -960 960 960" aria-hidden="true"><path d="M120-120v-320h80v184l504-504H520v-80h320v320h-80v-184L256-200h184v80H120Z"/></svg>';
const newIcon = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2Z"/></svg>';
const duplicateIcon = '<svg viewBox="0 -960 960 960" aria-hidden="true"><path d="M120-120q-33 0-56.5-23.5T40-200v-520h80v520h680v80H120Zm160-160q-33 0-56.5-23.5T200-360v-440q0-33 23.5-56.5T280-880h200l80 80h280q33 0 56.5 23.5T920-720v360q0 33-23.5 56.5T840-280H280Zm0-80h560v-360H527l-80-80H280v440Zm0 0v-440 440Z"/></svg>';
const autoExpandIcon = '<svg viewBox="0 -960 960 960" aria-hidden="true"><path d="M160-80v-80h640v80H160Zm320-120L320-360l56-56 64 62v-252l-64 62-56-56 160-160 160 160-56 56-64-62v252l64-62 56 56-160 160ZM160-800v-80h640v80H160Z"/></svg>';
const tagsIcon = '<svg viewBox="0 -960 960 960" aria-hidden="true"><path d="M480-240 63-467l84-46 333 182 333-182 84 46-417 227Zm0 160L63-307l84-46 333 182 333-182 84 46L480-80Zm0-320L40-640l440-240 40 22v178h327l73 40-440 240Zm0-91 200-109H440v-167L207-640l273 149Zm-40-109Z"/></svg>';
const deleteIcon = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12ZM8 9h8v10H8V9Zm7.5-5-1-1h-5l-1 1H5v2h14V4h-3.5Z"/></svg>';
const DEFAULT_TAG_NAME = 'type';
const DEFAULT_TAG_VALUE = 'rich-text-audio';
const MAX_TAGS = 100;
const MAX_TAG_NAME_LENGTH = 80;
const MAX_TAG_VALUE_LENGTH = 500;
function normalizeFontSize(size) {
  const value = Math.round(Number.parseFloat(size));
  return `${Math.min(MAX_FONT_SIZE, Math.max(MIN_FONT_SIZE, Number.isFinite(value) ? value : 24))}px`;
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

function setITranslatorDisableSequence(enabled, sequence = disableSequence) {
  disableSequenceEnabled = Boolean(enabled);
  disableSequence = String(sequence || '').slice(0, 3);
  document.querySelectorAll('i-translator-textarea').forEach(widget => widget.syncDisableSequenceSetting?.());
}

function indicator(widget) { return widget.querySelector('[data-mode-indicator]'); }
function escapeHtml(value) { return String(value).replace(/[&<>'"]/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[character]); }
function generatedWidgetId() {
  return `itarea-${globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`}`;
}

function tagsDialogMarkup() {
  return `<div class="itarea__tags-overlay" data-tags-dialog hidden><section class="itarea__tags-dialog" role="dialog" aria-modal="true" aria-label="Text area tags"><button type="button" class="itarea__tags-close" data-tags-close aria-label="Close tags">×</button><h2>Tags</h2><p>Add metadata that the containing page can query from this text area.</p><form class="itarea__tags-form" data-tags-form><label>Name <input type="text" data-tag-name maxlength="${MAX_TAG_NAME_LENGTH}" autocomplete="off"></label><span aria-hidden="true">=</span><label>Value <input type="text" data-tag-value maxlength="${MAX_TAG_VALUE_LENGTH}" autocomplete="off"></label><button type="submit">Add tag</button></form><p class="itarea__tags-error" data-tags-error role="alert" hidden></p><div class="itarea__tags-table-wrap"><table class="itarea__tags-table"><thead><tr><th>Name</th><th>Value</th><th>Delete</th></tr></thead><tbody data-tags-body></tbody></table></div></section></div>`;
}

function uiDialogMarkup() {
  return `<div class="itarea__ui-overlay" data-ui-dialog hidden><section class="itarea__ui-dialog" role="dialog" aria-modal="true" aria-label="iTranslator dialog"><button type="button" class="itarea__ui-close" data-ui-close aria-label="Close">×</button><h2 data-ui-title></h2><p data-ui-message></p><input type="text" data-ui-input hidden><footer><button type="button" data-ui-cancel>Cancel</button><button type="button" class="primary" data-ui-confirm>OK</button></footer></section></div>`;
}

function createUiDialog(widget) {
  const overlay = widget.querySelector('[data-ui-dialog]');
  const title = widget.querySelector('[data-ui-title]');
  const message = widget.querySelector('[data-ui-message]');
  const input = widget.querySelector('[data-ui-input]');
  const cancelButton = widget.querySelector('[data-ui-cancel]');
  const confirmButton = widget.querySelector('[data-ui-confirm]');
  const closeButton = widget.querySelector('[data-ui-close]');
  let finish = null;
  let kind = 'alert';
  let returnFocus = null;

  const close = accepted => {
    if (!finish) return;
    const resolve = finish;
    finish = null;
    overlay.hidden = true;
    const value = kind === 'prompt' ? (accepted ? input.value : null) : kind === 'confirm' ? accepted : undefined;
    resolve(value);
    if (returnFocus?.isConnected) returnFocus.focus();
  };
  const show = options => new Promise(resolve => {
    if (finish) close(false);
    kind = options.kind || 'alert';
    finish = resolve;
    returnFocus = document.activeElement;
    title.textContent = options.title || (kind === 'alert' ? 'Notice' : 'Please confirm');
    message.textContent = options.message || '';
    input.hidden = kind !== 'prompt';
    input.value = options.value || '';
    input.setAttribute('aria-label', options.inputLabel || title.textContent);
    cancelButton.hidden = kind === 'alert';
    cancelButton.textContent = options.cancelLabel || 'Cancel';
    confirmButton.textContent = options.confirmLabel || (kind === 'prompt' ? 'Save' : kind === 'confirm' ? 'Continue' : 'OK');
    confirmButton.classList.toggle('danger', Boolean(options.danger));
    overlay.hidden = false;
    queueMicrotask(() => (kind === 'prompt' ? input : confirmButton).focus());
  });
  const keydown = event => {
    if (overlay.hidden) return;
    if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); close(false); }
    else if (event.key === 'Enter' && (kind !== 'prompt' || document.activeElement === input)) {
      event.preventDefault(); event.stopPropagation(); close(true);
    }
  };
  confirmButton.addEventListener('click', () => close(true));
  cancelButton.addEventListener('click', () => close(false));
  closeButton.addEventListener('click', () => close(false));
  overlay.addEventListener('click', event => { if (event.target === overlay) close(false); });
  document.addEventListener('keydown', keydown, true);
  return {
    alert: (text, options = {}) => show({ ...options, kind: 'alert', message: text }),
    confirm: (text, options = {}) => show({ ...options, kind: 'confirm', message: text }),
    prompt: (text, value = '', options = {}) => show({ ...options, kind: 'prompt', message: text, value }),
    destroy() { document.removeEventListener('keydown', keydown, true); if (finish) close(false); },
  };
}

export class ITranslatorTextarea extends HTMLElement {
  connectedCallback() {
    if (!pageConfig) throw new Error('Call configureITranslator(config) before adding i-translator-textarea elements.');
    const label = this.getAttribute('label') || 'Text';
    const targets = Object.entries(pageConfig.targets)
      .filter(([id]) => id !== 'sanskrit-iast')
      .map(([id, target]) => `<option value="${id}">${target.label}</option>`).join('');
    const fontOptions = pageConfig.fonts?.options || { system: { label: 'System default', family: 'system-ui' } };
    const mappingRows = Object.entries({ ...pageConfig.tokens, ...pageConfig.aliases, ...pageConfig.punctuation })
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([input, output]) => `<tr><td><code>${escapeHtml(input)}</code></td><td>${escapeHtml(output)}</td></tr>`).join('');
    this.innerHTML = `<section class="itarea"><div class="itarea__bar"><button type="button" data-mode="itrans" class="active">iTrans</button><button type="button" data-mode="roman">Roman</button><button type="button" data-mode="english">English</button><button type="button" class="itarea__record-button" data-audio-record title="Record or edit audio" aria-label="Record or edit audio">${audioIcons.record}</button><button type="button" class="itarea__bar-icon" data-new title="New text area below" aria-label="New text area below">${newIcon}</button><button type="button" class="itarea__bar-icon" data-duplicate title="Duplicate text area below" aria-label="Duplicate text area below">${duplicateIcon}</button><button type="button" class="itarea__bar-icon" data-delete-widget title="Delete this new text area" aria-label="Delete this new text area" hidden>${deleteIcon}</button><label class="itarea__font-size-control">Text size <input type="number" data-font-size-value min="${MIN_FONT_SIZE}" max="${MAX_FONT_SIZE}" value="22" aria-label="Text size in pixels"><span>px</span></label></div>${richTextToolbarMarkup(fontOptions)}<div class="itarea__editor"><div class="itarea__input" contenteditable="true" role="textbox" aria-multiline="true" spellcheck="false" aria-label="${label}" data-placeholder="Type Sanskrit with ITRANS"></div><div class="itarea__resize-handle" data-resize-handle title="Drag to resize text area" aria-label="Drag to resize text area" role="separator"></div><div class="itarea__width-handle" data-width-handle title="Drag to resize widget width" aria-label="Drag to resize widget width" role="separator" hidden></div><span class="itarea__top-tabs"><button type="button" class="itarea__help-button itarea__top-help" data-help title="Widget help" aria-label="Widget help">${helpIcon}</button><span class="itarea__document-controls"><button type="button" data-document-save title="Save iTranslator document — Saved" aria-label="Save iTranslator document — Saved">${documentIcons.save}</button><button type="button" data-document-open title="Open iTranslator document" aria-label="Open iTranslator document">${documentIcons.open}</button><input type="file" data-document-file accept=".itarea.zip,application/zip" hidden><span class="itarea__document-feedback" data-document-feedback role="status" aria-live="polite" hidden></span></span><span class="itarea__mode-tab"><span data-mode-indicator></span><button type="button" class="itarea__tab-settings" data-settings title="Language settings" aria-label="Language settings">${settingsIcon}</button></span></span><div class="itarea__actions"><button type="button" class="itarea__icon itarea__audio-play" data-audio-play title="No recorded audio" aria-label="Play recorded audio" disabled>${audioIcons.play}</button><button type="button" class="itarea__icon" data-copy title="Copy text" aria-label="Copy text">${copyIcon}</button></div><div class="itarea__settings" hidden><label>Language <select data-target-select>${targets}</select></label><label class="itarea__auto-expand">Auto-expand <input type="checkbox" data-auto-expand checked></label><label class="itarea__width-resize">Resize width <input type="checkbox" data-width-resize></label><label class="itarea__duplicate-audio">Include audio when duplicating <input type="checkbox" data-duplicate-audio></label><label class="itarea__global-settings">Apply language and size globally <input type="checkbox" data-apply-globally></label></div><div class="itarea__help-overlay" data-help-dialog hidden><section class="itarea__help" role="dialog" aria-modal="true" aria-label="iTranslator Text Area help"><button type="button" class="itarea__help-close" data-help-close aria-label="Close help">×</button><h2>iTranslator Text Area</h2><ul><li><strong>iTrans:</strong> type ASCII ITRANS; use Ctrl+S or Ctrl+I.</li><li><strong>Roman:</strong> creates IAST; use Ctrl+R.</li><li><strong>English:</strong> leaves text unchanged; use Ctrl+E, Ctrl+O, or Escape.</li><li>Use the formatting row for bold, italic, underline, lists, color, selected font, font size and weight, line spacing, alignment, links, and clear formatting.</li><li>The formatting font, size, color, and weight controls apply to selected text or to subsequent typing at the caret. Enter a pixel value in the upper size field to change the whole editor's default size.</li><li>The microphone opens the recorder and waveform editor. Audio is available until this page is refreshed; use Save to export it.</li><li>The Save dot means the text, formatting, or audio has changed since the last export. Save exports the text, formatting, mode, language, font, size, and audio to one <code>.itarea.zip</code> file.</li><li>New creates an empty text area below; Duplicate copies this widget's settings, formatted text, and optional audio.</li><li>Enable <strong>Resize width</strong> in Settings to drag the widget's right edge.</li><li>Use the control below Copy and Play to hide or show the controls above the text area.</li></ul><h3>Current ITRANS mappings</h3><p>These mappings come from the active widget configuration. See <a href="https://en.wikipedia.org/wiki/ITRANS" target="_blank" rel="noopener noreferrer">ITRANS on Wikipedia</a> for background and conventions.</p><table class="itarea__mapping-table"><thead><tr><th>Input</th><th>Output</th></tr></thead><tbody>${mappingRows}</tbody></table></section></div>${audioDialogMarkup()}</div></section>`;
    this.querySelector('.itarea__font-size-control')?.remove();
    const controlBar = this.querySelector('.itarea__bar');
    const formatBar = this.querySelector('.itarea__format-bar');
    const topTabs = this.querySelector('.itarea__top-tabs');
    const modeButtons = document.createElement('span');
    modeButtons.className = 'itarea__mode-buttons';
    const firstModeButton = controlBar.querySelector('[data-mode]');
    controlBar.insertBefore(modeButtons, firstModeButton);
    controlBar.querySelectorAll('[data-mode]').forEach(button => modeButtons.append(button));
    const quickFontControl = formatBar.querySelector('.itarea__format-font');
    modeButtons.insertAdjacentElement('afterend', quickFontControl);
    controlBar.append(topTabs);
    const settingsPanel = this.querySelector('.itarea__settings');
    settingsPanel.querySelector('.itarea__auto-expand')?.remove();
    const autoExpandToggle = document.createElement('button');
    autoExpandToggle.type = 'button';
    autoExpandToggle.className = 'itarea__bar-icon itarea__auto-expand-toggle';
    autoExpandToggle.dataset.autoExpand = '';
    autoExpandToggle.innerHTML = autoExpandIcon;
    this.querySelector('[data-duplicate]').insertAdjacentElement('afterend', autoExpandToggle);
    const tagsButton = document.createElement('button');
    tagsButton.type = 'button';
    tagsButton.className = 'itarea__bar-icon itarea__tags-button';
    tagsButton.dataset.tags = '';
    tagsButton.title = 'Tags';
    tagsButton.setAttribute('aria-label', 'Tags');
    tagsButton.innerHTML = tagsIcon;
    autoExpandToggle.insertAdjacentElement('afterend', tagsButton);
    this.querySelector('.itarea').insertAdjacentHTML('beforeend', `${tagsDialogMarkup()}${uiDialogMarkup()}`);
    settingsPanel.insertAdjacentHTML('beforeend', `<label class="itarea__disable-sequence"><input type="checkbox" data-disable-sequence-enabled> <span>iTrans disable seq.</span><input type="text" data-disable-sequence maxlength="3" size="3" value=" = " aria-label="iTrans disable sequence"></label><div class="itarea__version">iTranslator ${WIDGET_VERSION}<br>Updated ${WIDGET_UPDATED}</div>`);
    const actions = this.querySelector('.itarea__actions');
    this.querySelector('[data-copy]').insertAdjacentHTML('afterend', '<span class="itarea__copy-feedback" data-copy-feedback role="status" aria-live="polite" hidden>Copied</span>');
    actions.insertAdjacentHTML('beforeend', `<button type="button" class="itarea__icon itarea__controls-toggle" data-controls-toggle title="Hide controls" aria-label="Hide controls">${collapseControlsIcon}</button>`);
    const controlsToggle = this.querySelector('[data-controls-toggle]');
    const setControlsVisible = visible => {
      controlBar.hidden = !visible;
      formatBar.hidden = !visible;
      topTabs.hidden = !visible;
      settingsPanel.hidden = true;
      controlsToggle.innerHTML = visible ? collapseControlsIcon : expandControlsIcon;
      controlsToggle.title = visible ? 'Hide controls' : 'Show controls';
      controlsToggle.setAttribute('aria-label', controlsToggle.title);
    };
    controlsToggle.addEventListener('click', () => setControlsVisible(controlBar.hidden));
    setControlsVisible(false);
    this.mode = 'itrans';
    this.rawBuffer = '';
    this.bufferRange = null;
    this.autoExpand = true;
    this._contentLastUpdatedAt = null;
    this._audioLastUpdatedAt = null;
    this._tags = new Map([[DEFAULT_TAG_NAME, DEFAULT_TAG_VALUE]]);
    this.target = pageTarget;
    this.font = pageFont;
    this.fontSize = pageFontSize;
    this.input = this.querySelector('.itarea__input');
    this.syncAutoExpandToggle();
    if (this._initialTags !== undefined) {
      this.setTags(this._initialTags, { notify: false });
      delete this._initialTags;
    }
    this.renderTags();
    this.widthResizable = false;
    this.duplicateAudio = false;
    const audioPlay = this.querySelector('[data-audio-play]');
    this.updateActionVisibility = () => {
      const height = this.input.getBoundingClientRect().height;
      audioPlay.hidden = height < 88;
      controlsToggle.hidden = height < 122;
    };
    this.actionResizeObserver = new ResizeObserver(this.updateActionVisibility);
    this.actionResizeObserver.observe(this.input);
    if (this._initialValue !== undefined) {
      this.input.textContent = this._initialValue;
      delete this._initialValue;
    }
    this.history = [];
    this.redoHistory = [];
    this.historyBatchActive = false;
    this.historyTimer = null;
    this.lineRestoreMode = null;
    this.querySelector('[data-target-select]').value = this.target;
    this.updateFontSizeControls();
    this.applyFont();
    this.applyFontSize();
    const defaultFontOption = fontOptions[this.font];
    this.querySelector('[data-format-font]').value = defaultFontOption?.stack || defaultFontOption?.family || '';
    this.querySelector('[data-format-size]').value = '24px';
    this.querySelector('[data-format-weight]').value = '600';
    this.setMode('itrans');
    this.uiDialog = createUiDialog(this);
    this.audioController = createAudioController(this);
    this.documentController = createDocumentController(this, WIDGET_VERSION);
    this.richTextController = createRichTextController(this);
    this.trackAudioUpdated = () => { this._audioLastUpdatedAt = new Date().toISOString(); };
    this.addEventListener('audiochange', this.trackAudioUpdated);
    if (this._initialHtml !== undefined) {
      const initialHtml = this._initialHtml;
      delete this._initialHtml;
      this.htmlValue = initialHtml;
    }
    const deleteWidget = this.querySelector('[data-delete-widget]');
    deleteWidget.hidden = !this.hasAttribute('data-itarea-generated');
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
    const legacySizeHelp = [...helpDialog.querySelectorAll('li')]
      .find(item => item.textContent.includes('upper size field'));
    if (legacySizeHelp) {
      legacySizeHelp.textContent = 'The font selector beside the modes and the formatting size, color, and weight controls apply to selected text or to subsequent typing at the caret.';
      legacySizeHelp.insertAdjacentHTML('afterend', '<li>Use the Expand icon beside Duplicate to turn automatic height expansion on or off.</li><li>Use Tags to attach queryable name/value metadata. The required type=rich-text-audio tag cannot be changed or deleted.</li>');
    }
    helpDialog.querySelector('h2').insertAdjacentHTML('afterend', '<p><strong>Shortcuts:</strong> Ctrl+S/Ctrl+I toggle iTrans and English; Ctrl+R toggles Roman and iTrans; Ctrl+O toggles English and iTrans; Ctrl+E and Escape select English. Ctrl+Z/Ctrl+U undo and Ctrl+Shift+Z/Ctrl+Shift+U redo.</p><p>The default text style is 24px Demi. ITF Devanagari is used when installed, with bundled Noto Sans Devanagari as fallback. Formatting controls include four-character decrease/increase indentation.</p><p>Optionally enable the global <strong>iTrans disable seq.</strong> setting. Typing its sequence (default: <code> = </code>) temporarily switches the current line to English; Enter restores the previous transliteration mode.</p>');
    this.querySelector('[data-help]').addEventListener('click', () => { helpDialog.hidden = false; });
    this.querySelector('[data-help-close]').addEventListener('click', () => { helpDialog.hidden = true; });
    helpDialog.addEventListener('click', event => { if (event.target === helpDialog) helpDialog.hidden = true; });
    this.closeHelpOnEscape = event => {
      if (event.key === 'Escape' && !helpDialog.hidden) {
        event.preventDefault(); event.stopPropagation(); helpDialog.hidden = true;
      }
    };
    document.addEventListener('keydown', this.closeHelpOnEscape, true);
    const tagsDialog = this.querySelector('[data-tags-dialog]');
    const tagNameInput = this.querySelector('[data-tag-name]');
    const tagValueInput = this.querySelector('[data-tag-value]');
    const closeTags = () => {
      tagsDialog.hidden = true;
      this.querySelector('[data-tags-error]').hidden = true;
      tagsButton.focus();
    };
    tagsButton.addEventListener('click', () => {
      this.renderTags();
      tagsDialog.hidden = false;
      tagNameInput.focus();
    });
    this.querySelector('[data-tags-close]').addEventListener('click', closeTags);
    tagsDialog.addEventListener('click', event => { if (event.target === tagsDialog) closeTags(); });
    this.closeTagsOnEscape = event => {
      if (event.key === 'Escape' && !tagsDialog.hidden) {
        event.preventDefault();
        event.stopPropagation();
        closeTags();
      }
    };
    document.addEventListener('keydown', this.closeTagsOnEscape, true);
    this.querySelector('[data-tags-form]').addEventListener('submit', event => {
      event.preventDefault();
      try {
        this.setTag(tagNameInput.value, tagValueInput.value);
        tagNameInput.value = '';
        tagValueInput.value = '';
        this.querySelector('[data-tags-error]').hidden = true;
        tagNameInput.focus();
      } catch (error) {
        const message = this.querySelector('[data-tags-error]');
        message.textContent = error.message;
        message.hidden = false;
      }
    });
    this.querySelector('[data-tags-body]').addEventListener('click', event => {
      const button = event.target.closest('[data-tag-delete]');
      if (button) this.removeTag(button.dataset.tagDelete);
    });
    const applyGlobally = this.querySelector('[data-apply-globally]');
    applyGlobally.addEventListener('change', () => {
      if (applyGlobally.checked) {
        setITranslatorTarget(this.target);
        setITranslatorFontSize(this.fontSize);
      }
    });
    this.querySelector('[data-target-select]').addEventListener('change', event => {
      if (applyGlobally.checked) setITranslatorTarget(event.target.value); else this.setTarget(event.target.value);
    });
    autoExpandToggle.addEventListener('click', () => this.setAutoExpand(!this.autoExpand));
    this.querySelector('[data-width-resize]').addEventListener('change', event => this.setWidthResizable(event.target.checked));
    this.querySelector('[data-duplicate-audio]').addEventListener('change', event => { this.duplicateAudio = event.target.checked; });
    const disableToggle = this.querySelector('[data-disable-sequence-enabled]');
    const disableInput = this.querySelector('[data-disable-sequence]');
    this.syncDisableSequenceSetting = () => {
      disableToggle.checked = disableSequenceEnabled;
      disableInput.value = disableSequence;
    };
    this.syncDisableSequenceSetting();
    disableToggle.addEventListener('change', () => setITranslatorDisableSequence(disableToggle.checked, disableInput.value));
    disableInput.addEventListener('input', () => setITranslatorDisableSequence(disableToggle.checked, disableInput.value));
    this.querySelector('[data-resize-handle]').addEventListener('pointerdown', event => this.startManualResize(event));
    this.querySelector('[data-width-handle]').addEventListener('pointerdown', event => this.startManualWidthResize(event));
    this.querySelector('[data-new]').addEventListener('click', () => this.createSibling(false));
    this.querySelector('[data-duplicate]').addEventListener('click', () => this.createSibling(true));
    deleteWidget.addEventListener('click', () => this.deleteGeneratedWidget());
    this.querySelector('[data-copy]').addEventListener('click', async () => {
      this.flushBuffer();
      const button = this.querySelector('[data-copy]');
      const feedback = this.querySelector('[data-copy-feedback]');
      clearTimeout(this.copyFeedbackTimer);
      try {
        const plain = this.value;
        const html = this.htmlValue;
        if (navigator.clipboard.write && globalThis.ClipboardItem) {
          try {
            await navigator.clipboard.write([new ClipboardItem({
              'text/plain': new Blob([plain], { type: 'text/plain' }),
              'text/html': new Blob([html], { type: 'text/html' }),
            })]);
          } catch {
            // Some browsers expose rich clipboard APIs but deny them on local
            // file pages. Preserve the existing plain-text copy behavior.
            await navigator.clipboard.writeText(plain);
          }
        } else await navigator.clipboard.writeText(plain);
        button.innerHTML = copiedIcon;
        button.classList.add('is-copied');
        button.title = 'Copied';
        button.setAttribute('aria-label', 'Copied');
        feedback.textContent = 'Copied';
        feedback.classList.remove('error');
      } catch {
        feedback.textContent = 'Copy failed';
        feedback.classList.add('error');
      }
      feedback.hidden = false;
      this.copyFeedbackTimer = setTimeout(() => {
        button.innerHTML = copyIcon;
        button.classList.remove('is-copied');
        button.title = 'Copy text';
        button.setAttribute('aria-label', 'Copy text');
        feedback.hidden = true;
      }, 1800);
    });
    this.input.addEventListener('keydown', event => this.handleKeydown(event));
    this.input.addEventListener('input', () => {
      this._contentLastUpdatedAt = new Date().toISOString();
      this.adjustHeight();
      this.scheduleHistoryBoundary();
      this.audioController?.markTextChanged();
      this.documentController?.markDirty();
    });
    this.input.addEventListener('paste', event => this.handlePaste(event));
    this.input.addEventListener('blur', () => this.flushBuffer());
    this.input.addEventListener('pointerdown', () => this.flushBuffer());
    this.adjustHeight();
    this.updateActionVisibility();
  }

  get transliterate() { return createTransliterator(pageConfig, this.mode === 'roman' ? 'sanskrit-iast' : this.target); }

  disconnectedCallback() {
    document.removeEventListener('click', this.closeSettingsWhenClickedOutside);
    document.removeEventListener('keydown', this.closeSettingsOnEscape, true);
    document.removeEventListener('keydown', this.closeHelpOnEscape, true);
    document.removeEventListener('keydown', this.closeTagsOnEscape, true);
    this.actionResizeObserver?.disconnect();
    this.audioController?.destroy();
    this.documentController?.destroy();
    this.richTextController?.destroy();
    this.uiDialog?.destroy();
    this.removeEventListener('audiochange', this.trackAudioUpdated);
    clearTimeout(this.copyFeedbackTimer);
    clearTimeout(this.historyTimer);
  }

  applyFont() {
    const option = pageConfig.fonts?.options?.[this.font];
    const family = option?.family || 'system-ui';
    const cssFamily = family === 'system-ui' ? 'system-ui' : `"${family}"`;
    this.style.setProperty('--itarea-font-family', option?.stack || `${cssFamily}, system-ui, sans-serif`);
  }

  setTarget(target) {
    if (!pageConfig.targets[target]) throw new Error(`Unsupported target: ${target}`);
    this.flushBuffer();
    this.target = target;
    this.querySelector('[data-target-select]').value = target;
    this.updateModeIndicator();
    this.documentController?.markDirty();
  }

  supportsTarget(target) { return Boolean(pageConfig.targets[target]); }

  setFont(font) {
    if (!pageConfig.fonts?.options?.[font]) throw new Error(`Unsupported font: ${font}`);
    this.font = font;
    this.applyFont();
    this.documentController?.markDirty();
  }

  setFontSize(size) {
    this.fontSize = normalizeFontSize(size);
    this.updateFontSizeControls();
    this.applyFontSize();
    this.adjustHeight();
    this.documentController?.markDirty();
  }

  applyFontSize() {
    this.style.setProperty('--itarea-font-size', this.fontSize);
  }

  updateFontSizeControls() {
    const value = Number.parseInt(this.fontSize, 10);
    const defaultSizeInput = this.querySelector('[data-font-size-value]');
    if (defaultSizeInput) defaultSizeInput.value = value;
  }

  adjustHeight() {
    if (!this.autoExpand) return;
    this.input.style.height = 'auto';
    this.input.style.height = `${Math.max(this.input.scrollHeight, 128)}px`;
  }

  syncAutoExpandToggle() {
    const toggle = this.querySelector('[data-auto-expand]');
    if (!toggle) return;
    const label = this.autoExpand ? 'Auto-expand on' : 'Auto-expand off';
    toggle.classList.toggle('active', this.autoExpand);
    toggle.setAttribute('aria-pressed', String(this.autoExpand));
    toggle.setAttribute('aria-label', label);
    toggle.title = label;
  }

  setAutoExpand(enabled, updateHeight = true) {
    this.autoExpand = Boolean(enabled);
    this.syncAutoExpandToggle();
    if (!updateHeight) return;
    if (this.autoExpand) this.adjustHeight();
    else this.input.style.height = '';
  }

  get tags() {
    const source = this._tags || new Map([[DEFAULT_TAG_NAME, DEFAULT_TAG_VALUE]]);
    return [...source].map(([name, value]) => ({ name, value }));
  }

  set tags(value) {
    if (!this.isConnected || !this._tags) this._initialTags = value;
    else this.setTags(value);
  }

  getTag(name) {
    return this._tags?.get(String(name).trim());
  }

  setTags(value, { notify = true } = {}) {
    const entries = Array.isArray(value)
      ? value.map(tag => [tag?.name, tag?.value])
      : Object.entries(value || {});
    if (entries.length > MAX_TAGS) throw new Error(`A text area can have at most ${MAX_TAGS} tags.`);
    const next = new Map([[DEFAULT_TAG_NAME, DEFAULT_TAG_VALUE]]);
    for (const [rawName, rawValue] of entries) {
      const name = String(rawName ?? '').trim();
      const tagValue = String(rawValue ?? '').trim();
      if (!name || !tagValue) throw new Error('Tag name and value are required.');
      if (name.length > MAX_TAG_NAME_LENGTH || tagValue.length > MAX_TAG_VALUE_LENGTH) throw new Error('A tag name or value is too long.');
      if (name === DEFAULT_TAG_NAME && tagValue !== DEFAULT_TAG_VALUE) throw new Error(`The required ${DEFAULT_TAG_NAME} tag cannot be changed.`);
      if (name !== DEFAULT_TAG_NAME) next.set(name, tagValue);
    }
    this._tags = next;
    this.renderTags();
    if (notify) this.notifyTagsChanged();
  }

  setTag(name, value) {
    const cleanName = String(name ?? '').trim();
    const cleanValue = String(value ?? '').trim();
    if (!cleanName || !cleanValue) throw new Error('Tag name and value are required.');
    if (cleanName.length > MAX_TAG_NAME_LENGTH || cleanValue.length > MAX_TAG_VALUE_LENGTH) throw new Error('A tag name or value is too long.');
    if (cleanName === DEFAULT_TAG_NAME) {
      if (cleanValue !== DEFAULT_TAG_VALUE) throw new Error(`The required ${DEFAULT_TAG_NAME} tag cannot be changed.`);
      return;
    }
    if (!this._tags.has(cleanName) && this._tags.size >= MAX_TAGS) throw new Error(`A text area can have at most ${MAX_TAGS} tags.`);
    if (this._tags.get(cleanName) === cleanValue) return;
    this._tags.set(cleanName, cleanValue);
    this.renderTags();
    this.notifyTagsChanged();
  }

  removeTag(name) {
    const cleanName = String(name ?? '').trim();
    if (!cleanName || cleanName === DEFAULT_TAG_NAME || !this._tags.delete(cleanName)) return false;
    this.renderTags();
    this.notifyTagsChanged();
    return true;
  }

  renderTags() {
    const body = this.querySelector?.('[data-tags-body]');
    if (!body || !this._tags) return;
    body.replaceChildren();
    for (const [name, value] of this._tags) {
      const row = document.createElement('tr');
      const nameCell = document.createElement('td');
      const valueCell = document.createElement('td');
      const deleteCell = document.createElement('td');
      nameCell.textContent = name;
      valueCell.textContent = value;
      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = 'Delete';
      button.dataset.tagDelete = name;
      button.disabled = name === DEFAULT_TAG_NAME;
      button.title = button.disabled ? 'Required tag — cannot be deleted' : `Delete ${name}`;
      deleteCell.append(button);
      row.append(nameCell, valueCell, deleteCell);
      body.append(row);
    }
  }

  notifyTagsChanged() {
    const detail = { tags: this.tags };
    this.dispatchEvent(new CustomEvent('tagschange', { bubbles: true, detail }));
  }

  startManualResize(event) {
    event.preventDefault();
    const startY = event.clientY;
    const startHeight = this.input.getBoundingClientRect().height;
    const minHeight = parseFloat(getComputedStyle(this.input).minHeight);
    this.setAutoExpand(false, false);
    const resize = move => {
      this.input.style.height = `${Math.max(minHeight, startHeight + move.clientY - startY)}px`;
      this.updateActionVisibility();
    };
    const finish = () => {
      window.removeEventListener('pointermove', resize);
      window.removeEventListener('pointerup', finish);
    };
    window.addEventListener('pointermove', resize);
    window.addEventListener('pointerup', finish, { once: true });
  }

  setWidthResizable(enabled) {
    this.widthResizable = Boolean(enabled);
    const handle = this.querySelector('[data-width-handle]');
    const toggle = this.querySelector('[data-width-resize]');
    handle.hidden = !this.widthResizable;
    toggle.checked = this.widthResizable;
    if (this.widthResizable) {
      this.style.display = 'block';
      this.style.maxWidth = '100%';
      this.style.width = `${Math.round(this.getBoundingClientRect().width)}px`;
    } else {
      this.style.width = '';
      this.style.maxWidth = '';
    }
  }

  startManualWidthResize(event) {
    if (!this.widthResizable) return;
    event.preventDefault();
    const startX = event.clientX;
    const box = this.getBoundingClientRect();
    const startWidth = box.width;
    const maxWidth = Math.max(260, (this.parentElement?.getBoundingClientRect().right || box.right) - box.left);
    const resize = move => {
      this.style.width = `${Math.round(Math.min(maxWidth, Math.max(260, startWidth + move.clientX - startX)))}px`;
      this.adjustHeight();
    };
    const finish = () => {
      window.removeEventListener('pointermove', resize);
      window.removeEventListener('pointerup', finish);
    };
    window.addEventListener('pointermove', resize);
    window.addEventListener('pointerup', finish, { once: true });
  }

  async createSibling(duplicate) {
    const created = document.createElement('i-translator-textarea');
    created.setAttribute('label', this.getAttribute('label') || 'Text');
    created.setAttribute('audio-id', generatedWidgetId());
    created.setAttribute('data-itarea-generated', '');
    this.insertAdjacentElement('afterend', created);
    created.setTarget(this.target);
    created.setFont(this.font);
    created.setFontSize(this.fontSize);
    if (duplicate) {
      created.setAutoExpand(this.autoExpand);
      created.setMode(this.mode);
      created.htmlValue = this.htmlValue;
      created.tags = this.tags;
    }
    if (duplicate && this.duplicateAudio) {
      try {
        const audio = await this.audioController.exportWav();
        if (audio) await created.audioController.importAudio(audio.blob);
      } catch { /* Text duplication remains useful if audio storage is unavailable. */ }
    }
    created.input.focus();
    this.dispatchEvent(new CustomEvent(duplicate ? 'widgetduplicate' : 'widgetnew', { bubbles: true, detail: { source: this, widget: created } }));
  }

  async deleteGeneratedWidget() {
    if (!this.hasAttribute('data-itarea-generated')) return;
    const hasContent = Boolean(this.value.trim() || this.audioBlob || this.tags.length > 1);
    if (hasContent && !await this.uiDialog.confirm('Delete this new text area and its unsaved content?', { title: 'Delete text area?', confirmLabel: 'Delete', danger: true })) return;
    this.remove();
  }

  updateModeIndicator() {
    const element = indicator(this);
    const modeName = this.mode === 'english'
      ? 'No transliteration'
      : this.mode === 'roman'
        ? 'Roman'
        : pageConfig.targets[this.target].label;
    element.textContent = '';
    element.hidden = true;
    const settings = this.querySelector('[data-settings]');
    settings.title = `${modeName} — Settings`;
    settings.setAttribute('aria-label', settings.title);
  }

  maybeDisableTransliterationForLine() {
    if (!disableSequenceEnabled || !disableSequence || this.mode === 'english' || this.lineRestoreMode) return;
    const beforeCursor = this.textBeforeCaret();
    if (!beforeCursor.endsWith(disableSequence)) return;
    this.lineRestoreMode = this.mode;
    this.setMode('english', { keepLineRestoreMode: true });
  }

  snapshot() {
    return { value: this.input.innerHTML };
  }

  snapshotsMatch(left, right) {
    return left && right && left.value === right.value;
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
    this.input.innerHTML = sanitizeRichHtml(snapshot.value);
    this.placeCaretAtEnd();
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

  setMode(mode, { keepLineRestoreMode = false } = {}) {
    this.flushBuffer();
    if (!keepLineRestoreMode) this.lineRestoreMode = null;
    this.mode = mode;
    this.querySelectorAll('[data-mode]').forEach(button => button.classList.toggle('active', button.dataset.mode === mode));
    this.input.classList.toggle('itarea__english', mode === 'english');
    this.input.classList.toggle('itarea__roman', mode === 'roman');
    this.input.dataset.placeholder = mode === 'english' ? 'Type English' : 'Type Sanskrit with ITRANS';
    this.updateModeIndicator();
    this.documentController?.markDirty();
    this.input.focus();
  }

  handleKeydown(event) {
    const settings = this.querySelector('.itarea__settings');
    if (event.key === 'Escape' && !settings.hidden) {
      event.preventDefault(); settings.hidden = true; return;
    }
    if (event.key === 'Enter' && this.lineRestoreMode) {
      const restoreMode = this.lineRestoreMode;
      this.lineRestoreMode = null;
      this.setMode(restoreMode, { keepLineRestoreMode: true });
      return;
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
    const text = event.clipboardData?.getData('text/plain');
    if (text === undefined) return;
    event.preventDefault();
    this.beginHistoryBatch();
    this.flushBuffer();
    this.insertAtSelection(this.mode === 'english' ? text : this.transliterate(text));
    this.adjustHeight();
    this.audioController?.markTextChanged();
    this.documentController?.markDirty();
    this.maybeDisableTransliterationForLine();
    this.endHistoryBatch();
  }

  replaceBuffer() {
    const rendered = this.transliterate(this.rawBuffer);
    if (this.bufferRange && this.input.contains(this.bufferRange.commonAncestorContainer)) {
      this.selectRange(this.bufferRange);
      if (!rendered) {
        this.bufferRange.deleteContents();
        this.bufferRange.collapse(true);
        this.selectRange(this.bufferRange);
      } else this.insertAtSelection(rendered);
    } else if (rendered) this.insertAtSelection(rendered);
    this.bufferRange = this.rangeBeforeCaret(rendered.length);
    this.adjustHeight();
    this.audioController?.markTextChanged();
    this.documentController?.markDirty();
    this.maybeDisableTransliterationForLine();
  }

  flushBuffer() {
    this.rawBuffer = '';
    this.bufferRange = null;
  }

  selectRange(range) {
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
  }

  insertAtSelection(text) {
    this.input.focus();
    document.execCommand('insertText', false, text);
  }

  rangeBeforeCaret(length) {
    const selection = window.getSelection();
    if (!selection?.rangeCount) return null;
    const caret = selection.getRangeAt(0);
    if (!caret.collapsed || caret.startContainer.nodeType !== Node.TEXT_NODE || caret.startOffset < length) return null;
    const range = document.createRange();
    range.setStart(caret.startContainer, caret.startOffset - length);
    range.setEnd(caret.startContainer, caret.startOffset);
    return range;
  }

  textBeforeCaret() {
    const selection = window.getSelection();
    if (!selection?.rangeCount || !this.input.contains(selection.anchorNode)) return '';
    const caret = selection.getRangeAt(0);
    const range = document.createRange();
    range.selectNodeContents(this.input);
    range.setEnd(caret.startContainer, caret.startOffset);
    return range.toString();
  }

  placeCaretAtEnd() {
    this.input.focus();
    const range = document.createRange();
    range.selectNodeContents(this.input);
    range.collapse(false);
    this.selectRange(range);
  }

  get value() { this.flushBuffer(); return this.input.innerText.replaceAll('\u200b', ''); }

  set value(value) {
    const text = String(value ?? '');
    if (!this.input) {
      this._initialValue = text;
      return;
    }
    this.flushBuffer();
    this.input.textContent = text;
    this._contentLastUpdatedAt = new Date().toISOString();
    this.clearHistory();
    this.adjustHeight();
    this.audioController?.markTextChanged();
    this.documentController?.markDirty();
  }

  get htmlValue() {
    this.flushBuffer();
    return this.richTextController ? this.richTextController.html : sanitizeRichHtml(this.input?.innerHTML || this._initialHtml || '');
  }

  set htmlValue(value) {
    const html = String(value || '');
    if (!this.input) { this._initialHtml = html; return; }
    this.flushBuffer();
    if (this.richTextController) this.richTextController.setHtml(html);
    else this.input.innerHTML = sanitizeRichHtml(html);
    this._contentLastUpdatedAt = new Date().toISOString();
    this.clearHistory();
    this.adjustHeight();
    this.audioController?.markTextChanged();
    this.documentController?.markDirty();
  }

  get audioBlob() { return this.audioController?.blob || null; }

  get audioDurationMs() { return this.audioController?.durationMs || 0; }

  _setLastUpdatedTimes({ content, audio } = {}) {
    this._contentLastUpdatedAt = content || null;
    this._audioLastUpdatedAt = audio || null;
  }

  getState() {
    const label = this.getAttribute('label') || null;
    const audioId = this.getAttribute('audio-id') || null;
    const instanceName = this.getAttribute('name') || this.id || audioId || label;
    return {
      instanceName,
      widgetVersion: WIDGET_VERSION,
      widgetUpdatedAt: WIDGET_UPDATED_ISO,
      tags: this.tags,
      content: {
        text: this.value,
        html: this.htmlValue,
        lastUpdatedAt: this._contentLastUpdatedAt,
      },
      defaultStyle: {
        font: this.font,
        fontSize: this.fontSize,
        fontWeight: 600,
      },
      audio: {
        blob: this.audioBlob,
        durationMs: this.audioDurationMs,
        lastUpdatedAt: this._audioLastUpdatedAt,
      },
      layout: {
        autoExpand: this.autoExpand,
        heightResizable: true,
        widthResizable: this.widthResizable,
      },
      language: this.target,
      mode: this.mode,
      duplicateAudio: this.duplicateAudio,
      dirty: this.documentController?.dirty ?? Boolean(this.value.trim()),
      attributes: {
        id: this.id || null,
        name: this.getAttribute('name') || null,
        label,
        audioId,
      },
    };
  }
}

customElements.define('i-translator-textarea', ITranslatorTextarea);
