import * as Ariakit from "@ariakit/react";

export default function Example() {
  const composite = Ariakit.useCompositeStore({
    rtl: true,
    orientation: "horizontal",
    defaultActiveId: null,
  });

  return (
    <Ariakit.Composite
      store={composite}
      role="toolbar"
      aria-label="Text formatting"
      dir="rtl"
      style={{ display: "flex", gap: 8 }}
    >
      <Ariakit.CompositeItem>Bold</Ariakit.CompositeItem>
      <Ariakit.CompositeItem>Italic</Ariakit.CompositeItem>
      <Ariakit.CompositeItem>Underline</Ariakit.CompositeItem>
    </Ariakit.Composite>
  );
}
