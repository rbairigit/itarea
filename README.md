# iTranslator Text Area

`itarea` is a browser-native, configurable ITRANS input widget. It provides an
ITRANS input mode (the default) and an English mode in the same text area.

## Quick start

Open `demo/index.html` in a modern browser. No build step or network connection
is required.

## Current prototype

- Sanskrit (Devanagari) is the default target.
- The widget reads all mappings from `config/itrans-config.json`.
- Custom aliases include `R` for `ऋ` and `RR` for `ॠ`, in addition to the
  standard `RRi`/`R^i` and `RRI`/`R^I` forms.
- ITRANS input is replaced in place by the configured target script, so Sanskrit
  and English can be mixed in a single text area.
- English mode leaves the input unchanged.
- `Ctrl+S` selects iTrans mode. `Ctrl+E` or `Escape` selects English mode.
  English mode turns the input light grey and shows a floating mode indicator.
- `Ctrl+R` selects Roman mode, which replaces ITRANS input with IAST, such as
  `kRtaj~naH` becoming `kṛtajñaḥ`.
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

For each alias, use this rule:

- Add a normal consonant, punctuation mark, or standalone symbol to `aliases`.
- For a custom vowel, add both the standalone glyph to `aliases` and its
  combining sign to `vowelMarks`; this makes it combine after consonants.
- Add the equivalent IAST form to `iastTokens` if it should also work in Roman
  mode.

After editing the JSON file, reload the page or recreate the widget.

## References

The mapping vocabulary follows the ITRANS scheme, an ASCII transliteration
scheme for Indic scripts. The initial vowel aliases include the conventional
`RRi`/`R^i` for ऋ and `RRI`/`R^I` for ॠ. See the
[ITRANS overview](https://en.wikipedia.org/wiki/ITRANS) and its linked official
reference tables for the broader scheme.
