import * as React from "react";
import * as Ariakit from "@ariakit/react";

export {
  PopoverArrow,
  PopoverDescription,
  PopoverDismiss,
  PopoverHeading,
} from "@ariakit/react";

export type PopoverProps = React.HTMLAttributes<HTMLDivElement> & {
  placement?: Ariakit.PopoverStoreProps["placement"];
  isOpen?: boolean;
  anchorRef?: React.RefObject<HTMLElement>;
  getAnchorRect?: () => DOMRect | null;
  onClose?: () => void;
};

export const Popover = React.forwardRef<HTMLDivElement, PopoverProps>(
  (props, ref) => {
    const {
      placement,
      anchorRef,
      getAnchorRect,
      isOpen = true,
      onClose,
      ...rest
    } = props;
    const fallbackRef = React.useRef<HTMLSpanElement>(null);
    const popover = Ariakit.usePopoverStore({
      placement,
      open: isOpen,
      setOpen(open) {
        if (!open) {
          onClose?.();
        }
      },
    });
    return (
      <>
        <span ref={fallbackRef} style={{ position: "fixed" }} />
        <Ariakit.Popover
          store={popover}
          ref={ref}
          portal
          getAnchorRect={() => {
            if (getAnchorRect) {
              return getAnchorRect();
            }
            if (anchorRef) {
              return anchorRef.current?.getBoundingClientRect() || null;
            }
            const parentElement = fallbackRef.current?.parentElement;
            if (parentElement) {
              return parentElement.getBoundingClientRect();
            }
            return null;
          }}
          {...rest}
        />
      </>
    );
  },
);
