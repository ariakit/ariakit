import * as Ariakit from "@ariakit/react";

export default function Example() {
  const select = Ariakit.useSelectStore({ open: true });
  return (
    <Ariakit.SelectList store={select} aria-label="Favorite fruit">
      <Ariakit.SelectItem
        focusOnHover={false}
        hideOnClick={false}
        value="Apple"
      />
      <Ariakit.SelectItem
        focusOnHover={false}
        hideOnClick={false}
        value="Banana"
      />
      <Ariakit.SelectItem
        focusOnHover={false}
        hideOnClick={false}
        value="Grape"
        disabled
      />
      <Ariakit.SelectItem
        focusOnHover={false}
        hideOnClick={false}
        value="Orange"
      />
    </Ariakit.SelectList>
  );
}
