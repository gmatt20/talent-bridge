---
name: html-css-style-guide
description: Apply HTML/CSS Style Guide when writing, reviewing, or editing HTML and CSS code.
license: MIT
compatibility: opencode
---

Apply Google HTML/CSS Style to all HTML and CSS code written, reviewed, or refactored. Flag violations. Fix on sight when editing.

## General Rules

### Protocol

- Always use HTTPS (`https:`) for embedded resources (images, media, stylesheets, scripts).
- Never omit protocol. Never use HTTP.

### Indentation

- **2 spaces.** No tabs. No mixing.

### Capitalization

- All code lowercase: element names, attributes, attribute values, selectors, properties, property values.
- Exception: strings and `CDATA`.

### Trailing Whitespace

- Remove all trailing whitespace.

### Encoding

- UTF-8 (no BOM).
- Specify in HTML: `<meta charset="utf-8">`.
- Don't specify encoding for CSS files (UTF-8 assumed).

### Comments

- Explain code purpose where helpful. Use `TODO: action item` for action items - no other formats (`@@`, etc.).

## HTML

### Document Type

- Always `<!doctype html>`. No quirks mode.

### Validity

- Use valid HTML. Test with W3C validator.

### Semantics

- Use elements for intended purpose: headings for headings, `<p>` for paragraphs, `<a>` for links.
- No `<div onclick="...">` as button substitute.

### Multimedia Fallback

- Images: always provide meaningful `alt` text. Decorative images: `alt=""`.
- Video/audio: provide transcripts and captions when available.

### Separation of Concerns

- Structure (HTML), presentation (CSS), behavior (JS) strictly separate.
- No inline styles. Minimize style/script links per document.

### Entity References

- Don't use entity references (`&mdash;`, `&rdquo;`, `&#x263a;`).
- Exceptions: `<`, `&`, and control/invisible characters.

### Optional Tags

- Omit optional tags for file size optimization (optional rule)
- HTML5 spec defines which tags can be omitted.

### type Attributes

- Omit `type` for stylesheets and scripts. HTML5 defaults to `text/css` and `text/javascript`.

```html
<!-- Wrong -->
 <link rel="stylesheet" href="style.css" type="text/css">
 <script src="app.js" type="text/javascript"></script>

<!-- Right -->
 <link rel="stylesheet" href="style.css">
 <script src="app.js"></script>
```

### id Attributes

- Avoid unnecessary `id` attributes. Prefer `class` for styling, `data-*` for scripting.
- When `id` required: always include hyphen in value (`user-profile` not `userProfile`).
- Reason: `id` values without hyphens become global `window` properties.

### HTML Formatting

- New line for every block, list, or table element.
- Indent child elements of block/list/table elements.
- Break long lines for readability (optional). Continuation lines indented to distinguish from children.

### HTML Quotation Marks

- **Double quotes** (`""`) for attribute values. Never single quotes.

```html
<!-- Wrong -->
<a class='maia-button'>Sign in</a>

<!-- Right -->
<a class="maia-button">Sign in</a>
```

## CSS

### Validity

- Use valid CSS. Test with W3C CSS validator.

### Class Naming

- Meaningful or generic names reflecting element purpose.
- No presentational names (`.button-green`) or cryptic names (`.yee-1901`)

```css
/* Wrong */
.yee-1901 {}
.button-green {}

/* Right */
.gallery {}
.login {}
.video {}
.aux {}
```

### Class Name Style

- Short as possible, long as necessary.

```css
/* Wrong */
.navigation {}
.atr {}

/* Right */
.nav {}
.author {}
```

### Class Name Delimiters

- Separate words with hyphens only. No underscores, no concatenation.

```css
/* Wrong */
.demoimage {}
.error_status {}

/* Right */
.video-id {}
.ads-sample {}
```

### Prefixes

- Use application-specific prefix as namespace in large/shared projects (optional).

```css
.adw-help {} /* AdWords */
.maia-note {} /* Maia */
```

### Type Selectors

- Don't qualify class names with element types.

```css
/* Wrong */
ul.example {}
div.error {}

/* Right */
.example {}
.error {}
```

### ID Selectors

- Avoid ID selectors in CSS. Use class selectors.

### Shorthand Properties

- Use shorthand properties (`font`, `padding`, `border`, etc.) whenever possible.

```css
/* Wrong */
padding-top: 0;
padding-right: 1em;
padding-bottom: 2em;
padding-left: 1em;

/* Right */
padding: 0 1em 2em;
```

### 0 and Units

- Omit units after `0` values unless required.

```css
flex: 0px; /* flex-basis requires unit */
margin: 0;
padding: 0;
```

### Leading 0s

- Always include leading `0` before decimal values.

```css
font-size: 0.8em;
```

### Hexadecimal Notation

- Use 3-char hex when possible.

```css
/* Wrong */
color: #eebbcc;

/* Right */
color: #ebc;
```

### !important

- Avoid `!important`. Use selector specificity to override properties.

### Hacks

- Avoid user-agent detection and CSS hacks. Last resort only.

### Declaration Order

- Alphabetize declarations (optional). Keep vendor prefixes sorted (`-moz` before `-webkit`).

```css
background: fuchsia;
border: 1px solid;
-moz-border-radius: 4px;
-webkit-border-radius: 4px;
border-radius: 4px;
color: black;
text-align: center;
```

### Block Content Indentation

- Indent all block content (rules within rules, declarations).

```css
@media screen, projection {

  html {
    background: #fff;
    color: #444;
  }

}
```

### Declaration Stops

- Semicolon after **every** declaration. No exceptions.

### Property Name Stops

- Space after colon, no space before colon.

```css
/* Wrong */
h3 {
  font-weight:bold;
}

/* Right */
h3 {
  font-weight: bold;
}
```

### Declaration Block Separation

- Space between last selector and opening brace `{`.
- Opening brace on same line as last selector.

```css
/* Wrong */
.video{
  margin-top: 1em;
}

/* Right */
.video {
  margin-top: 1em;
}
```

### Selector and Declaration Separation

- New line for each selector.
- New line for each declaration.

```css
/* Wrong */
a:focus, a:active {
  position: relative; top: 1px;
}

/* Right */
h1,
h2,
h3 {
  font-weight: normal;
  line-height: 1.2;
}
```

### Rule Separation

- Blank line between rules.

```css
html {
  background: #fff;
}

body {
  margin: auto;
  width: 50%;
}
```

### CSS Quotation Marks

- **Single quotes** (`''`) for attribute selectors and property values.
- No quotes in `url()` values.
- Exception: `@charset` requires double quotes.

```css
/* Wrong */
html {
  font-family: "open sans", arial, sans-serif;
}

/* Right */
html {
  font-family: 'open sans', arial, sans-serif;
}
```

### Section Comments

- Group sections with comments (optional). Separate sections with blank lines.

```css
/* Header */

.adw-header {}

/* Footer */

.adw-footer {}
```

## Enforcement

When writing HTML/CSS code: follow all rules above. No exceptions unless rule itself specifies one.

When reviewing HTML/CSS code: flag violations with line reference and rule section. Suggest fix.

When refactoring: preserve style compliance. Don't introduce violations.

Be consistent with surrounding code style.
