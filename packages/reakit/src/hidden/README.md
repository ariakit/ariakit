---
path: /docs/hidden
redirect_from:
  - /components/hidden
  - /components/hidden/hiddencontainer
  - /components/hidden/hiddenhide
  - /components/hidden/hiddenshow
  - /components/hidden/hiddentoggle
---

# Hidden

`Hidden` is a highly generic yet powerful Reakit component. It simply hides itself away and waits for a `visible` prop to show up.

## Usage

```jsx
import { Hidden } from "reakit";

function Example() {
  return <Hidden visible>Hidden</Hidden>
}
```

```jsx
import { Hidden, useHiddenState } from "reakit";

function Example() {
  const state = useHiddenState({ visible: true });
  return (
    <div>
      <button onClick={state.toggle}>Toggle</button>
      <Hidden {...state}>Hidden</Hidden>
    </div>
  );
}

return <Example />;
```

```jsx
import { Hidden, HiddenToggle, useHiddenState } from "reakit";

function Example() {
  const state = useHiddenState({ visible: true });
  return (
    <div>
      <HiddenToggle {...state}>Toggle</HiddenToggle>
      <Hidden hideOnClickOutside {...state}>Hidden</Hidden>
    </div>
  );
}
```

```jsx
import { useHidden, useHiddenToggle, useHiddenState } from "reakit";

function Example() {
  const state = useHiddenState({ visible: true });
  const hiddenToggle = useHiddenToggle(state);
  const hidden = useHidden({ hideOnClickOutside: true, ...state });
  return (
    <div>
      <button {...hiddenToggle}>Toggle</button>
      <div {...hidden}>Hidden</div>
    </div>
  );
}
```

## API

### `useHiddenState`

```ts static
type HiddenStateOptions = {
  /** @default false */
  visible?: boolean;
};

type HiddenState = {
  visible: boolean;
  show: () => void;
  hide: () => void;
  toggle: () => void;
};

function useHiddenState(options?: HiddenStateOptions): HiddenState;
```

### `useHidden`

```ts static
type UseHiddenOptions = UseBoxOptions & HiddenStateOptions;

export function useHidden(
  options: UseHiddenOptions = {},
  props: React.HTMLAttributes<any> & React.RefAttributes<any> = {}
```

```ts static
type HiddenState = {
  visible: boolean;
  show: () => void;
  hide: () => void;
  toggle: () => void;
};

type Hidden = Box & {
  visible: boolean;
  hide: () => void;
  hideOnClickOutside: boolean;
  hideOnEsc: boolean;
};

type HiddenToggle = Box & {
  toggle: () => void;
};
```
