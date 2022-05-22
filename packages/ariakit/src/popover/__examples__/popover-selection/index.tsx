import { useEffect, useRef } from "react";
import { Button } from "ariakit/button";
import { Popover, PopoverArrow, usePopoverState } from "ariakit/popover";
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

  const popover = usePopoverState({
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
      popover.setVisible(true);
    };
    const onSelect = () => {
      if (popoverContainer.contains(doc.activeElement)) return;
      if (hasSelectionWithin(paragraph)) {
        return popover.render();
      }
      popover.setVisible(false);
    };
    doc.addEventListener("mouseup", onMouseUp);
    doc.addEventListener("selectionchange", onSelect);
    return () => {
      doc.removeEventListener("mouseup", onMouseUp);
      doc.removeEventListener("selectionchange", onSelect);
    };
  }, [popover.render, popover.setVisible]);

  return (
    <div>
      <Popover
        state={popover}
        autoFocusOnShow={false}
        hideOnInteractOutside={() => !hasSelectionWithin(paragraphRef.current)}
        ref={popoverRef}
        className="popover"
      >
        <PopoverArrow size={24} className="arrow" />
        <Button className="button secondary">Bookmark</Button>
        <Button className="button secondary">Edit</Button>
        <Button className="button secondary">Share</Button>
      </Popover>
      <p ref={paragraphRef}>
        Lorem ipsum dolor, sit amet consectetur adipisicing elit. Odio, sed fuga
        necessitatibus aliquid expedita atque? Doloremque ea sequi totam
        laudantium laboriosam repellat quasi commodi omnis aut nulla. Numquam,
        beatae maxime.
      </p>
    </div>
  );
}
