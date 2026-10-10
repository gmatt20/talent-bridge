---
name: react-style-guide
description: Apply React Style Guide when writing, reviewing, or editing React components, hooks, or TSX files.
license: MIT
compatibility: opencode
---

Apply this React style to all React code (`.tsx`, hooks, component tests) written, reviewed, or refactored. It builds on the TypeScript Style Guide (`typescript-style`): everything there applies to `.tsx` files too. Flag violations. Fix on sight when editing.

## Formatting

- Formatting is owned by **Prettier** (`frontend/.prettierrc.json`, Google `gts` settings): semicolons, single quotes, no bracket spacing (`{Foo}`), trailing commas, 80 columns, `x => x` arrows.
- Run `npm run format` before committing. Don't hand-format against it.
- JSX attribute values use double quotes (`className="..."`); Prettier keeps them.
- Long Tailwind class strings may exceed 80 columns; don't split one class list across string concatenations.

## Files and Exports

- **One exported component per file.** Small private helpers may live beside it.
- File name matches the exported component: `ProjectCard.tsx` exports `ProjectCard`.
- Exception: shadcn primitives in `components/ui/` keep shadcn's layout (lowercase file names, related parts exported together) so they stay easy to update.
- Hooks live in `useThing.ts` files and export `useThing`.
- **Named exports only**, including pages and routes. No `export default`.
  - Exception: config files a tool requires to default-export (`vite.config.ts`).
- Imports within `src/` are **relative** (`../components/EmptyState`). Keep parent steps to two or fewer; if you need more, the file is probably in the wrong folder.
- Import types with `import type {...}`.

## Components

- Write components as **function declarations**: `export function ProjectCard(props: ProjectCardProps) {}`.
- No `React.FC`, no class components, no `forwardRef` (React 19 passes `ref` as a prop).
- Component names are `UpperCamelCase` and say what the thing is (`BriefView`, not `BriefComponent`).
- Return `null` to render nothing. Don't return `undefined` or `false`.
- Keep components pure: no side effects during render, no mutation of props or state.
- Prefer composition (`children`, render slots like `actions`) over boolean props that toggle large chunks of markup.

## Props

- Declare props with an **`interface` named `<Component>Props`**, directly above the component. No inline object types in the parameter list.
- Extending a DOM element's props: `interface PillButtonProps extends React.ComponentProps<'button'> {...}`.
- Destructure props in the signature when there are a few; use `props.x` when there are many.
- Default values go in the destructuring (`tone = 'solid'`), never in `defaultProps`.
- Optional props use `?`, not `| undefined`.
- Callback props are named `onThing` (`onChange`, `onRemove`). The handlers that implement them are named `handleThing`.
- Document each exported component with a JSDoc comment saying what it renders and when to use it. Document a prop only when its name and type don't explain it.

## State and Hooks

- Follow the **Rules of Hooks**: call hooks at the top level of components or custom hooks, never in conditions, loops, or nested functions.
- Custom hooks start with `use` and return either a value or a small object (`{data, error, loading}`).
- Don't store what you can derive. Compute it during render (`const descriptionShort = description.length < MIN`).
- Initialize from props or expensive work with a lazy initializer: `useState(() => compute())`.
- Update state that depends on the previous value with the updater form: `setCount(c => c + 1)`.
- `useEffect` is for synchronizing with things outside React (network, timers, DOM APIs, subscriptions):
  - List every reactive value it reads in the dependency array.
  - Return a cleanup for anything you start (timers, listeners, in-flight requests, `cancelled` flags).
  - Don't use an effect to transform data for rendering or to respond to a user event. Do that in the event handler.
- Reach for `useMemo`, `useCallback` and `memo` only when a measured problem calls for it.
- Use `useRef` for DOM nodes and mutable values that must not trigger a render.

## Events

- Handlers are named `handleThing`: `handleSubmit`, `handleRoleKeyDown`.
- Define handlers as `const handleThing = (event: FormEvent) => {...}` inside the component, or inline arrows for one-liners.
- Type events with React's types (`FormEvent`, `KeyboardEvent<HTMLInputElement>`), imported with `import type`.
- Forms: handle `onSubmit` on the `<form>` and call `event.preventDefault()`. Don't attach submit logic to a button's `onClick`.

## JSX

- Lists need a **stable `key`** from the data (`id`, a unique name). Use the index only for static lists that never reorder.
- Conditional rendering: `cond && <X />` is fine when `cond` is a boolean, string, or object. When it can be a number, compare explicitly (`items.length > 0 && ...`) so `0` never renders.
- Prefer `<>...</>` over `<Fragment>` unless it needs a `key`.
- No chained or nested ternaries in JSX. For three or more branches (loading / error / empty / content), compute the content in a variable with `if` statements, or extract a small component.
- Self-close elements without children: `<Skeleton />`.
- Spread props (`{...props}`) only to forward them to the underlying element, last, after the props you set.

## Styling

- Style with **Tailwind** classes and the theme tokens in `src/index.css` (`bg-primary`, `text-muted-foreground`, `border-line-strong`). No hard-coded hex colors in components.
- Merge class names with `cn()` from `lib/utils`; put the caller's `className` last so it wins.
- Variants belong in `cva` (`components/ui/button.tsx`), not in chains of ternaries.
- Inline `style` only for values computed at runtime (a progress width).
- shadcn components in `components/ui/` are owned by the project: edit them, but keep their structure so updates stay mergeable.

## Data and Routing

- Components never call `fetch`. All data goes through the `src/api/*` functions and the shared types in `src/types/api.ts`.
- Load data with `useApi` (or a custom hook built on it) and render **loading**, **empty**, and **error** states for every view.
- Use React Router's `Link`/`NavLink` for in-app navigation and `useNavigate` after an action. Never use `<a href>` for internal routes.
- Guard routes with `RequireRole` in `router.tsx`, not inside page components.

## Accessibility

- Every interactive element is a real `<button>`, `<a>`, or form control. No clickable `<div>`s.
- Every form control has a visible `<label htmlFor>`; errors are linked with `aria-describedby` and announced with `role="alert"`.
- Icon-only buttons have an `aria-label`. Decorative icons get `aria-hidden`.
- Keep the visible focus ring (`focus-visible:outline-*`). Never remove an outline without replacing it.
- Respect `prefers-reduced-motion`: no autoplaying motion without a pause control, and nothing animated that the reduced setting doesn't stop.

## Comments

- `/** JSDoc */` on every exported component, hook, and function. Start with what it does ("Renders...", "Loads...").
- `//` for implementation notes that explain *why*, not *what*.
- No commented-out code.

## Enforcement

When writing React code: follow all rules above and in the TypeScript Style Guide. No exceptions unless the rule itself specifies one.

When reviewing React code: flag violations with line reference and rule section. Suggest fix.

When refactoring: preserve style compliance. Don't introduce violations.

Be consistent with surrounding code style.
