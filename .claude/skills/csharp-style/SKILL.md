---
name: csharp-style-guide
description: Apply C# Style Guide when writing, reviewing, or editing C# code.
license: MIT
compatibility: opencode
---

Apply C# Style Guide to all C# code written, reviewed, or refactored. Flag violations. Fix on sight when editing.

## Naming

| Kind | Style | Example |
|---|---|---|
| Class, method, enum, public field, public property, namespace | PascalCase | `MyClass`, `CalculateValue` |
| Local variable, parameter | camelCase | `resultValue`, `mulNumber` |
| Private, protected, internal field/property | _camelCase | `_results`, `_bar` |
| Interface | `I` + PascalCase | `IMyInterface` |
| Constant (`const`, `static`, `readonly`) | Same convention as above (no special casing) | `_bar` (private const), `MaxRetries` (public const) |

- Modifiers (`const`, `static`, `readonly`) do not affect naming convention.
- A "word" = anything without internal spaces, including acronyms: `MyRpc` not `MyRPC`.

## Files

- Filenames and directories: **PascalCase** (`MyFile.cs`).
- File name = main class name where possible (`MyClass.cs`).
- Prefer one core class per file.

## Organization

### Modifier Order

```
public protected internal private new abstract virtual override sealed static readonly extern unsafe volatile async
```

### Usings

- `using` declarations at top of file, before any namespaces.
- Alphabetical order; `System` imports always first.

### Class Member Order

Group in this order:
1. Nested classes, enums, delegates, events
2. Static, const, readonly fields
3. Fields and properties
4. Constructors and finalizers
5. Methods

Within each group, order by visibility:
1. public
2. internal
3. protected internal
4. protected
5. private

Group interface implementations together where possible.

## Formatting

### Indentation & Spacing

- **2 spaces**, no tabs.
- Column limit: **100**.
- One statement per line max.
- One assignment per statement max.

### Braces

- No line break before opening brace `{`.
- No line break between closing brace `}` and `else`.
- Braces always used even when optional.
- Empty blocks may be concise: `void DoNothing() {}`.

### Whitespace

- Space after `if`/`for`/`while` etc. and after commas.
- No space after `(` or before `)`.
- No space between unary operator and operand.
- One space between operator and operands for all other operators.

### Line Wrapping

- Continuations indented **4 spaces**.
- Brace-based continuations (list initializers, lambdas, object initializers) don't count as continuations.
- Function args: if they don't fit one line, break and align with first argument. If that doesn't fit, wrap all args on new lines with 4-space indent.

### Object/Container Initializers

- Use 2-space indent inside initializer blocks.

```csharp
private int[] _someTable = {
  2, 3, 4,
};

var x = new SomeClass {
  Property1 = value1,
  Property2 = value2,
};
```

## Coding Guidelines

### Constants

- Prefer `const` when possible; `readonly` as alternative.
- Named constants over magic numbers. Always.

### Collections

- **Inputs:** use most restrictive type (`IReadOnlyCollection`, `IReadOnlyList`, `IEnumerable`).
- **Outputs returning ownership:** prefer `IList`.
- **Outputs not transferring ownership:** prefer most restrictive type.

### Generators vs Containers

- Generator code often less readable.
- Generator + `ToList()` = slower than direct fill.
- Generator called multiple times = much slower than container iteration.
- Use judgment based on lazy evaluation needs.

### Properties

- Single-line read-only: prefer expression body `=>`.
- Everything else: `{ get; set; }`.

### Expression Body Syntax

- Use in lambdas and properties.
- Don't use on method definitions.
- Align closing with first char of line containing opening brace.

### Structs vs Classes

- Almost always use class.
- Struct only when type is small, short-lived, or commonly embedded (like `Vector3`, `Quaternion`, `Bounds`).
- Structs are value types: passed/returned by value, assignment copies.

### Lambdas

- Non-trivial or reused lambdas -> named methods.

### Field Initializers

- Encouraged.

### Extension Methods

- Only when source unavailable or change infeasible.
- Only for core general features.
- Only in core libraries available everywhere.
- Err on side of not adding them.

### `ref` and `out`

- `out` for return-only values. Place after all other params.
- `ref` rarely. Not for struct optimization. Not for modifiable containers unless replacing entire instance.

### LINQ

- Prefer single-line LINQ + imperative code over long chains.
- Prefer extension methods (`myList.Where(x)`) over SQL-style keywords.
- Avoid `Container.ForEach(...)` for multi-statement bodies.

### Array vs List

- Prefer `List<>` for public variables, properties, return types.
- `List<>` when size can change; arrays when size fixed at construction.
- Arrays for multidimensional.

### Tuples

- Prefer named class over `Tuple<>` for complex return types.

### String Operations

- Use whatever is most readable.
- `StringBuilder` for multiple concatenations when performance matters.
- Chained `+` concatenation = slow + memory churn.

### `using` Aliases

- Don't alias long type names. Usually means a `Tuple<>` should become a class.
- `using` statements are file-scoped only.

### Object Initializer Syntax

- Fine for plain old data types.
- Avoid for classes/structs with constructors.
- Multiple lines: indent one block level.

### Namespace Naming

- Max 2 levels deep.
- Don't force file/folder layout to match namespaces.
- Shared library code: use namespaces. Leaf application code: optional.
- Top-level names must be globally unique and recognizable.

### `var` Keyword

Use encouraged when it aids readability:
- **Yes:** type is obvious (`var apple = new Apple();`), transient variables passed directly to other methods.
- **No:** basic types (`var success = true;`), compiler-resolved numeric types, when knowing type benefits reader.

### Default Values / Null Returns for Structs

- Prefer returning success `bool` + `out` struct value.
- Nullable structs OK when resulting code is significantly more readable.

### Removing from Containers While Iterating

- `someList.RemoveAll(predicate)` preferred.
- Otherwise: build new container, swap at end.

### Delegates

- Call with `Invoke()` and null conditional: `SomeDelegate?.Invoke()`.
- Marks call site clearly; robust against threading races.

### Attributes

- One line above associated member, separated by newline.
- Multiple attributes: one per line.

### Argument Naming

When function argument meaning is nonobvious:
- Use named constants for repeated literal values.
- Replace `bool` args with `enum`.
- Replace complex nested expressions with named variables.
- Use Named Arguments at call site.
- For many config options: define options class/struct.

```csharp
// Bad
DecimalNumber product = CalculateProduct(values, 7, false, null);

// Good
ProductOptions options = new ProductOptions();
options.PrecisionDecimals = 7;
options.UseCache = CacheUsage.DontUseCache;
DecimalNumber product = CalculateProduct(values, options, completionDelegate: null);
```

## Enforcement

When writing C# code: follow all rules above. No exceptions unless rule itself specifies one.

When reviewing C# code: flag violations with line reference and rule section. Suggest fix.

When refactoring: preserve style compliance. Don't introduce violations.
