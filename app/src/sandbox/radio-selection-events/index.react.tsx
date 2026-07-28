import * as Ariakit from "@ariakit/react";
import { useState } from "react";

function BasicRadios() {
  return (
    <Ariakit.RadioProvider>
      <Ariakit.RadioGroup aria-label="Basic radios">
        <label>
          <Ariakit.Radio value="apple" /> Basic apple
        </label>
        <label>
          <Ariakit.Radio value="orange" /> Basic orange
        </label>
        <label>
          <Ariakit.Radio value="watermelon" /> Basic watermelon
        </label>
      </Ariakit.RadioGroup>
    </Ariakit.RadioProvider>
  );
}

function DefaultRadios() {
  return (
    <Ariakit.RadioProvider defaultValue="orange">
      <Ariakit.RadioGroup aria-label="Default radios">
        <label>
          <Ariakit.Radio value="apple" /> Default apple
        </label>
        <label>
          <Ariakit.Radio value="orange" /> Default orange
        </label>
        <label>
          <Ariakit.Radio value="watermelon" /> Default watermelon
        </label>
      </Ariakit.RadioGroup>
    </Ariakit.RadioProvider>
  );
}

interface ChangeRadiosProps {
  custom?: boolean;
}

function ChangeRadios({ custom = false }: ChangeRadiosProps) {
  const [changes, setChanges] = useState(0);
  const kind = custom ? "Custom" : "Native";
  return (
    <Ariakit.RadioProvider>
      <Ariakit.RadioGroup aria-label={`${kind} changes`}>
        {["apple", "orange", "watermelon"].map((value) =>
          custom ? (
            <Ariakit.Radio
              key={value}
              render={<button />}
              value={value}
              onChange={() => setChanges((count) => count + 1)}
            >
              {kind} {value}
            </Ariakit.Radio>
          ) : (
            <label key={value}>
              <Ariakit.Radio
                value={value}
                onChange={() => setChanges((count) => count + 1)}
              />
              {kind} {value}
            </label>
          ),
        )}
      </Ariakit.RadioGroup>
      <output aria-label={`${kind} change count`}>{changes}</output>
    </Ariakit.RadioProvider>
  );
}

export default function Example() {
  return (
    <main>
      <h1>Radio selection and change events</h1>
      <BasicRadios />
      <DefaultRadios />
      <ChangeRadios />
      <ChangeRadios custom />
    </main>
  );
}
