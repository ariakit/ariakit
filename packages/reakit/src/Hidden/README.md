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
  return <Hidden visible>Hidden</Hidden>;
}
```

```jsx
import { HiddenDisclosure, Hidden, useHiddenState } from "reakit";

function Example() {
  const state = useHiddenState({ visible: true });
  return (
    <div>
      <HiddenDisclosure {...state} disabled unstable_focusable>
        Toggle
      </HiddenDisclosure>
      <Hidden {...state}>Hidden</Hidden>
    </div>
  );
}

return <Example />;
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
};

type HiddenToggle = Box & {
  toggle: () => void;
};
```
