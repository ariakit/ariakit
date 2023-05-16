# Dialog with Framer Motion

<p data-description>
  Using <a href="https://www.framer.com/motion/">Framer Motion</a> to add initial and exit animations to a modal <a href="/components/dialog">Dialog</a> and its <a href="/apis/dialog#backdrop"><code>backdrop</code></a> element.
</p>

<div data-cards="components">

- [](/components/button)
- [](/components/dialog)

</div>

<a href="./index.tsx" data-playground>Example</a>

## Related examples

<div data-cards="examples">

- [](/examples/menu-framer-motion)
- [](/examples/tooltip-framer-motion)

</div>

## AnimatePresence

We use the [AnimatePresence](https://www.framer.com/motion/animate-presence/) component from Framer Motion to animate the Ariakit [Dialog](/components/dialog) component when it gets mounted and unmounted from the DOM.

```jsx
<AnimatePresence>
  {mounted && (
    <Ariakit.Dialog
      store={dialog}
      hidden={false}
      as={motion.div}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      backdrop={
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        />
      }
    />
  )}
</AnimatePresence>
```

To dynamically render the dialog component, you can use the [`mounted`](/apis/dialog-store#mounted) state that can be retrieved from the store:

```jsx
const dialog = Ariakit.useDialogStore();
const mounted = dialog.useState("mounted");
```

You can learn more about reading state from the store on the [Component stores](/guide/component-stores#reading-the-state) guide.
