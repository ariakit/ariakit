# Contributing

## Basic tutorial

This guide is intended to help you get started with contributing to the project. By following these steps — **which should take no more than 30 minutes** —, you will understand the development process and workflow.

1. [Cloning the repository](#cloning-the-repository)
2. [Installing Node.js and npm](#installing-nodejs-and-npm)
3. [Installing dependencies](#installing-dependencies)
4. [Starting the development server](#starting-the-development-server)
5. [Creating a component](#creating-a-component)
6. [Creating the default example](#creating-the-default-example)
7. [Styling the example](#styling-the-example)
8. [Testing the example](#testing-the-example)
9. [Writing another example](#writing-another-example)
10. [Importing styles from other examples](#importing-styles-from-other-examples)
11. [Promoting the component](#promoting-the-component)
12. [Updating the examples to import from `@ariakit/react`](#updating-the-examples-to-import-from-ariakitreact)
13. [Writing the component documentation](#writing-the-component-documentation)
14. [Writing documentation for other examples](#writing-documentation-for-other-examples)
15. [Submitting a pull request](#submitting-a-pull-request)

## Advanced tutorial

This guide covers more advanced topics. Pick the topics based on your needs.

16. [Versioning](#versioning)
17. [Running with React 17](#running-with-react-17)
18. [Writing end-to-end tests](#writing-end-to-end-tests)

<br>

---

<br>

## Cloning the repository

To start contributing to the project, you have to fork this repository and clone it to your local machine:

```bash
git clone https://github.com/YOUR_USERNAME/ariakit.git
```

If you are already part of the organization on GitHub, clone the repository directly:

```bash
git clone https://github.com/ariakit/ariakit.git
```

Alternatively, you can [open the project in Gitpod](https://gitpod.io/#https://github.com/ariakit/ariakit) and skip to [Creating a component](#creating-a-component).

<div align="right">
  <a href="#basic-tutorial">&uarr; back to top</a></b>
</div>

## Installing Node.js and npm

This repository uses [npm workspaces](https://docs.npmjs.com/cli/v8/using-npm/workspaces) to manage multiple ESM projects. You need to install **npm v7 or higher** and **Node.js v18 or higher**.

You can run the following commands in your terminal to check your local Node.js and npm versions:

```bash
node -v
npm -v
```

If the versions are not correct or you don't have Node.js or npm installed, download them from https://nodejs.org.

Alternatively, you can use [nvm](https://github.com/nvm-sh/nvm) to install the project's Node.js and npm versions. Once in the project's root directory, run the following command in your terminal:

```bash
nvm use
```

> If you haven't installed the specific Node.js version yet, `nvm` will ask you to run `nvm install` to install it. Follow the instructions in your terminal.

<div align="right">
  <a href="#basic-tutorial">&uarr; back to top</a></b>
</div>

## Installing dependencies

Once in the project's root directory, run the following command to install the project's dependencies:

```bash
npm install
```

<div align="right">
  <a href="#basic-tutorial">&uarr; back to top</a></b>
</div>

## Starting the development server

After installing the project's dependencies, run the following command to start the development server:

```bash
npm run dev
```

> If you're on Windows, we recommend using [WSL](https://learn.microsoft.com/en-us/windows/wsl/install) or [Gitpod](https://gitpod.io/#https://github.com/ariakit/ariakit).

Now open http://localhost:3000 in your browser to see the project's site.

<div align="right">
  <a href="#basic-tutorial">&uarr; back to top</a></b>
</div>

## Creating a component

To make a new component, create a file with the following contents:

`packages/ariakit-react-core/src/my-component/my-component.ts`

````tsx
import { createComponent, createElement, createHook } from "../utils/system.js";
import type { As, Options, Props } from "../utils/types.js";

/**
 * Description for my component hook.
 * @see https://ariakit.org/components/my-component
 * @example
 * ```jsx
 * const props = useMyComponent();
 * <Role {...props} />
 * ```
 */
export const useMyComponent = createHook<MyComponentOptions>(
  ({ customProp = "My component", ...props }) => {
    props = { children: customProp, ...props };
    return props;
  }
);

/**
 * Description for my component.
 * @see https://ariakit.org/components/my-component
 * @example
 * ```jsx
 * <MyComponent />
 * ```
 */
export const MyComponent = createComponent<MyComponentOptions>((props) => {
  const htmlProps = useMyComponent(props);
  return createElement("div", htmlProps);
});

if (process.env.NODE_ENV !== "production") {
  MyComponent.displayName = "MyComponent";
}

export type MyComponentOptions<T extends As = "div"> = Options<T> & {
  /**
   * Description for custom prop.
   */
  customProp?: string;
};

export type MyComponentProps<T extends As = "div"> = Props<
  MyComponentOptions<T>
>;
````

That's the basic structure for all components in the project. This will guarantee that the component will support all the library's core features. You can take a look at other components to see more complex examples.

<div align="right">
  <a href="#basic-tutorial">&uarr; back to top</a></b>
</div>

## Creating the default example

The development workflow on this project is entirely based on examples. You can think of an example as a use case of a component. This will be used not only for development purposes, but also to show the component and its usage in the documentation.

> Every component has a default example that receives the name of the component. This default example should be a common use case, but also simple enough so it requires as few custom props as possible.

Let's create a default example for our component:

`examples/my-component/index.tsx`

```tsx
import { MyComponent } from "@ariakit/react-core/my-component/my-component";

export default function Example() {
  return <MyComponent />;
}
```

Now open http://localhost:3000/examples/my-component to see the example in action.

<div align="right">
  <a href="#basic-tutorial">&uarr; back to top</a></b>
</div>

## Styling the example

When necessary, you can apply styles to the example. We're using [Tailwind](https://tailwindcss.com/) to keep the styles consistent throughout the project. You will find the theme configuration in the [`tailwind.config.cjs`](tailwind.config.cjs) file.

> To use Tailwind in a CSS file rather than applying classes directly to the HTML elements, we're using the [`@apply`](https://tailwindcss.com/docs/functions-and-directives#apply) directive.
>
> Make sure you also take [dark mode](https://tailwindcss.com/docs/dark-mode) into account.

`examples/my-component/style.css`

<!-- prettier-ignore -->
```css
.my-component {
  @apply
    bg-red-600
    text-white
    dark:bg-red-800
  ;
}
```

Now we need to import the CSS file on the example's `index.tsx` file and add the class name to the respective elements:

`examples/my-component/index.tsx`

```tsx
import { MyComponent } from "@ariakit/react-core/my-component/my-component";
import "./style.css";

export default function Example() {
  return <MyComponent className="my-component" />;
}
```

Now open http://localhost:3000/examples/my-component to see the example with the styles applied.

You'll notice that the transpiled CSS file has been also added to editor's files so people can easily edit it directly in the browser. You can also use it to see the output CSS while applying Tailwind classes.

<div align="right">
  <a href="#basic-tutorial">&uarr; back to top</a></b>
</div>

## Testing the example

One of the goals of having use cases written like that is so we can write automated tests for them. Instead of testing the Ariakit components directly, we're testing the examples that represent the way people use Ariakit components.

> We use [`@ariakit/test`](packages/ariakit-test), which is a wrapper around [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/) with some additional features to ensure that events like clicks and key presses work similarly to actual user events.

Let's create a test for our example:

`examples/my-component/test.ts`

```tsx
import { getByText } from "@ariakit/test";

test("my component", () => {
  expect(getByText("My component")).toBeInTheDocument();
});
```

Now run the following command in your terminal to watch the test results:

```bash
npm test watch my-component
```

<div align="right">
  <a href="#basic-tutorial">&uarr; back to top</a></b>
</div>

## Writing another example

A component may have multiple examples besides the default one. This is useful when you want to show a component in different contexts and props.

> Conventionally, the example names are prefixed with the component name and a short suffix. For example: `my-component-custom-prop`.

Let's create another example for our component:

`examples/my-component-custom-prop/index.tsx`

```tsx
import { MyComponent } from "@ariakit/react-core/my-component/my-component";
import "./style.css";

export default function Example() {
  return <MyComponent className="my-component" customProp="Hello world" />;
}
```

<div align="right">
  <a href="#basic-tutorial">&uarr; back to top</a></b>
</div>

## Importing styles from other examples

We can `@import` CSS files from other examples. You'll usually import the styles from the default example into the other examples so you don't need to repeat the same base styles.

`examples/my-component-custom-prop/style.css`

<!-- prettier-ignore -->
```css
@import url("../my-component/style.css");

.my-component {
  @apply
    p-4
  ;
}
```

Now open http://localhost:3000/examples/my-component-custom-prop to see the example with the custom prop applied.

<div align="right">
  <a href="#basic-tutorial">&uarr; back to top</a></b>
</div>

## Promoting the component

So far, we've been working with the `@ariakit/react-core` package. This is where all the components — including experimental stuff — are developed. This package doesn't follow [semver](https://semver.org/), so we can introduce breaking changes on patch and minor updates. Once a component is stable enough, it's promoted to the `@ariakit/react` package.

To promote our component to the `@ariakit/react` package, we need to create a file and re-export the component from the `@ariakit/react-core` package:

`packages/ariakit-react/src/my-component.ts`

```ts
export { MyComponent } from "@ariakit/react-core/my-component/my-component";

export type {
  MyComponentProps,
  MyComponentOptions,
} from "@ariakit/react-core/my-component/my-component";
```

Finally, we must update the `index.ts` file to export the component:

`packages/ariakit-react/src/index.ts`

```ts
// ...
export * from "./my-component.js";
// ...
```

<div align="right">
  <a href="#basic-tutorial">&uarr; back to top</a></b>
</div>

## Updating the examples to import from `@ariakit/react`

Now that we've promoted our component to the `@ariakit/react` package, we need to update the import declarations on the examples:

`examples/my-component/index.tsx`

```tsx
import * as Ariakit from "@ariakit/react";
import "./style.css";

export default function Example() {
  return <Ariakit.MyComponent className="my-component" />;
}
```

`examples/my-component-custom-prop/index.tsx`

```tsx
import * as Ariakit from "@ariakit/react";
import "./style.css";

export default function Example() {
  return (
    <Ariakit.MyComponent className="my-component" customProp="Hello world" />
  );
}
```

<div align="right">
  <a href="#basic-tutorial">&uarr; back to top</a></b>
</div>

## Writing the component documentation

Now that the component is part of the main library, we should write documentation for it.

We can create a markdown file in the components folder and render an anchor element pointing to the example's index file with a `data-playground` attribute. This will turn the link into a playground.

`components/my-component.md`

````markdown
# My component

<div data-description>

This is my component.

</div>

<a href="../examples/my-component/index.tsx" data-playground>Example</a>
````

Now open http://localhost:3000/components/my-component to see the component documentation.

<div align="right">
  <a href="#basic-tutorial">&uarr; back to top</a></b>
</div>

## Writing documentation for other examples

Unlike default examples, other examples will be primarily accessed through their own URLs (for example: http://localhost:3000/examples/my-component-custom-prop). To write documentation for them, we can create a `readme.md` file in the example's directory and follow the same convention as for the component's markdown file.

`examples/my-component-custom-prop/readme.md`

````markdown
# My component with `customProp`

<div data-description>

This is my component using `customProp`.

</div>

<a href="./index.tsx" data-playground>Example</a>

Note that we're passing the `customProp` prop to the component:

```tsx
<MyComponent className="my-component" customProp="Hello world" />
```
````

Now open http://localhost:3000/examples/my-component-custom-prop to see the example documentation.

<div align="right">
  <a href="#basic-tutorial">&uarr; back to top</a></b>
</div>

## Submitting a pull request

When you're ready to submit a pull request, you can follow these naming conventions:

- Pull request titles use the [Imperative Mood](https://en.wikipedia.org/wiki/Imperative_mood) (e.g., `Add something`, `Fix something`).
- [Changesets](#versioning) use past tense verbs (e.g., `Added something`, `Fixed something`).

When you submit a pull request, GitHub will automatically lint, build, and test your changes. If you see an ❌, it's most likely a bug in your code. Please, inspect the logs through the GitHub UI to find the cause.

<div align="right">
  <a href="#basic-tutorial">&uarr; back to top</a></b>
</div>

<br>

---

<div align="center">
  ✅ Now you're ready to contribute to the project. Follow the next steps if you need more advanced instructions.
</div>

---

<br>

## Versioning

When adding new features or fixing bugs, we'll need to bump the package versions. We use [Changesets](https://github.com/changesets/changesets) to do this.

> The action of adding a new example doesn't require a version bump. Only changes to the codebase that affect the public API or existing behavior (e.g., bugs) do.

Let's create a new changeset file for our component:

`.changeset/my-component.md`

```markdown
---
"@ariakit/react": minor
"@ariakit/react-core": patch
---

Added `MyComponent` component. ([#1271](https://github.com/ariakit/ariakit/pull/1271))
```

> The name of the file doesn't really matter as long as it's unique across changesets. Just try to name it in a way that we can easily remember what the change was when reviewing all the changesets.

Once your pull request is merged into the `main` branch, the `Publish` PR will be automatically created/updated with the new changes. Once we merge this PR, the affected packages will be automatically published to npm and the [changelog](packages/ariakit-react/CHANGELOG.md) will be updated.

<div align="right">
    <a href="#advanced-tutorial">&uarr; back to top</a></b>
</div>

## Running with React 17

Ariakit supports both React 17 and React 18. If you want to see if your example works with React 17, you can run the following commands.

```bash
npm run test-react17
```

This command will automatically re-install React 18 at the end of the process. If, for some reason, this doesn't happen automatically, you should run `npm i` in your terminal.

<div align="right">
    <a href="#advanced-tutorial">&uarr; back to top</a></b>
</div>

## Writing end-to-end tests

Most of the time, we'll write unit and integration tests as described on [Testing the example](#testing-the-example). Those tests simulate real user interactions, but they don't run in the browser. They use [JSDOM](https://github.com/jsdom/jsdom), which implements JavaScript DOM APIs in a Node.js environment.

Combined with the [`@ariakit/test`](packages/ariakit-test) package, this is more than enough for most cases. However, sometimes we need a real browser to test specific interactions with our examples that aren't supported in JSDOM. For those cases, we use [Playwright](https://playwright.dev).

Let's create an end-to-end test for our example:

`examples/my-component/test-chrome.ts`

```ts
import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/previews/my-component");
});

test("my component", async ({ page }) => {
  const element = await page.getByText("My component");
  await expect(element).toBeVisible();
});
```

Now run the following command in your terminal to see the test results (make sure to replace `my-component` with the name of your example, or omit it to run all the tests):

> **Note**: The [development server](#starting-the-development-server) must be running in another terminal instance.

```bash
npm run test-browser my-component
```

You can also run the tests in headed mode:

```bash
npm run test-browser-headed my-component
```

Or in debug mode:

```bash
npm run test-browser-debug my-component
```

<div align="right">
    <a href="#advanced-tutorial">&uarr; back to top</a></b>
</div>
