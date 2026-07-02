import * as Ariakit from "@ariakit/react";

const fruits = ["Apple", "Banana", "Orange"];

// virtualFocus is disabled so items receive real DOM focus, making the
// focusOnMove behavior observable through document.activeElement.
export default function Example() {
  const select = Ariakit.useSelectStore({
    defaultValue: "Apple",
    virtualFocus: false,
  });
  return (
    <>
      <Ariakit.SelectLabel store={select}>Fruit</Ariakit.SelectLabel>
      <Ariakit.Select store={select} style={{ display: "block" }} />
      <Ariakit.SelectPopover
        store={select}
        gutter={4}
        sameWidth
        focusOnMove={false}
        // TODO: Remove this workaround once
        // https://github.com/ariakit/ariakit/issues/6324 is fixed. It moves
        // the active item with setActiveId, which updates the highlight
        // without triggering the focus-on-move effect (unlike move). At list
        // edges, down/up return undefined, and bailing out mirrors the
        // native behavior of not moving nor swallowing the key event.
        onKeyDownCapture={(event) => {
          if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
          const nextId =
            event.key === "ArrowDown" ? select.down() : select.up();
          if (nextId === undefined) return;
          event.preventDefault();
          select.setActiveId(nextId);
        }}
        style={{ background: "white", border: "1px solid gray" }}
      >
        {fruits.map((fruit) => (
          <Ariakit.SelectItem
            key={fruit}
            value={fruit}
            style={{ display: "block", padding: "4px 8px" }}
          />
        ))}
      </Ariakit.SelectPopover>
    </>
  );
}
