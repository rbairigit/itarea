# Changelog

All notable changes to iTranslator Text Area are documented here.

## 1.1.0 — 2026-09-10

- Added per-widget microphone recording with a five-minute limit.
- Added a waveform editor with selection playback, deletion, silencing,
  silence insertion, reset, and five-step audio undo/redo.
- Added per-widget audio playback, download, deletion, and 30-day browser
  persistence using stable `audio-id` values.
- Added `audioBlob`, `audioDurationMs`, and the `audiochange` event for host
  pages.
- Added stale-audio indication when widget text changes after audio is saved.
- Made action controls disappear safely when the textarea is manually reduced.
- Reduced right-side textarea padding while preserving action-control space.
- Replaced the text-size slider with a compact editable pixel field.
- Shortened the default language label from “Sanskrit (Devanagari)” to
  “Sanskrit”.
- Added a visible checkmark and “Copied” confirmation to the Copy control.
- Updated the demo, sample, help text, package documentation, and standalone
  distribution.

## 1.0.10 — 2026-09-06

- Added the optional global iTrans disable sequence.
- Added version and update-date information to the settings panel.

Earlier 1.0.x releases established configurable ITRANS/IAST transliteration,
multiple Indic target scripts, fonts, shortcuts, undo/redo, auto-expansion,
resizing, compact controls, help, and standalone packaging.
