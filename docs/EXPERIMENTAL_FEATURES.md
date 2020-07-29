---
path: /docs/experimental/
experimental: true
redirect_from:
  - /docs/experimental-features/
---

# Experimental features

Reakit is the result of a lot of experimentation. We want to keep this spirit in order to continue evolving and remain modern. New modules, types, components and props are usually introduced with the `unstable_` prefix. After being thoroughly tested in various apps and the API has met the vast majority of use cases, we can remove the prefix and release it as a stable module in a new minor version.

<blockquote experimental="true">

Experimental features may introduce **breaking changes** or be **removed altogether** in patch and minor versions without notice. The simple act of promoting an experimental feature to its stable version would break your code if you are using it as the feature would be renamed.

</blockquote>

<carbon-ad></carbon-ad>

## Use exact version in package.json

When you're using experimental features, because new patch and minor versions may introduce breaking changes, you should always use the exact version of the library in your `package.json` file.

```diff
{
  "dependencies": {
-   "reakit": "^1.2.3"
+   "reakit": "1.2.3"
  }
}
```

You can install the library with the exact version by using this command on npm:

```sh
npm install reakit --save-exact
```

Or using Yarn:

```sh
yarn add reakit --exact
```

## Abstract experimental code in your app

You can make it easier to update experimental features later by abstracting them into a separate file in your app.

For example, say you're using `unstable_prop` from `unstable_Component`. Instead of passing this prop every time you use `Component`, you can abstract `Component` into a separate file and define an API which the rest of your app will rely on.

```jsx static
// MyComponent.js
import React from "react";
import { unstable_Component as Component } from "reakit";

function MyComponent({ prop, ...props }, ref) {
  return <Component unstable_prop={prop} {...props} ref={ref} />;
}

export default React.forwardRef(MyComponent);
```

<!-- eslint-disable import/no-unresolved -->

```jsx static
// OtherComponent.js
import MyComponent from "./MyComponent";

function OtherComponent() {
  return <MyComponent prop="value" />;
}
```

If something changes on that experimental feature, you can simply update `MyComponent` instead of going through your entire app.