# Contributing

This guide is a work in progress and is very incomplete at the moment. If you're interested in contributing:

- Join the `#ariakit` channel in the [Solid Discord server](https://discord.gg/solidjs).
- Check [the main tracking issue](https://github.com/ariakit/ariakit/issues/4117).
- Check [this discussion](https://github.com/ariakit/ariakit/discussions/4322).

## Basic tutorial

To get started, it is strongly recommended to follow the instructions in the [main contributing guide](../../contributing.md). This will ensure that the development environment is set up correctly, and will also walk you through the basics of Ariakit React, which is necessary to understand the Solid port.

Then, continue with the following steps.

### Preparing to port a component

Once you've chosen a component to port, the first step is to prepare the file structure.

First, take a look at the component's source in the `ariakit-react-core` package. This is the original React code we're going to port.

The same file structure should be employed in the `ariakit-solid-core` package. We'll copy the original React code into the Solid port, as a starting point.

For example, if we plan on porting the `Button` component, we'll copy the `packages/ariakit-react-core/src/button` directory into `packages/ariakit-solid-core/src/button`.

This will include the `button/button.tsx` file, where the (WIP) test

## Port reference

### Terminology

Due to differences between React and Solid, there are some differences in terminology used between both Ariakit flavors.

|              React              |  Solid   |
| :-----------------------------: | :------: |
| Element (as in "React element") | Instance |

<details>
<summary>Explanation</summary>

- Elements/instances

  React has a virtual DOM, which implies the concept of "React elements" (elements in the React tree, **not in the DOM tree**). A React element can be roughly thought of as something that exists "between React components and the DOM". Since Solid has no virtual DOM, "Solid elements" don't exist.

  However, Ariakit's architecture contains some details that reference React elements, and still make sense in the Solid port (`createElement`, `wrapElement`, etc.).

  While Solid doesn't have a concept of "element" in this sense, Ariakit Solid uses the term "instance" in place of "element" when referring to analogous architectural concepts.

</details>

### System utilities

"System" utilities are foundational utilities that are used to create components and hooks, among other things. Ariakit Solid has, for the most part, analogous utilities to the React ones.

|       React utility        |            Solid utility             |
| :------------------------: | :----------------------------------: |
| `createHook<T, Options>()` |           **✅ no change**           |
|     `wrapElement` prop     |         `wrapInstance` prop          |
|     `useWrapElement()`     | `wrapInstance()` (see section below) |
|     `createElement()`      |          `createInstance()`          |

### TypeScript types

These replacements make sense most of the time. There might be cases where a different type is more appropriate.

|     React     |      Solid       |
| :-----------: | :--------------: |
| `ElementType` | `ValidComponent` |
|  `ReactNode`  |  `JSX.Element`   |
|     `FC`      |   `Component`    |

### Prop "destructuring" and default values

Solid doesn't support prop destructuring, so the usual React pattern to separate props (for spreading/chaining the rest) and setting defaults doesn't work.

Ariakit React uses this pattern to separate "options" (custom to a specific hook/component) from "props" (HTML attributes). In Ariakit Solid, use the `withOptions` internal utility instead:

```diff
export const useMyComponent = createHook<TagName, MyComponentOptions>(
-  function useMyComponent({ enabled = false, ...props }) {
+  withOptions({ enabled: false }, function useMyComponent(props, options) {
```

Then, use the `options` props object:

```diff
-console.log(enabled);
+console.log(options.enabled);
```

To simply "destructure" without setting a default value, pass `undefined`:

```diff
-function useMyComponent({ enabled, ...props }) {
+withOptions({ enabled: undefined }, function useMyComponent(props, options) {
```

### Prop chaining

Ariakit makes heavy use of the "prop chaining" pattern. Some examples:

```jsx
function useMyComponent(props) {
  // set props
  props = { type: "button", ...props };
  // set a ref (merged)
  props = { ...props, ref: useMergeRefs(myRef, props.ref) };
  // set some styles (merged)
  props = {
    ...props,
    style: { position: "fixed", ...props.style },
  };
  // inherit props from a different hook
  props = useVisuallyHidden(props);
}
```

In Ariakit Solid, the internal `mergeProps` utility (not to be confused with [the built-in utility](https://docs.solidjs.com/reference/reactive-utilities/merge-props#mergeprops)) must be used.

This utility also has the advantage of automatically handling merging of props (refs, styles, etc.). This utility can be omitted when inheriting props from a different hook, since the chaining is already handled by that hook.

The example above could be ported as:

```jsx
function useMyComponent(props) {
  // set props
  props = mergeProps({ type: "button" }, props);
  // set a ref (merged)
  props = mergeProps({ ref: myRef.bind }, props);
  // set some styles (merged)
  props = mergeProps({ style: { position: "fixed" } }, props);
  // inherit props from a different hook
  props = useVisuallyHidden(props);
}
```

**Very important note**: to preserve reactivity, any props that depend on reactive values must be declared with a getter function. For example, if the original React code looks like this:

```jsx
const [value, setValue] = useState(initialValue);
props = {
  exampleProp1: value,
  exampleProp2: props.differentProp,
  ...props,
};
```

Then the Solid port could look like this:

```jsx
const [value, setValue] = createSignal(initialValue);
props = mergeProps({
  get exampleProp1() {
    return value();
  },
  get exampleProp2() {
    return props.differentProp;
  },
  ...props,
});
```

However, declaring getters can be a bit cumbersome (and mess with the port diff), so there's a special behavior in `mergeProps` that automatically creates these getters for props that follow a specific name pattern (starting with `$`). For example:

```jsx
props = mergeProps({
  $exampleProp1: () => value(),
  // or, when possible:
  $exampleProp1: value,
  $exampleProp2: () => props.differentProp,
});
```

Getters are not necessary for static props.

### State/signals

|              React               |                  Solid                   |
| :------------------------------: | :--------------------------------------: |
| `const [value, setValue] = ...`  |             **✅ no change**             |
|     `useState(initialValue)`     |       `createSignal(initialValue)`       |
|       `setValue(newValue)`       |             **✅ no change**             |
|       `console.log(value)`       |          `console.log(value())`          |
| `const derivedValue = value + 1` | `const derivedValue = () => value() + 1` |

<details>
<summary>Explanation</summary>

The `createSignal` function from Solid is analogous to the `useState` hook in React: it holds a value that is "stateful" (or "reactive" in Solid terminology).

Updating the value works as in React:

```jsx
const [value, setValue] = createSignal(initialValue);
setValue(newValue);
```

However, accessing the value is a different story in Solid. For starters, `value` is not the value itself (as in React), but a getter function that returns the value. The port must do a good job to preserve similar reactivity properties as in the original React code (e.g. through derived getters).

Porting code that involves signals requires good understanding of Solid's reactivity system. This reference won't go into details about signals or reactivity, but you can learn more in the [Solid docs](https://docs.solidjs.com/).

</details>

### Effects

TODO: document effects.

### Refs

|            React            |            Solid            |
| :-------------------------: | :-------------------------: |
| `useRef<HTMLElement>(null)` | `createRef<HTMLElement>(null)`  |
|   `useRef(initialValue)`    |  `createRef(initialValue)`  |
| `console.log(ref.current)`  |      **✅ no change**       |
|  `ref.current = newValue`   |      **✅ no change**       |
|   `<button ref={ref} />`    | `<button ref={ref.bind} />` |

<details>
<summary>Explanation</summary>

The `createRef` utility (internal to Ariakit Solid) is analogous to the `useRef` hook in React: it creates a "ref object" that holds a value. Usually (but not always) it is an HTML element bound through the `ref` prop.

Reading and updating the value works as in React:

```jsx
const ref = createRef();
console.log(ref.current); // access the value
ref.current = newValue; // update the value
```

Another similarity is that an initial value can be passed to the `createRef` function:

```jsx
const ref = createRef(initialValue);
```

However, there is an important difference. The ref can't be passed to the `ref` prop of a JSX element directly. Instead, you need to use `ref.bind`.

```tsx
// React - the ref is passed directly:
<button ref={ref} />
// Solid - you must pass `ref.bind` instead:
<button ref={ref.bind} />
```

</details>

### Context

TODO: document context.

### JSDoc links

For now, add the `solid` subdomain to any links in JSDoc comments (rewrite `ariakit.org` into `solid.ariakit.org`).

The referenced URLs don't actually exist yet, but this will make it easier when the documentation is built.

<details>
<summary>Example</summary>

```ts
// In Ariakit React:

/**
 * Renders an accessible button element.
 * @see https://ariakit.org/components/button
 */
export const Button = /* ... */

// In Ariakit Solid:

/**
 * Renders an accessible button element.
 * @see https://solid.ariakit.org/components/button
 */
export const Button = /* ... */
```

</details>

### `useWrapElement`

Use `wrapInstance` instead. The second argument is not a "render function" since Solid doesn't re-render. Instead, it's a function component.

For this reason, instead of receiving the element being wrapped as the first argument, it receives props which _contain_ the element being wrapped as `children`.

```diff
-props = useWrapElement(props, (element) => (
-  <div className="wrapper">
-    {element}
-  </div>
-))
+props = wrapInstance(props, (wrapperProps) => (
+  <div class="wrapper">
+    {wrapperProps.children}
+  </div>
+))
```

## Special patterns

### JSX branches and early returns

Since React re-runs (re-renders) components and hooks, you can short-circuit to create "branches" in JSX, for example:

```jsx
if (condition) return <div>A</div>;
return <div>B</div>;
```

Solid doesn't re-run these functions, so this method cannot be used. Instead, use reactive utilities like `Shows` or `Switch`, for example:

```jsx
return (
  <Show when={condition()} fallback={<div>B</div>}>
    <div>A</div>
  </Show>
);
```

This might require some restructuring of the code to preserve the same behavior while pleasing Solid. A good understanding of Solid's reactivity system is required.

### Stable accessors

TODO: document `stableAccessor`.

### Reactive hoisting

TODO: document this. TL;DR in effects and computations, always access reactive values at the top to prevent early returns and other code paths from breaking reactivity.

## Useful tips

### Diff utilities

<!-- TODO: .ts files don't work -->

Here's a shell function that can be helpful to quickly show the diff between the original React code and the Solid port. Must be run from inside the project directory.

```sh
akdiff <relative path in src without extension>
```

For example:

```sh
akdiff group/group-label
```

To use it, make sure to run one of following snippets in your shell. To "install" it, put it in your shell's config file (`~/.bashrc` for Bash, `~/.zshrc` for Zsh, etc.). In Fish, you can just add it as a function (e.g. in `~/.config/fish/functions/akdiff.fish`).

This version opens the diff in VS Code. You need to have `code` in your PATH, which requires running the "Install 'code' command in PATH" command from VS Code itself (see [the docs](https://code.visualstudio.com/docs/setup/mac#_launching-from-the-command-line)).

You can easily modify the diff command if you wish. For example, to use `git` instead of `code` change the following line:

```diff
-code --diff "$file1" "$file2"
+git diff --no-index "$file1" "$file2"
```

#### Fish

This one even has completions! Put it in `~/.config/fish/functions/akdiff.fish`.

```fish
function akdiff
  set repo_root (git rev-parse --show-toplevel 2>/dev/null)
  if test -z "$repo_root"
    echo "not in a git repo"
    return 1
  end

  set filepath $argv[1]
  set file1 "$repo_root/packages/ariakit-react-core/src/$filepath.tsx"
  set file2 "$repo_root/packages/ariakit-solid-core/src/$filepath.tsx"

  if test -f "$file1" -a -f "$file2"
    code --diff "$file1" "$file2"
  else
    echo "file not found: $filepath in one or both packages"
    return 1
  end
end

function __fish_akdiff_complete_files
  set repo_root (git rev-parse --show-toplevel 2>/dev/null)
  if test -z "$repo_root"
    return 1
  end

  find $repo_root/packages/ariakit-solid-core/src -type f -not -path "*/utils/*" | sed -E 's|.*/([^/]+/[^/]+)\.[^/]+$|\1|' | sort -u
end
complete -c akdiff -f -a "(__fish_akdiff_complete_files)"
```

#### Bash/Zsh/Sh

No fancy completions, but works in most shells.

```sh
akdiff() {
  local repo_root
  repo_root=$(git rev-parse --show-toplevel 2>/dev/null) || { echo "not in a git repo"; return 1; }

  local filepath="$1"
  local file1="$repo_root/packages/ariakit-react-core/src/$filepath.tsx"
  local file2="$repo_root/packages/ariakit-solid-core/src/$filepath.tsx"

  if [[ -f "$file1" && -f "$file2" ]]; then
    code --diff "$file1" "$file2"
  else
    echo "file not found: $filepath in one or both packages"
    return 1
  fi
}
```
