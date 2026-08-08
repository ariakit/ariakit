import * as Ariakit from "@ariakit/react";
import { useEffect, useRef } from "react";

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
  const popover = Ariakit.usePopoverStore();

  useEffect(() => {
    const popoverElement = popoverRef.current;
    const paragraph = paragraphRef.current;
    if (!popoverElement) return;
    if (!paragraph) return;
    const document = paragraph.ownerDocument;
    const onMouseUp = () => {
      if (!hasSelectionWithin(paragraph)) return;
      popover.render();
      popover.setOpen(true);
    };
    const onSelectionChange = () => {
      if (popoverElement.contains(document.activeElement)) return;
      if (hasSelectionWithin(paragraph)) {
        popover.render();
        return;
      }
      popover.setOpen(false);
    };
    document.addEventListener("mouseup", onMouseUp);
    document.addEventListener("selectionchange", onSelectionChange);
    return () => {
      document.removeEventListener("mouseup", onMouseUp);
      document.removeEventListener("selectionchange", onSelectionChange);
    };
  }, [popover]);

  return (
    <Ariakit.PopoverProvider store={popover} placement="top">
      <Ariakit.Popover
        autoFocusOnShow={false}
        hideOnInteractOutside={() => !hasSelectionWithin(paragraphRef.current)}
        ref={popoverRef}
        getAnchorRect={() => {
          const selection = paragraphRef.current?.ownerDocument.getSelection();
          if (!selection?.rangeCount) return null;
          return selection.getRangeAt(0).getBoundingClientRect();
        }}
      >
        <Ariakit.Button tabIndex={0}>Bookmark</Ariakit.Button>
        <Ariakit.Button tabIndex={0}>Edit</Ariakit.Button>
        <Ariakit.Button tabIndex={0}>Share</Ariakit.Button>
      </Ariakit.Popover>
      <p ref={paragraphRef}>
        Lorem ipsum dolor, sit amet consectetur adipisicing elit. Odio, sed fuga
        necessitatibus aliquid expedita atque? Doloremque ea sequi totam
        laudantium laboriosam repellat quasi commodi omnis aut nulla. Numquam,
        beatae maxime.
      </p>
    </Ariakit.PopoverProvider>
  );
}
