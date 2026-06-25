import * as Ariakit from "@ariakit/react";
import type { KeyboardEvent } from "react";

export default function Example() {
  const composite = Ariakit.useCompositeStore({
    rtl: true,
    orientation: "horizontal",
    defaultActiveId: null,
  });

  // TODO: Remove once https://github.com/ariakit/ariakit/issues/6299 is fixed.
  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.defaultPrevented) return;
    if (event.target !== event.currentTarget) return;
    const isLeft = event.key === "ArrowLeft";
    const isRight = event.key === "ArrowRight";
    if (!isLeft && !isRight) return;
    const id = isLeft ? composite.previous() : composite.next();
    if (id === undefined) return;
    event.preventDefault();
    composite.move(id);
  }

  return (
    <Ariakit.Composite
      store={composite}
      role="toolbar"
      aria-label="Text formatting"
      dir="rtl"
      onKeyDown={onKeyDown}
      style={{ display: "flex", gap: 8 }}
    >
      <Ariakit.CompositeItem>Bold</Ariakit.CompositeItem>
      <Ariakit.CompositeItem>Italic</Ariakit.CompositeItem>
      <Ariakit.CompositeItem>Underline</Ariakit.CompositeItem>
    </Ariakit.Composite>
  );
}
