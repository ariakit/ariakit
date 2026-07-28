import * as Ariakit from "@ariakit/react";
import { useState } from "react";

export default function Example() {
  const [defaultActivations, setDefaultActivations] = useState(0);
  const [enterDisabledActivations, setEnterDisabledActivations] = useState(0);
  const [spaceDisabledActivations, setSpaceDisabledActivations] = useState(0);
  return (
    <main>
      <h1>Command activation</h1>
      <Ariakit.Command
        role="button"
        render={<div />}
        onClick={() => setDefaultActivations((count) => count + 1)}
      >
        Default command
      </Ariakit.Command>
      <output aria-label="Default activations">{defaultActivations}</output>

      <Ariakit.Command
        render={<div />}
        clickOnEnter={false}
        onClick={() => setEnterDisabledActivations((count) => count + 1)}
      >
        Enter disabled
      </Ariakit.Command>
      <output aria-label="Enter disabled activations">
        {enterDisabledActivations}
      </output>

      <Ariakit.Command
        render={<div />}
        clickOnSpace={false}
        onClick={() => setSpaceDisabledActivations((count) => count + 1)}
      >
        Space disabled
      </Ariakit.Command>
      <output aria-label="Space disabled activations">
        {spaceDisabledActivations}
      </output>
    </main>
  );
}
