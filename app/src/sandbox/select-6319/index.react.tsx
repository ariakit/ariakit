import * as Ariakit from "@ariakit/react";
import { useState } from "react";

const fruits = ["Apple", "Banana", "Cherry"];
const colors = ["Red", "Green", "Blue"];

const popoverStyle = {
  background: "white",
  border: "1px solid gray",
  padding: 4,
};

export default function Example() {
  const [showCustomInput, setShowCustomInput] = useState(false);
  const fruit = Ariakit.useSelectStore({ defaultValue: "Cherry" });
  const color = Ariakit.useSelectStore({ defaultValue: "Green" });
  return (
    <>
      <div>
        <Ariakit.SelectLabel store={fruit}>Favorite fruit</Ariakit.SelectLabel>
        {/* TODO: Remove moveOnKeyDown={false} once
            https://github.com/ariakit/ariakit/issues/6319 is fixed. It
            disables the buggy closed-select move path. The default
            showOnKeyDown behavior still opens the popover on the same key
            press, so this is behavior-preserving with default props. */}
        <Ariakit.Select store={fruit} moveOnKeyDown={false} />
        <Ariakit.SelectPopover
          store={fruit}
          gutter={4}
          sameWidth
          style={popoverStyle}
        >
          {fruits.map((value) => (
            <Ariakit.SelectItem key={value} value={value} />
          ))}
          {/* Action items at the end of the list, rendered as SelectItems
              without the optional value prop so they take part in keyboard
              navigation. */}
          <Ariakit.SelectItem hideOnClick onClick={() => fruit.setValue("")}>
            Clear selection
          </Ariakit.SelectItem>
          <Ariakit.SelectItem
            hideOnClick
            onClick={() => setShowCustomInput(true)}
          >
            Other fruit…
          </Ariakit.SelectItem>
        </Ariakit.SelectPopover>
        {showCustomInput && <input aria-label="Other fruit" />}
      </div>
      <div>
        <Ariakit.SelectLabel store={color}>Favorite color</Ariakit.SelectLabel>
        {/* TODO: Remove moveOnKeyDown={false} and the custom onKeyDown once
            https://github.com/ariakit/ariakit/issues/6319 is fixed. This
            select relies on closed-select value cycling (showOnKeyDown is
            false), so the move is reimplemented here, skipping items without
            a value safely. */}
        <Ariakit.Select
          store={color}
          showOnKeyDown={false}
          moveOnKeyDown={false}
          onKeyDown={(event) => {
            if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
            if (color.getState().open) return;
            event.preventDefault();
            const next = event.key === "ArrowDown" ? color.down : color.up;
            const visitedIds = new Set<string>();
            let skip = 0;
            let nextId = next();
            while (nextId) {
              const nextItem = color.item(nextId);
              if (!nextItem) return;
              if (nextItem.value != null) {
                color.move(nextId);
                return;
              }
              // next() repeats ids at the end of the list, and repeats the
              // first enabled item when there is no active item, so a repeat
              // means there is no valued item to move to
              if (visitedIds.has(nextId)) return;
              visitedIds.add(nextId);
              nextId = next({ skip: ++skip });
            }
          }}
        />
        <Ariakit.SelectPopover
          store={color}
          gutter={4}
          sameWidth
          style={popoverStyle}
        >
          {colors.map((value) => (
            <Ariakit.SelectItem key={value} value={value} />
          ))}
          <Ariakit.SelectItem hideOnClick onClick={() => color.setValue("")}>
            Clear selection
          </Ariakit.SelectItem>
        </Ariakit.SelectPopover>
      </div>
    </>
  );
}
