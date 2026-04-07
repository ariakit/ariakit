import * as ak from "@ariakit/react";
import { useState } from "react";

export default function Example() {
  const [loaded, setLoaded] = useState(false);
  const [disabled, setDisabled] = useState(false);

  return (
    <div>
      <button type="button" onClick={() => setLoaded((v) => !v)}>
        Toggle content
      </button>
      <button type="button" onClick={() => setDisabled((v) => !v)}>
        Toggle disabled
      </button>
      <ak.TabProvider>
        <ak.TabList aria-label="Panels">
          <ak.Tab>Panel</ak.Tab>
        </ak.TabList>
        <ak.TabPanel>
          {loaded ? (
            <button type="button" disabled={disabled}>
              Action
            </button>
          ) : (
            <p>Loading...</p>
          )}
        </ak.TabPanel>
      </ak.TabProvider>
    </div>
  );
}
