---
name: shell-style-guide
description: Apply Shell Style Guide when writing, reviewing, or editing shell scripts.
license: MIT
compatibility: opencode
---

Apply Google Shell Style to all shell code written, reviewed, or refactored. Flag violations. Fix on sight when editing.

## Shell Language

- **Bash only** for executables. Start with `#!/bin/bash` and minimal flags.
- Use `set` for shell options (not shebang flags) so `bash script_name` invocation works.
- Shell for small utilities / simple wrappers only. >100 lines or complex control flow -> rewrite in structured language.

## Files & Invocation

### Extensions
- Executables: `.sh` extension or no extension. No extension preferred when added directly to `PATH`.
- Libraries: `.sh` extension, not executable.

### SUID/SGID
- **Forbidden.** Use `sudo` for elevated access.

## STDOUT vs STDERR

- All error messages -> `STDERR`.
- Recommended error function pattern:

```bash
err() {
  echo "[$(date +'%Y-%m-%dT%H:%M:%S%z')]: $*" >&2
}
```

## Comments

### File Header
- Every file: `#!/bin/bash` + brief description of contents. Copyright/author optional.

### Function Comments
- Required unless function is both obvious and short. Always required in libraries.
- Sections: Description, `Globals:`, `Arguments:`, `Outputs:`, `Returns:`.

```bash
#######################################
# Brief description.
# Globals:
#   VAR_NAME
# Arguments:
#   Description of args.
# Outputs:
#   Writes to STDOUT/STDERR.
# Returns:
#   0 on success, non-zero on error.
#######################################
```

### Implementation Comments
- Comment tricky, non-obvious, interesting, or important code only.

### TODO Comments
- Format: `# TODO(username): explanation (bug ####)`

## Formatting

### Indentation
- **2 spaces.** No tabs. Exception: `<<-` here-document body may use tabs.

### Line Length
- **80 characters** max. Long paths/URLs on own line or in variable OK.

### Pipelines
- Fits one line -> one line.
- Otherwise split: one pipe segment per line, pipe on new line, 2-space indent, `\` for continuation.

```bash
command1 \
  | command2 \
  | command3
```

### Control Flow
- `; then` and `; do` on same line as `if`/`for`/`while`.
- `else`, `fi`, `done` on own lines, vertically aligned with opener.
- Always include `in "$@"` in for loops for clarity.

### Case Statement
- Alternatives indented 2 spaces from `case`/`esac`.
- Short single-line: `pattern) action ;;` with spaces around.
- Long/multi-command: pattern, actions, `;;` on separate lines.
- No `;&` or `;;&`. No open parenthesis before pattern.

### Variable Expansion
- **Quote variables.** Prefer `"${var}"` over `"$var"`.
- Don't brace-delimit single-char specials (`$1`, `$?`, `$#`) unless needed.
- Brace-delimit all other variables.

### Quoting
- Always quote strings with variables, command substitutions, spaces, or meta characters.
- Use arrays for safe list quoting (especially command-line flags).
- `"$@"` almost always correct; `$*` almost always wrong.
- Single quotes = no substitution. Double quotes = substitution.

## Features

### ShellCheck
- Recommended for all scripts.

### Command Substitution
- `$(command)` always. Never backticks.

### Test
- `[[ ... ]]` always. Never `[ ... ]`, `test`, or `/usr/bin/[`.

### Testing Strings
- `==` for equality (not `=`). `-z`/`-n` for empty/non-empty checks.
- Numeric comparison: `(( ... ))` or `-lt`/`-gt`. Never `<`/`>` inside `[[ ]]` for numbers.

### Wildcard Expansion
- Use `./*` not `*` to avoid `-` prefix issues.

### Eval
- **Avoid.** Do not use `eval`.

### Arrays
- Use arrays for lists of elements. Never pack multiple args into single string.
- Quoted expansion: `"${array[@]}"`.
- No `$(ls /dir)` into array - leads to unsafe expansion.

### Pipes to While
- Prefer process substitution or `readarray` (bash4+) over piping to `while`.
- Pipe to `while` creates subshell -> variables don't propagate.

```bash
while read -r line; do
  last="${line}"
done < <(your_command)
```

### Arithmetic
- `(( ... ))` or `$(( ... ))` only. Never `let`, `$[ ... ]`, or `expr`.
- Inside `$(( ))`, omit `${...}` around variable names for cleaner code.

### Aliases
- **Never in scripts.** Use functions instead.

## Naming

| Type | Convention | Example |
|---|---|---|
| Function | `lower_with_under` | `my_func()` |
| Library function | `package::func` | `mylib::parse()` |
| Variable | `lower_with_under` | `file_count` |
| Loop variable | Named for iterated collection | `zone` in `"${zones[@]}"` |
| Constant / Exported | `UPPER_WITH_UNDER`, `readonly` or `export` | `readonly PATH_TO_FILES='/some/path'` |
| Source filename | `lowercase` or `lower_with_under` | `make_template` |

- Braces on same line as function name. No space between name and `()`.
- `function` keyword optional but consistent within project.

## Local Variables

- Declare with `local` inside functions.
- **Separate declaration and assignment** when value comes from command substitution (local masks `$?`).

```bash
local my_var
my_var="$(my_func)"
(( $? == 0 )) || return
```

## Function Location

- All functions grouped near top of file, after includes/`set`/constants.
- No executable code hidden between functions.

## main Function

- Required for scripts with ≥1 other function.
- Last non-comment line: `main "$@"`.

## Return Values

- Always check return values. Use `$?` or direct `if` test.
- Use `PIPESTATUS` for pipe segment errors.

## Builtins vs External Commands

- Prefer shell builtins over external processes.
- Parameter expansion over `sed`/`expr`. `[[ =~ ]]` over `grep` for simple matches.

## Source

Based on [Google Shell Style Guide](https://google.github.io/styleguide/shellguide.html).
