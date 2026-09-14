# iTranslator Text Area

`itarea` is a browser-native, configurable ITRANS input widget. It provides an
ITRANS input mode (the default) and an English mode in the same text area.

Current stable release: **1.3.0**.

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
      href="https://cdn.jsdelivr.net/gh/rbairigit/itarea@v1.3.0/dist/itarea.css">

<script src="https://cdn.jsdelivr.net/gh/rbairigit/itarea@v1.3.0/dist/itarea-standalone.js"></script>

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

The formatting toolbar includes a quick-access font selector. It applies a font
to selected text, or to subsequently typed text when only the caret is present.
The default uses ITF Devanagari when that font is installed and automatically
falls back to the bundled Noto Sans Devanagari otherwise. The starter package
also includes Noto Serif Devanagari, Tiro Devanagari Sanskrit, Sanskrit 2003,
Sanskrit 2020, and Chandas, plus a System default choice. The existing `setITranslatorFont()` API remains available when
a host page needs to change the base font for every widget:

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
- Each widget keeps its own target language and default text size. The settings
  menu can optionally apply those choices to every widget on the page.
- The font selector sits beside the mode buttons for quick access. It applies
  to selected text or to subsequent typing at the caret.
- A responsive formatting group formats selected text with bold, italic, underline, bulleted
  and numbered lists, 36 preset colors plus a custom color, font family, font size, Normal/
  Medium/Demi/Bold weight, line spacing, four-character indentation,
  left/center/right alignment, links,
  and clear formatting. Font family, font size, color, and weight also apply to
  subsequent typing when the selection is a caret. The group wraps into extra
  rows automatically when the widget is narrow. The default text style is 24px Demi.
- The transliteration controls also wrap into additional rows within their
  shared border when the widget is narrow. The Expand icon beside Duplicate
  toggles automatic height expansion without opening Settings.
- The Tags control shows a small count badge and opens a per-widget metadata editor. Every widget starts with
  the immutable `type=rich-text-audio` tag; additional unique name/value tags
  can be added, edited directly in the table, deleted, queried by the containing page, duplicated,
  and preserved in `.itarea.zip` documents.
- Each widget can record up to five minutes of audio and edit it using a
  selectable waveform. The editor supports previewing a selection, deleting or
  silencing a selection, inserting silence, five edit undo/redo steps, reset,
  download, and re-recording.
- Saved audio belongs to that widget for the current page session only. A page
  refresh clears it unless it was exported with **Save**. Audio is not uploaded
  by the widget.
- Text is not stored automatically; use **Save** to preserve it in an
  `.itarea.zip` document.
- The Play control below Copy is disabled until audio is saved. If the text is
  changed afterward, the Play control is marked as stale so the recording can
  be reviewed or replaced.
- The Save and Open controls store one widget as a portable `.itarea.zip`
  document. It includes plain text, sanitized formatted HTML, mode, language,
  font, font size, tags, and saved audio when present. A red dot on Save means the
  document has changed since its last export. Opening warns before replacing
  nonempty content. Older plain-text `.itarea.zip` files remain supported.
- The paired unfold control below Copy restores or hides the controls above the
  text area. Widgets start in compact mode, with the top controls hidden and
  Copy still available.
- Settings can opt in to a right-edge width-resize handle. The width stays
  within its parent container.
- New creates an empty sibling widget with the same language, font, and text
  size. Duplicate also copies text, mode, and auto-expand. It omits audio unless
  **Include audio when duplicating** is enabled in the source widget's settings.
- English mode leaves the input unchanged.
- `Ctrl+S` or `Ctrl+I` toggles between iTrans and English. `Ctrl+R` toggles
  between Roman and iTrans, while `Ctrl+O` toggles between English and iTrans.
  `Ctrl+E` and `Escape` always select English mode.
  English mode turns the input light grey. The Settings tooltip identifies the
  active language or input mode.
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

### Querying tags from a containing page

```js
const widget = document.querySelector('i-translator-textarea');

widget.tags;                 // [{ name: 'type', value: 'rich-text-audio' }, ...]
widget.getTag('type');       // 'rich-text-audio'
widget.setTag('lesson', 'greetings');
widget.removeTag('lesson');

widget.addEventListener('tagschange', event => {
  console.log(event.detail.tags);
});
```

Assign an array of `{ name, value }` objects—or an object map—to `widget.tags`
to replace all optional tags. The required `type=rich-text-audio` tag is always
restored and cannot be changed or deleted.

The initial transliterator covers common Sanskrit vowels, consonants, marks,
virama, and punctuation. It is deliberately a foundation rather than a claim of
complete compatibility with every historical ITRANS extension.

## Files

- `config/itrans-config.json` - character maps and aliases to customize.
- `src/itransliterator.js` - configurable transliteration engine.
- `src/itaudio.js` - session-only browser recorder and waveform editor.
- `src/itrichtext.js` - formatting toolbar, selection handling, and HTML sanitizer.
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

Audio is kept only in memory for the current page session. Refreshing or closing
the page clears it. Use the widget's **Save** control to include it in a portable
`.itarea.zip` document, or use **Download** for a separate audio file. The
component dispatches an `audiochange` event after save or delete, and exposes the
saved data to page code:

```js
const widget = document.querySelector('i-translator-textarea');
widget.addEventListener('audiochange', event => console.log(event.detail));
console.log(widget.audioBlob, widget.audioDurationMs);
```

Microphone access depends on browser permission. Local `file://` recording has
been verified in Chrome on macOS, but other browser/security configurations may
require the page to be served from `localhost` or HTTPS.

## Creating widgets and resizing width

Reveal the controls to use **New** or **Duplicate**. New places an empty widget
directly below the current one while retaining its language, font, font size,
and size. Duplicate also retains its text, active mode, and auto-expand choice.
Audio is intentionally omitted unless **Include audio when duplicating** is
checked in Settings. Dynamically created widgets show a trash control, while the
original page widget cannot be deleted. They exist only for the current page
session; add permanent widget elements to the page's HTML when they must also
exist after a page refresh.

Enable **Resize width** in Settings to reveal a right-edge drag handle. This is
off by default and keeps the widget within the width of its parent container.

## Saving and opening portable documents

Reveal the widget controls, then use **Save** to create a single file whose name
ends in `.itarea.zip`. The archive contains:

- `manifest.json` with the Unicode text, selected language and mode, font, font
  size, sanitized formatted HTML, widget version, and audio metadata.
- `audio.wav` when audio has been saved in the widget's recorder.

Chrome and other browsers that support the native save picker let you choose a
filename and folder directly. Other configurations use the browser's normal
download flow. **Open** accepts an `.itarea.zip` document, validates it, and
warns before overwriting existing widget text or audio. If a saved font is not
available in the current package, the System default font is used and a warning
is shown.

Widget warnings, confirmations, filename entry, link entry, and error messages
use the widget's own accessible dialogs rather than browser-native alerts. Use
the buttons, press Enter to accept, or press Escape, select ×, or select the
backdrop to cancel and return focus to the previous control.

The archive is self-contained and uses a versioned manifest. Keep the original
archive as created by the widget; recompressing its contents with another ZIP
tool is not supported by this first implementation.

Host pages can observe successful saves and opens:

```js
const widget = document.querySelector('i-translator-textarea');
widget.addEventListener('documentsave', event => console.log(event.detail));
widget.addEventListener('documentopen', event => console.log(event.detail));
```

The existing `widget.value` API continues to read and write plain text. Use
`widget.htmlValue` when a host page needs the sanitized formatted HTML. The Copy
control writes both HTML and plain-text clipboard representations when the
browser supports rich clipboard data.

## Reading complete widget state

Host pages can retrieve a snapshot of the widget's public state with
`widget.getState()`. The snapshot includes tags, plain and formatted content,
content/audio update times, default font information, audio data, layout
choices, language, mode, identifiers, widget version, and the unsaved state.

```js
const widget = document.querySelector('i-translator-textarea');
const state = widget.getState();

console.log(state.content.text, state.content.html);
console.log(state.audio.blob, state.tags);
console.log(state.dirty);
```

`dirty` is `true` when the widget has changed since its last successful Save or
Open, and `false` when it matches that saved/opened checkpoint. The returned
object is a snapshot; changing its fields does not change the widget. Rich-text
run-level styles remain represented in `state.content.html`, while
`state.defaultStyle` describes the widget's baseline font settings.

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

## Customizing the appearance

The widget exposes a documented CSS-variable theme layer. Load a custom
stylesheet after `itarea.css` and override variables globally, on a containing
section, or on one `i-translator-textarea`. For example:

```css
.blue-editors {
  --itarea-accent: #2457a7;
  --itarea-accent-hover: #183f7d;
  --itarea-accent-soft: #e8f0ff;
  --itarea-border-color: #aebbd0;
  --itarea-radius: 12px;
}
```

See [THEMING.md](THEMING.md) for every supported color, surface, border,
waveform, typography, spacing, sizing, and corner variable. A copy is included
in `dist/` so recipients of the standalone package receive the same guide.

For Telugu, Kannada, Tamil, and Malayalam, the widget also supports the newer
ITRANS/ISO 15919 short-vowel distinction: `e` and `o` produce the short vowels,
while `E` and `O` produce their long counterparts. The distinction works for
both independent vowels and vowel signs after consonants. `Ra` produces Tamil
`ற` and Malayalam `റ`, as defined by the newer mapping table. Sanskrit retains
its established `e`/`o` behavior for backward compatibility.

## References

The mapping vocabulary follows the ITRANS scheme, an ASCII transliteration
scheme for Indic scripts. The initial vowel aliases include the conventional
`RRi`/`R^i` for ऋ and `RRI`/`R^I` for ॠ. See the
[ITRANS overview](https://en.wikipedia.org/wiki/ITRANS) and its linked official
reference tables for the broader scheme.
