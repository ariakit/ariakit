---
unlisted: true
---

# Component providers

<div data-description>

Provide state to Ariakit components using a simple wrapper that supports controlled and uncontrolled props.

</div>

## Overview

Component providers are optional components that act as a higher-level API on top of [component stores](/guide/component-stores). They wrap Ariakit components and automatically provide a store to them.

For instance, when you wrap [`Combobox`](/reference/combobox) and [`ComboboxPopover`](/reference/combobox-popover) with [`ComboboxProvider`](/reference/combobox-provider), both components will be connected to the same store automatically:

```jsx "ComboboxProvider"
<ComboboxProvider>
  <Combobox />
  <ComboboxPopover>
    <ComboboxItem value="Apple" />
    <ComboboxItem value="Banana" />
    <ComboboxItem value="Orange" />
  </ComboboxPopover>
</ComboboxProvider>
```

If you choose not to use component providers, you will need to manually pass the [`store`](/reference/combobox#store) prop to each top-level component.

## Managing state

### Default state

Component providers can act as uncontrolled containers. In such a scenario, you can supply the initial state using props:

```jsx "defaultValue"
<SelectProvider defaultValue="Banana">
```

### State setters

Component providers may also accept callbacks for state changes. These functions conventionally bear the name of the state property they modify, prefixed with the word `set`. They are invoked with the new state whenever an update occurs.

These state setters serve various purposes, such as updating another state, executing side effects, or implementing features like `onChange`, `onValuesChange`, `onToggle`, `onOpenChange`, and so on.

```jsx {2-4} "setValue"
<SelectProvider
  setValue={(value) => {
    console.log(value);
  }}
>
```

### Controlled state

You can take full control of the state by passing the exact property, without prefixes, as a prop to the provider component. In this case, the state will be considered controlled and the component will not update the state internally. It will only call the state setter. You can use this to implement a controlled component using `React.useState`:

```jsx "value"0,2 "setValue"0,2
const [value, setValue] = React.useState("Banana");

<SelectProvider value={value} setValue={setValue}>
```

You can also receive controlled props, such as `value` and `onChange`, from a parent component and pass them directly to the provider component:

```jsx "value"0 "setValue" "defaultValue"0
<SelectProvider
  value={props.value}
  setValue={props.onChange}
  defaultValue={props.defaultValue}
>
```

## Passing a store

You can use both component providers and [component stores](/guide/component-stores) together if you need fine-grained control over the state. In this case, you can pass the store as a prop to the provider component:

```jsx "store"
const select = useSelectStore({ defaultValue: "Banana" });
const value = select.useState("value");

<SelectProvider store={select}>
```

## Using React Context

If you're inside a React component that's wrapped within an Ariakit component provider, you can benefit from Ariakit context hooks to access the nearest component store in the tree:

```jsx "useMenuContext"
// A MenuButton that also behaves as a MenuItem when it's in a submenu
function MenuButton(props) {
  const menu = useMenuContext();
  const render = menu?.parent ? <Ariakit.MenuItem /> : undefined;

  return <Ariakit.MenuButton {...props} render={render} />;
}
```
