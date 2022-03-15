import { HTMLAttributes, forwardRef, useEffect, useRef, useState } from "react";
import { PopoverDismiss, PopoverHeading } from "ariakit/popover";
import {
  Select,
  SelectItem,
  SelectItemCheck,
  SelectPopover,
  useSelectState,
} from "ariakit/select";
import useResponsiveRenderCallback from "packages/website/utils/use-responsive-render-callback";
import { useSwipeable } from "react-swipeable";
import Popup from "../popup";

export type FileSelectProps = {
  defaultValue?: string;
  value?: string;
  onChange?: (file: string) => void;
  values: string[];
};

const FileSelect = forwardRef<HTMLDivElement, FileSelectProps>(
  ({ defaultValue, value, onChange, values, ...props }, ref) => {
    const renderCallback = useResponsiveRenderCallback();
    const select = useSelectState({
      defaultValue,
      value,
      setValue: onChange,
      renderCallback,
      animated: true,
    });
    const [trackTouch, setTrackTouch] = useState(true);
    const ref1 = useRef<HTMLDivElement>(null);

    useEffect(() => {
      if (!select.mounted) {
        select.popoverRef.current?.style.setProperty(
          "transform",
          `translateY(0)`
        );
      }
    }, [select.mounted]);

    const handlers = useSwipeable({
      trackTouch: false,
      onSwipedDown: (data) => {
        const element = ref1.current;
        const limit = (element?.clientHeight || 500) * 0.25;
        if (data.deltaY > limit || data.velocity > 0.5) {
          select.hide();
        } else {
          select.popoverRef.current?.style.setProperty(
            "transform",
            "translateY(0)"
          );
        }
      },
      onSwiping: (data) => {
        if (
          data.dir === "Down" &&
          (!select.popoverRef.current?.contains(data.event.target) ||
            select.popoverRef.current.scrollTop <= 0)
        ) {
          select.popoverRef.current?.style.setProperty(
            "transform",
            `translateY(${data.absY}px)`
          );
        }
      },
    });

    return (
      <>
        <Select
          state={select}
          className="flex gap-2 x h-10 cursor-default items-center justify-between
                  px-4 text-base bg-canvas-2 dark:bg-canvas-2-dark
                  rounded whitespace-nowrap text-canvas-2 dark:text-canvas-2-dark
                  sm:h-8 sm:px-3 sm:text-sm"
        />
        <SelectPopover
          backdropProps={{
            ...handlers,
            style: { backgroundColor: "rgb(0 0 0 / 20%)" },
          }}
          ref={ref1}
          onScroll={(event) => {
            if (event.target.scrollTop <= 0) {
              setTrackTouch(true);
            } else {
              setTrackTouch(false);
            }
          }}
          state={select}
          as={Popup}
          elevation={4}
          modal
          wrapperProps={{
            className: "min-w-full will-change-transform",
          }}
          className="will-change-transform p-2 min-w-max text-base overflow-auto
          max-h-[calc(100vh-24px)] transition-transform
          translate-y-full enter:translate-y-0"
        >
          <PopoverHeading className="text-xl text-center my-2 font-medium">
            Files
          </PopoverHeading>
          {values.map((value) => (
            <SelectItem
              key={value}
              value={value}
              className="flex
              h-12
              sm:h-10
              gap-2
              items-center
              scroll-m-2
              cursor-default
              rounded
              p-2
              aria-disabled:opacity-50
              active-item:bg-primary-2
              active-item:text-primary-2
              dark:active-item:bg-primary-2-dark
              dark:active-item:text-primary-2-dark"
            >
              <SelectItemCheck />
              {value}
            </SelectItem>
          ))}
          <SelectItem as={PopoverDismiss}>Cancel</SelectItem>
        </SelectPopover>
      </>
    );
  }
);

export default FileSelect;
