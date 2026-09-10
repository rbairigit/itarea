# iTranslator Text Area

`itarea` is a browser-native, configurable ITRANS input widget. It provides an
ITRANS input mode (the default) and an English mode in the same text area.

Current stable release: **1.2.0**.

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
      href="https://cdn.jsdelivr.net/gh/rbairigit/itarea@v1.2.0/dist/itarea.css">

<script src="https://cdn.jsdelivr.net/gh/rbairigit/itarea@v1.2.0/dist/itarea-standalone.js"></script>

<i-translator-textarea label="Sanskrit text" audio-id="lesson-1"></i-translator-textarea>
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

- Sanskrit is the default target and uses Devanagari script.
- The widget reads all mappings from `config/itrans-config.json`.
- Custom aliases include `R` for `ऋ` and `RR` for `ॠ`, in addition to the
  standard `RRi`/`R^i` and `RRI`/`R^I` forms.
- ITRANS input is replaced in place by the configured target script, so Sanskrit
  and English can be mixed in a single text area.
- Each widget keeps its own target language, font, and text size. The settings
  menu can optionally apply those changes to every widget on the page.
- A 14–48px number field beside the mode buttons controls text size. Type a
  value and press Enter, or leave the field, to apply it.
- Each widget can record up to five minutes of audio and edit it using a
  selectable waveform. The editor supports previewing a selection, deleting or
  silencing a selection, inserting silence, five edit undo/redo steps, reset,
  download, and re-recording.
- Saved audio belongs to that widget and remains in the same browser for 30
  days. Give reusable widgets a stable `audio-id`; otherwise their page order is
  used. Audio is not embedded in or uploaded by the widget.
- The Play control below Copy is disabled until audio is saved. If the text is
  changed afterward, the Play control is marked as stale so the recording can
  be reviewed or replaced.
- The Save and Open controls store one widget as a portable `.itarea.zip`
  document. It includes the Unicode text, mode, language, font, font size, and
  saved audio when present. Opening warns before replacing nonempty content.
- The paired unfold control below Copy restores or hides the controls above the
  text area. Widgets start in compact mode, with the top controls hidden and
  Copy still available.
- English mode leaves the input unchanged.
- `Ctrl+S` or `Ctrl+I` toggles between iTrans and English. `Ctrl+R` toggles
  between Roman and iTrans, while `Ctrl+O` toggles between English and iTrans.
  `Ctrl+E` and `Escape` always select English mode.
  English mode turns the input light grey and shows a floating mode indicator.
- Roman mode replaces ITRANS input with IAST, such as `kRtaj~naH` becoming
  `kṛtajñaḥ`.
- `Ctrl+Z` or `Ctrl+U` undoes up to 100 recent editing actions per widget.
  `Ctrl+Shift+Z` or `Ctrl+Shift+U` redoes an undone action.
- The global <strong>iTrans disable seq.</strong> setting is off by default.
  When enabled, typing its three-character sequence (default: ` = `) in iTrans
  or Roman mode keeps the sequence and switches the remainder of that line to
  English. Pressing Enter restores the prior transliteration mode. An explicit
  mode shortcut cancels the temporary line override.
- Supported targets are Sanskrit/Devanagari (default), Telugu, Kannada, Tamil,
  Malayalam, and Roman/IAST. The page-level target menu is populated from the
  configuration.

The initial transliterator covers common Sanskrit vowels, consonants, marks,
virama, and punctuation. It is deliberately a foundation rather than a claim of
complete compatibility with every historical ITRANS extension.

## Files

- `config/itrans-config.json` - character maps and aliases to customize.
- `src/itransliterator.js` - configurable transliteration engine.
- `src/itaudio.js` - browser recorder, waveform editor, and 30-day audio storage.
- `src/itdocument.js` - portable `.itarea.zip` creation, validation, save, and
  restore support.
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

## Recording and retrieving audio

Reveal the compact widget controls and select the microphone button. Record up
to five minutes, then use the waveform editor to preview, select, delete,
silence, or insert silence. Select **Save audio** to associate the result with
that widget, and **Download** to keep a separate audio file.

For reliable restoration after reloading a page, assign a unique and stable
`audio-id`:

```html
<i-translator-textarea audio-id="verse-001"></i-translator-textarea>
```

Audio is stored in IndexedDB for 30 days, scoped to the same browser profile and
page location. Clearing site data, moving a local page, changing its URL, using
another browser/profile, or reaching the browser's storage limit can remove or
separate it. The component dispatches an `audiochange` event after save or
delete, and exposes the saved data to page code:

```js
const widget = document.querySelector('i-translator-textarea');
widget.addEventListener('audiochange', event => console.log(event.detail));
console.log(widget.audioBlob, widget.audioDurationMs);
```

Microphone access depends on browser permission. Local `file://` recording has
been verified in Chrome on macOS, but other browser/security configurations may
require the page to be served from `localhost` or HTTPS.

## Saving and opening portable documents

Reveal the widget controls, then use **Save** to create a single file whose name
ends in `.itarea.zip`. The archive contains:

- `manifest.json` with the Unicode text, selected language and mode, font, font
  size, widget version, and audio metadata.
- `audio.wav` when audio has been saved in the widget's recorder.

Chrome and other browsers that support the native save picker let you choose a
filename and folder directly. Other configurations use the browser's normal
download flow. **Open** accepts an `.itarea.zip` document, validates it, and
warns before overwriting existing widget text or audio. If a saved font is not
available in the current package, the System default font is used and a warning
is shown.

The archive is self-contained and uses a versioned manifest. Keep the original
archive as created by the widget; recompressing its contents with another ZIP
tool is not supported by this first implementation.

Host pages can observe successful saves and opens:

```js
const widget = document.querySelector('i-translator-textarea');
widget.addEventListener('documentsave', event => console.log(event.detail));
widget.addEventListener('documentopen', event => console.log(event.detail));
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
