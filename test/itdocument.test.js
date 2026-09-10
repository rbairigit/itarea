import assert from 'node:assert/strict';
import test from 'node:test';
import { createItareaArchive, readItareaArchive } from '../src/itdocument.js';

function manifest(audio = false) {
  return {
    format: 'itarea-document',
    formatVersion: 1,
    createdAt: '2026-09-10T00:00:00.000Z',
    widgetVersion: '1.1.0',
    content: {
      text: 'रामः speaks English.',
      language: 'sanskrit-devanagari',
      mode: 'itrans',
      font: 'system',
      fontSize: 22,
    },
    audio: audio
      ? { included: true, file: 'audio.wav', mimeType: 'audio/wav', durationMs: 1250 }
      : { included: false },
  };
}

test('round-trips a text-only iTranslator document', async() => {
  const input = manifest();
  input.content.html = '<div><strong>रामः</strong> speaks <em>English</em>.</div>';
  const archive = await createItareaArchive(input);
  const result = await readItareaArchive(archive);
  assert.deepEqual(result.manifest, input);
  assert.equal(result.audio, null);
});

test('continues to accept legacy documents without formatted HTML', async() => {
  const input = manifest();
  const archive = await createItareaArchive(input);
  const result = await readItareaArchive(archive);
  assert.equal(result.manifest.content.html, undefined);
  assert.equal(result.manifest.content.text, input.content.text);
});

test('round-trips queryable widget tags', async() => {
  const input = manifest();
  input.metadata = {
    tags: [
      { name: 'type', value: 'rich-text-audio' },
      { name: 'lesson', value: 'greetings' },
    ],
  };
  const archive = await createItareaArchive(input);
  const result = await readItareaArchive(archive);
  assert.deepEqual(result.manifest.metadata.tags, input.metadata.tags);
});

test('rejects tag metadata without the required immutable type tag', async() => {
  const input = manifest();
  input.metadata = { tags: [{ name: 'lesson', value: 'greetings' }] };
  const archive = await createItareaArchive(input);
  await assert.rejects(readItareaArchive(archive), /required type tag/);
});

test('rejects invalid formatted HTML metadata', async() => {
  const input = manifest();
  input.content.html = 42;
  const archive = await createItareaArchive(input);
  await assert.rejects(readItareaArchive(archive), /formatting/);
});

test('round-trips a document with audio', async() => {
  const audioBytes = new Uint8Array(44);
  audioBytes.set(new TextEncoder().encode('RIFF'), 0);
  audioBytes.set(new TextEncoder().encode('WAVE'), 8);
  const archive = await createItareaArchive(manifest(true), new Blob([audioBytes], { type: 'audio/wav' }));
  const result = await readItareaArchive(archive);
  assert.deepEqual(new Uint8Array(await result.audio.arrayBuffer()), audioBytes);
  assert.equal(result.audio.type, 'audio/wav');
});

test('rejects a damaged archive entry', async() => {
  const archive = await createItareaArchive(manifest());
  const bytes = new Uint8Array(await archive.arrayBuffer());
  const marker = new TextEncoder().encode('"format": "itarea-document"');
  const start = bytes.findIndex((_, index) => marker.every((byte, offset) => bytes[index + offset] === byte));
  assert.notEqual(start, -1);
  bytes[start] ^= 1;
  await assert.rejects(readItareaArchive(new Blob([bytes])), /integrity check/);
});

test('rejects an unsupported manifest format', async() => {
  const invalid = manifest();
  invalid.formatVersion = 99;
  const archive = await createItareaArchive(invalid);
  await assert.rejects(readItareaArchive(archive), /not a supported/);
});
