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
        <Tab {...tab} stopId="tab1">
          Tab 1
        </Tab>
        <Tab {...tab} stopId="tab2" disabled>
          Tab 2
        </Tab>
        <Tab {...tab} stopId="tab3">
          Tab 3
        </Tab>
      </TabList>
      <TabPanel {...tab} stopId="tab1">
        Tab 1
      </TabPanel>
      <TabPanel {...tab} stopId="tab2">
        Tab 2
      </TabPanel>
      <TabPanel {...tab} stopId="tab3">
        Tab 3
      </TabPanel>
    </>
  );
}
```

### Default selected tab

You can set the default selected tab by passing a `stopId` to `selectedId` on `useTabState`.

```jsx
import { useTabState, Tab, TabList, TabPanel } from "reakit/Tab";

function Example() {
  const tab = useTabState({ selectedId: "tab3" });
  return (
    <>
      <TabList {...tab} aria-label="My tabs">
        <Tab {...tab} stopId="tab1">
          Tab 1
        </Tab>
        <Tab {...tab} stopId="tab2" disabled>
          Tab 2
        </Tab>
        <Tab {...tab} stopId="tab3">
          Tab 3
        </Tab>
      </TabList>
      <TabPanel {...tab} stopId="tab1">
        Tab 1
      </TabPanel>
      <TabPanel {...tab} stopId="tab2">
        Tab 2
      </TabPanel>
      <TabPanel {...tab} stopId="tab3">
        Tab 3
      </TabPanel>
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
        <Tab {...tab} stopId="tab1">
          Tab 1
        </Tab>
        <Tab {...tab} stopId="tab2" disabled>
          Tab 2
        </Tab>
        <Tab {...tab} stopId="tab3">
          Tab 3
        </Tab>
      </TabList>
      <TabPanel {...tab} stopId="tab1">
        Tab 1
      </TabPanel>
      <TabPanel {...tab} stopId="tab2">
        Tab 2
      </TabPanel>
      <TabPanel {...tab} stopId="tab3">
        Tab 3
      </TabPanel>
    </>
  );
}
```

### Vertical tabs

You can control the orientation of the tabs by setting `orientation` on `useTabState`. Since it composes from [Rover](/docs/rover/), explicitly defining an orientation will change how arrow key navigation works. If it's set to `vertical`, only <kbd>↑</kbd> and <kbd>↓</kbd> will work.

```jsx
import { useTabState, Tab, TabList, TabPanel } from "reakit/Tab";

function Example() {
  const tab = useTabState({ orientation: "vertical" });
  return (
    <div style={{ display: "flex" }}>
      <TabList {...tab} aria-label="My tabs">
        <Tab {...tab} stopId="tab1">
          Tab 1
        </Tab>
        <Tab {...tab} stopId="tab2" disabled>
          Tab 2
        </Tab>
        <Tab {...tab} stopId="tab3">
          Tab 3
        </Tab>
      </TabList>
      <TabPanel {...tab} stopId="tab1">
        Tab 1
      </TabPanel>
      <TabPanel {...tab} stopId="tab2">
        Tab 2
      </TabPanel>
      <TabPanel {...tab} stopId="tab3">
        Tab 3
      </TabPanel>
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
        <Tab stopId="tab1">Tab 1</Tab>
        <Tab stopId="tab2">Tab 2</Tab>
        <Tab stopId="tab3">Tab 3</Tab>
      </TabList>
      <TabPanel stopId="tab1">Tab 1</TabPanel>
      <TabPanel stopId="tab2">Tab 2</TabPanel>
      <TabPanel stopId="tab3">Tab 3</TabPanel>
    </Tabs>
  );
}
```

## Accessibility

- `Tab` has role `tab`.
- `Tab` has `aria-controls` referring to its associated `TabPanel`.
- The selected `Tab` has `aria-selected` set to `true` and all other `Tab`s have it set to `false`.
- `Tab` extends the accessibility features of [Rover](/docs/rover/#accessibility).
- `TabList` has role `tablist`.
- `TabList` has `aria-orientation` set to `vertical` or `horizontal` based on the value of the `orientation` option.
- `TabPanel` has role `tabpanel`.
- `TabPanel` has `aria-labelledby` referring to its associated `Tab`.

Learn more in [Accessibility](/docs/accessibility/).

## Composition

- `Tab` uses [Rover](/docs/rover/).
- `TabList` uses [Box](/docs/box/).
- `TabPanel` uses [Hidden](/docs/hidden/).

Learn more in [Composition](/docs/composition/#props-hooks).

## Props

<!-- Automatically generated -->

### `useTabState`

- **`orientation`**
  <code>&#34;horizontal&#34; | &#34;vertical&#34; | undefined</code>

  Defines the orientation of the rover list.

- **`stops`**
  <code>Stop[]</code>

  A list of element refs and IDs of the roving items.

- **`currentId`**
  <code>string | null</code>

  The current focused element ID.

- **`unstable_moves`** <span title="Experimental">⚠️</span>
  <code>number</code>

  Stores the number of moves that have been made by calling `move`, `next`,
`previous`, `first` or `last`.

- **`loop`**
  <code>boolean</code>

  If enabled:
  - Jumps to the first item when moving next from the last item.
  - Jumps to the last item when moving previous from the first item.

- **`selectedId`**
  <code>string | null</code>

  The current selected tab's `stopId`.

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

- **`stopId`**
  <code>string | undefined</code>

  Element ID.

<details><summary>14 state props</summary>

> These props are returned by the state hook. You can spread them into this component (`{...state}`) or pass them separately. You can also provide these props from your own state logic.

- **`orientation`**
  <code>&#34;horizontal&#34; | &#34;vertical&#34; | undefined</code>

  Defines the orientation of the rover list.

- **`unstable_moves`** <span title="Experimental">⚠️</span>
  <code>number</code>

  Stores the number of moves that have been made by calling `move`, `next`,
`previous`, `first` or `last`.

- **`stops`**
  <code>Stop[]</code>

  A list of element refs and IDs of the roving items.

- **`currentId`**
  <code>string | null</code>

  The current focused element ID.

- **`register`**
  <code>(id: string, ref: RefObject&#60;HTMLElement&#62;) =&#62; void</code>

  Registers the element ID and ref in the roving tab index list.

- **`unregister`**
  <code>(id: string) =&#62; void</code>

  Unregisters the roving item.

- **`move`**
  <code>(id: string | null) =&#62; void</code>

  Moves focus to a given element ID.

- **`next`**
  <code>() =&#62; void</code>

  Moves focus to the next element.

- **`previous`**
  <code>() =&#62; void</code>

  Moves focus to the previous element.

- **`first`**
  <code>() =&#62; void</code>

  Moves focus to the first element.

- **`last`**
  <code>() =&#62; void</code>

  Moves focus to the last element.

- **`manual`**
  <code>boolean</code>

  Whether the tab selection should be manual.

- **`selectedId`**
  <code>string | null</code>

  The current selected tab's `stopId`.

- **`select`**
  <code>(id: string | null) =&#62; void</code>

  Selects a tab by its `stopId`.

</details>

### `TabList`

<details><summary>1 state props</summary>

> These props are returned by the state hook. You can spread them into this component (`{...state}`) or pass them separately. You can also provide these props from your own state logic.

- **`orientation`**
  <code>&#34;horizontal&#34; | &#34;vertical&#34; | undefined</code>

  Defines the orientation of the rover list.

</details>

### `TabPanel`

- **`stopId`**
  <code>string</code>

  Tab's `stopId`.

<details><summary>4 state props</summary>

> These props are returned by the state hook. You can spread them into this component (`{...state}`) or pass them separately. You can also provide these props from your own state logic.

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
  <code>string | null</code>

  The current selected tab's `stopId`.

</details>
