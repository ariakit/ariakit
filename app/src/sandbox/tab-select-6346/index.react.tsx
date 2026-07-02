import * as Ariakit from "@ariakit/react";

function BrowseTabButton(props: { tabId: string; children: string }) {
  const tab = Ariakit.useTabContext();
  return (
    <button
      onClick={() => {
        tab?.setSelectedId(props.tabId);
        // TODO: Workaround for the swallowed setSelectedId -> activeId sync.
        // Remove once https://github.com/ariakit/ariakit/issues/6346 is fixed.
        tab?.setActiveId(props.tabId);
      }}
    >
      {props.children}
    </button>
  );
}

export default function Example() {
  return (
    <>
      <style>{`[data-active-item] { outline: 2px solid red; }`}</style>
      <Ariakit.SelectProvider defaultValue="Apple" virtualFocus={false}>
        <Ariakit.SelectLabel>Grocery</Ariakit.SelectLabel>
        <Ariakit.Select />
        <Ariakit.SelectPopover
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
              <Ariakit.SelectList>
                <Ariakit.SelectItem value="Apple" />
                <Ariakit.SelectItem value="Banana" />
              </Ariakit.SelectList>
              <BrowseTabButton tabId="tab-vegetables">
                Browse vegetables
              </BrowseTabButton>
            </Ariakit.TabPanel>
            <Ariakit.TabPanel tabId="tab-vegetables">
              <Ariakit.SelectList>
                <Ariakit.SelectItem value="Carrot" />
                <Ariakit.SelectItem value="Potato" />
              </Ariakit.SelectList>
              <BrowseTabButton tabId="tab-fruits">
                Browse fruits
              </BrowseTabButton>
            </Ariakit.TabPanel>
          </Ariakit.TabProvider>
        </Ariakit.SelectPopover>
      </Ariakit.SelectProvider>
    </>
  );
}
