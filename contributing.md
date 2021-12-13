# Contributing

This guide is intended to help you get started with contributing to the project. By following these steps, you will understand the basic development process and workflow.

1. [Cloning the repository](#cloning-the-repository)
2. [Installing Node.js and npm](#installing-nodejs-and-npm)
3. [Installing dependencies](#installing-dependencies)
4. [Creating a new branch](#creating-a-new-branch)
5. [Starting the development server](#starting-the-development-server)
6. [Creating a component](#creating-a-component)
7. [Creating the default example](#creating-the-default-example)
8. [Styling the example](#styling-the-example)
9. [Writing the component documentation](#writing-the-component-documentation)
10. [Writing another example](#writing-another-example)
11. [Importing styles from other examples](#importing-styles-from-other-examples)
12. [Writing documentation for other examples](#writing-documentation-for-other-examples)

## Cloning the repository

To start contributing to the project, you have to fork this repository and clone it to your local machine:

```bash
git clone -b v2 https://github.com/YOUR_USERNAME/reakit.git
```

If you are already part of the organization on GitHub, you can clone the repository directly:

```bash
git clone -b v2 https://github.com/reakit/reakit.git
```

## Installing Node.js and npm

This repository uses [npm workspaces](https://docs.npmjs.com/cli/v8/using-npm/workspaces) to manage multiple projects. You need to install **npm v7 or higher** and **Node.js v15 or higher**.

You can run the following commands in your terminal to check your local Node.js and npm versions:

```bash
node -v
npm -v
```

If the versions are not correct or you don't have Node.js or npm installed, you can download them from https://nodejs.org.

Alternatively, you can use [nvm](https://github.com/nvm-sh/nvm) to install the project's Node.js and npm versions. Once in the project's root directory, you can run the following command in your terminal:

```bash
nvm use
```

> If you haven't installed the specific Node.js version yet, `nvm` will ask you to run `nvm install` to install it. You can just follow the instructions in your terminal.

## Installing dependencies

Once in the project's root directory, you can run the following command to install the project's dependencies:

```bash
npm install
```

## Creating a new branch

Make sure you create a new branch for your changes. You can do this by running the following command in your terminal:

```bash
git checkout -b feat/new-feature
```

## Starting the development server

After installing the project's dependencies, you can run the following command to start the development server:

```bash
npm run dev
```

> On Windows, you should run this command as administrator or in developer mode. Otherwise, symlinks won't be created.

Now you can open http://localhost:3000 in your browser to see the project's site.

## Creating a component

To create a new component, create a file with the following contents:

`packages/ariakit/src/my-component/my-component.ts`

````tsx
import {
  createComponent,
  createElement,
  createHook,
} from "ariakit-utils/system";
import { As, Options, Props } from "ariakit-utils/types";

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

export type MyComponentOptions<T extends As = "div"> = Options<T> & {
  /**
   * Description for custom prop.
   */
  customProp?: string;
};
};

export type MyComponentProps<T extends As = "div"> = Props<
  MyComponentOptions<T>
>;
````

That's the basic structure for all components in the project. This will guarantee that the component will support all the library's [core features](https://ariakit.org/guide/core-features). You can take a look at other components to see more complex examples.

Finally, create an `index.ts` file in the same directory as the component. This file will be used to export the component:

`packages/ariakit/src/my-component/index.ts`

```tsx
export * from "./my-component";
```

## Creating the default example

The development workflow on this project is entirely based on examples. You can think of an example as a use case of a component. This will be used not only for development purposes, but also to show the component and its usage in the documentation.

> Every component has a default example that receives the name of the component. This default example should be a common use case, but also simple enough so it requires as few custom props as possible.

Let's create a default example for our component:

`packages/ariakit/src/my-component/__examples__/my-component/index.tsx`

```tsx
import { MyComponent } from "ariakit/my-component";

export default function Example() {
  return <MyComponent />;
}
```

Now you can open http://localhost:3000/examples/my-component in your browser to see the example in action.

## Styling the example

When necessary, you can apply styles to the example. We're using [Tailwind](https://tailwindcss.com/) to keep the styles consistent throughout the project. You can find the theme configuration in the [`tailwind.config.js`](tailwind.config.js) file.

> To use Tailwind in a CSS file rather than applying classes directly to the HTML elements, we're using the [`@apply`](https://tailwindcss.com/docs/functions-and-directives#apply) directive.
>
> Make sure you also take dark mode into account.

`packages/ariakit/src/my-component/__examples__/my-component/style.css`

```css
.my-component {
  @apply bg-danger-2 text-danger-2 dark:bg-danger-2-dark dark:text-danger-2-dark
}
```

Now we need to import the CSS file on the example's `index.tsx` file and add the class name to the respective elements:

`packages/ariakit/src/my-component/__examples__/my-component/index.tsx`

```tsx
import { MyComponent } from "ariakit/my-component";
import "./style.css";

export default function Example() {
  return <MyComponent className="my-component" />;
}
```

Now you can open http://localhost:3000/examples/my-component in your browser to see the example with the styles applied.

You'll notice that the transpiled CSS file has been also added to editor's files so people can easily edit it directly in the browser. You can also use it to see the output CSS while applying Tailwind classes.

## Testing the example

One of the goals of having use cases written like that is so we can write automated tests for them.

> We use [`ariakit-test-utils`](packages/ariakit-test-utils), which is a wrapper around [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/) with some additional features to ensure that events like clicks and key presses work similarly to actual user events.

Let's create a test for our example:

`packages/ariakit/src/my-component/__examples__/my-component/test.tsx`

```tsx
import { render, getByText } from "ariakit-test-utils";
import Example from ".";

test("My component", () => {
  render(<Example />);
  expect(getByText("My component")).toBeInTheDocument();
});
```

Now you can run the following command in your terminal to watch the test results:

```bash
npm run test:watch
```

## Writing the component documentation

Now we can write the documentation for the component itself using the example we just created.

We can create a `readme.md` file in the component's directory and render an anchor element pointing to the example's index file with a `data-playground` attribute. This will turn the link into a playground.

`packages/ariakit/src/my-component/readme.md`

````markdown
# My component

This is my component.

<a href="./__examples__/my-component/index.tsx" data-playground>Example</a>

## Features

- Renders a nice "My component" text.

## Installation

```bash
npm install ariakit
```

Learn more on [Get started](/guide/get-started).
````

Now you can open http://localhost:3000/components/my-component in your browser to see the component documentation.

## Writing another example

A component may have multiple examples besides the default one. This is useful when you want to show a component in different contexts and props.

> Conventionally, the example names are prefixed with the component name and a short suffix. For example: `my-component-custom-prop`.

Let's create another example for our component:

`packages/ariakit/src/my-component/__examples__/my-component-custom-prop/index.tsx`

```tsx
import { MyComponent } from "ariakit/my-component";
import "./style.css";

export default function Example() {
  return <MyComponent className="my-component" customProp="Hello world" />;
}
```

Now you can open http://localhost:3000/examples/my-component-custom-prop in your browser to see the example with the custom prop applied.

## Importing styles from other examples

We can `@import` CSS files from other examples. You'll usually import the CSS file from the default example on the other examples so you don't need to repeat yourself.

`packages/ariakit/src/my-component/__examples__/my-component-custom-prop/style.css`

```css
@import url("../my-component/style.css");

.my-component {
  @apply p-4;
}
```

## Writing documentation for other examples

Unlike default examples, other examples will be primarily accessed through their own URLs (`/examples/my-component-custom-prop`). To write documentation for them, we can create a `readme.md` file in the example's directory and follow the same convention as for the component's `readme.md` file.

`packages/ariakit/src/my-component/__examples__/my-component-custom-prop/readme.md`

````markdown
# My component with `customProp`

This is my component using `customProp`.

<a href="./index.tsx" data-playground>Example</a>

Note that we're passing the `customProp` prop to the component:

```tsx
<MyComponent className="my-component" customProp="Hello world" />
```
````
