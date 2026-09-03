import test from 'node:test';
import assert from 'node:assert/strict';
import config from '../config/itrans-config.json' with { type: 'json' };
import { createTransliterator } from '../src/itransliterator.js';

const transliterate = createTransliterator(config);
const romanize = createTransliterator(config, 'sanskrit-iast');
test('uses configurable Sanskrit aliases', () => {
  assert.equal(transliterate('R RR RRi R^i RRI R^I'), 'ऋ ॠ ऋ ऋ ॠ ॠ');
  assert.equal(transliterate('kRtaj~naH'), 'कृतज्ञः');
  assert.equal(transliterate('kRRitaj~naH'), 'कृतज्ञः');
  assert.equal(transliterate('kR^itaj~naH'), 'कृतज्ञः');
  assert.equal(transliterate('S L'), 'ष् ळ्');
  assert.equal(romanize('S L'), 'ṣ ḻ');
});
test('creates IAST from ITRANS input', () => {
  assert.equal(romanize('kRtaj~naH'), 'kṛtajñaḥ');
  assert.equal(romanize('kRRitaj~naH'), 'kṛtajñaḥ');
  assert.equal(romanize('kR^itaj~naH'), 'kṛtajñaḥ');
});
test('creates supported southern Indic scripts', () => {
  assert.equal(createTransliterator(config, 'telugu')('raamaH'), 'రామః');
  assert.equal(createTransliterator(config, 'kannada')('raamaH'), 'ರಾಮಃ');
  assert.equal(createTransliterator(config, 'malayalam')('raamaH'), 'രാമഃ');
  assert.equal(createTransliterator(config, 'tamil')('raamaH'), 'ராமஃ');
});
test('forms basic consonant-vowel syllables', () => {
  assert.equal(transliterate('raama'), 'राम');
  assert.equal(transliterate('namaH|'), 'नमः।');
  assert.equal(transliterate('raamam '), 'रामम् ');
  assert.equal(createTransliterator(config, 'telugu')('raamam '), 'రామమ్ ');
  assert.equal(transliterate('| ||'), '। ॥');
  assert.equal(transliterate('raamam||'), 'रामम्॥');
  assert.equal(createTransliterator(config, 'telugu')('| ||'), '। ॥');
  assert.equal(createTransliterator(config, 'kannada')('| ||'), '। ॥');
  assert.equal(createTransliterator(config, 'malayalam')('| ||'), '। ॥');
});
test('renders OM and AUM by target script', () => {
  assert.equal(transliterate('OM AUM'), 'ॐ ॐ');
  assert.equal(createTransliterator(config, 'telugu')('OM AUM'), 'ఓం ఓం');
  assert.equal(createTransliterator(config, 'tamil')('OM AUM'), 'ௐ ௐ');
});
test('renders digits in the selected script', () => {
  assert.equal(transliterate('0123456789'), '०१२३४५६७८९');
  assert.equal(createTransliterator(config, 'telugu')('0123456789'), '౦౧౨౩౪౫౬౭౮౯');
  assert.equal(createTransliterator(config, 'tamil')('0123456789'), '௦௧௨௩௪௫௬௭௮௯');
});
