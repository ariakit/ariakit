import { useEffect, useRef } from "react";
import { Button } from "ariakit/button";
import { Popover, PopoverArrow, usePopoverState } from "ariakit/popover";
import "./style.css";

function hasSelectionWithin(element?: Element | null) {
  const selection = window.getSelection();
  if (!selection?.rangeCount) return false;
  const range = selection.getRangeAt(0);
  if (range.collapsed) return false;
  console.log(range);
  return !!element?.contains(range.commonAncestorContainer);
}

export default function Example() {
  const ref = useRef<HTMLParagraphElement>(null);

  const popover = usePopoverState({
    placement: "top",
    getAnchorRect: () => {
      const selection = window.getSelection();
      if (!selection?.rangeCount) return null;
      const range = selection.getRangeAt(0);
      return range.getBoundingClientRect();
    },
  });

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const onPointerUp = () => {
      if (!hasSelectionWithin(element)) return;
      popover.setVisible(true);
      popover.render();
    };
    const onSelect = () => {
      if (hasSelectionWithin(element)) {
        popover.render();
        return;
      }
      popover.setVisible(false);
    };
    element.ownerDocument.addEventListener("pointerup", onPointerUp);
    element.ownerDocument.addEventListener("selectionchange", onSelect);
    return () => {
      element.ownerDocument.removeEventListener("pointerup", onPointerUp);
      element.ownerDocument.removeEventListener("selectionchange", onSelect);
    };
  }, [popover.setVisible, popover.render]);

  return (
    <div>
      <Popover
        state={popover}
        hideOnInteractOutside={(event) => {
          if (hasSelectionWithin(ref.current)) {
            return false;
          }
          return true;
        }}
        autoFocusOnShow={false}
        className="popover"
      >
        <PopoverArrow className="arrow" />
        <Button className="button">Accept</Button>
      </Popover>
      <p ref={ref}>
        Lorem ipsum dolor, sit amet consectetur adipisicing elit. Odio, sed fuga
        necessitatibus aliquid expedita atque? Doloremque ea sequi totam
        laudantium laboriosam repellat quasi commodi omnis aut nulla. Numquam,
        beatae maxime.
      </p>
    </div>
  );
}
