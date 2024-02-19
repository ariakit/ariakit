---
tags:
  - Plus
  - Tab
  - Animated
  - CSS transitions
  - Abstracted examples
---

# Animated TabPanel

<div data-description>

Using plain CSS transitions to slide in and out [`TabPanel`](/reference/tab-panel) components as they are expanded.

</div>

<div data-tags></div>

<a href="./index.tsx" data-playground>Example</a>

## Components

<div data-cards="components">

- [](/components/tab)

</div>

## Determining the previously opened tab

In this example, we created a custom `TabPanel` component that automatically assigns a `data-was-open` attribute to the tab panel element if it was the last one opened. This will be used as a CSS selector to decide whether the next active tab panel should slide in from the left or the right.

This can be implemented inside our custom `TabPanel` component by following these steps:

1. Inside `TabPanel`, get the current selected tab id from the tab store and maintain a record of the previously selected tab id:

   ```tsx {11,12} "selectedTabId" "previousTabId"
   function usePrevious<T>(value: T) {
     const ref = React.useRef<T>();
     React.useEffect(() => {
       ref.current = value;
     }, [value]);
     return ref.current;
   }

   function TabPanel(props) {
     const tab = Ariakit.useTabContext()!;
     const selectedTabId = tab.useState("selectedId");
     const previousTabId = usePrevious(selectedTabId);
   ```

2. Get the current tab panel object from the tab store:

   ```tsx
   const panel = tab.useState(() => tab.panels.item(props.id));
   ```

   It's important to use the [`useState`](/reference/use-tab-store#usestate) hook to ensure that the component re-renders when the tab panel object changes.

3. Determine if the current tab panel was the last one opened by comparing the current tab id with the previously selected tab id and set the `data-was-open` attribute accordingly:

   ```tsx
   const wasPanelOpen = panel?.tabId && previousTabId === panel.tabId;

   <Ariakit.TabPanel data-was-open={wasPanelOpen || undefined} />
   ```

## Setting up the CSS transition

We apply transitions to both the [`opacity`](https://developer.mozilla.org/en-US/docs/Web/CSS/opacity) and the [`translate`](https://developer.mozilla.org/en-US/docs/Web/CSS/translate) properties.

Instead of directly applying the transition to `.tab-panel`, which would trigger the transition when the tab panel is first rendered, we target the tab panels only when a tab panel with the `data-was-open` attribute already exists. This attribute is only assigned when the active tab changes, thereby effectively ignoring the initial render:

```css
:has(> [data-was-open]) > .tab-panel {
  transition-property: opacity, translate;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 300ms;
  opacity: 0;
  translate: -100%;
}
```

## Sliding tab panels from/to the right

We can use the [subsequent-sibling combinator](https://developer.mozilla.org/en-US/docs/Web/CSS/Subsequent-sibling_combinator) (`~`) to select tab panels that come after the most recently opened tab panel. This lets us slide the tab panels from or to the right side:

```css
:is([data-was-open], [data-open]) ~ .tab-panel {
  translate: 100%;
}
```

The `data-open` attribute is automatically assigned to the active tab panel by Ariakit. Check out the [Styling](/guide/styling#data-open) guide for more details.

## Defining the enter transition

With the [`[data-enter]`](/guide/styling#data-enter) selector, we can establish the final state of the tab panel as it enters the viewport. Using the `!important` keyword might be necessary to override previous rules that have higher specificity:

```css
.tab-panel[data-enter] {
  opacity: 100% !important;
  translate: 0 !important;
}
```

## Ensuring tab panels don't stack on top of each other

Finally, we need to adjust the tab panels' position to prevent them from stacking on top of each other when they're exiting. We can use the `:not()` pseudo-class in combination with the [`[data-open]`](/guide/styling#data-open) selector to _synchronously_ style the exiting tab panel with an absolute position:

```css
.tab-panel:not([data-open]) {
  position: absolute;
  top: 0px;
}
```

## Related examples

<div data-cards="examples">

- [](/examples/combobox-animated)
- [](/examples/dialog-animated)
- [](/examples/select-animated)
- [](/examples/combobox-tabs)

</div>
