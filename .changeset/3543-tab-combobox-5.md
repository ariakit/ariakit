---
"@ariakit/react-core": patch
"@ariakit/react": patch
---

Combobox with tabs

[Tab](https://ariakit.org/components/tab) components can now be rendered as part of other composite widgets, like [Combobox](https://ariakit.org/components/combobox). The following structure should work seamlessly:

```jsx "TabProvider" "TabList" "Tab" "TabPanel"
<ComboboxProvider>
  <Combobox />
  <ComboboxPopover>
    <TabProvider>
      <TabList>
        <Tab />
      </TabList>
      <TabPanel unmountOnHide>
        <ComboboxList>
          <ComboboxItem />
        </ComboboxList>
      </TabPanel>
    </TabProvider>
  </ComboboxPopover>
</ComboboxProvider>
```
