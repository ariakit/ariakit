import * as React from "react";
import * as Ariakit from "@ariakit/react";

export {
  PopoverArrow,
  PopoverDescription,
  PopoverDismiss,
  PopoverHeading,
} from "@ariakit/react";

export interface PopoverProps extends Ariakit.PopoverProps {
  placement?: Ariakit.PopoverStoreProps["placement"];
  anchorRef?: React.RefObject<HTMLElement>;
}

export const Popover = React.forwardRef<HTMLDivElement, PopoverProps>(
  function Popover(props, ref) {
    const { placement, anchorRef, ...rest } = props;
    const fallbackRef = React.useRef<HTMLSpanElement>(null);
    return (
      <Ariakit.PopoverProvider placement={placement}>
        <span ref={fallbackRef} style={{ position: "fixed" }} />
        <Ariakit.Popover
          ref={ref}
          open
          portal
          unmountOnHide
          getAnchorRect={() => {
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
      </Ariakit.PopoverProvider>
    );
  },
);
