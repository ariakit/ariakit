---
tags:
  - Plus
  - Dialog
  - Combobox
  - Tab
  - Button
  - Animated
  - CSS transitions
  - Concurrent React
  - Search
  - Abstracted examples
---

# Command Menu with Tabs

<div data-description>

Combining [Dialog](/components/dialog), [Tab](/components/tab), and [Combobox](/components/combobox) from [Ariakit React](/components) to build a command palette component.

</div>

<div data-tags></div>

<a href="./index.react.tsx" data-playground>Example</a>

## Components

<div data-cards="components">

- [](/components/dialog)
- [](/components/combobox)
- [](/components/tab)
- [](/components/button)

</div>

## Understanding the basic structure

This example creates a custom `CommandMenu` component with the following API structure:

```jsx
<CommandMenu>
  <CommandMenuInput />
  <CommandMenuTabList>
    <CommandMenuTab />
  </CommandMenuTabList>
  <CommandMenuTabPanel>
    <CommandMenuList>
      <CommandMenuGroup>
        <CommandMenuItem />
      </CommandMenuGroup>
    </CommandMenuList>
  </CommandMenuTabPanel>
</CommandMenu>
```

`CommandMenuTabList`, `CommandMenuTab`, `CommandMenuTabPanel`, and `CommandMenuGroup` are optional components that let you display multiple tabs and item groups in the command menu. If you don't need these features, just leave them out.

Under the hood, we render a set of [Dialog](/components/dialog), [Tab](/components/tab), and [Combobox](/components/combobox) components from [Ariakit React](/components) structured as follows:

```jsx
<Dialog>
  <ComboboxProvider>
    <Combobox />
    <DialogDismiss />
    <TabList>
      <Tab />
    </TabList>
    <TabPanel>
      <ComboboxList>
        <ComboboxGroup>
          <ComboboxItem />
        </ComboboxGroup>
      </ComboboxList>
    </TabPanel>
  </ComboboxProvider>
</Dialog>
```

## Syncing the state between Dialog and Combobox

We need to synchronize the visibility state between the [Dialog](/components/dialog) and [Combobox](/components/combobox) components. This can be done by passing the dialog store, obtained from the [`useDialogStore`](/reference/use-dialog-store) hook, to the [`disclosure`](/reference/combobox-provider#disclosure) prop of the [`ComboboxProvider`](/reference/combobox-provider) component:

```jsx
const dialog = useDialogStore();

<Dialog store={dialog}>
  <ComboboxProvider disclosure={dialog}>
```

## Shifting focus when moving down

By default, pressing <kbd>↓</kbd> when there's no composite item in the next row of the same column will move focus to the item in the following row. However, this might not be ideal when items are grouped, as each group might end with fewer items in the last row.

The [`focusShift`](/reference/combobox-provider#focusshift) prop allows you to customize this behavior. When enabled, the focus will move to the nearest composite item in the next row, even if it's in a different column:

```jsx
<ComboboxProvider focusShift>
```

<img src="/media/dialog-combobox-tab-command-menu-focus-shift.png" width="703" height="352" alt="Screenshot of a grid widget illustrating how the focusShift prop works: when enabled, pressing the arrow down key moves the focus to the nearest item in the next row even if it is not immediately below the active item." />

## Wrapping focus between lines

We can use the [`focusWrap`](/reference/combobox-provider#focuswrap) prop to enable focus wrapping between lines (horizontally). When the focus reaches the last item in a row and the user presses <kbd>→</kbd>, it will move to the first item in the next row:

```jsx
<ComboboxProvider focusWrap="horizontal">
```

## Focusing on the first item by default

By default, the [Combobox](/components/combobox) component doesn't focus on the first option when the list opens. However, in this example, the combobox input and options are displayed simultaneously when the dialog appears. To improve usability, we focus on the first item immediately, allowing the user to choose the first suggestion with minimal effort.

To achieve this, we use the [`autoSelect`](/reference/combobox#autoselect) prop of the [`Combobox`](/reference/combobox) component, setting the value to `"always"`:

```jsx
<Combobox autoSelect="always" />
```

## Switching tabs with <kbd>Tab</kbd> and <kbd>Shift</kbd> <kbd>Tab</kbd>

We can enable keyboard navigation between tabs using the <kbd>Tab</kbd> key by providing an `onKeyDown` handler to the [`Combobox`](/reference/combobox) component. The [`previous`](/reference/use-tab-store#previous) and [`next`](/reference/use-tab-store#next) methods from the [tab store](/reference/use-tab-store) hook allow you to get the previous and next tab IDs. These functions take parameters to customize the tab state for that particular call.

```jsx
const tab = useTabContext();

<Combobox
  onKeyDown={(event) => {
    if (event.key !== "Tab") return;

    const activeId = tab?.getState().selectedId;
    const options = { activeId, focusLoop: false };
    const nextId = event.shiftKey
      ? tab?.previous(options)
      : tab?.next(options);

    if (!nextId) return;

    event.preventDefault();
    tab?.select(nextId);
  }}
/>
```

We need to set the selected tab as the [`activeId`](/reference/tab-provider#activeid) when retrieving previous or next tab IDs, as this information is used to calculate the next tab. The [`focusLoop`](/reference/tab-provider#focusloop) option is set to `false` to allow users to exit the tab list when they reach the last tab. However, when using arrow keys, [`focusLoop`](/reference/tab-provider#focusloop) remains enabled because passing options to the [`next`](/reference/use-tab-store#next) and [`previous`](/reference/use-tab-store#previous) methods doesn't change the original store state.

<img src="/media/dialog-combobox-tab-command-menu-focus-loop.png" width="670" height="352" alt="Screenshot showing a search input with a tab list below, including arrows indicating what happens when the user presses Tab while both the combobox and the last tab are focused (via aria-activedescendant). If focusLoop is set to false, focus moves to the next tabbable element after the input, which is an Esc button. If focusLoop is set to true, focus loops back to the first tab." />

## Rendering a single tab panel

In this example, we assume the developer will render a single [`TabPanel`](/reference/tab-panel) component rather than one for each tab. To reflect the tab change, we automatically update the [`tabId`](/reference/tab-panel#tabid) prop to match the selected tab ID. The consumer is responsible for updating the tab panel contents based on the selected tab.

```jsx "tabId" "selectedId"
function CommandMenuTabPanel(props) {
  const tab = useTabContext();
  const tabId = useStoreState(tab, (state) => props.tabId ?? state?.selectedId);

  return <TabPanel {...props} tabId={tabId} />;
}
```

```jsx {6-7}
const [tabId, setTabId] = useState("tab1");

<CommandMenu defaultTab={tabId} onTabChange={setTabId}>
  ...
  <CommandMenuTabPanel>
    {tabId === "tab1" && <TabPanelContent1 />}
    {tabId === "tab2" && <TabPanelContent2 />}
  </CommandMenuTabPanel>
```

Our custom `onTabChange` function is invoked within a React transition, ensuring that updating the tab panel contents doesn't block the main thread.

## Automatically setting `rowId` within a grid

Grids are composite widgets that enable two-dimensional arrow key navigation. [Ariakit React](/components) offers two ways to transform any composite widget into a grid:

- Wrap composite items in a composite row component:

  ```jsx "ComboboxRow"
  <ComboboxRow>
    <ComboboxItem />
    <ComboboxItem />
  </ComboboxRow>
  <ComboboxRow>
    <ComboboxItem />
    <ComboboxItem />
  </ComboboxRow>
  ```

- Use the `rowId` prop to assign a row ID to each composite item:

  ```jsx "rowId"
  <ComboboxItem rowId="row1" />
  <ComboboxItem rowId="row1" />
  <ComboboxItem rowId="row2" />
  <ComboboxItem rowId="row2" />
  ```

In this example, we leverage the second approach to automatically set the [`rowId`](/reference/combobox-item#rowid) prop when our custom `CommandMenuGrid` component is used. The consumer simply needs to inform the number of columns and the index of the item:

1. For the `CommandMenuItem` component, we calculate the [`rowId`](/reference/combobox-item#rowid) using the number of columns, the group, and the item's index:

    ```jsx "rowId"
    const cols = useContext(CommandMenuGridColsContext);
    const group = useContext(CommandMenuGroupContext);
    const rowId = getRowId(cols, props.index, group);

    <ComboboxItem rowId={rowId} />
    ```

2. For the `CommandMenuTab` component, we set [`rowId`](/reference/tab#rowid) if the combobox widget includes any items with a `rowId` prop. Since the tabs are rendered in the same row, this value can remain static:

    ```jsx "rowId" {4}
    const combobox = useComboboxContext();
    const isGrid = useStoreState(
      combobox,
      (state) => !!state?.items.find((item) => !!item.rowId),
    );
    const rowId = isGrid ? "tabs" : undefined;

    <Tab rowId={rowId} />
    ```

## Related examples

<div data-cards="examples">

- [](/examples/dialog-combobox-command-menu)
- [](/examples/combobox-links)
- [](/examples/combobox-filtering)
- [](/examples/combobox-tabs)
- [](/examples/dialog-menu)
- [](/examples/dialog-nested)
- [](/examples/menu-combobox)
- [](/examples/select-combobox)

</div>
