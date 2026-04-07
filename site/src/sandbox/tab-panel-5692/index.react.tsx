import * as ak from "@ariakit/react";

export default function Example() {
  return (
    <ak.TabProvider>
      <ak.TabList aria-label="Panels">
        <ak.Tab>Static</ak.Tab>
        <ak.Tab>Interactive</ak.Tab>
      </ak.TabList>
      <ak.TabPanel>
        <p>This panel has no tabbable children.</p>
      </ak.TabPanel>
      <ak.TabPanel>
        <a href="#">Interactive link</a>
      </ak.TabPanel>
    </ak.TabProvider>
  );
}
