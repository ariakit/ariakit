import * as ak from "@ariakit/react";

export default function Example() {
  return (
    <div>
      <section aria-label="Default">
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
      </section>

      <section aria-label="Unmount">
        <ak.TabProvider>
          <ak.TabList aria-label="Unmount panels">
            <ak.Tab>Static</ak.Tab>
            <ak.Tab>Interactive</ak.Tab>
          </ak.TabList>
          <ak.TabPanel unmountOnHide>
            <p>This panel has no tabbable children.</p>
          </ak.TabPanel>
          <ak.TabPanel unmountOnHide>
            <a href="#">Interactive link</a>
          </ak.TabPanel>
        </ak.TabProvider>
      </section>
    </div>
  );
}
