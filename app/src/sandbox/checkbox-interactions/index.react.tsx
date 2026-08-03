import * as Ariakit from "@ariakit/react";
import { useState } from "react";

function BasicCheckboxes() {
  const [controlled, setControlled] = useState(true);
  const store = Ariakit.useCheckboxStore({ defaultValue: true });
  const valuedStore = Ariakit.useCheckboxStore();
  return (
    <section>
      <h2>Basic checkboxes</h2>
      <label>
        <Ariakit.Checkbox /> Terms
      </label>
      <label>
        <Ariakit.Checkbox
          checked={controlled}
          onChange={(event) => setControlled(event.target.checked)}
        />{" "}
        Controlled
      </label>
      <label>
        <Ariakit.Checkbox store={store} /> Store
      </label>
      <label>
        <Ariakit.Checkbox store={valuedStore} value="accept" /> Valued
      </label>
    </section>
  );
}

function DynamicCheckboxes() {
  const [allChecked, setAllChecked] = useState(true);
  const first = Ariakit.useCheckboxStore({
    value: allChecked,
    setValue: setAllChecked,
  });
  const second = Ariakit.useCheckboxStore({
    store: allChecked ? first : undefined,
  });
  return (
    <section>
      <h2>Dynamic store</h2>
      <label>
        <Ariakit.Checkbox store={first} /> Dynamic 1
      </label>
      <label>
        <Ariakit.Checkbox store={second} /> Dynamic 2
      </label>
    </section>
  );
}

function ButtonCheckbox() {
  const store = Ariakit.useCheckboxStore();
  const checked = Ariakit.useStoreState(store, "value");
  return (
    <section>
      <h2>Rendered checkbox</h2>
      <Ariakit.Checkbox store={store} render={<button />}>
        Button checkbox: {checked ? "Checked" : "Unchecked"}
      </Ariakit.Checkbox>
    </section>
  );
}

function ForwardedUndefinedCheckbox(props: Ariakit.CheckboxProps) {
  const { role, ...rest } = props;
  return <Ariakit.Checkbox {...rest} render={<div role={role} />} />;
}

function RenderPropCheckbox() {
  return (
    <section>
      <h2>Render prop checkbox</h2>
      <ForwardedUndefinedCheckbox aria-label="Forwarded undefined" />
    </section>
  );
}

function CustomCheckbox() {
  const [checked, setChecked] = useState(true);
  return (
    <section>
      <h2>Custom checkbox</h2>
      <label data-checked={checked}>
        <Ariakit.VisuallyHidden>
          <Ariakit.Checkbox
            aria-label="Custom"
            defaultChecked
            clickOnEnter
            onChange={(event) => setChecked(event.target.checked)}
          />
        </Ariakit.VisuallyHidden>
        <span data-checked={checked}>✓</span>
        <span>Custom</span>
      </label>
    </section>
  );
}

function CheckboxGroup() {
  return (
    <Ariakit.CheckboxProvider defaultValue={[]}>
      <Ariakit.Group>
        <Ariakit.GroupLabel>Favorite fruits</Ariakit.GroupLabel>
        <label>
          <Ariakit.Checkbox value="apple" /> Apple
        </label>
        <label>
          <Ariakit.Checkbox value="orange" /> Orange
        </label>
        <label>
          <Ariakit.Checkbox value="mango" /> Mango
        </label>
      </Ariakit.Group>
    </Ariakit.CheckboxProvider>
  );
}

export default function Example() {
  return (
    <main>
      <h1>Checkbox interactions</h1>
      <BasicCheckboxes />
      <DynamicCheckboxes />
      <ButtonCheckbox />
      <RenderPropCheckbox />
      <CustomCheckbox />
      <CheckboxGroup />
    </main>
  );
}
