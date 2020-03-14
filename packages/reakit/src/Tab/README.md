---
path: /docs/tab/
redirect_from:
  - /components/tabs/
  - /components/tabs/tabscontainer/
  - /components/tabs/tabsnext/
  - /components/tabs/tabspanel/
  - /components/tabs/tabsprevious/
  - /components/tabs/tabstab/
---

# Tab

Accessible `Tab` component that follows the [WAI-ARIA Tabs Pattern](https://www.w3.org/TR/wai-aria-practices/#tabpanel). It's a component that, when activated, display a `TabPanel`.

<carbon-ad></carbon-ad>

## Installation

```sh
npm install reakit
```

Learn more in [Get started](/docs/get-started/).

## Usage

```jsx
import { useTabState, Tab, TabList, TabPanel } from "reakit/Tab";

function Example() {
  const tab = useTabState();
  return (
    <>
      <TabList {...tab} aria-label="My tabs">
        <Tab {...tab}>Tab 1</Tab>
        <Tab {...tab} disabled>
          Tab 2
        </Tab>
        <Tab {...tab}>Tab 3</Tab>
      </TabList>
      <TabPanel {...tab}>Tab 1</TabPanel>
      <TabPanel {...tab}>Tab 2</TabPanel>
      <TabPanel {...tab}>Tab 3</TabPanel>
    </>
  );
}
```

### Default selected tab

You can set the default selected tab by passing an `id` to `selectedId` on `useTabState`.

```jsx
import { useTabState, Tab, TabList, TabPanel } from "reakit/Tab";

function Example() {
  const tab = useTabState({ selectedId: "tab3" });
  return (
    <>
      <TabList {...tab} aria-label="My tabs">
        <Tab {...tab}>Tab 1</Tab>
        <Tab {...tab} disabled>
          Tab 2
        </Tab>
        <Tab {...tab} id="tab3">
          Tab 3
        </Tab>
      </TabList>
      <TabPanel {...tab}>Tab 1</TabPanel>
      <TabPanel {...tab}>Tab 2</TabPanel>
      <TabPanel {...tab}>Tab 3</TabPanel>
    </>
  );
}
```

### No selected tab

By default, the first tab will be selected, but you can unset it by passing `null` to `selectedId` on `useTabState`

```jsx
import { useTabState, Tab, TabList, TabPanel } from "reakit/Tab";

function Example() {
  const tab = useTabState({ selectedId: null });
  return (
    <>
      <TabList {...tab} aria-label="My tabs">
        <Tab {...tab}>Tab 1</Tab>
        <Tab {...tab}>Tab 2</Tab>
        <Tab {...tab}>Tab 3</Tab>
      </TabList>
      <TabPanel {...tab}>Tab 1</TabPanel>
      <TabPanel {...tab}>Tab 2</TabPanel>
      <TabPanel {...tab}>Tab 3</TabPanel>
    </>
  );
}
```

### Manual activation

By default, a `Tab` is selected when it gets focused, which reveals its corresponding `TabPanel`. This behavior can be changed by setting `manual` to `true` on `useTabState`.

```jsx
import { useTabState, Tab, TabList, TabPanel } from "reakit/Tab";

function Example() {
  const tab = useTabState({ manual: true });
  return (
    <>
      <TabList {...tab} aria-label="My tabs">
        <Tab {...tab}>Tab 1</Tab>
        <Tab {...tab}>Tab 2</Tab>
        <Tab {...tab}>Tab 3</Tab>
      </TabList>
      <TabPanel {...tab}>Tab 1</TabPanel>
      <TabPanel {...tab}>Tab 2</TabPanel>
      <TabPanel {...tab}>Tab 3</TabPanel>
    </>
  );
}
```

### Vertical tabs

You can control the orientation of the tabs by setting `orientation` on `useTabState`. Since it composes from [CompositeItem](/docs/composite/), explicitly defining an orientation will change how arrow key navigation works. If it's set to `vertical`, only <kbd>↑</kbd> and <kbd>↓</kbd> will work.

```jsx
import { useTabState, Tab, TabList, TabPanel } from "reakit/Tab";

function Example() {
  const tab = useTabState({ orientation: "vertical" });
  return (
    <div style={{ display: "flex" }}>
      <TabList {...tab} aria-label="My tabs">
        <Tab {...tab}>Tab 1</Tab>
        <Tab {...tab}>Tab 2</Tab>
        <Tab {...tab}>Tab 3</Tab>
      </TabList>
      <TabPanel {...tab}>Tab 1</TabPanel>
      <TabPanel {...tab}>Tab 2</TabPanel>
      <TabPanel {...tab}>Tab 3</TabPanel>
    </div>
  );
}
```

### Abstracting

Like all other Reakit components, you can leverage the low level API to create your own customized API and make it less verbose, for example, by using React Context underneath.

```jsx
import React from "react";
import {
  useTabState,
  Tab as BaseTab,
  TabList as BaseTabList,
  TabPanel as BaseTabPanel
} from "reakit/Tab";

const TabsContext = React.createContext();

function Tabs({ children, ...initialState }) {
  const tab = useTabState(initialState);
  const value = React.useMemo(() => tab, Object.values(tab));
  return <TabsContext.Provider value={value}>{children}</TabsContext.Provider>;
}

function Tab(props) {
  const tab = React.useContext(TabsContext);
  return <BaseTab {...tab} {...props} />;
}

function TabList(props) {
  const tab = React.useContext(TabsContext);
  return <BaseTabList {...tab} {...props} />;
}

function TabPanel(props) {
  const tab = React.useContext(TabsContext);
  return <BaseTabPanel {...tab} {...props} />;
}

function Example() {
  return (
    <Tabs selectedId="tab3">
      <TabList aria-label="My tabs">
        <Tab>Tab 1</Tab>
        <Tab>Tab 2</Tab>
        <Tab id="tab3">Tab 3</Tab>
      </TabList>
      <TabPanel>Tab 1</TabPanel>
      <TabPanel>Tab 2</TabPanel>
      <TabPanel>Tab 3</TabPanel>
    </Tabs>
  );
}
```

## Accessibility

- `Tab` has role `tab`.
- `Tab` has `aria-controls` referring to its associated `TabPanel`.
- The selected `Tab` has `aria-selected` set to `true` and all other `Tab`s have it set to `false`.
- `Tab` extends the accessibility features of [CompositeItem](/docs/composite/#accessibility).
- `TabList` has role `tablist`.
- `TabList` has `aria-orientation` set to `vertical` or `horizontal` based on the value of the `orientation` option.
- `TabList` extends the accessibility features of [Composite](/docs/composite/#accessibility).
- `TabPanel` has role `tabpanel`.
- `TabPanel` has `aria-labelledby` referring to its associated `Tab`.
- `TabPanel` extends the accessibility features of [DisclosureContent](/docs/disclosure/#accessibility).

Learn more in [Accessibility](/docs/accessibility/).

## Composition

- `Tab` uses [CompositeItem](/docs/composite/).
- `TabList` uses [Composite](/docs/composite/).
- `TabPanel` uses [DisclosureContent](/docs/disclosure/).

Learn more in [Composition](/docs/composition/#props-hooks).

## Props

<!-- Automatically generated -->

### `useTabState`

- **`baseId`**
  <code>string</code>

  ID that will serve as a base for all the items IDs.

- **`rtl`**
  <code>boolean</code>

  Determines how `next` and `previous` will behave. If `rtl` is set to `true`,
then `next` will move focus to the previous item in the DOM.

- **`orientation`**
  <code>&#34;horizontal&#34; | &#34;vertical&#34; | undefined</code>

  Defines the orientation of the composite widget.

  When the composite widget has multiple groups (two-dimensional) and `wrap`
is `true`, the navigation will wrap based on the value of `orientation`:
  - `undefined`: wraps in both directions.
  - `horizontal`: wraps horizontally only.
  - `vertical`: wraps vertically only.

  If the composite widget has a single row or column (one-dimensional), the
`orientation` value determines which arrow keys can be used to move focus:
  - `undefined`: all arrow keys work.
  - `horizontal`: only left and right arrow keys work.
  - `vertical`: only up and down arrow keys work.

- **`currentId`**
  <code>string | null</code>

  The current focused item ID.

- **`loop`**
  <code>boolean</code>

  If enabled, moving to the next item from the last one will focus the first
item and vice-versa. It doesn't work if the composite widget has multiple
groups (two-dimensional).

- **`focusWrap`**
  <code>boolean</code>

  If enabled, moving to the next item from the last one in a row or column
will focus the first item in the next row or column and vice-versa.
Depending on the value of the `orientation` state, it'll wrap in only one
direction:
  - If `orientation` is `undefined`, it wraps in both directions.
  - If `orientation` is `horizontal`, it wraps horizontally only.
  - If `orientation` is `vertical`, it wraps vertically only.

  `focusWrap` only works if the composite widget has multiple groups
(two-dimensional).

- **`selectedId`**
  <code>string | null | undefined</code>

  The current selected tab's `id`.

- **`manual`**
  <code>boolean</code>

  Whether the tab selection should be manual.

### `Tab`

- **`disabled`**
  <code>boolean | undefined</code>

  Same as the HTML attribute.

- **`focusable`**
  <code>boolean | undefined</code>

  When an element is `disabled`, it may still be `focusable`. It works
similarly to `readOnly` on form elements. In this case, only
`aria-disabled` will be set.

- **`id`**
  <code>string | undefined</code>

  Same as the HTML attribute.

<details><summary>18 state props</summary>

> These props are returned by the state hook. You can spread them into this component (`{...state}`) or pass them separately. You can also provide these props from your own state logic.

- **`baseId`**
  <code>string</code>

  ID that will serve as a base for all the items IDs.

- **`orientation`**
  <code>&#34;horizontal&#34; | &#34;vertical&#34; | undefined</code>

  Defines the orientation of the composite widget.

  When the composite widget has multiple groups (two-dimensional) and `wrap`
is `true`, the navigation will wrap based on the value of `orientation`:
  - `undefined`: wraps in both directions.
  - `horizontal`: wraps horizontally only.
  - `vertical`: wraps vertically only.

  If the composite widget has a single row or column (one-dimensional), the
`orientation` value determines which arrow keys can be used to move focus:
  - `undefined`: all arrow keys work.
  - `horizontal`: only left and right arrow keys work.
  - `vertical`: only up and down arrow keys work.

- **`currentId`**
  <code>string | null</code>

  The current focused item ID.

- **`items`**
  <code>Item[]</code>

  Lists all the composite items.

- **`move`**
  <code>(id: string | null) =&#62; void</code>

  Moves focus to a given item ID.

- **`setCurrentId`**
  <code>(value: SetStateAction&#60;string | null&#62;) =&#62; void</code>

  Sets `currentId`.

- **`registerItem`**
  <code>(item: Item) =&#62; void</code>

  Registers a composite item.

- **`unregisterItem`**
  <code>(id: string) =&#62; void</code>

  Unregisters a composite item.

- **`next`**
  <code>(unstable_allTheWay?: boolean | undefined) =&#62; void</code>

  Moves focus to the next item.

- **`previous`**
  <code>(unstable_allTheWay?: boolean | undefined) =&#62; void</code>

  Moves focus to the previous item.

- **`up`**
  <code>(unstable_allTheWay?: boolean | undefined) =&#62; void</code>

  Moves focus to the item above.

- **`down`**
  <code>(unstable_allTheWay?: boolean | undefined) =&#62; void</code>

  Moves focus to the item below.

- **`first`**
  <code>() =&#62; void</code>

  Moves focus to the first item.

- **`last`**
  <code>() =&#62; void</code>

  Moves focus to the last item.

- **`manual`**
  <code>boolean</code>

  Whether the tab selection should be manual.

- **`selectedId`**
  <code>string | null | undefined</code>

  The current selected tab's `id`.

- **`panels`**
  <code>Item[]</code>

  Lists all the panels.

- **`select`**
  <code>(id: string | null) =&#62; void</code>

  Moves into and selects a tab by its `id`.

</details>

### `TabList`

- **`disabled`**
  <code>boolean | undefined</code>

  Same as the HTML attribute.

- **`focusable`**
  <code>boolean | undefined</code>

  When an element is `disabled`, it may still be `focusable`. It works
similarly to `readOnly` on form elements. In this case, only
`aria-disabled` will be set.

- **`id`**
  <code>string | undefined</code>

  Same as the HTML attribute.

<details><summary>4 state props</summary>

> These props are returned by the state hook. You can spread them into this component (`{...state}`) or pass them separately. You can also provide these props from your own state logic.

- **`baseId`**
  <code>string</code>

  ID that will serve as a base for all the items IDs.

- **`currentId`**
  <code>string | null</code>

  The current focused item ID.

- **`items`**
  <code>Item[]</code>

  Lists all the composite items.

- **`orientation`**
  <code>&#34;horizontal&#34; | &#34;vertical&#34; | undefined</code>

  Defines the orientation of the composite widget.

  When the composite widget has multiple groups (two-dimensional) and `wrap`
is `true`, the navigation will wrap based on the value of `orientation`:
  - `undefined`: wraps in both directions.
  - `horizontal`: wraps horizontally only.
  - `vertical`: wraps vertically only.

  If the composite widget has a single row or column (one-dimensional), the
`orientation` value determines which arrow keys can be used to move focus:
  - `undefined`: all arrow keys work.
  - `horizontal`: only left and right arrow keys work.
  - `vertical`: only up and down arrow keys work.

</details>

### `TabPanel`

- **`id`**
  <code>string | undefined</code>

  Same as the HTML attribute.

- **`tabId`**
  <code>string | undefined</code>

  Tab's id

<details><summary>9 state props</summary>

> These props are returned by the state hook. You can spread them into this component (`{...state}`) or pass them separately. You can also provide these props from your own state logic.

- **`baseId`**
  <code>string</code>

  ID that will serve as a base for all the items IDs.

- **`visible`**
  <code>boolean</code>

  Whether it's visible or not.

- **`unstable_animated`** <span title="Experimental">⚠️</span>
  <code>number | boolean</code>

  If `true`, `animating` will be set to `true` when `visible` changes.
It'll wait for `stopAnimation` to be called or a CSS transition ends.
If it's a number, `stopAnimation` will be called automatically after
given milliseconds.

- **`unstable_stopAnimation`** <span title="Experimental">⚠️</span>
  <code>() =&#62; void</code>

  Stops animation. It's called automatically if there's a CSS transition.
It's called after given milliseconds if `animated` is a number.

- **`selectedId`**
  <code>string | null | undefined</code>

  The current selected tab's `id`.

- **`items`**
  <code>Item[]</code>

  Lists all the composite items.

- **`panels`**
  <code>Item[]</code>

  Lists all the panels.

- **`registerPanel`**
  <code>(item: Item) =&#62; void</code>

  Registers a tab panel.

- **`unregisterPanel`**
  <code>(id: string) =&#62; void</code>

  Unregisters a tab panel.

</details>
