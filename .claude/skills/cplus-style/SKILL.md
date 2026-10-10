---
name: cplus-style-guide
description: Apply C++ Style Guide when writing, reviewing, or editing C++ code.
license: MIT
compatibility: opencode
---

Apply Google C++ Style to all C++ code written, reviewed, or refactored. Flag violations. Fix on sight when editing.

Target: **C++20**. No C++23 features. No nonstandard extensions.

## Header Files

- Every `.cc` file has associated `.h` file (exceptions: unit tests, small `main()`-only files).
- Headers must be **self-contained** (compile on their own), end in `.h`.
- Non-header includes end in `.inc` - use sparingly.
- **`#define` guards** required: format `<PROJECT>_<PATH>_<FILE>_H_`.
- **Include What You Use**: don't rely on transitive inclusions.
- **Avoid forward declarations** where possible. Include needed headers instead.
- Only define functions in headers when short (~10 lines or fewer). Longer definitions go in `.cc`. Mark with `inline` if in header.

### Include Order

1. Related header (`dir2/foo2.h`)
2. Blank line
3. C system headers (angle brackets, `.h` extension)
4. Blank line
5. C++ standard library headers (no extension)
6. Blank line
7. Other libraries' `.h` files
8. Blank line
9. Project `.h` files

Alphabetical within each section. Use angle brackets only for standard/system/required third-party headers. Use quotes for project headers.

## Scoping

### Namespaces

- Place code in namespaces. Unique names based on project name/path.
- **No `using namespace foo;`** (using-directives forbidden).
- **No inline namespaces.**
- Terminate multi-line namespaces with `// namespace name` comment.
- No indentation inside namespaces.
- Single-line nested declarations preferred: `namespace my_project::my_component {`.
- No namespace aliases at namespace scope in headers (except internal namespaces).

### Internal Linkage

- In `.cc` files: use unnamed namespace or `static` for file-local definitions.
- Never use unnamed namespace or `static` in `.h` files.

### Local Variables

- Declare in narrowest scope possible, near first use.
- Initialize at declaration, not separate declaration + assignment.

### Static and Global Variables

- Objects with static storage duration: **forbidden unless trivially destructible**.
- Constant initialization: always allowed; mark with `constexpr` or `constinit`.
- Dynamic initialization of non-local statics: discouraged; allowed only if initialization ordering doesn't matter.
- Function-local statics with dynamic init: allowed.
- Global strings: prefer `constexpr string_view`, char arrays, or char pointers to string literals.
- No `std::string` or other non-trivially-destructible types as static/global variables.

### `thread_local` Variables

- At class/namespace scope: must use `constinit` (or `constexpr`).
- Inside functions: no init concerns, but watch for use-after-free on thread exit.
- Prefer trivially destructible types for `thread_local`.

## Classes

### Constructors

- Never call virtual functions in constructors.
- If construction can fail, consider factory function or `Init()` method.

### Implicit Conversions

- Mark single-argument constructors and conversion operators `explicit`.
- Exception: copy/move constructors, `std::initializer_list` constructors.

### Copyable and Movable Types

- Public API must make clear: copyable, move-only, or neither.
- Explicitly declare or delete copy/move operations in public section.

### Structs vs. Classes

- `struct`: passive data carrier, all fields public, no invariants.
- `class`: when functionality, invariants, or wide visibility needed.
- Structs: prefer over `std::pair`/`std::tuple` when elements have meaningful names.

### Inheritance

- Prefer composition over inheritance.
- All inheritance `public`.
- Use `override` or `final` on overrides - never `virtual` on overrides.
- Multiple implementation inheritance: strongly discouraged.
- Make base classes abstract when possible.

### Operator Overloading

- Define only if meaning obvious and consistent with built-in operators.
- Define in same headers/`.cc`/namespaces as operand types.
- **Do not** overload `&&`, `||`, `,` (comma), unary `&`.
- **No user-defined literals** (`operator""`).

### Access Control

- Data members: `private` (except constants).
- Test fixture data members in `.cc`: may be `protected`.

### Declaration Order

1. `public:`, then `protected:`, then `private:`.
2. Within each: types/aliases -> non-static data (structs only) -> static constants -> factory functions -> constructors/assignment -> destructor -> other functions -> other data members.

## Functions

### Inputs and Outputs

- Prefer return values over output parameters.
- Non-optional inputs: values or `const` references.
- Non-optional outputs/in-out: references.
- Optional inputs: `std::optional` (by value) or `const` pointer.
- Optional outputs: non-`const` pointer.
- Input-only parameters before output parameters.

### Short Functions

- Target ~40 lines max. Break up longer functions when reasonable.

### Overloading

- Allowed when no semantic difference between variants.
- Place umbrella comment before first declaration.

### Default Arguments

- Allowed on non-virtual functions with constant defaults.
- Banned on virtual functions.

### Trailing Return Types

- Use only when required (lambdas) or significantly more readable (complex template returns).

## Other C++ Features

### Smart Pointers

- Prefer `std::unique_ptr` for ownership transfer.
- Use `std::shared_ptr` only with good reason (prefer `std::shared_ptr<const Foo>`).
- Never use `std::auto_ptr`.

### Rvalue References

- Use only for: move constructors/assignment, `&&`-qualified consuming methods, forwarding references with `std::forward`, overload pairs.

### Friends

- Allowed within reason. Define in same file as befriended class.

### Exceptions

- **Do not use C++ exceptions.** No `std::exception_ptr`, no `std::nested_exception`.

### `noexcept`

- Use when useful for performance and semantically correct.
- Prefer unconditional `noexcept` in exception-disabled environments.

### RTTI

- Avoid `typeid` and `dynamic_cast`. Prefer virtual methods or Visitor pattern.
- OK in unit tests.

### Casting

- Use C++ casts: `static_cast`, `const_cast`, `reinterpret_cast`, `std::bit_cast`.
- Prefer brace initialization for arithmetic conversions: `int64_t{x}`.
- **No C-style casts** `(int)x` (except cast to `void`).

### Streams

- Use only when best tool (ad-hoc, local, developer-facing I/O).
- Avoid stateful stream API (no `imbue()`, `xalloc()`).

### Preincrement/Predecrement

- Prefer prefix `++i` / `--i` unless postfix semantics needed.

### `const`

- Use `const` wherever meaningful in APIs.
- `const` methods: required unless method mutates logical state.
- `const` placement: prefer `const` first (`const int*`), but be consistent locally.

### `constexpr` / `constinit` / `consteval`

- Use `constexpr` for true constants and supporting functions.
- Use `consteval` to restrict to compile-time only.
- Don't complexify functions just to enable `constexpr`.

### Integer Types

- Use `int` for general integers. Use `<stdint.h>` exact-width types (`int16_t`, `int64_t`) when size matters.
- Avoid `unsigned` types except for bit patterns/modular arithmetic.
- Avoid `short`, `long`, `long long`.

### Floating-Point Types

- Use `float` and `double` only. No `long double`.

### Macros

- Avoid macros. Prefer `inline` functions, `const`, `enum`.
- If necessary: ALL_CAPS with project prefix, `#define` right before use, `#undef` right after.
- Never export macros from headers without globally unique name.

### `nullptr`

- Use `nullptr` for pointers, `'\0'` for null character. Never `0` for pointers.

### `sizeof`

- Prefer `sizeof(varname)` over `sizeof(type)`.

### Type Deduction / `auto`

- Use only when it makes code clearer or safer, not just to save typing.
- Function template arg deduction: almost always OK.
- Local variable `auto`: OK when type is obvious or irrelevant.
- Return type deduction: only for small functions with narrow scope.
- No `auto` parameters in non-lambda functions (use named template parameters).

### CTAD (Class Template Argument Deduction)

- Only use with templates that provide explicit deduction guides (all `std` templates presumed OK).

### Designated Initializers

- Use only C++20-compliant form (same order as struct definition).

### Lambda Expressions

- Prefer explicit captures when lambda may escape current scope.
- Default capture by reference `[&]`: only when lifetime obviously shorter than captures.
- Default capture by value `[=]`: only for short lambdas with obvious captured set, no implicit `this`.

### Template Metaprogramming

- Avoid complexity. Hide as implementation detail. Comment extensively.

### Concepts and Constraints

- Use sparingly. Prefer `requires(Concept<T>)` syntax over `template<Concept T>`.
- Prefer standard concepts over type traits.
- Don't define concepts that duplicate function body logic.
- New concept declarations: rare, internal only.

### Modules

- **Do not use C++20 modules.**

### Coroutines

- Only via project-approved libraries. No custom promise/awaitable types.

### Disallowed Standard Library

- `<ratio>` - too template-heavy.
- `<cfenv>` / `<fenv.h>` - unreliable compiler support.
- `<filesystem>` - insufficient test support, security vulnerabilities.

## Naming

| Kind | Style | Example |
|---|---|---|
| File | lowercase, `_` or `-` | `my_useful_class.cc` |
| Type (class/struct/enum/alias/template param) | PascalCase | `MyExcitingClass` |
| Concept | PascalCase | `Hashable` |
| Variable (local, parameter) | snake_case | `table_name` |
| Class data member | snake_case + trailing `_` | `table_name_` |
| Struct data member | snake_case (no trailing `_`) | `num_entries` |
| Constant (`constexpr`/`const`, static storage) | `k` + MixedCase | `kDaysInAWeek` |
| Function | PascalCase | `AddTableEntry()` |
| Accessor/mutator | snake_case (may match member) | `count()`, `set_count()` |
| Namespace | snake_case | `my_project` |
| Enumerator | `k` + MixedCase | `kOk`, `kOutOfMemory` |
| Macro | ALL_CAPS + project prefix | `MYPROJECT_ROUND` |

- Source files: `.cc`; headers: `.h`; textual includes: `.inc`.
- Abbreviations: capitalize as single word (`StartRpc` not `StartRPC`).
- No Hungarian notation.

## Comments

- Use `//` or `/* */` - be consistent.
- Every file: license boilerplate.
- Every non-obvious class/struct: describe purpose and usage.
- Every non-trivial function declaration: describe what it does, inputs, outputs, ownership, nullability.
- Function definitions: document tricky implementation details.
- Class data members: comment if type/name insufficient to convey purpose.
- Global variables: always comment purpose.
- **TODO** format: `// TODO: bug 12345678 - description` or `// TODO(name): description`.
- Use inclusive language. Gender-neutral pronouns.

## Formatting

### Line Length

- **80 characters** maximum.
- Exceptions: URLs, string literals, includes, header guards, using-declarations.

### Indentation

- **2 spaces**. No tabs.
- Access specifiers (`public:`, `private:`): 1-space indent.
- Wrapped parameters: 4-space indent.

### Braces

- Always use braces for `if`/`else`/`for`/`while`/`do` (exception: entire statement fits on one or two lines).
- Opening brace on same line as statement. Closing brace on own line.

### Functions

- Return type + function name on same line.
- Parameters on same line if they fit; otherwise wrap with 4-space indent.
- No space between function name and `(`.

### Namespaces

- No indentation inside namespaces.
- Closing comment: `}  // namespace name` (or `}  // namespace` for unnamed).

### Classes

- `public:`, `protected:`, `private:`, 1-space indent.
- Blank line before each section (except first).

### Constructor Initializer Lists

- All on one line, or wrap before `:` with 4-space indent, one member per line.

### Pointer/Reference Declarations

- No space after `*` or `&`: `char* c`, `const std::string& str`.
- Space separates type from name, not decorating both sides.

### Boolean Expressions

- Wrap long booleans consistently (operator at end of line preferred).
- Use `&&` / `||` not `and` / `or`.

### Return Values

- No unnecessary parentheses around return expressions.

### Switch

- `case` at 2-space indent, body at 4-space.
- Fall-through: annotate with `[[fallthrough]];`.
- Non-enum switches: always have `default`.

### Floating-Point Literals

- Always include radix point with digits on both sides: `1.0f`, `-0.5L`, `1248.0e6`.

### Preprocessor Directives

- `#` at beginning of line, never indented.

### Vertical Whitespace

- Use sparingly. No blank lines at start/end of code blocks.

## Exceptions to Rules

- **Existing non-conformant code**: may follow local conventions for consistency.
- **Windows code**: may use COM/ATL multiple inheritance, Windows types (`DWORD`, `HANDLE`), `__declspec(dllimport/dllexport)` via macros. No `#pragma once`. No Hungarian notation.

## Enforcement

When writing C++ code: follow all rules above. No exceptions unless rule itself specifies one.

When reviewing C++ code: flag violations with line reference and rule section. Suggest fix.

When refactoring: preserve style compliance. Don't introduce violations.
