import { HTMLAttributes, RefObject, forwardRef, useRef } from "react";
import {
  Popover as BasePopover,
  PopoverStateProps,
  usePopoverState,
} from "ariakit/popover";

export {
  PopoverArrow,
  PopoverDescription,
  PopoverDismiss,
  PopoverHeading,
} from "ariakit/popover";

export type PopoverProps = HTMLAttributes<HTMLDivElement> & {
  placement?: PopoverStateProps["placement"];
  isOpen?: boolean;
  anchorRef?: RefObject<HTMLElement>;
  getAnchorRect?: () => DOMRect | null;
  onClose?: () => void;
};

export const Popover = forwardRef<HTMLDivElement, PopoverProps>(
  (props, ref) => {
    const {
      placement,
      anchorRef,
      getAnchorRect,
      isOpen = true,
      onClose,
      ...rest
    } = props;
    const fallbackRef = useRef<HTMLSpanElement>(null);
    const popover = usePopoverState({
      placement,
      visible: isOpen,
      setVisible: (visible) => {
        if (!visible && onClose) onClose();
        return visible;
      },
      getAnchorRect: () => {
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
      },
    });
    return (
      <>
        <span ref={fallbackRef} style={{ position: "fixed" }} />
        <BasePopover state={popover} ref={ref} portal {...rest} />
      </>
    );
  }
);
