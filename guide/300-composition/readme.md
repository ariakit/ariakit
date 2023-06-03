# Composition

<p data-description>
  The <code>render</code> prop makes Ariakit components more versatile, allowing you to easily replace the default HTML element or enhance its features with custom components.
</p>

## Changing the HTML element

The `render` prop lets you specify a different HTML element to be rendered instead of the default element.

For instance, the [Textarea with inline Combobox](/examples/combobox-textarea) example uses the `render` prop to replace the default `input` element rendered by the [Combobox](/components/combobox) component with a `textarea` element. You can pass specific `textarea` props to the element directly:

```jsx "Combobox" "textarea"
<Combobox render={<textarea rows={5} />} />
```

The [Combobox with links](/examples/combobox-links) example renders the [`ComboboxItem`](/apis/combobox-item) component as an anchor element. Specific props should be passed to their corresponding components:

```jsx "ComboboxItem" "a"
<ComboboxItem
  hideOnClick
  focusOnHover
  render={<a href="https://google.com" />}
/>
```

The [Dialog with details & summary](/examples/dialog-details) example uses the `render` prop to replace the default `button` element of the [Button](/components/button) component with a `summary` element:

```jsx "Button"0 "summary"
<Button render={<summary />}>Show modal</Button>
```

## Composing with custom components

<aside data-type="danger" title="Important to know">

When rendering custom components using the `render` prop, be aware that [custom components must be open for extension](#custom-components-must-be-open-for-extension).

</aside>

Besides changing the underlying HTML element, the `render` prop can be used to render a custom component.

In the [Menu with Framer Motion](/examples/menu-framer-motion) example, the `render` prop is used to render the [Menu](/components/menu) component as a `motion.div` element:

```jsx "Menu" "motion.div"
<Menu render={<motion.div animate={{ y: 100 }} />} />
```

The [Tab with Next.js App Router](/examples/tab-next-router) example uses the `render` prop to render the [Tab](/components/tab) component as the custom `Link` component from Next.js:

```jsx "Tab"0 "Link"
<Tab render={<Link href="/new" />}>New</Tab>
```

## Merging the rendered element props

When passing an HTML element to the `render` prop, all the HTML props returned by the original component will be passed to the rendered element. The `style`, `className`, `ref` and event props will be automatically merged. In all other cases, the rendered element props will override the original component props:

```jsx "id"0,2
// Results in <a id="item" ...other HTML props from ComboboxItem
<ComboboxItem id="item" render={<a />} />

// Results in <a id="link" ...other HTML props from ComboboxItem
<ComboboxItem id="item" render={<a id="link" />} />
```

This also applies to the `children` prop:

```jsx "Ariakit"0 "Ariakit.org"
// Children will be Ariakit
<ComboboxItem render={<a />}>Ariakit</ComboboxItem>

// Children will be Ariakit.org
<ComboboxItem render={<a>Ariakit.org</a>}>Ariakit</ComboboxItem>
```

<aside data-type="note" title="Flat is better than nested">

With the `render` prop, you don't need to nest the `children` inside the rendered element. Instead, you can pass the `children` as usual to the original component to avoid extra nesting.

<div class="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] gap-x-2 gap-y-4 [&_pre]:h-full">

```jsx {5,6} "Menu"
// ❌ Nesting inside render
<MenuItem
  render={
    <Menu label="File">
      <MenuItem>New Tab</MenuItem>
      <MenuItem>New Window</MenuItem>
    </Menu>
  }
/>
```

```jsx {3,4} "Menu"
// ✅ Better
<MenuItem render={<Menu label="File" />}>
  <MenuItem>New Tab</MenuItem>
  <MenuItem>New Window</MenuItem>
</MenuItem>
```

</div>

</aside>

The same logic applies to custom components, but only for the props that are directly passed to the element within the `render` prop. The custom component itself is responsible for merging these props within its implementation. For more details, see [Custom components must be open for extension](#custom-components-must-be-open-for-extension).

## Explicit `render` function

In addition to accepting a React element, the `render` prop can also receive a function that takes the original component's HTML props as a parameter and returns a React element. This provides you with greater control over the process of merging props:

```jsx "htmlProps"
<Button render={(htmlProps) => <summary {...htmlProps} />} />
```

This is useful when you want to compose the original component with custom components that accept HTML props through a custom prop:

```jsx "triggerProps"
<ComboboxItem render={(props) => <MyModal triggerProps={props} />} />
```

<aside data-type="danger" title="Important to know">

When rendering custom components using the `render` prop, be aware that [custom components must be open for extension](#custom-components-must-be-open-for-extension).

</aside>

Another use case for the `render` function is to render elements between an internal wrapper and the rendered element:

```jsx "dialogProps"
<Dialog
  portal
  backdrop={false}
  render={(dialogProps) => (
    // Renders a custom backdrop element that wraps the dialog, but is still
    // inside the dialog portal.
    <div className="backdrop">
      <div {...dialogProps} />
    </div>
  )}
>
```

## Merging the `render` function props

When a function is passed to the `render` prop, the HTML props will **not** be automatically merged into the returned React element. It's your responsibility to merge them within the function itself, following the same approach described in [Custom components must be open for extension](#custom-components-must-be-open-for-extension).

Considering this, it's generally recommended to pass all the HTML props you intend to merge to the original component, as it can handle the merging process for you:

<div class="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] gap-x-2 gap-y-4 !max-w-[832px] [&_pre]:h-full">

```jsx "ref" "onClick"
// ❌ Manually merging props
<Button
  render={(props) => (
    <summary
      {...props}
      ref={mergeRefs(props.ref, myRef)}
      onClick={(event) => {
        props.onClick?.(event);
        handleClick();
      }}
    />
  )}
/>
```

```jsx "ref" "onClick"
// ✅ Better
<Button
  ref={myRef}
  onClick={handleClick}
  render={(props) => <summary {...props} />}
/>
```

</div>

## Custom components must be open for extension

When using the `render` prop with a custom component, you must ensure the component is open for extension. This means it should pass the incoming props, including event listeners and the forwarded `ref` prop, to the underlying element. Otherwise, the component may not work as expected.

This is a common pattern in most modern component libraries, so you shouldn't have problems with them. If you're using your own custom components, make sure they're open for extension by following these guidelines:

1. Spread all props onto the underlying element.
2. Forward the `ref` prop and merge it with the internal ref, if any.
3. Merge the `style` and `className` props with the internal styles and classes, if any.
4. Chain the event props with the internal event handlers, if any.

```jsx {8,9,12,15} "forwardRef" "mergeRefs"0
import { forwardRef, useRef } from "react";
import { mergeRefs } from "react-merge-refs";

const CustomButton = forwardRef(function CustomButton(props, forwardedRef) {
  const internalRef = useRef(null);
  return (
    <button
      {...props}
      ref={mergeRefs([internalRef, forwardedRef])}
      style={{
        position: "relative",
        ...props.style,
      }}
      onClick={(event) => {
        props.onClick?.(event);
        // ...
      }}
    />
  );
});
```
