const DOCUMENT_FORMAT = 'itarea-document';
const DOCUMENT_FORMAT_VERSION = 1;
const MAX_ARCHIVE_BYTES = 150 * 1024 * 1024;
const MAX_MANIFEST_BYTES = 1024 * 1024;
const MAX_TEXT_LENGTH = 5 * 1024 * 1024;
const MAX_ENTRIES = 8;
const MAX_DOCUMENT_TAGS = 100;
const MAX_DOCUMENT_TAG_NAME_LENGTH = 80;
const MAX_DOCUMENT_TAG_VALUE_LENGTH = 500;

export const documentIcons = {
  open: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 6h-8l-2-2H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2Zm0 12H4V8h16v10Zm-8.5-8H7v6h4.5v2H7a2 2 0 0 1-2-2v-6a2 2 0 0 1 2-2h4.5v2ZM18 11l-2.5 2.5V12H12v-2h3.5V8.5L18 11Zm-2.5.5L18 14v-5l-2.5 2.5Z"/></svg>',
  save: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M17 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V7l-4-4Zm2 16H5V5h11.2L19 7.8V19ZM12 18a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm-5-8h8V6H7v4Z"/></svg>',
};

const encoder = new TextEncoder();
const decoder = new TextDecoder();

function crcTable() {
  const table = new Uint32Array(256);
  for (let index = 0; index < 256; index++) {
    let value = index;
    for (let bit = 0; bit < 8; bit++) value = value & 1 ? 0xedb88320 ^ (value >>> 1) : value >>> 1;
    table[index] = value >>> 0;
  }
  return table;
}

const CRC_TABLE = crcTable();

function crc32(bytes) {
  let crc = 0xffffffff;
  for (const byte of bytes) crc = CRC_TABLE[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

function concatBytes(parts) {
  const length = parts.reduce((total, part) => total + part.length, 0);
  const output = new Uint8Array(length);
  let offset = 0;
  for (const part of parts) { output.set(part, offset); offset += part.length; }
  return output;
}

function zipDate(date = new Date()) {
  const year = Math.max(1980, date.getFullYear());
  return {
    time: (date.getHours() << 11) | (date.getMinutes() << 5) | Math.floor(date.getSeconds() / 2),
    date: ((year - 1980) << 9) | ((date.getMonth() + 1) << 5) | date.getDate(),
  };
}

function localHeader(entry, offset) {
  const name = encoder.encode(entry.name);
  const header = new Uint8Array(30 + name.length);
  const view = new DataView(header.buffer);
  const stamp = zipDate();
  view.setUint32(0, 0x04034b50, true);
  view.setUint16(4, 20, true);
  view.setUint16(6, 0x0800, true);
  view.setUint16(8, 0, true);
  view.setUint16(10, stamp.time, true);
  view.setUint16(12, stamp.date, true);
  view.setUint32(14, entry.crc, true);
  view.setUint32(18, entry.data.length, true);
  view.setUint32(22, entry.data.length, true);
  view.setUint16(26, name.length, true);
  view.setUint16(28, 0, true);
  header.set(name, 30);
  return { header, offset };
}

function centralHeader(entry, offset) {
  const name = encoder.encode(entry.name);
  const header = new Uint8Array(46 + name.length);
  const view = new DataView(header.buffer);
  const stamp = zipDate();
  view.setUint32(0, 0x02014b50, true);
  view.setUint16(4, 20, true);
  view.setUint16(6, 20, true);
  view.setUint16(8, 0x0800, true);
  view.setUint16(10, 0, true);
  view.setUint16(12, stamp.time, true);
  view.setUint16(14, stamp.date, true);
  view.setUint32(16, entry.crc, true);
  view.setUint32(20, entry.data.length, true);
  view.setUint32(24, entry.data.length, true);
  view.setUint16(28, name.length, true);
  view.setUint16(30, 0, true);
  view.setUint16(32, 0, true);
  view.setUint16(34, 0, true);
  view.setUint16(36, 0, true);
  view.setUint32(38, 0, true);
  view.setUint32(42, offset, true);
  header.set(name, 46);
  return header;
}

function encodeStoredZip(files) {
  const entries = files.map(file => ({ name: file.name, data: file.data, crc: crc32(file.data) }));
  const localParts = [];
  const centralParts = [];
  let offset = 0;
  for (const entry of entries) {
    const local = localHeader(entry, offset);
    localParts.push(local.header, entry.data);
    centralParts.push(centralHeader(entry, offset));
    offset += local.header.length + entry.data.length;
  }
  const central = concatBytes(centralParts);
  const end = new Uint8Array(22);
  const view = new DataView(end.buffer);
  view.setUint32(0, 0x06054b50, true);
  view.setUint16(8, entries.length, true);
  view.setUint16(10, entries.length, true);
  view.setUint32(12, central.length, true);
  view.setUint32(16, offset, true);
  return concatBytes([...localParts, central, end]);
}

function findEndRecord(bytes) {
  const start = Math.max(0, bytes.length - 65557);
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  for (let offset = bytes.length - 22; offset >= start; offset--) {
    if (view.getUint32(offset, true) === 0x06054b50) return offset;
  }
  throw new Error('The selected file is not a valid ZIP archive.');
}

function decodeStoredZip(bytes) {
  if (bytes.length > MAX_ARCHIVE_BYTES) throw new Error('The archive exceeds the 150 MB safety limit.');
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const endOffset = findEndRecord(bytes);
  const count = view.getUint16(endOffset + 10, true);
  const centralSize = view.getUint32(endOffset + 12, true);
  let offset = view.getUint32(endOffset + 16, true);
  if (!count || count > MAX_ENTRIES || offset + centralSize > endOffset) throw new Error('The archive directory is invalid.');
  const files = new Map();
  for (let index = 0; index < count; index++) {
    if (offset + 46 > bytes.length || view.getUint32(offset, true) !== 0x02014b50) throw new Error('The archive directory is damaged.');
    const flags = view.getUint16(offset + 8, true);
    const method = view.getUint16(offset + 10, true);
    const expectedCrc = view.getUint32(offset + 16, true);
    const compressedSize = view.getUint32(offset + 20, true);
    const uncompressedSize = view.getUint32(offset + 24, true);
    const nameLength = view.getUint16(offset + 28, true);
    const extraLength = view.getUint16(offset + 30, true);
    const commentLength = view.getUint16(offset + 32, true);
    const localOffset = view.getUint32(offset + 42, true);
    const centralEnd = offset + 46 + nameLength + extraLength + commentLength;
    if (centralEnd > bytes.length) throw new Error('The archive directory is incomplete.');
    const name = decoder.decode(bytes.subarray(offset + 46, offset + 46 + nameLength));
    if (flags & 1) throw new Error('Encrypted archives are not supported.');
    if (method !== 0 || compressedSize !== uncompressedSize) throw new Error('This archive was recompressed. Open the original .itarea.zip file.');
    if (!['manifest.json', 'audio.wav'].includes(name) || files.has(name)) throw new Error('The archive contains unexpected files.');
    if (localOffset + 30 > bytes.length || view.getUint32(localOffset, true) !== 0x04034b50) throw new Error('An archive entry is damaged.');
    if (view.getUint16(localOffset + 8, true) !== 0) throw new Error('An archive entry uses an unsupported compression method.');
    const localNameLength = view.getUint16(localOffset + 26, true);
    const localExtraLength = view.getUint16(localOffset + 28, true);
    const dataOffset = localOffset + 30 + localNameLength + localExtraLength;
    if (dataOffset > bytes.length) throw new Error('An archive entry header is incomplete.');
    const localName = decoder.decode(bytes.subarray(localOffset + 30, localOffset + 30 + localNameLength));
    if (localName !== name) throw new Error('An archive entry name is inconsistent.');
    if (dataOffset + compressedSize > bytes.length) throw new Error('An archive entry is incomplete.');
    const data = bytes.slice(dataOffset, dataOffset + compressedSize);
    if (crc32(data) !== expectedCrc) throw new Error('An archive entry failed its integrity check.');
    files.set(name, data);
    offset += 46 + nameLength + extraLength + commentLength;
  }
  return files;
}

function validateManifest(manifest, files) {
  if (!manifest || manifest.format !== DOCUMENT_FORMAT || manifest.formatVersion !== DOCUMENT_FORMAT_VERSION) throw new Error('This is not a supported iTranslator document.');
  if (!manifest.content || typeof manifest.content.text !== 'string') throw new Error('The document text is missing or invalid.');
  if (manifest.content.text.length > MAX_TEXT_LENGTH) throw new Error('The document text exceeds the safety limit.');
  if (manifest.content.html !== undefined && (typeof manifest.content.html !== 'string' || manifest.content.html.length > MAX_TEXT_LENGTH)) throw new Error('The document formatting is missing or invalid.');
  if (typeof manifest.content.language !== 'string' || typeof manifest.content.font !== 'string') throw new Error('The document language or font is invalid.');
  if (!['itrans', 'roman', 'english'].includes(manifest.content.mode)) throw new Error('The document mode is invalid.');
  const fontSize = Number(manifest.content.fontSize);
  if (!Number.isFinite(fontSize) || fontSize < 14 || fontSize > 48) throw new Error('The document font size is invalid.');
  if (manifest.metadata?.tags !== undefined) {
    if (!Array.isArray(manifest.metadata.tags) || manifest.metadata.tags.length > MAX_DOCUMENT_TAGS) throw new Error('The document tags are invalid.');
    const names = new Set();
    for (const tag of manifest.metadata.tags) {
      if (!tag || typeof tag.name !== 'string' || typeof tag.value !== 'string'
        || !tag.name.trim() || !tag.value.trim()
        || tag.name.length > MAX_DOCUMENT_TAG_NAME_LENGTH || tag.value.length > MAX_DOCUMENT_TAG_VALUE_LENGTH
        || names.has(tag.name)) throw new Error('The document tags are invalid.');
      names.add(tag.name);
    }
    const required = manifest.metadata.tags.find(tag => tag.name === 'type');
    if (!required || required.value !== 'rich-text-audio') throw new Error('The document required type tag is invalid.');
  }
  if (manifest.audio?.included) {
    if (manifest.audio.file !== 'audio.wav' || !files.has('audio.wav')) throw new Error('The document refers to missing or invalid audio.');
    const wav = files.get('audio.wav');
    const ascii = (offset, value) => value.split('').every((character, index) => wav[offset + index] === character.charCodeAt(0));
    if (wav.length < 44 || !ascii(0, 'RIFF') || !ascii(8, 'WAVE')) throw new Error('The document audio is not a valid WAV file.');
    const duration = Number(manifest.audio.durationMs);
    if (!Number.isFinite(duration) || duration < 0 || duration > 300500) throw new Error('The document audio duration is invalid.');
  } else if (files.has('audio.wav')) throw new Error('The archive contains unreferenced audio.');
}

export async function createItareaArchive(manifest, audioBlob = null) {
  const files = [{ name: 'manifest.json', data: encoder.encode(`${JSON.stringify(manifest, null, 2)}\n`) }];
  if (audioBlob) files.push({ name: 'audio.wav', data: new Uint8Array(await audioBlob.arrayBuffer()) });
  return new Blob([encodeStoredZip(files)], { type: 'application/zip' });
}

export async function readItareaArchive(blob) {
  const files = decodeStoredZip(new Uint8Array(await blob.arrayBuffer()));
  const manifestBytes = files.get('manifest.json');
  if (!manifestBytes || manifestBytes.length > MAX_MANIFEST_BYTES) throw new Error('The manifest is missing or too large.');
  let manifest;
  try { manifest = JSON.parse(decoder.decode(manifestBytes)); }
  catch { throw new Error('The manifest contains invalid JSON.'); }
  validateManifest(manifest, files);
  const audio = manifest.audio?.included ? new Blob([files.get(manifest.audio.file)], { type: manifest.audio.mimeType || 'audio/wav' }) : null;
  return { manifest, audio };
}

function safeFilename(value) {
  const stem = String(value || 'itarea-document').trim().replace(/(?:\.itarea)?\.zip$/i, '');
  const cleaned = stem.replace(/[^\p{L}\p{N}._-]+/gu, '-').replace(/^-+|-+$/g, '');
  return `${cleaned || 'itarea-document'}.itarea.zip`;
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url; link.download = filename; link.hidden = true;
  document.body.append(link); link.click(); link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function createDocumentController(widget, version) {
  const openButton = widget.querySelector('[data-document-open]');
  const saveButton = widget.querySelector('[data-document-save]');
  const fileInput = widget.querySelector('[data-document-file]');
  const feedback = widget.querySelector('[data-document-feedback]');
  let feedbackTimer;
  let dirty = Boolean(widget.value.trim());

  const updateSaveState = () => {
    saveButton.classList.toggle('is-dirty', dirty);
    const label = dirty ? 'Save iTranslator document — not saved' : 'Save iTranslator document — Saved';
    saveButton.title = label;
    saveButton.setAttribute('aria-label', label);
  };
  const markDirty = () => { dirty = true; updateSaveState(); };
  const markSaved = () => { dirty = false; updateSaveState(); };
  updateSaveState();

  const showFeedback = (message, error = false) => {
    clearTimeout(feedbackTimer);
    feedback.textContent = message;
    feedback.classList.toggle('error', error);
    feedback.hidden = false;
    feedbackTimer = setTimeout(() => { feedback.hidden = true; }, 2400);
  };

  const makeManifest = audio => ({
    format: DOCUMENT_FORMAT,
    formatVersion: DOCUMENT_FORMAT_VERSION,
    createdAt: new Date().toISOString(),
    widgetVersion: version,
    content: {
      text: widget.value,
      html: widget.htmlValue,
      lastUpdatedAt: widget.getState().content.lastUpdatedAt,
      language: widget.target,
      mode: widget.mode,
      font: widget.font,
      fontSize: Number.parseInt(widget.fontSize, 10),
    },
    metadata: { tags: widget.tags },
    audio: audio ? { included: true, file: 'audio.wav', mimeType: 'audio/wav', durationMs: audio.durationMs, lastUpdatedAt: widget.getState().audio.lastUpdatedAt } : { included: false, lastUpdatedAt: null },
  });

  const save = async() => {
    if (saveButton.disabled) return;
    const suggestedName = safeFilename(widget.getAttribute('audio-id') || widget.getAttribute('label'));
    let handle = null;
    let filename = suggestedName;
    try {
      if (window.showSaveFilePicker) {
        try {
          handle = await window.showSaveFilePicker({
            suggestedName,
            types: [{ description: 'iTranslator document', accept: { 'application/zip': ['.itarea.zip'] } }],
          });
        } catch (error) {
          if (error?.name === 'AbortError') return;
          if (error?.name !== 'SecurityError') throw error;
        }
      }
      if (!handle) {
        const entered = await widget.uiDialog.prompt('Enter a filename for this iTranslator document.', suggestedName, { title: 'Save document', inputLabel: 'Document filename', confirmLabel: 'Save' });
        if (entered === null) return;
        filename = safeFilename(entered);
      }
      saveButton.disabled = true;
      showFeedback('Preparing…');
      await widget.audioController?.ready;
      const audio = await widget.audioController?.exportWav();
      const archive = await createItareaArchive(makeManifest(audio), audio?.blob || null);
      if (handle) {
        const writable = await handle.createWritable();
        await writable.write(archive);
        await writable.close();
        filename = handle.name;
      } else downloadBlob(archive, filename);
      showFeedback('Saved');
      markSaved();
      widget.dispatchEvent(new CustomEvent('documentsave', { bubbles: true, detail: { filename, size: archive.size } }));
    } catch (error) {
      if (error?.name !== 'AbortError') { showFeedback('Save failed', true); await widget.uiDialog.alert(`The document could not be saved.\n\n${error.message || error}`, { title: 'Save failed' }); }
    } finally { saveButton.disabled = false; }
  };

  const applyDocument = async file => {
    openButton.disabled = true;
    showFeedback('Opening…');
    try {
      const { manifest, audio } = await readItareaArchive(file);
      await widget.audioController?.ready;
      if (!widget.supportsTarget(manifest.content.language)) throw new Error(`Unsupported language: ${manifest.content.language}`);
      const hasExisting = Boolean(widget.value.trim() || widget.audioBlob || widget.tags.length > 1);
      if (hasExisting && !await widget.uiDialog.confirm('Opening this file will overwrite the existing text, tags, and recorded audio in this text area. Continue?', { title: 'Replace existing content?', confirmLabel: 'Open document', danger: true })) { showFeedback('Open cancelled'); return; }
      const warnings = [];
      widget.setTarget(manifest.content.language);
      try { widget.setFont(manifest.content.font); }
      catch { widget.setFont('system'); warnings.push(`Font “${manifest.content.font}” was unavailable, so System default was used.`); }
      widget.setFontSize(manifest.content.fontSize);
      if (manifest.content.html) widget.htmlValue = manifest.content.html;
      else widget.value = manifest.content.text;
      widget.setMode(manifest.content.mode);
      widget.tags = manifest.metadata?.tags || [{ name: 'type', value: 'rich-text-audio' }];
      if (audio) await widget.audioController.importAudio(audio);
      else await widget.audioController.clearAudio();
      widget._setLastUpdatedTimes?.({
        content: manifest.content.lastUpdatedAt || manifest.createdAt || null,
        audio: audio ? (manifest.audio?.lastUpdatedAt || manifest.createdAt || null) : null,
      });
      showFeedback('Opened');
      markSaved();
      widget.dispatchEvent(new CustomEvent('documentopen', { bubbles: true, detail: { filename: file.name, manifest } }));
      if (warnings.length) await widget.uiDialog.alert(warnings.join('\n'), { title: 'Document opened with changes' });
    } catch (error) {
      showFeedback('Open failed', true);
      await widget.uiDialog.alert(`The document could not be opened.\n\n${error.message || error}`, { title: 'Open failed' });
    } finally { openButton.disabled = false; fileInput.value = ''; }
  };

  openButton.addEventListener('click', () => fileInput.click());
  saveButton.addEventListener('click', save);
  fileInput.addEventListener('change', () => { const file = fileInput.files?.[0]; if (file) applyDocument(file); });
  widget.addEventListener('audiochange', markDirty);
  widget.addEventListener('tagschange', markDirty);

  return {
    save,
    open: () => fileInput.click(),
    markDirty,
    markSaved,
    get dirty() { return dirty; },
    destroy() {
      clearTimeout(feedbackTimer);
      widget.removeEventListener('audiochange', markDirty);
      widget.removeEventListener('tagschange', markDirty);
    },
  };
}
