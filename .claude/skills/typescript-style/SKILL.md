---
name: typescript-style-guide
description: Apply TypeScript Style Guide when writing, reviewing, or editing TypeScript code.
license: MIT
compatibility: opencode
---

Apply Google TypeScript Style to all TypeScript code written, reviewed, or refactored. Flag violations. Fix on sight when editing.

## Source File Basics

- Encoding: **UTF-8**.
- Only ASCII horizontal space (0x20) for whitespace. Escape all others in strings.
- Use special escape sequences (`\n`, `\t`, etc.) over numeric escapes. No legacy octal escapes.
- Non-ASCII: use actual Unicode char (e.g. `∞`). For non-printable, use hex/Unicode escape + comment.

## Source File Structure

Order: copyright → `@fileoverview` JSDoc → imports → implementation. One blank line between sections.

## Imports

### Variants

| Type | Example | When |
|------|---------|------|
| Namespace | `import * as foo from '...';` | Many symbols from large API |
| Named | `import {Foo} from '...';` | Frequently used / clear-named symbols |
| Default | `import Foo from '...';` | Only for external code requiring it |
| Side-effect | `import '...';` | Libraries loaded for side effects only |

### Paths

- Use relative imports (`./foo`) within same project.
- Limit parent steps (`../../../`).

### Namespace vs Named

- Named: frequently used symbols or clear names. Alias with `as` if needed.
- Namespace: many symbols from large API, or when names are generic (`Model`, `Controller`).

### Renaming

- Rename to avoid collisions, clarify generated names, or improve readability.

### Import type

- Use `import type {...}` when symbol used only as type. Regular imports for values.

## Exports

- **Named exports only.** No `export default`.
- Use `export type` when re-exporting types.
- Minimize exported API surface. Don't export unused symbols.
- **No mutable exports** (`export let` disallowed). Use getter functions for mutable bindings.

## Modules, Not Namespaces

- Use ES6 modules (`import`/`export`). **No `namespace Foo {}`**. No `require()`. No `/// <reference>`.

## Container Classes

- Don't create classes with only static methods/properties for namespacing. Export individual constants/functions.

## Variables

- **`const` by default.** `let` when reassignment needed. **Never `var`.**
- One variable per declaration.
- No use before declaration.

## Arrays

- **No `Array()` constructor.** Use `[]` or `Array.from`.
- No non-numeric properties on arrays.
- Spread: only spread iterables into arrays. No spreading `null`/`undefined`/primitives.
- Destructuring OK. Use `[]` default for optional destructured params.

## Objects

- **No `Object()` constructor.** Use `{}`.
- No unfiltered `for (... in ...)`. Use `Object.keys`/`Object.values`/`Object.entries`.
- Spread: only spread objects into objects. No spreading arrays/primitives into objects.
- Destructuring: keep simple. One level of unquoted shorthand in params. Defaults on left-hand side.

## Classes

### Declarations

- No semicolon after class declaration. Semicolon after class expression statement.
- Single blank line separating methods.

### Constructors

- Always use parentheses: `new Foo()`, not `new Foo`.
- Omit empty constructors (ES2015 provides default). Keep constructors with parameter properties/decorators/visibility modifiers.
- Single blank line above and below constructor.

### Members

- **No `#private` fields.** Use TypeScript visibility annotations (`private`).
- Use `readonly` for never-reassigned properties.
- Use parameter properties instead of manual assignment.
- Initialize fields at declaration when possible.

### Visibility

- Limit visibility as much as possible.
- **Never use `public` modifier** unless declaring non-readonly public parameter properties.
- TypeScript symbols are public by default.
- No `obj['foo']` to bypass visibility.
- Properties used outside class lexical scope (e.g. Angular templates): use `protected` or `public`, not `private`.

### Getters/Setters

- Getters must be pure functions (no side effects).
- Hidden properties may use prefix/suffix (`internal_`, `_wrapped`).
- At least one accessor must be non-trivial. No pass-through-only accessors.
- **No `Object.defineProperty`** for getters/setters.

### Static Methods

- Avoid private static methods - prefer module-local functions.
- No dynamic dispatch of static methods; call only on defining class.
- **No `this` in static context.**

### Disallowed

- No direct prototype manipulation (except framework code).

## Functions

### Prefer function declarations

- Use `function foo()` for named functions. Arrow functions OK when explicit type annotation needed.

### Nested functions

- Arrow functions or function declarations OK inside methods/functions.

### No function expressions

- Use arrow functions instead. Exception: dynamic `this` rebinding or generators.

### Arrow function bodies

- Concise body only when return value used.
- Block body when return value unused (ensures `void` return).
- Use `void` operator for explicit unused returns: `myPromise.then(v => void console.log(v))`.

### this

- Only in class constructors/methods, explicit `this`-typed functions, or arrow functions in valid `this` scope.
- Prefer arrow functions over `f.bind(this)` or `const self = this`.

### Callbacks

- Pass arrow functions as callbacks, not named functions - explicitly forward parameters.

### Arrow functions as properties

- Generally avoid on classes. Use arrow functions to call instance methods at call sites.
- OK for event handlers or template bindings.

### Event handlers

- Arrow functions OK when no uninstall needed.
- Arrow function properties when uninstall needed (stable reference).
- **No `bind` in event handler installation.**

### Parameter defaults

- No side effects in default initializers. Keep simple.
- Prefer destructuring for many optional params.

### Rest/spread

- Use rest parameters, not `arguments`. Never name variable `arguments`.
- Use spread syntax over `Function.prototype.apply`.

### Formatting

- No blank lines at start/end of function body.
- Generators: `function* foo()`, `yield* iter`.
- No space after `...` in rest/spread.

## Interfaces

### Strings

- **Single quotes** (`''`), not double quotes.
- No backslash line continuations. Use `+` concatenation or template literals.
- Prefer template literals over complex concatenation.

### Numbers

- Use `0x`, `0o`, `0b` prefixes (lowercase). No leading zeros otherwise.

### Type Coercion

- Use `String()`, `Boolean()` (no `new`!), template literals, or `!!` for coercion.
- **Enum values**: never coerce to boolean with `Boolean()`/`!!`. Compare explicitly.
- Use `Number()` for parsing. Check `isFinite`/`isNaN`. No unary `+`. No `parseInt`/`parseFloat` (except non-base-10 with input validation).
- No implicit boolean coercion of enum values.

## Control Structures

- Always use braced blocks. Exception: single-line `if` may elide block.
- Avoid assignment in control statements. If used, wrap in extra parentheses.
- Prefer `for...of` for arrays. `for...in` only for dict-style objects.
- Use `Object.keys`/`Object.values`/`Object.entries` over `for...in`.

## Equality

- **Always `===` and `!==`.** Exception: `== null` / `!= null` to cover both `null` and `undefined`.

## Type Assertions

- Use `as` syntax, not angle brackets.
- Add comment explaining why assertion is safe.
- Prefer runtime checks (`instanceof`, truthiness) over assertions.
- Double assertions: cast through `unknown` (not `any`).
- Use type annotations (`: Foo`) on object literals, not assertions (`as Foo`).

## Exception Handling

- Always `new Error()`, not `Error()`.
- Only throw `Error` or subclasses. Never throw strings/primitives.
- Catch blocks: assume all errors are `Error` instances. Don't defensively handle non-Error types.
- Empty catch blocks: add comment explaining why. No silent swallowing.
- Keep `try` blocks focused - minimize code inside.

## Switch Statements

- Always include `default` (last). No fall-through on non-empty cases. Empty cases may fall through.

## Decorators

- Don't define new decorators (except Angular/Polymer). Decorator immediately precedes symbol, no blank line between.

## Disallowed Features

- No wrapper objects (`new String()`, `new Boolean()`, `new Number()`).
- No reliance on ASI - always use semicolons.
- No `const enum` - use plain `enum`.
- No `debugger` in production.
- No `with` keyword.
- No `eval` or `Function(...string)`.
- No non-standard ECMAScript features.
- No modifying builtin prototypes.

## Naming

| Style | Category |
|-------|----------|
| `UpperCamelCase` | class, interface, type, enum, decorator, type params, TSX components |
| `lowerCamelCase` | variable, parameter, function, method, property, module alias |
| `CONSTANT_CASE` | global constants, enum values |

- Descriptive names. No ambiguous abbreviations.
- Treat acronyms as words: `loadHttpUrl` not `loadHTTPURL`.
- No `$` prefix (unless framework requires). Observable `$` suffix: team discretion, be consistent.
- No `_` prefix/suffix. No `_` as standalone identifier.
- No `#ident`.
- No type decoration in names (`IMyInterface`, `opt_` prefix).
- Type parameters: single uppercase or `UpperCamelCase`.

## Type System

### Inference

- Rely on inference for trivially inferred types (`string`, `number`, `boolean`, `RegExp`, `new` expressions).
- Explicitly specify types for complex expressions or empty generic collections.

### Return types

- Author's discretion. Reviewer may request for clarity.

### undefined/null

- Both OK. Context-dependent (`Map.get` -> `undefined`; DOM -> `null`).
- **No `|null` or `|undefined` in type aliases.** Add at usage site.
- Prefer `?` optional over `|undefined`.

### Structural types

- Use interfaces for structural types, not classes.
- Explicitly annotate type at declaration.

### Interfaces over type aliases

- Use `interface` for object types, not `type` alias.

### Array syntax

- Simple types: `T[]` / `readonly T[]`.
- Complex types: `Array<{...}>` / `Array<string|number>`.

### Mapped/conditional types

- Use simplest construct possible. Repetition > complex type expressions.

### any

- Avoid. Prefer specific types, `unknown`, or suppressed lint with comment.
- **No `{}` type** for most cases - use `unknown`, `Record<string, T>`, or `object`.

### Tuple types

- Use tuples over `Pair` interfaces. Prefer named properties when clearer.

### Wrapper types

- Never use `String`, `Boolean`, `Number`, `Object`. Always lowercase primitives.

### Return-type-only generics

- Don't create APIs with return-type-only generics. Always specify explicitly when calling existing ones.

## Toolchain

- All files must pass type checking.
- **No `@ts-ignore`**, `@ts-expect-error`, `@ts-nocheck` in production. `@ts-expect-error` OK in tests with justification.

## Comments & Documentation

- `/** JSDoc */` for user-facing documentation. `//` for implementation comments.
- Multi-line comments: use `//` style, not `/* */` blocks.
- JSDoc written in Markdown.
- Document all top-level exports. Exception: tooling-only symbols (e.g. `@NgModule` classes).
- Class comments: enough info for how/when to use.
- Method comments: start with third-person verb phrase.
- Parameter properties: use `@param` JSDoc.
- **No JSDoc type annotations** (`@param`, `@return` types, `@implements`, `@enum`, etc.) - TypeScript handles types.
- Omit `@param`/`@return` when they only restate name/type. Include only when adding information.
- Use `/* paramName= */` comments at call sites when parameter meaning unclear.
- JSDoc before decorators, not between decorator and symbol.

## Enforcement

When writing TypeScript: follow all rules above. No exceptions unless rule itself specifies one.

When reviewing TypeScript: flag violations with line reference and rule section. Suggest fix.

When refactoring: preserve style compliance. Don't introduce violations.
