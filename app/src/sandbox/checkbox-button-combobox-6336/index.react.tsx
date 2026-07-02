import * as Ariakit from "@ariakit/react";
import { useState } from "react";

function CheckboxExample() {
  const [custom, setCustom] = useState(false);
  const [checked, setChecked] = useState(false);
  return (
    <div>
      <button onClick={() => setCustom(!custom)}>
        {custom ? "Use native checkbox" : "Use custom checkbox"}
      </button>
      <Ariakit.Checkbox
        aria-label="Accept terms"
        checked={checked}
        onChange={() => setChecked(!checked)}
        render={
          custom ? (
            <div
              style={{
                width: 20,
                height: 20,
                border: "1px solid black",
                background: checked ? "black" : "white",
              }}
            />
          ) : (
            <input />
          )
        }
      />
      <output>checked: {String(checked)}</output>
    </div>
  );
}

function RadioExample() {
  const [custom, setCustom] = useState(false);
  const [fruit, setFruit] = useState("apple");
  return (
    <div>
      <button onClick={() => setCustom(!custom)}>
        {custom ? "Use native radio" : "Use custom radio"}
      </button>
      <Ariakit.RadioProvider
        value={fruit}
        setValue={(value) => setFruit(String(value))}
      >
        <Ariakit.RadioGroup aria-label="Fruit">
          <Ariakit.Radio aria-label="apple" value="apple" />
          <Ariakit.Radio
            aria-label="orange"
            value="orange"
            render={
              custom ? (
                <div
                  style={{
                    width: 20,
                    height: 20,
                    border: "1px solid black",
                    background: fruit === "orange" ? "black" : "white",
                  }}
                />
              ) : (
                <input />
              )
            }
          />
        </Ariakit.RadioGroup>
      </Ariakit.RadioProvider>
      <output>fruit: {fruit}</output>
    </div>
  );
}

interface ButtonExampleProps {
  label: string;
  defaultCustom?: boolean;
}

function ButtonExample({ label, defaultCustom = false }: ButtonExampleProps) {
  const [custom, setCustom] = useState(defaultCustom);
  const [clicks, setClicks] = useState(0);
  const name = label.toLowerCase();
  return (
    <div>
      <button onClick={() => setCustom(!custom)}>
        {custom ? `Use native ${name}` : `Use custom ${name}`}
      </button>
      <Ariakit.Button
        onClick={() => setClicks((count) => count + 1)}
        render={custom ? <div /> : <button />}
      >
        {label}
      </Ariakit.Button>
      <output>
        {name} clicks: {clicks}
      </output>
    </div>
  );
}

function ComboboxExample() {
  const [custom, setCustom] = useState(false);
  return (
    <div>
      <button onClick={() => setCustom(!custom)}>
        {custom ? "Use listbox list" : "Use dialog list"}
      </button>
      <Ariakit.ComboboxProvider defaultSelectedValue={["Apple"]}>
        <Ariakit.Combobox aria-label="Fruit" />
        <Ariakit.ComboboxList
          aria-label="Fruits"
          alwaysVisible
          render={custom ? <section role="dialog" /> : undefined}
        >
          <Ariakit.ComboboxItem value="Apple" />
        </Ariakit.ComboboxList>
      </Ariakit.ComboboxProvider>
    </div>
  );
}

export default function Example() {
  return (
    <>
      <CheckboxExample />
      <RadioExample />
      <ButtonExample label="Submit" />
      <ButtonExample label="Save" defaultCustom />
      <ComboboxExample />
    </>
  );
}
