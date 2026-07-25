import * as Ariakit from "@ariakit/react";

const values = ["Apple", "Banana", "Grape"];

function Select({
  label,
  unmount,
  resetOnEscape,
}: {
  label: string;
  unmount: boolean;
  resetOnEscape?: boolean | (() => boolean);
}) {
  return (
    <Ariakit.ComboboxProvider defaultSelectedValue="Apple" selectOnMove>
      <Ariakit.ComboboxSelect aria-label={label}>
        <Ariakit.ComboboxSelectedValue />
      </Ariakit.ComboboxSelect>
      <Ariakit.ComboboxPopover
        unmountOnHide={unmount}
        resetOnEscape={resetOnEscape}
      >
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
      <Select label="Mounted" unmount={false} />
      <Select label="Unmounted" unmount />
      <Select label="Callback" unmount={false} resetOnEscape={() => false} />
    </>
  );
}
