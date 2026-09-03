import test from 'node:test';
import assert from 'node:assert/strict';
import config from '../config/itrans-config.json' with { type: 'json' };
import { createTransliterator } from '../src/itransliterator.js';

const transliterate = createTransliterator(config);
test('uses configurable Sanskrit aliases', () => {
  assert.equal(transliterate('R RR RRi R^i RRI R^I'), 'ऋ ॠ ऋ ऋ ॠ ॠ');
});
test('forms basic consonant-vowel syllables', () => {
  assert.equal(transliterate('raama'), 'राम');
  assert.equal(transliterate('namaH|'), 'नमः।');
});
