---
name: markdown-style-guide
description: Apply Markdown Style Guide when writing, reviewing, or editing Markdown docs.
license: MIT
compatibility: opencode
---

Apply Google Markdown Style to all Markdown written, reviewed, or edited. Flag violations. Fix on sight when editing.

## Philosophy

- Minimum viable docs. Small + accurate > sprawling + stale.
- Better > best. Fast iteration, lower bar per CL, more CLs happen.
- Delete cruft frequently in small batches.

## Document Layout

```
# Document Title

Short introduction (1-3 sentence, high-level overview).

[TOC]

## Topic

Content.

## See also

* https://link-to-more-info
```

- First heading = level-one (`# Title`), ideally same as filename.
- Short intro before `[TOC]`, not after.
- Remaining headings start at `##`.
- `## See also` at bottom for misc links.

## Table of Contents

- Use `[TOC]` directive unless all content above the fold.
- Place `[TOC]` **after** intro, **before** first `##`.
- Reason: screen readers read DOM order; placing `[TOC]` at bottom delays access.

## Character Line Limit

- **80 characters** max.
- Exceptions: links, tables, headings, code blocks.
- Lines with links may exceed 80 chars (wrap surrounding text normally).

## Trailing Whitespace

- **Never** use trailing whitespace for line breaks.
- Use trailing backslash `\` sparingly if line break needed.
- Prefer double newline (paragraph) over `<br />`.

## Capitalization

- Preserve original product/tool names and casing.
- Follow Google Developer Documentation Style Guide for title/header capitalization.

## Headings

### ATX-Style Only

- Use `#` syntax. **Never** use `=` / `-` underline style.

### Unique, Complete Names

- Each heading fully descriptive and unique, even sub-sections.
- Prefer `### Foo summary` / `### Bar summary` over duplicate `### Summary`.

### Spacing

- Blank line before and after headings.
- Space after `#`: `## Heading` not `##Heading`.

### Single H1

- One `# Title` per document. All others `##` or deeper.

## Lists

### Lazy Numbering

- Long/changing lists: use `1.` for every item (lazy numbering).
- Short fixed lists: fully numbered (`1.`, `2.`, `3.`).

### Nested List Spacing

- 4-space indent for nested content (both numbered and bulleted).
- Numbered: 2 spaces after number → 4-space text indent.
- Bulleted: 3 spaces after `*` → 4-space text indent.
- Wrapped text matches list text indent.

```markdown
1.  Item one.
    Wrapped text indented 4 spaces.
2.  Item two.

*   Bullet item.
    Wrapped text indented 4 spaces.
    1.  Nested numbered.
        Wrapped at 8 spaces.
```

- Small single-line lists: one space after `*` OK.

## Code

### Inline Code

- Use backticks for: short code, field names, file types in generic sense, escaping paths/URLs.

### Code Blocks

- **Always** use fenced code blocks (`` ``` ``). **Never** indented code blocks.
- **Always** declare language: `` ```python ``, `` ```shell ``, etc.
- Escape newlines in CLI snippets with trailing `\`.

### Code in Lists

- Indent code block to match list text indent (4 additional spaces from list marker).

## Links

### Path Style

- Use explicit paths: `[text](/path/to/page.md)`.
- **No** full qualified URLs for internal links.
- Relative links OK within same directory. **Avoid** `../` paths to other directories.

### Link Titles

- Use informative text. **Never** "here", "link", or raw URL as link text.
- Write sentence naturally, wrap most appropriate phrase as link.

### Reference Links

- Use reference links when link length disrupts readability, especially in tables.
- Define reference link before next heading (end of section where first used).
- Multi-section references go at document end.
- Don't use reference links for short URLs that fit inline.

## Images

- Use sparingly. Prefer simple screenshots.
- Use when showing is easier than describing (e.g., UI navigation).
- Always provide descriptive alt text.

## Tables

### When to Use

- Use for tabular data with relatively uniform distribution across two dimensions.
- **Don't** use tables when a list would suffice.

### Table Best Practices

- Keep cells short. Use reference links for long URLs.
- Avoid rambling prose in cells.
- If many columns are empty or data is uneven, prefer lists + subheadings.

## HTML

- **Strongly prefer Markdown over HTML.**
- Every HTML hack reduces readability and portability.
- Exception: big/complex tables where Markdown insufficient.

## Enforcement

When writing Markdown: follow all rules above. No exceptions unless rule itself specifies one.

When reviewing Markdown: flag violations with rule section reference. Suggest fix.

When editing existing docs: preserve style compliance. Fix violations on sight.
