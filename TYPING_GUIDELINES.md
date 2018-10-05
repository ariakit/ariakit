# Guidelines When adding types 

When you have scenarios like: 
```tsx
const C = Card as typeof Card & CardComponents;

C.Fit = CardFit;

export * from "./Card";

export default C;
```
It is prefered to use the following:

```tsx
export * from "./Card";
export * from "./CardFit";

export default Object.assign(Card, {
  Fit: CardFit
});
```
---

Always export prop types:
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

When you have: 
```js
const component = (props: CodeProps) => {...}
```

Properly name the variable as ` ${ComponentName}Component`:
```js
const CodeComponent = (props: CodeProps) => {...}
```
