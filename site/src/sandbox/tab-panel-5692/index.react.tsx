import * as ak from "@ariakit/react";
import { useState } from "react";

export default function Example() {
  const [loaded, setLoaded] = useState(false);

  return (
    <div>
      <button type="button" onClick={() => setLoaded((v) => !v)}>
        Toggle
      </button>
      <ak.TabProvider>
        <ak.TabList aria-label="Panels">
          <ak.Tab>Panel</ak.Tab>
        </ak.TabList>
        <ak.TabPanel>
          {loaded ? <a href="#">Interactive link</a> : <p>Loading...</p>}
        </ak.TabPanel>
      </ak.TabProvider>
    </div>
  );
}
