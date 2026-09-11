# Theming iTranslator Text Area

Load your theme stylesheet **after** `itarea.css`, then override the public
`--itarea-*` custom properties. Do not edit generated files in `dist/`; a later
upgrade or build would replace those edits.

```html
<link rel="stylesheet" href="./dist/itarea.css">
<link rel="stylesheet" href="./itarea-theme.css">
<script src="./dist/itarea-standalone.js"></script>
```

## Applying a theme

Use `:root` for every widget:

```css
:root {
  --itarea-accent: #2457a7;
  --itarea-accent-hover: #183f7d;
  --itarea-accent-soft: #e8f0ff;
  --itarea-border-color: #aebbd0;
  --itarea-focus-color: #2457a7;
}
```

Use a container to theme one group:

```css
.blue-editor-group {
  --itarea-accent: #2457a7;
  --itarea-accent-hover: #183f7d;
  --itarea-accent-soft: #e8f0ff;
}
```

Or theme one widget:

```css
#lesson-notes {
  --itarea-surface: #fffefa;
  --itarea-radius: 12px;
  --itarea-editor-line-height: 1.7;
}
```

```html
<i-translator-textarea id="lesson-notes"></i-translator-textarea>
```

## Public variables

### Core colors

| Variable | Default | Purpose |
| --- | --- | --- |
| `--itarea-text-color` | `#29241c` | Main interface and editor text |
| `--itarea-muted-color` | `#625a50` | Secondary labels and inactive modes |
| `--itarea-subtle-color` | `#756b5e` | Version and subtle interface text |
| `--itarea-placeholder-color` | `#868686` | Empty-editor placeholder |
| `--itarea-disabled-color` | `#8a8a8a` | Disabled controls |
| `--itarea-accent` | `#774b0a` | Active mode, icons, and primary actions |
| `--itarea-accent-hover` | `#5d3907` | Accent hover state |
| `--itarea-accent-soft` | `#f4eddd` | Accent hover background |
| `--itarea-accent-contrast` | `#fff` | Text/icons placed on the accent color |
| `--itarea-focus-color` | `#0b6bdc` | Editor focus border |
| `--itarea-focus-ring-color` | `#dec8a4` | Dialog-control focus ring |
| `--itarea-link-color` | `#175caa` | Links inside rich text |
| `--itarea-success-color` | `#24733b` | Successful Copy indication |
| `--itarea-warning-color` | `#b26a00` | Stale-audio warning |
| `--itarea-unsaved-color` | `#be2d25` | Unsaved dot on Save |
| `--itarea-danger-color` | `#9c2018` | Destructive actions and errors |
| `--itarea-danger-dark` | `#8a1f18` | Dark error feedback |
| `--itarea-danger-surface` | `#f9dedb` | Error-message background |

### Surfaces and borders

| Variable | Default | Purpose |
| --- | --- | --- |
| `--itarea-surface` | `#fff` | Editor, controls, tables, and help surface |
| `--itarea-surface-alt` | `#fffdf8` | Tool groups, settings, and dialogs |
| `--itarea-muted-surface` | `#f3eee4` | Status and table-heading background |
| `--itarea-hover-surface` | `#e8e8e8` | Neutral hover background |
| `--itarea-code-background` | `#eee8db` | Mapping code samples |
| `--itarea-english-background` | `#e5e5e5` | English-mode editor background |
| `--itarea-roman-background` | `#e1f3df` | Roman-mode editor background |
| `--itarea-border-color` | `#bcae98` | Primary border color |
| `--itarea-strong-border-color` | `#918b83` | Strong and swatch borders |
| `--itarea-divider-color` | `#ded7c9` | Section dividers |
| `--itarea-table-border-color` | `#d5cab9` | Table outside border |
| `--itarea-table-divider-color` | `#e5ddd0` | Table row dividers |
| `--itarea-canvas-border-color` | `#cbbda8` | Audio canvas border |

### Dialogs and shadows

| Variable | Default | Purpose |
| --- | --- | --- |
| `--itarea-overlay-color` | `#0008` | Main dialog backdrop |
| `--itarea-overlay-light-color` | `#0006` | Help and Tags backdrop |
| `--itarea-shadow-low` | `#0003` | Menus and feedback shadows |
| `--itarea-shadow-medium` | `#0005` | Help and Tags shadows |
| `--itarea-shadow-high` | `#0007` | Main and Audio dialog shadows |
| `--itarea-active-shadow` | `#3a240833` | Active-mode button shadow |
| `--itarea-dialog-text-color` | `#514a41` | Dialog explanatory text |

### Audio waveform

| Variable | Default | Purpose |
| --- | --- | --- |
| `--itarea-waveform-background` | `#fff` | Waveform canvas background |
| `--itarea-waveform-color` | `#7a9b8c` | Saved waveform |
| `--itarea-waveform-selection` | `rgba(119, 75, 10, .22)` | Selected audio region |
| `--itarea-waveform-cursor` | `#774b0a` | Playback/edit cursor |
| `--itarea-live-waveform-color` | `#a52720` | Live recording waveform |

### Typography, dimensions, and spacing

| Variable | Default | Purpose |
| --- | --- | --- |
| `--itarea-ui-font-family` | `system-ui, sans-serif` | Controls and dialog font |
| `--itarea-ui-font-size` | `16px` | Base interface font size |
| `--itarea-ui-line-height` | `1.5` | Interface line height |
| `--itarea-editor-line-height` | `1.5` | Default rich-text line height |
| `--itarea-widget-margin` | `1rem 0` | Space around each widget |
| `--itarea-control-height` | `36px` | Main toolbar control height |
| `--itarea-toolbar-gap` | `5px` | Toolbar control and row spacing |
| `--itarea-toolbar-padding` | `5px` | Toolbar inside padding |
| `--itarea-editor-padding` | `.75rem` | Editor inside padding |
| `--itarea-editor-action-gutter` | `3.8rem` | Space reserved for editor action icons |
| `--itarea-radius` | `.5rem` | Toolbars and editor corners |
| `--itarea-radius-small` | `.4rem` | Buttons and input corners |
| `--itarea-radius-large` | `.8rem` | Dialog corners |

The selected writing font, font size, and font weight are content settings and
remain controlled through the widget API and formatting toolbar. They are not
theme colors. The 36 text-color presets likewise format document content rather
than the widget interface.

When changing `--itarea-control-height`, keep it at least `32px` so icons remain
comfortable to use. Always check focus contrast and text contrast when creating
a dark or strongly colored theme.
