import * as ak from "@ariakit/react";

interface SinglePanelProps {
  linkId: string;
}

// Single tab panel reused for all tabs with a dynamic `tabId` pointing to the
// selected tab, as documented in the TabPanel reference and the Tab with React
// Router example. See https://github.com/ariakit/ariakit/issues/6332
function SinglePanel({ linkId }: SinglePanelProps) {
  const tab = ak.useTabContext();
  const selectedId = ak.useStoreState(tab, "selectedId");
  return (
    <ak.TabPanel tabId={selectedId}>
      {selectedId === linkId ? (
        <a href="#docs">Read the documentation</a>
      ) : (
        <p>Plain text content with nothing to focus.</p>
      )}
    </ak.TabPanel>
  );
}

export default function Example() {
  return (
    <div>
      <section aria-label="Link first">
        <ak.TabProvider defaultSelectedId="link-1">
          <ak.TabList aria-label="Link first tabs">
            <ak.Tab id="link-1">Link</ak.Tab>
            <ak.Tab id="text-1">Text</ak.Tab>
          </ak.TabList>
          <SinglePanel linkId="link-1" />
        </ak.TabProvider>
      </section>

      <section aria-label="Text first">
        <ak.TabProvider defaultSelectedId="text-2">
          <ak.TabList aria-label="Text first tabs">
            <ak.Tab id="text-2">Text</ak.Tab>
            <ak.Tab id="link-2">Link</ak.Tab>
          </ak.TabList>
          <SinglePanel linkId="link-2" />
        </ak.TabProvider>
      </section>
    </div>
  );
}
