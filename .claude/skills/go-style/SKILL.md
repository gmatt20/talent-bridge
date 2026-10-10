---
name: go-style-guide
description: Apply Go Style Guide when writing, reviewing, or editing Go code.
license: MIT
compatibility: opencode
---

Apply Google Go Style to all Go code written, reviewed, or refactored. Flag violations. Fix on sight when editing.

## Principles (priority order)

1. **Clarity** - reader understands *what* and *why*. Comments explain *why*, not *what*.
2. **Simplicity** - simplest way; no unnecessary abstraction; no "clever" code.
3. **Concision** - high signal-to-noise; avoid repetition, extraneous syntax, opaque names.
4. **Maintainability** - easy to modify; comprehensive tests; minimal dependencies.
5. **Consistency** - match surrounding code, package, then codebase.

**Least mechanism**: prefer core language constructs -> stdlib -> established libraries -> new dependencies.

## Formatting

- All files must pass `gofmt`. Generated code too (via `format.Source`).
- **MixedCaps** / **mixedCaps** for all names. Never snake_case (except filenames, test funcs).
- **No fixed line length**. If too long, refactor. Don't split before indentation changes or to break long strings/URLs.

## Naming

### Packages

- Lowercase, no underscores, no caps. Concise single-word preferred (`tabwriter` not `tab_writer`).
- Avoid names easily shadowed by local vars (`usercount` not `count`).
- No generic names: `util`, `common`, `helper`, `model`.
- `_test` suffix allowed for black-box/integration test packages.

### Receivers

- 1-2 letter abbreviation of type. Consistent per type. Never `this`/`self`.

| Bad | Good |
|-----|------|
| `func (tray Tray)` | `func (t Tray)` |
| `func (this *ReportWriter)` | `func (w *ReportWriter)` |

### Constants

- `MixedCaps`. No `MAX_LENGTH`, no `kPrefix`. Name by role, not value.

### Initialisms

- All same case: `URL`/`url`, `ID`/`id`, `XMLAPI`/`xmlAPI`, `gRPC`/`GRPC`.
- Never `Url`, `Id`, `Grpc`.

### Getters

- No `Get`/`get` prefix. Use `Counts` not `GetCounts`. Use `Compute`/`Fetch` for expensive ops.

### Variables

- Name length ∝ scope size, ∝ 1/usage frequency.
- Omit type words: `users` not `userSlice`, `count` not `numUsers`.
- Single-letter OK in small scopes: `r` for `io.Reader`, `w` for `io.Writer`, `i` for loop index.
- Don't just drop letters (`Sandbox` not `Sbx`).

### Repetition - avoid

- **Package vs symbol**: `widget.New` not `widget.NewWidget`; `db.Load` not `db.LoadFromDatabase`.
- **Variable vs type**: `name` not `nameString`; `users` not `numUsers`.
- **Context vs local**: `Name()` not `ProjectName()` on `*Project`; `Report` not `AdsTargetingRevenueReport` in `ads/targeting/revenue/reporting`.

### Underscores

- Generally forbidden in names. Exceptions: generated-code package names, test/benchmark/example funcs in `*_test.go`, cgo/syscall identifiers.

## Comments & Documentation

- **Doc comments**: required on all exported names. Full sentences starting with symbol name.
- **Package comments**: immediately above `package` clause, no blank line.
- Comment sentences: capitalized, punctuated. Fragments OK for end-of-line struct field comments.
- **Comment line length**: no hard limit. Wrap around 80-100 for readability. Don't put huge prose on one line.
- Provide **runnable examples** in `*_test.go` files.
- **Named result params**: use when same-type returns need disambiguation or caller must act on specific param. Don't use for naked returns in medium+ functions.

## Imports

### Grouping (in order, separated by blank lines)

1. Standard library
2. Other (project/vendored) packages
3. Protocol buffer imports (with `pb` suffix)
4. Side-effect imports (`_ "pkg"`)

### Rules

- **Don't rename** unless collision or uninformative name. Rename most-local package on collision.
- Proto packages: remove underscores, add `pb` suffix (`foosvcpb`).
- Collision with local var: use `pkg` suffix (`urlpkg`).
- **No `import .`** - obscures origin of identifiers.
- **Blank imports** (`import _`) only in `main` package or tests.

## Errors

### Returning

- `error` is always last return. Return `nil` for success. Use `error` type, not concrete error types.

### Strings

- Lowercase, no trailing punctuation: `fmt.Errorf("something bad happened")`.

### Handling

- Never discard with `_` without explanation. Handle, return, or `log.Fatal`.
- **Indent error flow**: handle error first (`if err != nil { return }`), normal code after - no `else`.

### In-band errors

- Don't return `-1`/`""`/`null` for errors. Use multiple returns: `(value, ok bool)` or `(value, error)`.

### Wrapping

- `%v` to annotate (drop structure). `%w` to wrap (preserve for `errors.Is`/`errors.As`).
- Place `%w` at end: `fmt.Errorf("context: %w", err)`.
- Exception: sentinel errors at beginning: `fmt.Errorf("%w: detail", ErrCategory)`.

### Sentinel errors

- Use typed/sentinel errors for programmatic inspection. Don't match on error strings.

## Language

### Literals

- Use field names for external package structs. Optional for package-local types.
- Closing brace same indentation as opening.
- Omit zero-value fields when clarity preserved.
- Omit repeated type names in slice/map literals.
- `gofmt -s` removes redundant type names.

### Nil slices

- Prefer `var t []string` over `t := []string{}`. Check emptiness with `len(s) == 0`, not `s == nil`.

### Copying

- Don't copy types with pointer-associated methods (`*T`). Don't copy `sync.Mutex`, `bytes.Buffer`.

### Don't panic

- Use `error` + multiple returns. Use `log.Exit` or `log.Fatal` for fatal startup errors.
- Panic OK only for: API misuse invariants, internal parser recovery (with `recover` at package boundary), `MustXYZ` init helpers.

### Must functions

- `MustXYZ` convention for init-time helpers that panic on failure. In tests, use `t.Fatal` + `t.Helper`.

### Goroutine lifetimes

- Make goroutine exit obvious. Use `context.Context` + `sync.WaitGroup`. Don't fire-and-forget.
- Prefer **synchronous functions** over async. Let caller add concurrency.

### switch/break

- No redundant `break` in switch cases. Go auto-breaks. Use `fallthrough` for C-style. Use labels to break out of `for` from inside `switch`.

### Receiver type

| Condition | Receiver |
|-----------|----------|
| Mutates receiver | Pointer |
| Contains uncopyable fields (`sync.Mutex`) | Pointer |
| Large struct/array | Pointer |
| Slice (no reslice) | Value |
| Built-in type, no mutation | Value |
| Map, func, channel | Value |
| Small value type, no pointers | Value |
| When in doubt | Pointer |

Prefer all-pointer or all-value methods per type.

### Pass values

- Don't pass pointers just to save bytes if function only reads `*x`. Pass value directly.
- Exception: large structs, proto messages -> pointer.

### Type aliases

- `type T1 = T2` only for package migration. Use `type T1 T2` for new types.

### Miscellaneous

- Use `%q` for quoted strings in output. Use `any` over `interface{}`.
- Conditionals: variable on left (`result == "foo"` not `"foo" == result`).

## Interfaces

- **Don't create until real need exists.** No premature abstraction.
- Consumer defines interface (not producer), with only needed methods.
- Keep small. Keep unexported if internal-only.
- Accept interfaces, return concrete types. Exceptions: encapsulation (`error`), factory/strategy patterns, breaking import cycles.
- Don't wrap RPC clients in manual interfaces for testing. Use real transports.
- Don't export test doubles of interfaces.

## Generics

- Allowed when fulfilling real business need. Don't use prematurely.
- Start concrete; add polymorphism later if multiple types need it.
- Don't build DSLs or error-handling frameworks with generics.

## Contexts

- `context.Context` always first parameter.
- Exceptions: HTTP handlers (`req.Context()`), streaming RPC (`stream.Context()`), tests (`t.Context()` in Go 1.24+).
- Don't store context in structs. Pass as parameter.
- Don't create custom context types. No `context.Background()` in library code (only entrypoints).

## Common Libraries

### Flags

- Flag names: `snake_case`. Variable names: `mixedCaps`. Define only in `package main`.
- Libraries must not export flags as side effects.

### Logging

- `log.Info(v)` when no formatting needed. `log.Fatal` for stacktrace abort, `log.Exit` for clean abort.
- Use verbose levels: `V(1)` extra info, `V(2)` tracing, `V(3)` state dumps.
- Don't duplicate: if returning error, let caller log.

### crypto/rand

- Never `math/rand` for keys. Use `crypto/rand.Reader`.

## Testing

### Fundamentals

- Use `testing` package only. No assertion libraries. No third-party test frameworks.
- Failure messages: `YourFunc(%v) = %v, want %v`. Include function name, inputs, got, want.
- `got` before `want`. Use `cmp.Equal`/`cmp.Diff` for struct comparison (not `reflect.DeepEqual`).
- Prefer `t.Error` (keep going) over `t.Fatal` (stop). Use `t.Fatal` only when continuation meaningless.

### Table-driven tests

- Factor common logic into table structs. Use subtests (`t.Run`).
- Subtest names: readable, filterable, no slashes, no prose. Include inputs in failure message, not subtest name.
- Don't identify rows by index. Use descriptive name or field.
- Use field names in struct literals for test cases.

### Test helpers

- Call `t.Helper()`. Pass `*testing.T` after context. Use `t.Fatal` for setup failures.
- Don't use helpers to build assertion libraries.
- Don't call `t.Fatal` from separate goroutines.

### Test packages

- Same package (`package foo`) for internal access. `_test` suffix for black-box tests.

### Test doubles

- Name test double packages: `<pkg>test` (`creditcardtest`). Name doubles by behavior (`AlwaysCharges`, `AlwaysDeclines`).
- Prefix spy/stub variables to distinguish from production types.

### Error semantics in tests

- Don't string-match errors. Use `errors.Is`, `cmp` with `cmpopts.EquateErrors`.
- When only caring about error presence, use `bool` comparison.

### Scoping

- Setup as close to test as possible. Don't use `init()` for test data.
- Use `sync.Once` for expensive shared setup without teardown.
- Custom `TestMain` only when all tests need shared expensive resource with teardown.

## Function Formatting

- Keep signature on single line. Factor out local variables to shorten call sites.
- Don't break calls at arbitrary line lengths. Group line breaks semantically.
- Use option structs for many parameters. Variadic options for optional configuration.
- Don't break long string literals. Break after format string, args on next lines.

## Variable Declarations

- Non-zero init: prefer `:=`. Zero-value: prefer `var`.
- Maps must be explicitly initialized before write. Reading zero-value maps is fine.
- Use `make` with size hints only when size known and performance matters.

## Channel Direction

- Specify `<-chan` / `chan<-` where possible.

## String Concatenation

- Simple: `+`. Formatted: `fmt.Sprintf`. Piecemeal: `strings.Builder`. Multi-line constant: backtick `` ` ``.

## Global State

- Libraries must not force global state. Provide instance-based APIs.
- No package-level registries, singletons, or callback lists as primary API.
- If providing convenience default, it must be thin proxy to instance API, used only in `main`.

## Signal Boosting

- When `err == nil` (reverse of common pattern), add comment: `// if NO error`.
- When `=` vs `:=` matters, extract to separate lines with comment.

## Shadowing

- Beware `:=` in new scopes creating shadow variables. Use `=` to reassign outer variable.
- Don't shadow standard package names with local variables in large scopes.

## Source

Based on [Google Go Style Guide](https://google.github.io/styleguide/go/).
