# Coding guidelines

<div data-description>

Best practices we follow when writing Ariakit code examples for documentation purposes.

</div>

## Overview

This document provides guidelines for writing code examples in Ariakit documentation. It serves as a reference for our preferred coding style, but it is not a general guide for writing code in your own app.

Feel free to consult this document for insights into our approach to code writing.

<aside data-type="note">

This is a living document, and certain code examples on the site might not be current. If you find any outdated examples, please submit a pull request to have them updated.

</aside>

## Prefer `interface` over `type`

When using TypeScript to define prop types for components, we use `interface` instead of `type`. This is because `interface` syntax supports `extends`, which allows us to properly extend other types.

If you use the `type` keyword with intersection (`&`), it may silently introduce unintended or invalid types, which would be immediately detected if you used `interface` instead:

```ts "interface" "extends"
// ❌ Bad, produces an invalid type without error
type CheckboxProps = React.ComponentPropsWithoutRef<"input"> & {
  onChange?: (value: boolean) => void;
}

// ❗ Interface immediately detects the error
interface CheckboxProps extends React.ComponentPropsWithoutRef<"input"> {
  onChange?: (value: boolean) => void;
}

// ✅ Good, fixed
interface CheckboxProps
  extends Omit<React.ComponentPropsWithoutRef<"input">, "onChange"> {
  onChange?: (value: boolean) => void;
}
```

<div class="text-center -mt-6">

[Open in TS Playground](https://www.typescriptlang.org/play?#code/JYWwDg9gTgLgBAKjgQwM5wEoFNkGN4BmUEIcARFDvmQNwBQdA9I3IDLkcAQsgCYA0cYYtwCuuLOmQA7OMEkA3ZABtg3ODACeYLHADuwGAAsIw+FijEodDVrgBhA1lwBrAEYQAHgAViYVABVNbQBeTCoYADpbEkhJLEkYbwhfAHV9IxNsAgAeMlkwEzIAPjgAMjgAbzo4OAhJeykAcywAfgAuOAAKBUVhLHa3CEUcSQBKOCDiuQgVegBfBmY2OD8HODMLGXRaxXU4VCMdaVq4YVRkJrpcWtR4WvrJJvb7R1cPRN8ArQBtMjuDRqwZAAuuNOt1ev0IINhmMJhV5kwWIB1cjgAEl4mYCHhtKAQFhuMBkDAsDs4NwsMT8OhDNp1tA6LJiVAsWI7A5nG4vD50Fh3MTJNx0Ng8BEouBanEEtzUoZjDBMjk8gVipVqn8AW0wUoIXABkMpLDJtNuHMFixAKDkcAA4lC+HACMB3PiGRjmdi2S9Oe9UFU1ny4oK4AB5ED6LLC-CRaIS+LemXpeVYbK5ST5GBFfi-Or-B6AlW+9W5zVdbV9XVQ-WjcZGmZ0WZAA)

</div>

JSDoc is also better merged with `interface`. For example, tags such as `@default` will be appropriately overridden, whereas `type` would duplicate them.

In summary, according to the [TypeScript documentation](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#differences-between-type-aliases-and-interfaces:~:text=If%20you%20would%20like%20a%20heuristic%2C%20use%20interface%20until%20you%20need%20to%20use%20features%20from%20type), it is recommended that you use `interface` until you need to use features from `type`.


## Name functions inside `forwardRef`

When wrapping components with `React.forwardRef`, we pass a named function as an argument instead of an anonymous arrow function. This is because React DevTools uses the function name to determine the component's name, eliminating the need to set `displayName`:

```ts {13-15}
// ❌ Bad
export const Combobox = React.forwardRef<HTMLInputElement, Props>(
  (props, ref) => {
    // ...
  }
);

// ❌ Bad
Combobox.displayName = "Combobox";

// ✅ Good
export const Combobox = React.forwardRef<HTMLInputElement, Props>(
  function Combobox(props, ref) {
    // ...
  }
);
```

## Import namespace

When importing components from Ariakit and the import statement expands to multiple lines, we use the namespace import syntax instead. This improves code readability and makes it more concise.

```js
// ❌ Bad (for documentation, but fine for app code)
import {
  Combobox,
  ComboboxCancel,
  ComboboxDisclosure,
  ComboboxPopover,
  ComboboxList,
  ComboboxItem,
  ComboboxItemValue,
} from "@ariakit/react";

// ✅ Good
import * as Ariakit from "@ariakit/react";

// ✅ Good
import { Checkbox } from "@ariakit/react";
```

This also simplifies the creation of abstractions for Ariakit components. For instance, when developing a custom `Combobox` component, there's no need to rename the Ariakit `Combobox` to a different name.

<aside data-type="note" title="What about tree shaking?">

No need to worry. The namespace import syntax does not increase the bundle size. Modern bundlers analyze the code statically and include only the components that are actually used. Unused components are removed from the bundle, unless you access their properties with a runtime variable:

```js
import * as Ariakit from "@ariakit/react";

// ❌ Bad, all components will be included in the bundle
const Component = Ariakit[runtimeVariable];

// ✅ Good, only the used component will be included in the bundle
const Component = Ariakit.Combobox;
```

</aside>

## Import `.jsx` Extension

The code examples are written using the [ECMAScript modules](https://nodejs.org/api/esm.html) syntax, which is the official standard format for JavaScript modules supported by modern browsers.

One difference between ESM and CommonJS is that ESM requires the file extension to be specified in the import statement. For TypeScript React files, you can use either `.js` or `.jsx` extensions.

When importing `.tsx` files, we use the `.jsx` extension for consistency and better compatibility with build tools like [Vite](https://vitejs.dev).

```js
// ❌ Bad, non-standard
import "./component";

// ❌ Bad
import "./component.js";

// ✅ Good
import "./component.jsx";
```

## Import Style First

In our code examples, we place the import statement for styles at the top of the file. This ensures that when we edit the example, the autoimport feature will add import statements at the end of the import list. This prevents the style import from being inserted in the middle of the list.

```js
// ❌ Bad
import { Combobox } from "@ariakit/react";
import "./style.css";

// ❌ Bad, autoimport will append the list
import { Combobox } from "@ariakit/react";
import "./style.css";
import { useState } from "react";

// ✅ Good
import "./style.css";
import { Combobox } from "@ariakit/react";
import { useState } from "react";
```
