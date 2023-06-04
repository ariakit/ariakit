# Component stores

<p data-description>
  Access and manipulate the state of Ariakit components in a performant way through component stores.
</p>

## Overview

Component stores are created using custom React hooks exported by the `@ariakit/react` package. They allow you to read and write the state of Ariakit components. With them, you can control the value of a [Combobox](/components/combobox), the active item of a [Menu](/components/menu), the open state of a [Dialog](/components/dialog), or the values in a [Form](/components/form), for example.

You instantiate the store by calling the component store hook within a React component:

```js "useComboboxStore"
function MyCombobox() {
  const combobox = useComboboxStore();
}
```

Then, you should pass the store to the wrapping components of that module:

```jsx "store" "combobox"
<Combobox store={combobox} />

<ComboboxPopover store={combobox}>
  <ComboboxItem value="Apple" />
  <ComboboxItem value="Banana" />
  <ComboboxItem value="Orange" />
</ComboboxPopover>
```

Passing the store to the child components, such as `ComboboxItem`, is optional.

<aside data-type="note" title="The store prop">

The `store` prop on Ariakit components serves as a means to establish connections between different parts of the same widget. It functions in a similar manner to HTML attributes such as `aria-labelledby`, `aria-describedby`, `aria-controls`, and `for`, which are used to reference other elements within the DOM.

</aside>

## Providing state to the store

Component stores accept an optional object as an argument. This object is used to initialize and control the state of the component.

### Default state

Conventionally, when dealing with dynamic state, the initial value passed to the store has its property name prefixed with the word `default`. In this case, only the initial value will be considered. It doesn't have to be referentially stable between re-renders.

```js "defaultValues:"
const form = useFormStore({
  defaultValues: { name: "", email: "" },
});
```

### State setters

Component stores may also accept callbacks for state changes. These functions conventionally bear the name of the state property they modify, prefixed with the word `set`. They are invoked with the new state whenever an update occurs.

These state setters serve various purposes, such as updating another state, executing side effects, or implementing features like `onChange`, `onValuesChange`, `onToggle`, `onOpenChange`, `onClose`, and so on.

```js {3-5} "setValues"
const form = useFormStore({
  defaultValues: { name: "", email: "" },
  setValues(values) {
    console.log(values);
  },
});
```

### Controlled state

You can take full control of the state by passing the exact property, without prefixes, to the store. In this case, the state will be considered controlled and the component will not update the state internally. It will only call the state setter. You can use this to implement a controlled component using `React.useState`:

```js "values" "setValues"
const [values, setValues] = React.useState({ name: "", email: "" });
const form = useFormStore({ values, setValues });
```

You can also receive controlled props, such as `value` and `onChange`, from a parent component and pass them directly to the store:

```js "value" "onChange"
const select = useSelectStore({
  value: props.value,
  setValue: props.onChange,
});
```

## Reading the state

Component stores in the `@ariakit/react` package expose a `useState` method. It's a custom React hook that you can use to read the state in a performant way.

### Watching the entire state

Calling `store.useState()` without any arguments returns the entire state object and re-renders the component whenever the state changes.

```js "useState"
function MyCombobox() {
  const combobox = useComboboxStore();
  const state = combobox.useState();

  console.log(state.value);
}
```

### Watching a specific state property

Alternatively, you can pass a string to `store.useState()` to read the value of a specific state property. The component will only re-render when the requested value changes.

```js ""open""
const value = combobox.useState("value");
const isOpen = combobox.useState("open");
```

### Computed values

Finally, `store.useState()` accepts a selector function as an argument. The function will receive the state as a parameter and should return a value, which can be computed inside the function body.

You're free to use other variables within this function. The selector will be called whenever the state is updated and on every render, but the component will only re-render when the returned value changes.

```js
function MyComboboxItem({ store, id }) {
  // This component will only re-render when isActive becomes true or false,
  // rather than on any activeId change.
  const isActive = store.useState((state) => state.activeId === id);
}
```

### Reading the state on events

If you're reading the state inside an event handler, you don't need to use `store.useState()`. You can read the current state directly from the store using `store.getState()`, which won't trigger a re-render on the component.

```js {4}
const combobox = useComboboxStore();

function handleKeyDown(event) {
  const { value } = combobox.getState();
  console.log(value);
}
```

## Writing the state

Component stores have a generic `setState` method that can be used to mutate any state in the store. This method shouldn't be called during render, but it's safe to call it inside an event handler or React effect callbacks.

```js "onClick" "setState"
const dialog = useDialogStore({ defaultOpen: false });

function onClick() {
  dialog.setState("open", true);
}
```

The second parameter of `store.setState()` can be either the new state value or a function that receives the current state and returns the new state. This is useful when you need to update the state based on a previous value.

```js
dialog.setState("open", (open) => !open);
```

Component stores may also expose specific methods to update the state. These methods are named after the state property they update. For example, `store.setOpen()` updates the `open` state.

```js "setOpen"
const dialog = useDialogStore({ defaultOpen: false });

function onClick() {
  // Equivalent to dialog.setState("open", true);
  dialog.setOpen(true);
}
```

Like `store.setState()`, these methods can also receive a function:

```js
dialog.setOpen((open) => !open);
```

For consistency, all the [state setters](#state-setters) that can be passed to the store as an argument are also exposed as methods.

For convenience, component stores may also expose methods that perform specific state updates:

```js
dialog.show(); // dialog.setOpen(true)
dialog.hide(); // dialog.setOpen(false)
dialog.toggle(); // dialog.setOpen((open) => !open)
```

## Using React Context

When you need to access the store in child components, passing it as a prop is usually the most straightforward approach. However, if the component is deeply nested within the component tree or if you're unable to pass the store as a prop for some reason, you can leverage React Context instead:

<a href="./form-react-context.tsx" data-playground type="code">Example</a>
