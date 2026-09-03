# iTranslator Text Area

`itarea` is a browser-native, configurable ITRANS input widget. It provides an
ITRANS input mode (the default) and an English mode, with a live output preview.

## Quick start

Open `demo/index.html` in a modern browser. No build step or network connection
is required.

## Current prototype

- Sanskrit (Devanagari) is the default target.
- The widget reads all mappings from `config/itrans-config.json`.
- Custom aliases include `R` for `ऋ` and `RR` for `ॠ`, in addition to the
  standard `RRi`/`R^i` and `RRI`/`R^I` forms.
- English mode leaves the input unchanged.
- The page-level target menu is populated from the configuration. The initial
  configuration contains Sanskrit/Devanagari; additional target scripts can be
  added without changing widget markup.

The initial transliterator covers common Sanskrit vowels, consonants, marks,
virama, and punctuation. It is deliberately a foundation rather than a claim of
complete compatibility with every historical ITRANS extension.

## Files

- `config/itrans-config.json` - character maps and aliases to customize.
- `src/itransliterator.js` - configurable transliteration engine.
- `src/itextarea.js` - reusable `<i-translator-textarea>` web component.
- `demo/index.html` - working example and page-level controls.

## Usage

```html
<script type="module">
  import { configureITranslator } from './src/itextarea.js';
  const config = await fetch('./config/itrans-config.json').then(r => r.json());
  configureITranslator(config);
</script>

<i-translator-textarea label="Sanskrit text"></i-translator-textarea>
```

## Editing mappings

Mappings are matched longest-first. Add aliases in `aliases` and characters in
`tokens`. For example, the starter configuration includes:

```json
"R": "ऋ",
"RR": "ॠ",
"RRi": "ऋ",
"R^i": "ऋ"
```

## References

The mapping vocabulary follows the ITRANS scheme, an ASCII transliteration
scheme for Indic scripts. The initial vowel aliases include the conventional
`RRi`/`R^i` for ऋ and `RRI`/`R^I` for ॠ. See the
[ITRANS overview](https://en.wikipedia.org/wiki/ITRANS) and its linked official
reference tables for the broader scheme.
