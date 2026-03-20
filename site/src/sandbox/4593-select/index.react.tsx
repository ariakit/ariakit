import * as Ariakit from "@ariakit/react";

const list = ["Apple", "Banana", "Cherry", "Grape", "Lemon", "Orange"];

export default function Example() {
  const id: string | undefined = undefined;
  return (
    <Ariakit.SelectProvider defaultValue="Apple">
      <Ariakit.SelectLabel>Favorite fruit</Ariakit.SelectLabel>
      <Ariakit.Select />
      <Ariakit.SelectPopover gutter={4} sameWidth unmountOnHide>
        {list.map((value) => (
          <Ariakit.SelectItem
            // TODO: Remove workaround once fixed
            // https://github.com/ariakit/ariakit/issues/4593
            {...(id != null ? { id } : null)}
            key={value}
            value={value}
          />
        ))}
      </Ariakit.SelectPopover>
    </Ariakit.SelectProvider>
  );
}
