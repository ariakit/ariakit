import * as Ariakit from "@ariakit/react";

const values = ["Apple", "Banana", "Grape", "Orange"];

function Select({ label, unmount }: { label: string; unmount: boolean }) {
  return (
    <Ariakit.ComboboxProvider defaultSelectedValue="Orange">
      <Ariakit.ComboboxSelectLabel>{label}</Ariakit.ComboboxSelectLabel>
      <Ariakit.ComboboxSelect />
      <Ariakit.ComboboxPopover unmountOnHide={unmount}>
        {values.map((value) => (
          <Ariakit.ComboboxItem key={value} value={value} />
        ))}
      </Ariakit.ComboboxPopover>
    </Ariakit.ComboboxProvider>
  );
}

export default function Example() {
  return (
    <>
      <Select label="Mounted fruit" unmount={false} />
      <Select label="Unmounted fruit" unmount />
    </>
  );
}
