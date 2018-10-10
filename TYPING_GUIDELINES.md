# Guidelines When adding types 

If a component has subcomponents, e.g `Step` component, which has:
- `StepContainer`
- `StepNext`
- `StepPrevious`
- ...

It is prefered to use Object.assign to attach them to the main component in the index.ts file:

```tsx
import Step from "./Step";

export * from "./Step";
export * from "./StepContainer";
export * from "./StepNext";
export * from "./StepPrevious";

export default Object.assign(Step, {
  Container: StepContainer,
  Next: StepNext,
  Previous: StepPrevious
});
```
---

Prop types should be exported `interfaces` named as `${ComponentName}Props` 
```ts
export interface DividerProps {
  vertical?: boolean;
}
```
---

Always export `default` and `*` from component files (that will export types):

```ts
import Divider from "./Divider";
export * from "./Divider";
export default Divider;
```
---

If it's a component that renders another component (wrapper), we must extend props interface:
```tsx
import Box, { BoxProps } from "../Box";
export interface DividerProps extends BoxProps {
  vertical?: boolean;
}

const DividerComponent = (props: DividerProps) => <Box {...props} />;
```
---

If a styled component needs another component declared in the same file (for lifecycles, computed props etc.)

```js
const component = (props: HiddenProps) => {...}

const Hidden = styled(component)
```

Properly name the variable as `${ComponentName}Component`:
```js
const HiddenComponent = (props: HiddenProps) => {...}

const Hidden = styled(HiddenComponent)``
```
