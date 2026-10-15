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

function ControlledRadios() {
  const [channel, setChannel] = useState("email");
  const [savedChannel, setSavedChannel] = useState("");
  return (
    <form
      aria-label="Contact preferences"
      onReset={() => setChannel("email")}
      onSubmit={(event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        const savedValue = data.get("channel");
        setSavedChannel(typeof savedValue === "string" ? savedValue : "");
      }}
    >
      {/*
       * TODO: Remove workaround after
       * https://github.com/ariakit/ariakit/issues/7898
       */}
      <Ariakit.RadioProvider
        value={channel}
        setValue={(value) => setChannel(`${value}`)}
      >
        <Ariakit.RadioGroup aria-label="Contact channel">
          {["email", "sms"].map((value) => (
            <label key={value}>
              <Ariakit.Radio name="channel" value={value} />
              {value === "email" ? "Email" : "SMS"}
            </label>
          ))}
        </Ariakit.RadioGroup>
      </Ariakit.RadioProvider>
      <button type="reset">Restore defaults</button>
      <button type="submit">Save preferences</button>
      <output aria-label="Saved channel">{savedChannel}</output>
    </form>
  );
}

function ControlledCustomRadios() {
  const [fruit, setFruit] = useState("apple");
  const [changes, setChanges] = useState(0);
  return (
    // TODO: Remove workaround after https://github.com/ariakit/ariakit/issues/7898
    <Ariakit.RadioProvider
      value={fruit}
      setValue={(value) => setFruit(`${value}`)}
    >
      <Ariakit.RadioGroup aria-label="Controlled custom radios">
        {["apple", "orange"].map((value) => (
          <Ariakit.Radio
            key={value}
            render={<button />}
            value={value}
            onChange={() => setChanges((count) => count + 1)}
          >
            Controlled {value}
          </Ariakit.Radio>
        ))}
      </Ariakit.RadioGroup>
      <button type="button" onClick={() => setFruit("apple")}>
        Reset controlled radios
      </button>
      <output aria-label="Controlled change count">{changes}</output>
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
      <ControlledRadios />
      <ControlledCustomRadios />
    </main>
  );
}
