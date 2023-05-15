# Composition

<p data-description>
  The <a href="#as"><code>as</code></a> and <a href="#render"><code>render</code></a> props make Ariakit components more versatile, allowing you to easily replace the default HTML element or enhance its features with custom components.
  </p>

## `as`

The `as` prop lets you specify a different HTML element or a custom component to be rendered instead of the default element.

### HTML elements

For instance, the [Textarea with inline Combobox](/examples/combobox-textarea) example uses the `as` prop to replace the default `input` element rendered by the [Combobox](/components/combobox) component with a `textarea` element. This allows specific `textarea` props to be passed:

```jsx
<Combobox as="textarea" rows={5} />
```

The [Combobox with links](/examples/combobox-links) example employs the `as` prop to render the [`ComboboxItem`](/apis/combobox-item) component as an anchor element:

```jsx
<ComboboxItem as="a" href="https://google.com" />
```

The [Dialog with details & summary](/examples/dialog-details) example uses the `as` prop to replace the default `button` element of the [Button](/components/button) component with a `summary` element:

```jsx
<Button as="summary">Show modal</Button>
```

### Custom components

<aside data-type="danger" title="Important to know">

- When passing custom components to the `as` prop, be aware that [custom components must be open for extension](#custom-components-must-be-open-for-extension).
- Using the `as` prop with custom components may lead to [prop conflicts](#prop-conflicts).

</aside>

In the [Menu with Framer Motion](/examples/menu-framer-motion) example, the `as` prop is used to render the [Menu](/components/menu) component as a `motion.div` element, allowing you to pass specific `motion.div` props to the `Menu` component:

```jsx
<Menu as={motion.div} animate={{ y: 100 }} />
```

The [Tab with Next.js App Router](/examples/tab-next-router) example uses the `as` prop to render the [Tab](/components/tab) component as the custom `Link` component from Next.js:

```jsx
<Tab as={Link} href={{ pathname: "/" }} />
```

### Prop conflicts

Although the `as` prop is a convenient way to replace the default HTML element, it has one important caveat when using custom components: prop name conflicts.

For example, if you're combining two components that accept the same custom prop, only the original component will receive the prop:

```jsx
<TooltipAnchor
  // We can't pass the custom `store` prop to `MenuButton` here because it will
  // be consumed by `TooltipAnchor` and won't be passed down to `MenuButton`.
  as={MenuButton}
  store={tooltip}
/>
```

In this case, it's preferable to use the [`render`](#render) prop instead.

## `render`

The `render` prop allows you to render a different HTML element or a custom component passing the original component's HTML props to it. This way, you can avoid prop conflicts:

```jsx {3}
<TooltipAnchor
  store={tooltip}
  render={(props) => <MenuButton store={menu} {...props} />}
>
  Open menu
</TooltipAnchor>
```

If you're working with custom components that accept HTML props through a different prop name, this approach lets you remap the props:

```jsx
<AriakitComponent render={(props) => <CustomComponent htmlProps={props} />} />
```

<aside data-type="danger" title="Important to know">

When rendering custom components using the `render` prop, be aware that [custom components must be open for extension](#custom-components-must-be-open-for-extension).

</aside>

### Nesting children

<figure data-type="bigquote">
  <blockquote cite="https://peps.python.org/pep-0020/">
    <p>Flat is better than nested</p>
  </blockquote>
  <figcaption>
    — <cite><a href="https://peps.python.org/pep-0020/">The Zen of Python</a></cite>
  </figcaption>
</figure>

With the `render` prop, you don't need to nest the `children` inside the render function. Instead, you can pass the `children` as usual to the original component. The render function will receive the `children` as a prop:

<div class="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] gap-x-2 gap-y-4 !max-w-5xl [&_pre]:h-full">

```jsx {6,7}
// ❌ Nesting
<TooltipAnchor
  store={tooltip}
  render={(props) => (
    <MenuButton store={menu} {...props}>
      Open menu
      <MenuButtonArrow />
    </MenuButton>
  )}
/>
```

```jsx {6,7}
// ✅ Better
<TooltipAnchor
  store={tooltip}
  render={(props) => <MenuButton store={menu} {...props} />}
>
  Open menu
  <MenuButtonArrow />
</TooltipAnchor>
```

</div>

This approach also makes it easier to refactor a component to use the `render` prop when needed. You can simply add the `render` prop to the component without having to touch the `children`.

## Custom components must be open for extension

When using the [`as`](#as) or [`render`](#render) props with a custom component, it must be open for extension. This means the component should pass the incoming props, including event listeners and the forwarded `ref` prop, to the underlying element. Otherwise, the component may not work as expected.

```jsx {10,13,17,21}
import { forwardRef, useRef } from "react";
import { mergeRefs } from "react-merge-refs";

const CustomButton = forwardRef((props, forwardedRef) => {
  const ref = useRef(null);
  // Do something with the internal ref
  return (
    <button
      // Spread the props
      {...props}
      // Merge the refs or pass the forwarded ref directly if you don't need
      // an internal ref
      ref={mergeRefs([ref, forwardedRef])}
      // Merge the styles
      style={{
        position: "relative",
        ...props.style,
      }}
      onClick={(event) => {
        // Call the original event handler if it exists
        props.onClick?.(event);
        // Do something else
      }}
    />
  );
});
```

This is a common pattern in most modern third-party libraries, so you shouldn't have problems with them. If you're using your own custom components, make sure they're open for extension.
