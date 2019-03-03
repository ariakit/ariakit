---
path: /components/tab
---

# Hidden

`Hidden` is a highly generic yet powerful Reakit component. It simply hides itself away and waits for a `visible` prop to show up.

## Usage

```jsx
import { Hidden } from "reakit";

<Hidden visible>Hidden</Hidden>
```

```jsx
import { Hidden, useHiddenState } from "reakit";

function Example() {
  const state = useHiddenState({ visible: true });
  return (
    <div>
      <button onClick={state.toggle}>Button</button>
      <Hidden {...state}>Hidden</Hidden>
    </div>
  );
}
```

```jsx
import { Hidden, HiddenButton, useHiddenState } from "reakit";

function Example() {
  const state = useHiddenState({ visible: true });
  return (
    <div>
      <HiddenButton {...state}>Button</HiddenButton>
      <Hidden hideOnClickOutside {...state}>Hidden</Hidden>
    </div>
  );
}
```

```jsx
import { useHiddenProps, useHiddenButtonProps, useHiddenState } from "reakit";

function Example() {
  const state = useHiddenState({ visible: true });
  const hiddenButtonProps = useHiddenButtonProps(state);
  const hiddenProps = useHiddenProps({ hideOnClickOutside: true, ...state });
  return (
    <div>
      <button {...hiddenButtonProps}>Button</button>
      <div {...hiddenProps}>Hidden</div>
    </div>
  );
}
```

## API

### `useHiddenState`

```ts
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

### `useHiddenProps`

```ts
type UseHiddenPropsOptions = UseBoxPropsOptions & HiddenStateOptions;

export function useHiddenProps(
  options: UseHiddenPropsOptions = {},
  props: React.HTMLAttributes<any> & React.RefAttributes<any> = {}
```

```ts
type HiddenState = {
  visible: boolean;
  show: () => void;
  hide: () => void;
  toggle: () => void;
};

type HiddenProps = BoxProps & {
  visible: boolean;
  hide: () => void;
  hideOnClickOutside: boolean;
  hideOnEsc: boolean;
};

type HiddenButtonProps = BoxProps & {
  toggle: () => void;
};
```
