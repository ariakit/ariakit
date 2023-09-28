# Styling

<div data-description>

Ariakit provides unstyled components by default. You're free to style them using your favorite styling method.

</div>

## Applying styles

Ariakit components accept all native props, including `className`, `style`, and `ref`. You can use them to apply your styles just like you would with any other React element using plain CSS, inline CSS, CSS modules, CSS-in-JS, Styled Components, Emotion, Tailwind, etc.

```jsx
<Dialog
  ref={dialogRef}
  style={{ backgroundColor: "white" }}
  className="dialog bg-white"
/>
```

## CSS selectors

<aside data-type="danger" title="Do not use any selectors that are not listed below">

Ariakit renders elements with HTML attributes, such as `role`, that should not be used as CSS selectors as they're not part of the public API and may change in future minor and patch releases.

To safely use CSS selectors, utilize the `className` prop or provide your own `data-*` attributes to the component. Refer to the list below for all the selectors that are safe to use.

</aside>

### `[aria-checked]`

The `aria-checked` attribute is applied to the [Checkbox](/components/checkbox) component when the input is checked. It can be either `true` or `false`.

```css
.checkbox[aria-checked="true"] {
  background-color: hsl(204 100% 40%);
  color: hsl(204 20% 100%);
}
```

### `[aria-disabled]`

Not all HTML elements accept the `disabled` attribute. That's why the [Focusable](/components/focusable) component and all components that use it underneath will apply the `aria-disabled` attribute to the rendered element when the `disabled` prop is set to `true`.

```css
.button[aria-disabled="true"] {
  opacity: 0.5;
}
```

### `[aria-expanded]`

The `aria-expanded` attribute is applied to the [Disclosure](/components/disclosure) component and all components that use it underneath, such as [PopoverDisclosure](/components/popover), [MenuButton](/components/menu), and [Select](/components/select), when the content element is shown.

```css
.button[aria-expanded="true"] {
  background-color: #eee;
}
```

### `[aria-invalid]`

The `aria-invalid` attribute is applied to [Form](/components/form) field components when there's a visible error message. You can use it to style the field differently when it's invalid.

```css
.input[aria-invalid="true"] {
  border-color: red;
}
```

### `[data-active]`

The `data-active` attribute is applied to clickable components, such as [Command](/components/command) and [Button](/components/button), to simulate the `:active` pseudo-class when the components are not rendered as native `button` elements.

It's important to note that, to avoid doing unnecessary work, the `data-active` attribute is not applied to components that are rendered as `button` elements. Therefore, you should use both the `:active` and `[data-active]` selectors to keep your styles consistent.

```css
.button:active,
.button[data-active] {
  background-color: #eee;
}
```

### `[data-active-item]`

The `data-active-item` attribute is applied to composite widget items when they receive focus or are hovered (when the [`focusOnHover`](/reference/composite-hover#focusonhover) prop is set to `true`). Besides the [Composite](/components/composite) component itself, composite widgets include [Combobox](/components/combobox), [Menu](/components/menu), [Radio](/components/radio), [Select](/components/select), [Tab](/components/tab), and [Toolbar](/components/toolbar).

```css
.item[data-active-item] {
  background-color: #eee;
}
```

### `[data-autofill]`

The `data-autofill` attribute is applied to the [Select](/components/select) component when it's used within a form and the value has been autofilled by the browser.

```css
.select[data-autofill] {
  background-color: rgb(219 237 255);
}
```

### `[data-backdrop]`

The `data-backdrop` attribute can be used to style all [Dialog](/components/dialog) backdrop elements at once.

```css
[data-backdrop] {
  background-color: rgba(0, 0, 0, 0.5);
}
```

### `[data-enter]`

When [Disclosure](/components/disclosure) components have the `animated` state set to `true`, they will apply the `data-enter` attribute to the rendered element when its being shown. This happens with a short delay to allow the browser to paint the element before the animation starts.

```css
.dialog {
  transform: scale(0.9);
  transition: transform 200ms;
}

.dialog[data-enter] {
  transform: scale(1);
}
```

### `[data-leave]`

Similar to [`data-enter`](#data-enter), when [Disclosure](/components/disclosure) components have the `animated` state set to `true`, they will apply the `data-leave` attribute to the rendered element when its being hidden.

Usually, you just need `data-enter`. The animation will be reversed when the element is hidden. However, if you want to style the exit animation in a different way, you can use `data-leave` to do so.

```css
.dialog {
  transform: scale(1);
  transition: transform 200ms;
}

.dialog[data-leave] {
  transform: scale(0.9);
}
```

### `[data-focus-visible]`

The `data-focus-visible` attribute is applied to the [Focusable](/components/focusable) component and all components that use it underneath when there's a keyboard interaction on a focusable element.

It works the same way as the [`:focus-visible`](https://developer.mozilla.org/en-US/docs/Web/CSS/:focus-visible) pseudo-class. However, unlike `:focus-visible`, the `data-focus-visible` attribute is also applied to composite widget items, such as [ComboboxItem](/components/combobox), when they receive [`virtualFocus`](/reference/use-composite-store#virtualfocus).

If you're styling Ariakit components, it's recommended to use the `[data-focus-visible]` selector to keep your styles consistent.

```css
.button[data-focus-visible] {
  outline: 2px solid #007acc;
}
```

## CSS variables

Some components, such as [Popover](/components/popover), [Menu](/components/menu), [Hovercard](/components/hovercard), [SelectPopover](/components/select), [ComboboxPopover](/components/combobox), among others, expose CSS variables that you can use to customize their appearance.

### `--popover-anchor-width`

The `--popover-anchor-width` variable exposes the width value of the anchor element. It's useful when you want to make the popover element have a minimum or the same width as the anchor element.

```css
.combobox-popover {
  /* The combobox popover will have the combobox input width as its min width */
  min-width: var(--popover-anchor-width);
}
```

### `--popover-available-height`

The `--popover-available-height` variable exposes the available vertical space in the viewport. You can use this to make the popover element have a maximum height that fits the available space.

```css
.popover {
  max-height: var(--popover-available-height);
}
```

### `--popover-available-width`

The `--popover-available-width` variable exposes the available horizontal space in the viewport. You can use this to make the popover element have a maximum width that fits the available space.

```css
.popover {
  max-width: var(--popover-available-width);
}
```

### `--popover-overflow-padding`

The `--popover-overflow-padding` variable exposes the amount of padding that should be added between the popover element and the viewport edges. You can use this in combination with `100%` or `100vw` values to make the popover element fill the entire viewport width, while still keeping the padding.

```css
.popover {
  width: calc(100vw - var(--popover-overflow-padding) * 2);
}
```

### `--scrollbar-width`

The [Dialog](/components/dialog) component will define a `--scrollbar-width` CSS variable on the `html` element when a modal dialog is open. Since the scrollbar is hidden when a modal dialog is open, this variable can be used to adjust the right padding of your `position: fixed` elements.

```css
.header {
  position: fixed;
  padding-inline: 16px;
  padding-inline-end: calc(16px + var(--scrollbar-width, 0));
}
```
