import * as React from "react";
import * as Ariakit from "@ariakit/react";
import { PopoverProvider } from "@ariakit/react-core/popover/popover-provider";

export {
  PopoverArrow,
  PopoverDescription,
  PopoverDismiss,
  PopoverHeading,
} from "@ariakit/react";

export interface PopoverProps extends Ariakit.PopoverProps {
  isOpen?: boolean;
  placement?: Ariakit.PopoverStoreProps["placement"];
  anchorRef?: React.RefObject<HTMLElement>;
  getAnchorRect?: () => DOMRect | null;
  onClose?: () => void;
}

export const Popover = React.forwardRef<HTMLDivElement, PopoverProps>(
  function Popover(props, ref) {
    const {
      placement,
      anchorRef,
      getAnchorRect,
      isOpen = true,
      onClose,
      ...rest
    } = props;
    const fallbackRef = React.useRef<HTMLSpanElement>(null);
    return (
      <PopoverProvider
        placement={placement}
        open={isOpen}
        setOpen={(open) => {
          if (!open) {
            onClose?.();
          }
        }}
      >
        <span ref={fallbackRef} style={{ position: "fixed" }} />
        <Ariakit.Popover
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
      </PopoverProvider>
    );
  },
);
