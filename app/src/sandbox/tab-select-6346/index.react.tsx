import * as Ariakit from "@ariakit/react";

function BrowseTabButton(props: { tabId: string; children: string }) {
  const tab = Ariakit.useTabContext();
  return (
    <button onClick={() => tab?.setSelectedId(props.tabId)}>
      {props.children}
    </button>
  );
}

export default function Example() {
  return (
    <>
      <style>{`[data-active-item] { outline: 2px solid red; }`}</style>
      <Ariakit.ComboboxProvider
        defaultSelectedValue="Apple"
        virtualFocus={false}
      >
        <Ariakit.ComboboxSelectLabel>Grocery</Ariakit.ComboboxSelectLabel>
        <Ariakit.ComboboxSelect />
        <Ariakit.ComboboxPopover
          gutter={4}
          sameWidth
          style={{ background: "white", border: "1px solid gray", padding: 8 }}
        >
          <Ariakit.TabProvider defaultSelectedId="tab-fruits">
            <Ariakit.TabList aria-label="Categories">
              <Ariakit.Tab id="tab-fruits">Fruits</Ariakit.Tab>
              <Ariakit.Tab id="tab-vegetables">Vegetables</Ariakit.Tab>
            </Ariakit.TabList>
            <Ariakit.TabPanel tabId="tab-fruits">
              <Ariakit.ComboboxList>
                <Ariakit.ComboboxItem value="Apple" />
                <Ariakit.ComboboxItem value="Banana" />
              </Ariakit.ComboboxList>
              <BrowseTabButton tabId="tab-vegetables">
                Browse vegetables
              </BrowseTabButton>
            </Ariakit.TabPanel>
            <Ariakit.TabPanel tabId="tab-vegetables">
              <Ariakit.ComboboxList>
                <Ariakit.ComboboxItem value="Carrot" />
                <Ariakit.ComboboxItem value="Potato" />
              </Ariakit.ComboboxList>
              <BrowseTabButton tabId="tab-fruits">
                Browse fruits
              </BrowseTabButton>
            </Ariakit.TabPanel>
          </Ariakit.TabProvider>
        </Ariakit.ComboboxPopover>
      </Ariakit.ComboboxProvider>
    </>
  );
}
