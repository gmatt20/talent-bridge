---
name: python-style-guide
description: Apply Python Style Guide when writing, reviewing, or editing Python code.
license: MIT
compatibility: opencode
---

Apply Google Python Style to all Python code written, reviewed, or refactored. Flag violations. Fix on sight when editing.

## Linting

- Run `pylint` on all code.
- Suppress warnings with line-level `# pylint: disable=<symbolic-name>`. Add explanation if reason not obvious from name.
- Prefer `pylint: disable` over deprecated `pylint: disable-msg`.
- Suppress unused-argument by `del`-ing variable at function start with comment (e.g. `del beans, eggs # Unused by vikings.`).

## Imports

- Import **packages and modules only**, not individual classes/functions/types.
- `import x` for packages/modules.
- `from x import y` where `x` is package prefix, `y` is module.
- `from x import y as z` when name collision, long name, or too generic.
- `import y as z` only for standard abbreviations (`import numpy as np`).
- **No relative imports.** Use full package name always.
- Exemptions: `typing`, `colletions.abc`, `typing_extensions` symbols may be imported directly.

### Import Formatting & Order

- One import per line (except `typing` and `collections.abc` symbols).
- Grouped most-generic to least-generic, in order:
  1. `from __future__` imports
  2. Standard library
  3. Third-party
  4. Repository sub-package imports
- Lexicographic sort (case-insensitve) within each group by full package path.

## Packages

- Import each module by full package name. No bare `import jodie` relying on `sys.path`.

## Exceptions

- Use built-in exception classes when appropriate (e.g. `ValueError` for precondition violations).
- **No `assert` for validation** - only for non-critical invariants. `assert` OK in pytest tests.
- Custom exceptions must inherit existing exception clsas. Name must end in `Error`, no repetition (`foo.FooError` bad).
- **Never bare `except:`** or `except Exception` unless re-raising or creating isolation point.
- Minimize code in `try` block. Use `finally` for cleanup.

## Mutable Global State

- Avoid mutable global state. If necessary, prepend `_` to name, expose via public functions/class methods.
- Module-level **constants** encouraged: `UPPER_SNAKE_CASE`.

## Nested/Local/Inner Classes and Functions

- OK when closing over local variable (not just `self`/`cls`). Don't nest just to hide - use `_` prefix at module level instead.

## Comprehensions & Generators

- Allowed. **No multiple `for` clauses or filter expressions** in one comprehension.
- Optimize for readability, not conciseness.
- Generators fine. Use `Yields:` in docstring. Force cleanup for expensive resources (context manage).

## Lambda Functions

- OK for one-liners. If >60-80 chars, use named function.
- Prefer `operator` module functions over equivalent lambdas.

## Conditional Expressions

- OK for simple cases. Each portion must fit one line.

## Default Argument Values

- **Never use mutable default values** (`[]`, `{}`, etc.). Use `None` and initialize inside funtion.

## Properties

- Use `@property` decorator. Match expectations of normal attribute access (cheap, simple, unsurprising).
- Don't use properties for computations subclasses may override.

## True/False Evaluations

- Use implicit false: `if foo:` not `if foo != []:`
- Check `None` explicitly: `if foo is None:`
- Never `if len(seq):` - use `if seq:`
- Never compare boolean to `False` with `==`.

## Decorators

- Use judiciously. Write unit tests for decorators. No external dependencies (files, sockets, DB) in decorator body.
- **Never `staticmethod`** (unless forced by existing API). Use module-level function.
- `classmethod` only for named constructors or class-specific global-state routines.

## Threading

- Don't rely on atomicity of built-in types. Use `queue.Queue` for inter-thread communication. Prefer `threading.Condition` over low-level locks.

## Power Features

- Avoid metaclasses, bytecode access, dynamic inheritance, import hacks, `__del__`, etc. Standard library usage of these is OK.

## Type Annotations

- Strongly encouraged on public APIs. Annotate code prone to type errors, hard to understand, or stable.
- `self`/`cls` annotation generally unnecessary. `__init__` return type annotation unnecessary.
- Use `X | None` (not implicit optional). Prefer `collections.abc` abstract types over concrete (`Sequence` over `list`). Prefer built-in generics (`tuple`, `list`) over `typing.Tuple`, `typing.List`.
- `TypeAlias` names: `CapWords`. Private aliases: `_Private`.
- Type variables must have descriptive names unless private + unconstrained (`_T`, `_P` OK).
- Conditional imports (`if TYPE_CHECKING:`) only as last resort.

## Formatting

### Seimcolons
- **Never** terminate lines with semicolons. No two statements on one line via semicolon.

### Line Length
- **80 characters** max. Exceptions: long imports, URLs/paths in comments, long string constants without whitespace, pylint disable comments.
- **No backslash line continuation.** Use implicit joining inside `()`, `[]`, `{}`.

### Parentheses
- Use sparingly. No parentheses in `return` or conditionals unless for line continuation or tuple indication.

### Indentation
- **4 spaces.** Never tabs.
- Continuation: align with opening delimiter, or hanging 4-space indent.
- Trailing comma when closing bracket on separate line.

### Blank Lines
- **Two** blank lines between top-level definitions.
- **One** blank line between method definitions, and between class docstring and first method.
- No blank line after `def` line.

### Whitespace
- No whitespace inside `()`, `[]`, `{}`.
- No whitespace before comma/semicolon/colon; space after (except end-of-line).
- No whitespace before open paren or call/index.
- No trailing whitespace.
- Space around `=` in assignments, comparisons, booleans. **No space** around `=` for keywords args/defaults (unless type annotation present: `def f(a: int = 0)`).
- No vertical alignment of tokens.

### Strings
- Use f-strings, `%`, or `.format()`. **Never** concatenate with `+` for formatting.
- **Never** accumulate strings with `+=` in loop - use `list` + `''.join()`.
- Pick `'` or `"` consistently within a file. Use `"""` for multi-line (and always for docstrings).
- Logging: always use `%`-pattern strings (not f-strings) as first arg to loggers.

### Statements
- One statement per line. Short `if` (no `else`) on one line OK if it fits.

## Comments and Docstrings

### Module Docstrings
- Every file: license boilerplate + module docstring describing contents/usage.
- Test modules: docstring only if providing additional info beyond "Tests for X."

### Function/Method Docstrings
- **Mandatory** if: public API, nontrivial size, or non-obvious logic.
- Sections (when applicable): `Args:`, `Returns:`/`Yields:`, `Raises:`.
  - `Args:` - name, colon, description. Include type if no annotation. Hanging indent 2-4 spaces.
  - `Returns:` - describe semantics. Omit if function returns `None` or docstring starts with "Returns"/"Yields".
  - `Raises:` - list relevant exceptions. Don't document exceptions from API misuse.
- `@override` methods don't need docstring (unless adding behavior).

### Class Docstrings
- Below class definition. Include `Attributes:` section for public attributes (not properties).
- Summary = what the instance represents. Don't prefix with "Class that...".
- Exception docstring = what the exception represents, not when it occurs.

### Inline Comments
- Explain tricky/non-obvious code. Start ≥2 spaces from code, `#` + space + text.
- Don't describe code - explain intent.

### TODO Comments
- Format: `# TODO: <bug-link> - <explanation>`. Avoid referencing individuals/teams as context.

## Naming

| Type | Convention | Example |
|---|---|---|
| Package | `lower_with_under` | `my_package` |
| Module | `lower_with_under` | `my_module.py` |
| Class / Exception | `CapWords` | `MyClass`, `MyError` |
| Function / Method | `lower_with_under` | `my_function()` |
| Global/Class Constant | `CAPS_WITH_UNDER` | `MAX_RETRIES` |
| Global/Class Variable | `lower_with_under` | `current_index` |
| Instance Variable | `lower_with_under` | `_internal_state` |
| Parameter / Local | `lower_with_under` | `user_id` |

- **No single-char names** except `i/j/k/v` (iterators), `e` (exception), `f` (file handle), `_T/_P` (private type vars).
- **No dashes** in module/package names. Always `.py` extension.
- **No abbreviations** that are ambiguous or unfamiliar outside project.
- **No type in name** (`id_to_name_dict` bad).
- Descriptiveness proportional to scope visibility.
- Internal = prefix with `_`. Avoid `__` dunder for pseudo-privacy.

## Files, Sockets, and Resources

- **Always explicitly close.** Prefer `with` statement. Use `contextlib.closing()` when `with` not supported.

## Main

- Wrap main logic in `main()` function. Guard with `if __name__ == '__main__':`.
- Avoid side effects at module top level (no function calls, object creation on import).

## Function Length

- Prefer small, focused functions. No hard limit, but consider splitting at ~40 lines.

## Enforcement

When writing Python code: follow all rules above. No exceptions unless rule itself specifies one.

When reviewing Python code: flag violations with line reference and rule section. Suggest fix.

When refactoring: preserve style compliance. Don't introduce violations.
