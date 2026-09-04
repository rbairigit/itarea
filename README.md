# iTranslator Text Area

`itarea` is a browser-native, configurable ITRANS input widget. It provides an
ITRANS input mode (the default) and an English mode in the same text area.

Current stable release: **1.0.6**.

## Quick start

Open `demo/index.html` in a modern browser. No build step or network connection
is required.

## Drop-in package for another webpage

Run `npm run build`. This creates the portable `dist/` folder:

- `dist/itarea.js` — one browser ES module containing the widget and
  transliteration engine.
- `dist/itarea.css` — the widget’s ready-to-use appearance.
- `dist/itrans-config.json` — editable mappings and target-language settings.
- `dist/itrans-config.js` — the same configuration as a JavaScript module, for
  pages opened directly from disk.
- `dist/itarea-standalone.js` — a classic-script build with its configuration
  already included, suitable for `file://` pages.
- `dist/fonts/` — bundled Sanskrit fonts and their SIL Open Font Licenses.

Copy that entire folder into any website. There are two supported integration
options.

### Use directly from the public repository

For a website with internet access, no download is necessary. Load the
standalone widget and stylesheet from the public repository through jsDelivr:

```html
<link rel="stylesheet"
      href="https://cdn.jsdelivr.net/gh/rbairigit/itarea@v1.0.6/dist/itarea.css">

<script src="https://cdn.jsdelivr.net/gh/rbairigit/itarea@v1.0.6/dist/itarea-standalone.js"></script>

<i-translator-textarea label="Sanskrit text"></i-translator-textarea>
```

The version is pinned deliberately. This keeps a page stable even when a newer
widget release is published. Change the version in both URLs when you choose
to upgrade.

### Hosted page or local web server

For a site served through HTTP(S), use the editable JSON configuration. This
example assumes the package is at `/assets/itarea/`.

```html
<link rel="stylesheet" href="/assets/itarea/itarea.css">

<div id="translator"></div>

<script type="module">
  import {
    configureITranslator,
    setITranslatorTarget
  } from '/assets/itarea/itarea.js';

  const config = await fetch('/assets/itarea/itrans-config.json')
    .then(response => response.json());

  configureITranslator(config);
  setITranslatorTarget('telugu'); // Optional; Sanskrit is the default.

  document.querySelector('#translator').innerHTML =
    '<i-translator-textarea label="Sanskrit text"></i-translator-textarea>';
</script>
```

Create widget elements only after calling `configureITranslator(config)`.

### Page opened directly from disk

For a `file://` page, use the standalone build, which embeds the configuration
at build time:

```html
<link rel="stylesheet" href="../dist/itarea.css">
<script src="../dist/itarea-standalone.js"></script>

<i-translator-textarea label="Sanskrit text"></i-translator-textarea>
```

The settings control in each widget includes a page-wide font selector. The
starter package includes regular styles of Noto Sans Devanagari, Noto Serif
Devanagari, Tiro Devanagari Sanskrit, Sanskrit 2003, and Chandas, plus a System
default choice. To set
the selection from JavaScript, import and call `setITranslatorFont()`:

```js
setITranslatorFont('tiro-devanagari-sanskrit');
```

Browsers deliberately block JSON `fetch()` requests from a `file://` page. Use
the standalone option for that situation; the included `sample/index.html`
does so and can be opened directly from disk.

## Current prototype

- Sanskrit (Devanagari) is the default target.
- The widget reads all mappings from `config/itrans-config.json`.
- Custom aliases include `R` for `ऋ` and `RR` for `ॠ`, in addition to the
  standard `RRi`/`R^i` and `RRI`/`R^I` forms.
- ITRANS input is replaced in place by the configured target script, so Sanskrit
  and English can be mixed in a single text area.
- Each widget keeps its own target language, font, and text size. The settings
  menu can optionally apply those changes to every widget on the page.
- A 14–48px text-size slider beside the mode buttons provides quick adjustment;
  its number field can also be edited directly.
- The paired unfold control below Copy restores or hides the controls above the
  text area. Widgets start in compact mode, with the top controls hidden and
  Copy still available.
- English mode leaves the input unchanged.
- `Ctrl+S` or `Ctrl+I` selects iTrans mode. `Ctrl+E`, `Ctrl+O`, or `Escape`
  selects English mode.
  English mode turns the input light grey and shows a floating mode indicator.
- `Ctrl+R` selects Roman mode, which replaces ITRANS input with IAST, such as
  `kRtaj~naH` becoming `kṛtajñaḥ`.
- Supported targets are Sanskrit/Devanagari (default), Telugu, Kannada, Tamil,
  Malayalam, and Roman/IAST. The page-level target menu is populated from the
  configuration.

The initial transliterator covers common Sanskrit vowels, consonants, marks,
virama, and punctuation. It is deliberately a foundation rather than a claim of
complete compatibility with every historical ITRANS extension.

## Files

- `config/itrans-config.json` - character maps and aliases to customize.
- `src/itransliterator.js` - configurable transliteration engine.
- `src/itextarea.js` - reusable `<i-translator-textarea>` web component.
- `src/itextarea.css` - reusable widget styling.
- `fonts/` - source font files and their licenses; only the regular styles are
  included to keep the bundle compact.
- `dist/` - generated, drop-in browser package; create or refresh it with
  `npm run build`.
- `demo/index.html` - working example and page-level controls.
- `sample/index.html` - minimal shareable page with a heading and one widget.

## Usage

```html
<script type="module">
  import { configureITranslator, setITranslatorTarget } from './src/itextarea.js';
  const config = await fetch('./config/itrans-config.json').then(r => r.json());
  configureITranslator(config);
  setITranslatorTarget('telugu'); // Or kannada, tamil, malayalam, etc.
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
