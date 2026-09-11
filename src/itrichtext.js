const COLOR_PRESETS = [
  '#000000', '#434343', '#666666', '#999999', '#b7b7b7', '#cccccc',
  '#980000', '#ff0000', '#ff9900', '#ffff00', '#00ff00', '#00ffff',
  '#4a86e8', '#0000ff', '#9900ff', '#ff00ff', '#e6b8af', '#f4cccc',
  '#fce5cd', '#fff2cc', '#d9ead3', '#d0e0e3', '#c9daf8', '#cfe2f3',
  '#d9d2e9', '#ead1dc', '#a61c00', '#cc0000', '#e69138', '#f1c232',
  '#6aa84f', '#45818e', '#3c78d8', '#3d85c6', '#674ea7', '#a64d79',
];

const ALLOWED_TAGS = new Set(['A', 'B', 'BR', 'DIV', 'EM', 'I', 'LI', 'OL', 'P', 'SPAN', 'STRONG', 'U', 'UL']);
const ALLOWED_STYLES = new Set(['color', 'font-family', 'font-size', 'font-weight', 'line-height', 'margin-left', 'text-align']);
const SIZE_OPTIONS = [14, 16, 18, 20, 22, 24, 28, 32, 36, 40, 44, 48];
const WEIGHT_OPTIONS = [['Normal', '400'], ['Medium', '500'], ['Demi', '600'], ['Bold', '700']];
const LINE_HEIGHT_STEPS = [1, 1.15, 1.3, 1.5, 1.75, 2, 2.5, 3];
const INDENT_STEP_CH = 4;
const MAX_INDENT_CH = 40;

const icon = path => `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${path}"/></svg>`;
const icons = {
  bullets: icon('M4 10.5c.83 0 1.5-.67 1.5-1.5S4.83 7.5 4 7.5 2.5 8.17 2.5 9s.67 1.5 1.5 1.5Zm0 6c.83 0 1.5-.67 1.5-1.5S4.83 13.5 4 13.5 2.5 14.17 2.5 15s.67 1.5 1.5 1.5Zm0-12C4.83 4.5 5.5 3.83 5.5 3S4.83 1.5 4 1.5 2.5 2.17 2.5 3 3.17 4.5 4 4.5ZM8 16h14v-2H8v2Zm0-6h14V8H8v2Zm0-8v2h14V2H8Z'),
  numbers: icon('M2 17h2v.5H3v1h1v.5H2v1h3v-4H2v1Zm1-9h1V4H2v1h1v3Zm-1 3h1.8L2 13.1v.9h3v-1H3.2L5 10.9V10H2v1Zm6 7h14v-2H8v2Zm0-7h14V9H8v2Zm0-7v2h14V4H8Z'),
  left: icon('M3 5h18v2H3V5Zm0 4h12v2H3V9Zm0 4h18v2H3v-2Zm0 4h12v2H3v-2Z'),
  center: icon('M3 5h18v2H3V5Zm3 4h12v2H6V9Zm-3 4h18v2H3v-2Zm3 4h12v2H6v-2Z'),
  right: icon('M3 5h18v2H3V5Zm6 4h12v2H9V9Zm-6 4h18v2H3v-2Zm6 4h12v2H9v-2Z'),
  link: icon('M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7a5 5 0 0 0 0 10h4v-1.9H7A3.1 3.1 0 0 1 3.9 12ZM8 13h8v-2H8v2Zm9-6h-4v1.9h4a3.1 3.1 0 1 1 0 6.2h-4V17h4a5 5 0 0 0 0-10Z'),
};

const escapeAttribute = value => String(value).replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');

export function richTextToolbarMarkup(fontOptions = {}, defaultFont = '') {
  const colors = COLOR_PRESETS.map(value => `<button type="button" class="itarea__color-preset" data-format-color="${value}" style="--swatch:${value}" title="${value}" aria-label="Text color ${value}"></button>`).join('');
  const sizes = SIZE_OPTIONS.map(value => `<option value="${value}px"${value === 24 ? ' selected' : ''}>${value}</option>`).join('');
  const weights = WEIGHT_OPTIONS.map(([label, value]) => `<option value="${value}"${value === '600' ? ' selected' : ''}>${label}</option>`).join('');
  const fonts = Object.entries(fontOptions).map(([id, font]) => `<option value="${escapeAttribute(font.stack || font.family)}"${id === defaultFont ? ' selected' : ''}>${escapeAttribute(font.label)}</option>`).join('');
  return `<div class="itarea__format-bar" role="toolbar" aria-label="Text formatting">
    <button type="button" data-format-command="bold" title="Bold" aria-label="Bold"><strong>B</strong></button>
    <button type="button" data-format-command="italic" title="Italic" aria-label="Italic"><em>I</em></button>
    <button type="button" data-format-command="underline" title="Underline" aria-label="Underline"><u>U</u></button>
    <button type="button" data-format-command="insertUnorderedList" title="Bulleted list" aria-label="Bulleted list">${icons.bullets}</button>
    <button type="button" data-format-command="insertOrderedList" title="Numbered list" aria-label="Numbered list">${icons.numbers}</button>
    <span class="itarea__color-control"><button type="button" data-color-toggle title="Text color" aria-label="Text color"><span class="itarea__color-letter">A</span><span class="itarea__chevron">▾</span></button><span class="itarea__color-palette" data-color-palette hidden>${colors}<label class="itarea__custom-color">Custom color <input type="color" data-custom-color value="#774b0a"></label></span></span>
    <label class="itarea__format-select itarea__format-font" title="Selected text font"><select data-format-font aria-label="Selected text font"><option value="">Font</option>${fonts}</select></label>
    <label class="itarea__format-select" title="Selected text size"><span>F</span><select data-format-size aria-label="Selected text size"><option value="">Size</option>${sizes}</select></label>
    <label class="itarea__format-select"><select data-format-weight aria-label="Font weight"><option value="">Weight</option>${weights}</select></label>
    <button type="button" class="itarea__block-format" data-line-spacing="decrease" title="Decrease line spacing" aria-label="Decrease line spacing"><span class="itarea__material-symbol">format_line_spacing</span><small>−</small></button>
    <button type="button" class="itarea__block-format" data-line-spacing="increase" title="Increase line spacing" aria-label="Increase line spacing"><span class="itarea__material-symbol">format_line_spacing</span><small>+</small></button>
    <button type="button" class="itarea__block-format" data-indent="decrease" title="Decrease indent by 4 character spaces" aria-label="Decrease indent by 4 character spaces"><span class="itarea__material-symbol">format_indent_decrease</span></button>
    <button type="button" class="itarea__block-format" data-indent="increase" title="Increase indent by 4 character spaces" aria-label="Increase indent by 4 character spaces"><span class="itarea__material-symbol">format_indent_increase</span></button>
    <button type="button" data-format-command="justifyLeft" title="Left align" aria-label="Left align">${icons.left}</button>
    <button type="button" data-format-command="justifyCenter" title="Center align" aria-label="Center align">${icons.center}</button>
    <button type="button" data-format-command="justifyRight" title="Right align" aria-label="Right align">${icons.right}</button>
    <button type="button" data-format-link title="Add or edit link" aria-label="Add or edit link">${icons.link}</button>
    <button type="button" data-format-clear title="Remove formatting" aria-label="Remove formatting"><span class="itarea__clear-format">T×</span></button>
  </div>`;
}

function cleanStyle(element) {
  for (const property of [...element.style]) {
    const value = element.style.getPropertyValue(property).trim();
    const allowed = ALLOWED_STYLES.has(property)
      && (property !== 'font-size' || /^([1-4][0-9])px$/.test(value))
      && (property !== 'font-family' || /^[\w\s,"'-]+$/u.test(value))
      && (property !== 'font-weight' || /^(400|500|600|700|normal|bold)$/.test(value))
      && (property !== 'line-height' || /^(1(?:\.\d+)?|2(?:\.\d+)?|3)$/.test(value))
      && (property !== 'margin-left' || /^(?:[048]|1[26]|2[048]|3[26]|40)ch$/.test(value))
      && (property !== 'text-align' || /^(left|center|right)$/.test(value))
      && (property !== 'color' || /^(#[0-9a-f]{3,8}|rgba?\([\d\s,.%]+\))$/i.test(value));
    if (!allowed) element.style.removeProperty(property);
  }
  if (!element.getAttribute('style')) element.removeAttribute('style');
}

export function sanitizeRichHtml(html) {
  const template = document.createElement('template');
  template.innerHTML = String(html || '');
  const visit = node => {
    for (const child of [...node.childNodes]) {
      if (child.nodeType === Node.COMMENT_NODE) { child.remove(); continue; }
      if (child.nodeType !== Node.ELEMENT_NODE) continue;
      if (!ALLOWED_TAGS.has(child.tagName)) {
        child.replaceWith(...child.childNodes);
        visit(node);
        continue;
      }
      for (const attribute of [...child.attributes]) {
        if (attribute.name !== 'style' && !(child.tagName === 'A' && ['href', 'target', 'rel'].includes(attribute.name))) child.removeAttribute(attribute.name);
      }
      cleanStyle(child);
      if (child.tagName === 'A') {
        const href = child.getAttribute('href') || '';
        if (!/^https?:\/\//i.test(href)) child.removeAttribute('href');
        else { child.target = '_blank'; child.rel = 'noopener noreferrer'; }
      }
      visit(child);
    }
  };
  visit(template.content);
  return template.innerHTML.replaceAll('\u200b', '');
}

function selectionInside(editor) {
  const selection = window.getSelection();
  return selection?.rangeCount && editor.contains(selection.anchorNode) ? selection.getRangeAt(0) : null;
}

function rangeOverlapsTextNode(range, node) {
  if (!node.length) return false;
  try {
    return range.intersectsNode(node);
  } catch {
    return false;
  }
}

function textOffsetsForRange(editor, range) {
  const before = document.createRange();
  before.selectNodeContents(editor);
  before.setEnd(range.startContainer, range.startOffset);
  return { start: before.toString().length, end: before.toString().length + range.toString().length };
}

function restoreRangeFromTextOffsets(editor, offsets) {
  const walker = document.createTreeWalker(editor, NodeFilter.SHOW_TEXT);
  let position = 0;
  let start = null;
  let end = null;
  let node;
  while ((node = walker.nextNode())) {
    const next = position + node.length;
    if (!start && offsets.start <= next) start = { node, offset: Math.max(0, offsets.start - position) };
    if (!end && offsets.end <= next) { end = { node, offset: Math.max(0, offsets.end - position) }; break; }
    position = next;
  }
  if (!start || !end) return null;
  const range = document.createRange();
  range.setStart(start.node, Math.min(start.offset, start.node.length));
  range.setEnd(end.node, Math.min(end.offset, end.node.length));
  const selection = window.getSelection();
  selection.removeAllRanges();
  selection.addRange(range);
  return range;
}

export function createRichTextController(widget) {
  const editor = widget.input;
  const toolbar = widget.querySelector('.itarea__format-bar');
  const palette = widget.querySelector('[data-color-palette]');
  const colorToggle = widget.querySelector('[data-color-toggle]');
  const fontSelect = widget.querySelector('[data-format-font]');
  const sizeSelect = widget.querySelector('[data-format-size]');
  const weightSelect = widget.querySelector('[data-format-weight]');
  let savedRange = null;

  const elementsInRange = range => {
    if (range.collapsed) {
      const element = range.startContainer.nodeType === Node.ELEMENT_NODE ? range.startContainer : range.startContainer.parentElement;
      return element ? [element] : [];
    }
    const elements = [];
    const walker = document.createTreeWalker(editor, NodeFilter.SHOW_TEXT);
    let node;
    while ((node = walker.nextNode())) if (rangeOverlapsTextNode(range, node)) elements.push(node.parentElement);
    return elements.filter(Boolean);
  };

  const oneComputedValue = (range, property, normalize = value => value) => {
    const values = new Set(elementsInRange(range).map(element => normalize(getComputedStyle(element)[property])).filter(Boolean));
    return values.size === 1 ? [...values][0] : '';
  };

  const updateStates = () => {
    toolbar.querySelectorAll('[data-format-command]').forEach(button => {
      const active = document.queryCommandState(button.dataset.formatCommand);
      button.classList.toggle('active', active);
      button.setAttribute('aria-pressed', String(active));
    });
    if (!savedRange) return;
    const size = oneComputedValue(savedRange, 'fontSize', value => `${Math.round(Number.parseFloat(value))}px`);
    sizeSelect.value = SIZE_OPTIONS.includes(Number.parseInt(size, 10)) ? size : '';
    const weight = oneComputedValue(savedRange, 'fontWeight', value => value === 'normal' ? '400' : value === 'bold' ? '700' : String(Math.round(Number.parseInt(value, 10) / 100) * 100));
    weightSelect.value = WEIGHT_OPTIONS.some(([, value]) => value === weight) ? weight : '';
    const computedFamily = oneComputedValue(savedRange, 'fontFamily', value => value.toLowerCase().replaceAll('"', '').replaceAll("'", ''));
    const matchingFont = [...fontSelect.options].find(option => {
      if (!option.value || !computedFamily) return false;
      const primary = option.value.split(',')[0].trim().toLowerCase().replaceAll('"', '').replaceAll("'", '');
      return computedFamily.includes(primary);
    });
    fontSelect.value = matchingFont?.value || '';
  };

  const remember = () => {
    const range = selectionInside(editor);
    if (range) { savedRange = range.cloneRange(); updateStates(); }
    return savedRange;
  };
  const restore = () => {
    if (!savedRange || !editor.contains(savedRange.commonAncestorContainer)) return false;
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(savedRange.cloneRange());
    return true;
  };
  const changed = () => {
    editor.dispatchEvent(new Event('input', { bubbles: true }));
    remember();
    widget.endHistoryBatch();
  };
  const command = (name, value = null) => {
    widget.beginHistoryBatch();
    if (!restore()) editor.focus();
    document.execCommand('styleWithCSS', false, true);
    document.execCommand(name, false, value);
    changed();
  };
  const applyStyle = (property, value) => {
    widget.beginHistoryBatch();
    if (!restore()) editor.focus();
    const selection = window.getSelection();
    if (!selection?.rangeCount) { widget.endHistoryBatch(); return; }
    const range = selection.getRangeAt(0);
    if (range.collapsed) {
      const span = document.createElement('span');
      span.style.setProperty(property, value);
      const text = document.createTextNode('\u200b');
      span.append(text); range.insertNode(span);
      range.setStart(text, 1); range.collapse(true);
      selection.removeAllRanges(); selection.addRange(range); savedRange = range.cloneRange();
    } else {
      const offsets = textOffsetsForRange(editor, range);
      const textNodes = [];
      const walker = document.createTreeWalker(editor, NodeFilter.SHOW_TEXT);
      let node;
      while ((node = walker.nextNode())) {
        if (!rangeOverlapsTextNode(range, node)) continue;
        const start = node === range.startContainer ? range.startOffset : 0;
        const end = node === range.endContainer ? range.endOffset : node.length;
        if (end > start) textNodes.push({ node, start, end });
      }
      textNodes.reverse().forEach(({ node: textNode, start, end }) => {
        if (end < textNode.length) textNode.splitText(end);
        const selectedNode = start > 0 ? textNode.splitText(start) : textNode;
        const span = document.createElement('span');
        span.style.setProperty(property, value);
        selectedNode.replaceWith(span);
        span.append(selectedNode);
      });
      editor.normalize();
      savedRange = restoreRangeFromTextOffsets(editor, offsets) || savedRange;
    }
    changed();
  };
  const blocksInSelection = () => {
    if (!restore()) editor.focus();
    const range = selectionInside(editor);
    if (!range) return [];
    const blocks = new Set();
    const add = node => {
      const element = node.nodeType === Node.ELEMENT_NODE ? node : node.parentElement;
      blocks.add(element?.closest('div,p,li') || editor);
    };
    add(range.startContainer); add(range.endContainer);
    const walker = document.createTreeWalker(editor, NodeFilter.SHOW_TEXT);
    let node;
    while ((node = walker.nextNode())) { try { if (range.intersectsNode(node)) add(node); } catch {} }
    return [...blocks].filter(Boolean);
  };

  toolbar.addEventListener('pointerdown', event => {
    if (!event.target.closest('input[type="color"]')) { remember(); if (event.target.closest('button')) event.preventDefault(); }
  });
  fontSelect.addEventListener('pointerdown', remember);
  toolbar.querySelectorAll('[data-format-command]').forEach(button => button.addEventListener('click', () => command(button.dataset.formatCommand)));
  fontSelect.addEventListener('change', event => { if (event.target.value) applyStyle('font-family', event.target.value); });
  sizeSelect.addEventListener('change', event => { if (event.target.value) applyStyle('font-size', event.target.value); });
  weightSelect.addEventListener('change', event => { if (event.target.value) applyStyle('font-weight', event.target.value); });
  colorToggle.addEventListener('click', () => { palette.hidden = !palette.hidden; colorToggle.setAttribute('aria-expanded', String(!palette.hidden)); });
  widget.querySelectorAll('[data-format-color]').forEach(button => button.addEventListener('click', () => { applyStyle('color', button.dataset.formatColor); palette.hidden = true; }));
  widget.querySelector('[data-custom-color]').addEventListener('change', event => { applyStyle('color', event.target.value); palette.hidden = true; });
  widget.querySelectorAll('[data-line-spacing]').forEach(button => button.addEventListener('click', () => {
    widget.beginHistoryBatch();
    const increase = button.dataset.lineSpacing === 'increase';
    let blocks = blocksInSelection();
    if (blocks.includes(editor)) {
      command('formatBlock', 'div');
      blocks = blocksInSelection();
    }
    for (const block of blocks) {
      const computed = getComputedStyle(block);
      const current = Number.parseFloat(computed.lineHeight) / Number.parseFloat(computed.fontSize) || 1.5;
      const next = increase
        ? (LINE_HEIGHT_STEPS.find(step => step > current + .01) || LINE_HEIGHT_STEPS.at(-1))
        : ([...LINE_HEIGHT_STEPS].reverse().find(step => step < current - .01) || LINE_HEIGHT_STEPS[0]);
      block.style.lineHeight = String(next);
    }
    changed();
  }));
  widget.querySelectorAll('[data-indent]').forEach(button => button.addEventListener('click', () => {
    widget.beginHistoryBatch();
    const direction = button.dataset.indent === 'increase' ? 1 : -1;
    let blocks = blocksInSelection();
    if (blocks.includes(editor)) {
      command('formatBlock', 'div');
      blocks = blocksInSelection();
    }
    for (const block of blocks.filter(element => element !== editor)) {
      const current = block.style.marginLeft.endsWith('ch') ? Number.parseInt(block.style.marginLeft, 10) || 0 : 0;
      const next = Math.min(MAX_INDENT_CH, Math.max(0, current + direction * INDENT_STEP_CH));
      if (next) block.style.marginLeft = `${next}ch`; else block.style.removeProperty('margin-left');
    }
    changed();
  }));
  widget.querySelector('[data-format-link]').addEventListener('click', async() => {
    if (!restore()) return;
    const range = selectionInside(editor);
    const active = (range?.startContainer.nodeType === Node.ELEMENT_NODE ? range.startContainer : range?.startContainer.parentElement)?.closest?.('a');
    const address = await widget.uiDialog.prompt('Enter a web address beginning with http:// or https://. Leave it blank to remove the current link.', active?.href || 'https://', { title: 'Add or edit link', inputLabel: 'Web address', confirmLabel: 'Apply link' });
    if (address === null) return;
    if (!address.trim()) command('unlink');
    else if (/^https?:\/\//i.test(address.trim())) command('createLink', address.trim());
    else await widget.uiDialog.alert('Please enter a web address beginning with http:// or https://.', { title: 'Invalid web address' });
  });
  widget.querySelector('[data-format-clear]').addEventListener('click', () => { command('removeFormat'); command('unlink'); });
  editor.addEventListener('mouseup', remember);
  editor.addEventListener('keyup', remember);
  editor.addEventListener('focus', remember);
  const outside = event => {
    if (!palette.contains(event.target) && !colorToggle.contains(event.target)) palette.hidden = true;
  };
  const escape = event => {
    if (event.key === 'Escape' && !palette.hidden) { event.preventDefault(); event.stopPropagation(); palette.hidden = true; }
  };
  document.addEventListener('click', outside);
  document.addEventListener('keydown', escape, true);

  return {
    rememberSelection: remember,
    restoreSelection: restore,
    get html() { return sanitizeRichHtml(editor.innerHTML); },
    setHtml(html) { editor.innerHTML = sanitizeRichHtml(html); },
    destroy() { document.removeEventListener('click', outside); document.removeEventListener('keydown', escape, true); },
  };
}
