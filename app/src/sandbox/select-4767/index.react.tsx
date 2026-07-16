import * as Ariakit from "@ariakit/react";

export default function Example() {
  return (
    <Ariakit.SelectProvider defaultValue="Apple">
      <Ariakit.SelectLabel>Favorite fruit</Ariakit.SelectLabel>
      <Ariakit.Select />
      <Ariakit.SelectPopover gutter={4} sameWidth>
        <Ariakit.SelectList focusable={false}>
          <Ariakit.SelectItem value="Apple" />
          <Ariakit.SelectItem value="Banana" />
          <Ariakit.SelectItem value="Orange" />
        </Ariakit.SelectList>
      </Ariakit.SelectPopover>
    </Ariakit.SelectProvider>
  );
}
