---
name: json-style-guide
description: Apply JSON Style Guide when writing, reviewing, or editing JSON data.
license: MIT
compatibility: opencode
---

Apply Google JSON Style to all JSON written, reviewed, or refactored. Flag violations. Fix on sight when editing.

## General

- **No comments** in JSON objects. Examples may show comments for illustration only.
- **Double quotes** always. All property names and string values in double quotes. Booleans/numbers never quoted.
- **Flatten data** unless structured hierarchy has clear semantic meaning (e.g., address sub-object).

## Property Name Rules

- **Meaningful names** with defined semantics.
- **camelCase**, ASCII strings. First char: letter, `_`, or `$`. Subsequent chars: letter, digit, `_`, or `$`.
- **Avoid reserved JavaScript keywords** (`break`, `case`, `class`, `const`, `continue`, `debugger`, `default`, `delete`, `do`, `else`, `enum`, `export`, `extends`, `false`, `finally`, `for`, `function`, `if`, `import`, `in`, `instanceof`, `new`, `null`, `return`, `super`, `switch`, `this`, `throw`, `true`, `try`, `typeof`, `var`, `void`, `while`, `with`, `yield`, etc.).
- **JSON map keys** exempt from naming rules - may use any Unicode characters. Document when an object is used as a map.
- **Plural names** for array properties (`items`, `siblings`). Singular for everything else.
- **Resolve naming conflicts** by choosing a new name or versioning the API - no JSON namespacing.

## Property Value Rules

- Values must be **boolean, number, string, object, array, or null**. No JavaScript expressions or functions.
- **Drop empty/null properties** unless there is a strong semantic reason to keep them (e.g., `"balance": 0` where zero is meaningful).
- **Enums as strings** - not integers. Allows graceful downstream handling of added/removed values.

## Data Types

| Type | Format | Standard |
|------|--------|----------|
| Date | `'2007-11-06T12:34:000Z'` | RFC 3339 |
| Duration | `"P3Y6M4DT12H30M0S"` | ISO 8601 |
| Lat/Long | `"+40.6892-074.0444"` | ISO 6709 (±DD.DDDD±DDD.DDDD) |

## JSON Structure & Reserved Properties

Top-level object may contain:
- `apiVersion` (string) - API version for request/response.
- `context` (string) - client-set, server-echoed. Useful for JSON-p/batch correlation.
- `id` (string) - server-supplied response identifier.
- `method` (string) - operation to perform or performed on data.
- `params` (object) - map of RPC input parameters.
- `data` (object) - container for response data. Never coexist with `error` (if both present, `error` wins).
- `error` (object) - error details.

### Reserved Properties in `data`

| Property | Type | Purpose |
|----------|------|---------|
| `kind` | string | Object type identifier. First property in object |
| `fields` | string | Fields present in partial GET/PATCH |
| `etag` | string | Resource version tag |
| `id` | string | Globally unique object reference |
| `lang` | string | Language (BCP 47) |
| `updated` | string | Last update (RFC 3339) |
| `deleted` | boolean | Deletion marker (only `true`, never `false`) |
| `items` | array | Collection of items. Last property in `data` |

### Paging Properties in `data`

| Property | Type | Purpose |
|----------|------|---------|
| `currentItemCount` | integer | Items in this result set |
| `itemsPerPage` | integer | Requested page size |
| `startIndex` | integer | 1-based index of first item |
| `totalItems` | integer | Total items available |
| `pageIndex` | integer | 1-based current page number |
| `totalPages` | integer | Total pages available |
| `pagingLinkTemplate` | string | URI template with `{index}` / `{pageIndex}` |

### Link Properties in `data`

Each link has object form and URI string form (suffixed `Link`):
- `self` / `selfLink` - retrieve this item's data.
- `edit` / `editLink` - update/delete endpoint.
- `next` / `nextLink` - next page of results.
- `previous` / `previousLink` - previous page of results.

### Error Object

```json
{
  "error": {
    "code": 404,
    "message": "File Not Found",
    "errors": [
      {
        "domain": "Calendar",
        "reason": "ResourceNotFoundException",
        "message": "File Not Found",
        "location": "",
        "locationType": "",
        "extendedHelp": "[https://url.to.more.details.example.com/](https://url.to.more.details.example.com/)",
        "sendReport": "[https://report.example.com/](https://report.example.com/)"
      }
    ]
  }
}
```

- `error.code` (integer) - HTTP response code.
- `error.message` (string) - human-readable message for first error.
- `error.errors[]` - array of individual error details.
- Each error: `domain`, `reason`, `message`, `location`, `locationType`, `extendedHelp`, `sendReport`.

## Property Ordering

1. **`kind` first** - guides parsers to instantiate correct object type.
2. **`items` last** - allows collection metadata to be read before iterating items.

Example:

```json
{
  "data": {
    "kind": "album",
    "title": "My Photo Album",
    "description": "An album in the user's account",
    "items": [
      {
        "kind": "photo",
        "title": "My First Photo"
      }
    ]
  }
}
```

## Enforcement

When writing JSON: follow all rules above. No exceptions unless rule itself specifies one.

When reviewing JSON: flag violations with property path and rule section. Suggest fix.

When refactoring: preserve style compliance. Don't introduce violations.
