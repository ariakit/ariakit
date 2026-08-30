import * as Ariakit from "@ariakit/react";
import { useState } from "react";

const devices = ["Desktop", "Tablet", "Mobile"];

export default function Example() {
  const [device, setDevice] = useState("Desktop");

  return (
    <div>
      <Ariakit.MenuProvider>
        <Ariakit.MenuButton>Preview</Ariakit.MenuButton>
        <Ariakit.Menu modal>
          {devices.map((item) => (
            <Ariakit.MenuItem key={item} onClick={() => setDevice(item)}>
              {item}
            </Ariakit.MenuItem>
          ))}
        </Ariakit.Menu>
      </Ariakit.MenuProvider>
      <button>Publish</button>
      <p>Previewing on {device}</p>
    </div>
  );
}
