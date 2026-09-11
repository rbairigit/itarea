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
  assert.equal(transliterate('vij~naana'), 'विज्ञान');
  assert.equal(transliterate('S L'), 'ष् ळ्');
  assert.equal(romanize('S L'), 'ṣ ḻ');
});
test('creates IAST from ITRANS input', () => {
  assert.equal(romanize('kRtaj~naH'), 'kṛtajñaḥ');
  assert.equal(romanize('kRRitaj~naH'), 'kṛtajñaḥ');
  assert.equal(romanize('kR^itaj~naH'), 'kṛtajñaḥ');
  assert.equal(romanize('vij~naana'), 'vijñāna');
});
test('creates supported southern Indic scripts', () => {
  assert.equal(createTransliterator(config, 'telugu')('raamaH'), 'రామః');
  assert.equal(createTransliterator(config, 'kannada')('raamaH'), 'ರಾಮಃ');
  assert.equal(createTransliterator(config, 'malayalam')('raamaH'), 'രാമഃ');
  assert.equal(createTransliterator(config, 'tamil')('raamaH'), 'ராமஃ');
});
test('distinguishes Dravidian short and long e and o vowels', () => {
  const cases = {
    telugu: ['ఎ ఏ ఒ ఓ', 'కె కే కొ కో'],
    kannada: ['ಎ ಏ ಒ ಓ', 'ಕೆ ಕೇ ಕೊ ಕೋ'],
    tamil: ['எ ஏ ஒ ஓ', 'கெ கே கொ கோ'],
    malayalam: ['എ ഏ ഒ ഓ', 'കെ കേ കൊ കോ'],
  };
  for (const [target, [independent, combined]] of Object.entries(cases)) {
    const convert = createTransliterator(config, target);
    assert.equal(convert('e E o O'), independent, `${target} independent vowels`);
    assert.equal(convert('ke kE ko kO'), combined, `${target} vowel signs`);
  }
});
test('supports the new Ra mapping where the ITRANS table defines it', () => {
  assert.equal(createTransliterator(config, 'tamil')('Ra'), 'ற');
  assert.equal(createTransliterator(config, 'malayalam')('Ra'), 'റ');
});
test('forms basic consonant-vowel syllables', () => {
  assert.equal(transliterate('raama'), 'राम');
  assert.equal(transliterate('kakShyaa'), 'कक्ष्या');
  assert.equal(transliterate('kakSyaa'), 'कक्ष्या');
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
  assert.equal(createTransliterator(config, 'kannada')('OM AUM'), 'ॐ ॐ');
  assert.equal(createTransliterator(config, 'malayalam')('OM AUM'), 'ॐ ॐ');
});
test('renders avagraha and chandrabindu shortcuts', () => {
  assert.equal(transliterate('.a k.N'), 'ऽ कँ');
  assert.equal(createTransliterator(config, 'telugu')('.a k.N'), 'ఽ కఁ');
});
test('renders Vedic accent aliases after the preceding vowel', () => {
  assert.equal(transliterate("a'' i_ u'''"), 'अ॑ इ॒ उ᳚');
  assert.equal(transliterate('aU+0951 iU+0952 uU+1CDA'), 'अ॑ इ॒ उ᳚');
  assert.equal(transliterate("te'' draa_ patnii'''"), 'ते॑ द्रा॒ पत्नी᳚');
  assert.equal(createTransliterator(config, 'telugu')("a'' i_ u'''"), 'అ॑ ఇ॒ ఉ᳚');
  assert.equal(romanize("a'' i_ u'''"), "a'' i_ u'''");
});
test('renders digits in the selected script', () => {
  assert.equal(transliterate('0123456789'), '०१२३४५६७८९');
  assert.equal(createTransliterator(config, 'telugu')('0123456789'), '౦౧౨౩౪౫౬౭౮౯');
  assert.equal(createTransliterator(config, 'tamil')('0123456789'), '௦௧௨௩௪௫௬௭௮௯');
});
