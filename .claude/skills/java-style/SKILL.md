---
name: java-style-guide
description: Apply Java Style Guide when writing, reviewing, or editing Java code.
license: MIT
compatibility: opencode
---

Apply Google Java style to all Java code written, reviewed, or refactored. Flag violations. Fix on sight when editing.

## Source File Basics

- File name = top-level class name + `.java`. Exactly one top-level class per file.
- Encoding: UTF-8. Always.
- No tabs. Only ASCII horizontal space (0x20) for whitespace.
- Use special escape sequences (`\b`, `\t`, `\n`, `\f`, `\r`, `\s`, `\"`, `\'`, `\\`) - never octal or Unicode escapes for these.
- Non-ASCII: prefer actual Unicode char with comment if helpful. Discourage `\uXXXX` outside strings/comments.

## Source File Structure (in order)

1. License/copyright (if present)
2. `package` declaration (required, never line-wrapped)
3. Imports
4. Exactly one top-level class

One blank line between each section.

## Imports

- **No wildcard imports** (`import foo.*` forbidden).
- **No module imports** (`import module java.base` forbidden).
- **No line-wrapping** on imports.
- **Order:** static imports (one block) → blank line → non-static imports (one block). ASCII sort within each block.
- **No static import for nested classes** - use normal imports.

## Formatting

### Braces

- Always use braces with `if`, `else`, `for`, `do`, `while` - even single-statement or empty bodies.
- K&R style: no line break before `{`, line break after `{`, line break before `}`.
- Empty blocks: `{}` OK (concise) unlesss multi-block (`if/else`, `try/catch`).

### Indentation

- Block indent: **+2 spaces**.
- Continuation lines: **+4 spaces** minimum.

### Column Limit

- **100 characters**. Exceptions: long URLs in Javadoc, package/import declarations, text block contents, shell commands in comments.

### One Statement Per Line

Always.

### Whitespace

**Vertical:** single blank line between class members. Multiple consecutive blank lines permitted but discouraged.

**Horizontal:**
- Space after `if`, `for`, `catch`, etc. before `(`.
- Space before `{` (except annotations like `@Foo({a, b})`).
- Space around binary/ternary operators, `&` in type bounds, `|` in catch, `:` in enhanced for, `->` in lambdas/switch rules.
- Space after `,`, `;`, `)` of cast.
- No space in `::` method refs or `.` dot separator.

**Horizontal alignment:** permited, never required. Don't add alignment-only changes to unrelated lines.

### Line-Wrapping

- Break at higher syntactic level.
- Non-assignment operator break: **before** the symbol.
- Assignment operator break: **after** the symbol (preferred).
- Method/constructor name stays attached to `(`.
- Comma stays attached to preceding token.
- Never break adjacent to `->` in lambda/switch rule (except immediately after `->` if followed by single unbraced expression).

## Specific Constructs

### Variables

- One variable per declaration (`int a, b;` forbidden).
- Declare close to first use, not at block start.
- C-style array declarations forbidden: `String[] args` not `String args[]`.

### Switch

- Indent contents +2. New-style (`->`) preferred for switch expressions.
- Old-style: mark fall-through with `// fall through`.
- Every switch must be exhaustive (add `default` if needed).

### Annotations

- Type-use annotation: immediately before annotated type (`final @Nullable String name`).
- Class/method annotations: one per line before declaration.
- Single parameterless method annotation may share line: `@Override public int hashCode()`.
- Field annotations: multiple may share one line.

### Modifiers Order

```
public protected private abstract default static final sealed non-sealed
transient volatile synchronized native strictfp
```

### Numeric Literals

- `long` suffix: uppercase `L` (never `l`).

### Text Blocks

- Opening `"""` on new line. Closing `"""` on new line, same indent level.

## Naming

| Kind | Style | Example |
|---|---|---|
| Package/module | all lowercase, no underscores | `com.example.deepspace` |
| Class/interface/enum/annotation | UpperCamelCase | `ImmutableList` |
| Method | lowerCamelCase | `sendMessage` |
| Constant (`static final`, deeply immutable) | UPPER_SNAKE_CASE | `MAX_RETRY_COUNT` |
| Non-constant field | lowerCamelCase | `computedValues` |
| Parameter | lowerCamelCase (no single-char in public methods) | `userId` |
| Local variable | lowerCamelCase (never styled as constant) | `currentIndex` |
| Type variable | single capital letter or `ClassNameT` | `E`, `RequestT` |

- No prefixes/suffixes (`name_`, `mName`, `s_name`, `kName` all wrong).
- Camel case rule: lowercase everything, then uppercase first letter of each word (or each word except first for lowerCamelCase). Acronyms treated as words: `XmlHttpRequest` not `XMLHTTPRequest`.
- Test class: `FooTest`. Test methods: underscores OK for logical separation.

## Programming Practices

- **`@Override`:** always, except when parent is `@Deprecated`.
- **Caught exceptions:** never silently ignored. Log, rethrow as `AssertionError`, or comment why empty catch is justified.
- **Static members:** qualify with class name, not instance (`Foo.method()` not `foo.method()`).
- **No `Object.finalize()`.**

## Javadoc

- Required on every visible (public/protected) class, member, record component.
- Basic form: `/** ... */`. Single-line OK when no block tags and fits one line.
- Summary fragment: noun/verb phrase, not a full sentence starting with "This method...". Capitalized and punctuated.
- Block tag order: `@param`, `@return`, `@throws`, `@deprecated`. None with empty description.
- Paragraphs separated by blank `*` line; subsequent paragraphs start with `<p>`.
- Self-explanatory members (`getFoo`) may skip Javadoc. Overrides may skip.
- Wrong: `/** @return the customer ID */` → Right: `/** Returns the customer ID. */` or `/** {@return the customer ID} */`

## Enforcement

When writing Java code: follow all rules above. No exceptions unless rule itself specifies one.

When reviewing Java code: flag violations with line reference and rule section. Suggest fix.

When refactoring: preserve style compliance. Don't introduce violations.
