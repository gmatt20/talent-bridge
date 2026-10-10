---
name: commit-style-guide
description: Apply Commit Message Style Guide when writing, reviewing, or editing commit messages.
license: MIT
compatibility: opencode
---

Apply conventional commit style to all commit messages written, reviewed or suggested. Flag violations. Fix on sight when editing.

## Format

```
<type>(<scope>): <subject>
<BLANK LINE>
<body>
<BLANK LINE>
<footer>
```

Header mandatory. Scope optional. Body and footer optional but recommended for non-trivial changes.

## 50/72 Rule

- **Subject line:** max 50 characters (excluding type and scope).
- **Body lines:** max 72 characters wide.

Allows easy reading on GitHub and in git tools.

## Type

Required. Must be one of:

| Type | Use |
|------|-----|
| `build` | Build system or external dependency changes (scopes: gulp, npm, etc.) |
| `ci` | CI config/script changes (scopes: Circle, BrowserStack, etc.) |
| `docs` | Documentation only |
| `feat` | New feature |
| `fix` | Bug fix |
| `license` | Licensing compliance and changes |
| `perf` | Performance improvement |
| `refactor` | Code change - no bug fix, no new feature |
| `style` | Formatting, whitespace, semicolons - no logic change |
| `test` | Add or correct tests |
| `revert` | Reverts a previous commit |

### Revert

If reverting, header: `revert: <original commit header>`. Body: `This reverts commit <hash>.`

## Scope

Optional. Name of package/module affected as perceived by changelog readers.

Examples: `common`, `compiler`, `compiler-cli`, `core`, `http`, `router`.

## Subject

- Imperative, present tense: "change" not "changed" nor "changes".
- Read as: "This commit will `<subject>`".
- No capital first letter.
- No trailing dot (`.`).

## Body

- Imperative, present tense (same as subject).
- Include motiviation for change.
- Contrast with previous behavior.

## Footer

### Breaking Changes

- Start with `BREAKING CHANGE:` followed by space or two newlines.
- Rest of footer describes the breaking change.

### Issue References

- Closed issues listed with `Closes` keyword.
- Single: `Closes #234`
- Multiple: `Closes #123, #245, #992`

## General Principles

- Make separate commits for logically separate changes.
- Describe changes well.
- Each commit should be a single logical unit.

## Enforcement

When writing commit messages:
1. Validate type is from allowed list.
2. Check subject length ≤ 50 chars (excluding type/scope prefix).
3. Check body lines ≤ 72 chars.
4. Verify imperative mood in subject and body.
5. No capital first letter in subject.
6. No trailing dot in subject.
7. Breaking changes use correct `BREAKING CHANGE:` format.
8. Issue references use `Closes #NNN` format.

When reviewing commit messages:
- Flag any violation with rule reference.
- Suggest corrected version.
