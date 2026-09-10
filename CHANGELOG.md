# Changelog

All notable changes to iTranslator Text Area are documented here.

## Unreleased

## 1.3.0 — 2026-09-11

- Replaced the plain textarea surface with a backward-compatible rich-text
  editor while retaining `widget.value` as the plain-text API.
- Added bold, italic, underline, bulleted and numbered lists, 36 preset colors
  plus custom color, selection font family, size and weight, line-spacing controls,
  alignment, links, and remove-formatting controls.
- Moved the font selector from Settings beside the transliteration mode group
  for rapid selection-level and caret-level font changes.
- Fixed rich-text selection restoration, persistent font/size/weight displays,
  and active formatting icon colors.
- Added four-character decrease/increase indent controls and reused the
  COURSE-EDITOR Material Symbols for line spacing and indentation.
- Changed the defaults to 24px Demi using installed ITF Devanagari when
  available and bundled Noto Sans Devanagari as fallback.
- Grouped the three transliteration modes, balanced both toolbar rows, and
  removed the visible language name beside Settings to save space.
- Added the sanitized `widget.htmlValue` API and included formatted HTML in
  portable saves, duplication, and rich clipboard copies. Older plain-text
  `.itarea.zip` documents remain supported.
- Consolidated the expanded controls into two rows: document/language controls
  remain in the transliteration row, and the formatting toolbar has one
  continuous surrounding border.
- Made the formatting group responsive: its rounded container and controls
  wrap into additional unseparated rows when the widget becomes narrow.
- Removed the redundant whole-editor pixel field from the transliteration row;
  text size remains available in the selection-aware formatting group.
- Made the transliteration group wrap responsively, moved Auto-expand from
  Settings to an Expand-icon toggle beside Duplicate, and normalized Save/Open
  spacing.
- Added per-widget name/value tags with a popup table, immutable
  `type=rich-text-audio` metadata, parent-page query APIs, a `tagschange` event,
  duplication, and portable document persistence.
- Removed automatic text and audio persistence; audio is now session-only and
  text is retained through explicit portable saves.
- Added a red unsaved dot and Saved/not-saved tooltip to the Save control.
- Shortened the visible mode button label from “Roman (IAST)” to “Roman”.
- Added opt-in right-edge widget-width resizing.
- Added New and Duplicate controls. Duplicate copies text, language, mode,
  font, size, and auto-expand; its new optional setting can include audio.
- Added a trash control for widgets created with New or Duplicate, and changed
  the Duplicate icon to a folder-copy icon.

## 1.2.0 — 2026-09-10

- Added per-widget Save and Open controls for portable `.itarea.zip` documents.
- Added a versioned manifest containing Unicode text, language, mode, font, and
  font size, with optional normalized WAV audio in the same archive.
- Added validation, overwrite confirmation, unavailable-font fallback, native
  save-picker support, download fallback, and save/open events.
- Included document support in both distribution builds and added archive
  round-trip and integrity tests.

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
