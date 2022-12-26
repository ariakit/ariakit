import { useEffect, useRef } from "react";
import * as Ariakit from "@ariakit/react";
import "./style.css";

function hasSelectionWithin(element?: Element | null) {
  const selection = element?.ownerDocument.getSelection();
  if (!selection?.rangeCount) return false;
  const range = selection.getRangeAt(0);
  if (range.collapsed) return false;
  return !!element?.contains(range.commonAncestorContainer);
}

export default function Example() {
  const popoverRef = useRef<HTMLDivElement>(null);
  const paragraphRef = useRef<HTMLParagraphElement>(null);

  const popover = Ariakit.usePopoverStore({
    placement: "top",
    getAnchorRect: () => {
      const selection = paragraphRef.current?.ownerDocument.getSelection();
      if (!selection?.rangeCount) return null;
      const range = selection.getRangeAt(0);
      return range.getBoundingClientRect();
    },
  });

  useEffect(() => {
    const popoverContainer = popoverRef.current;
    const paragraph = paragraphRef.current;
    if (!popoverContainer) return;
    if (!paragraph) return;
    const doc = paragraph.ownerDocument || document;
    const onMouseUp = () => {
      if (!hasSelectionWithin(paragraph)) return;
      popover.render();
      popover.setOpen(true);
    };
    const onSelect = () => {
      if (popoverContainer.contains(doc.activeElement)) return;
      if (hasSelectionWithin(paragraph)) {
        return popover.render();
      }
      popover.setOpen(false);
    };
    doc.addEventListener("mouseup", onMouseUp);
    doc.addEventListener("selectionchange", onSelect);
    return () => {
      doc.removeEventListener("mouseup", onMouseUp);
      doc.removeEventListener("selectionchange", onSelect);
    };
  }, [popover.render, popover.setOpen]);

  return (
    <div>
      <Ariakit.Popover
        store={popover}
        autoFocusOnShow={false}
        hideOnInteractOutside={() => !hasSelectionWithin(paragraphRef.current)}
        ref={popoverRef}
        className="popover"
      >
        <Ariakit.PopoverArrow size={24} className="arrow" />
        <Ariakit.Button className="button secondary">Bookmark</Ariakit.Button>
        <Ariakit.Button className="button secondary">Edit</Ariakit.Button>
        <Ariakit.Button className="button secondary">Share</Ariakit.Button>
      </Ariakit.Popover>
      <p ref={paragraphRef}>
        Lorem ipsum dolor, sit amet consectetur adipisicing elit. Odio, sed fuga
        necessitatibus aliquid expedita atque? Doloremque ea sequi totam
        laudantium laboriosam repellat quasi commodi omnis aut nulla. Numquam,
        beatae maxime.
      </p>
    </div>
  );
}
