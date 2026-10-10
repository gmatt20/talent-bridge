---
name: vim-style-guide
description: Apply Vimscript Style Guide when writing, reviewing, or editing Vimscript code.
license: MIT
compatibility: opencode
---

Apply Google Vimscript Style to all Vimscript code written, reviewed, or refactored. Flag violations. Fix on sight when editing.

## Portability

Many commands depend on user settings. Follow all rules below to keep scripts portable.

## Strings

- **Prefer single-quoted strings.** Double-quoted strings have different semantics and break regexes.
- Use double quotes only when escape sequences needed (`"\n"`) or embedding single quotes where it doesn't matter.

## Matching Strings

- **Use `=~#` or `=~?` families**, never bare `=~`.
- Bare `=~` depends on user `ignorecase`/`smartcase` settings.

## Regular Expressions

- **Prefix all regexes with `\m\C`** - forces `nomagic` + `noignorecase` behavior.
- Other magic levels (`\v`) and case (`\c`) allowed only when intentional and explicit.

## Dangerous Commands

- **Avoid `:s[ubstitute]`** - moves cursor, prints errors. Prefer `search()` and similar functions.
- Prefer functions over commands with side effects. See `:help functions()`.

## Fragile Commands

- **Always `normal!`**, never `normal` - latter depends on user key mappings.
- Avoid `:s[ubstitute]` - behavior depends on local settings.

## Catching Exceptions

- **Match error codes, not error text.** Error text may be locale-dependent.

## Messaging

- Message user **infrequently**. Only when:
  - Long-running process started.
  - Error occurred.

## Type Checking

- Use **strict comparison**: `is#` for string literals, `maktaba#value#IsEqual` otherwise.
- Check types explicitly via `maktaba#ensure`, `maktaba#value`, or `type()`.
- Use `:unlet` for variables that may change types (especially in loops).

## Python / Other Languages

- **Python**: use sparingly - only for critical functionality (e.g., threading).
- **Other languages (ruby, lua)**: avoid. No guarantee of compiled support in user's vim.

## Boilerplate

- **Use maktaba** for plugin creation, error handling, dependency checking.

## Plugin Layout

- Organize as modular plugin in one directory/repo.
- Name: `plugin-name`, optionally `vim-` prefix or `.vim` suffix.
- Split into `plugin/`, `autoload/`, etc. subdirectories.
- Declare metadata in `addon-info.json` format (VAM).

## Functions

- Define in `autoload/` directory with `[!]` and `[abort]`.
- Script-local functions (`s:`) welcome but must live in `autoload/`, called by autoloaded functions.
- **No global functions** - use autoloaded functions.
- Non-library plugins: expose commands, not functions. Extract command logic into autoloaded functions.

## Commands

- Define in `plugin/commands.vim` (general) or `ftplugin/` (filetype-specific).
- **Without `[!]`** - prevents silently clobbering existing commands.

## Autocommands

- Place in `plugin/autocmds.vim` within `augroup`s.
- Augroup name: unique, prefixed with plugin name.
- **Clear augroup with `autocmd!`** before defining new autocommands (re-entrant).

## Mappings

- Place in `plugin/mappings.vim`.
- Use `maktaba#plugin#MapPrefix` for prefix.
- Partial mappings (`:help using-<Plug>`) in `plugin/plugs.vim`.

## Settings

- **Use `:setlocal` and `&l:`** instead of `:set` and `&` unless explicit reason otherwise.

## Formatting

### Whitespace
- **2-space indents.** No tabs.
- Spaces around operators (does not apply to command arguments).
- No trailing whitespace (don't go out of way to remove existing; allowed in mappings prepping user input).
- **80-column line limit.**
- Continued lines: indent by 4 spaces.

### Alignment
- **Do not align** arguments of commands.

```vim
" Good
command -bang MyCommand call myplugin#foo()
command MyCommand2 call myplugin#bar()

" Bad
command -bang MyCommand    call myplugin#foo()
command       MyCommand2 call myplugin#bar()
```

## Naming

| Type | Convention | Example |
|---|---|---|
| Plugin | `plugin-names-like-this` | `vim-my-plugin` |
| Function | `FunctionNamesLikeThis` | `MyPlugin#DoThing()` |
| Script-local function | `s:FunctionNamesLikeThis` | `s:ParseLine()` |
| Command | `CommandNamesLikeThis` | `MyCommand` |
| Augroup | `augroup_names_like_this` | `my_plugin_events` |
| Variable | `variable_names_like_this` | `l:line_count` |

### Variable Scope Prefixes

**Always prefix variables with scope:**

| Scope | Prefix | Required |
|---|---|---|
| Global | `g:` | Always |
| Script-local | `s:` | Always |
| Function argument | `a:` | Always |
| Function-local | `l:` | Recommended |
| Vim-predefined | `v:` | Recommended |
| Buffer-local | `b:` | When buffer-local semantics needed |

- `g:`, `s:`, `a:` - **must always use**.
- `l:`, `v:` - add in new code for consistency/future-proofing.

## Source

Based on [Google Vimscript Style Guide](https://google.github.io/styleguide/vimscriptguide.xml).
