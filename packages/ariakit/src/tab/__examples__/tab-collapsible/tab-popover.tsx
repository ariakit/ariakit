import { CSSProperties, useRef, useState } from "react";
import { CompositeItem } from "ariakit/composite";
import { Popover, PopoverDisclosure, usePopoverState } from "ariakit/popover";

type TabPopoverProps = {
  title: string;
  children: React.ReactNode;
};

export default function TabPopover({ title, children }: TabPopoverProps) {
  const popover = usePopoverState({ placement: "bottom-end" });
  const finalFocusRef = useRef<HTMLButtonElement>(null);
  const [shouldRegisterItem, setShouldRegisterItem] = useState(false);
  const style: CSSProperties = popover.visible
    ? {}
    : // Hiding the popover with `display: none` would prevent the hidden items to
      // be focused, so we just make it transparent and disable pointer events.
      { opacity: 0, pointerEvents: "none" };

  return (
    <>
      <PopoverDisclosure
        state={popover}
        as={CompositeItem}
        ref={finalFocusRef}
        onFocus={() => setShouldRegisterItem(true)}
        onBlur={() => setShouldRegisterItem(false)}
        shouldRegisterItem={shouldRegisterItem}
        aria-hidden={!shouldRegisterItem}
        aria-expanded={popover.visible}
        className="tab"
      >
        {title}
      </PopoverDisclosure>
      <Popover
        state={popover}
        role="presentation"
        hidden={false}
        focusable={false}
        finalFocusRef={finalFocusRef}
        onFocus={popover.show}
        style={style}
        className="popover"
      >
        {children}
      </Popover>
    </>
  );
}
