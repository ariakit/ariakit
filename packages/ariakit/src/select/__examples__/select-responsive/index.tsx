import { useCallback } from "react";
import {
  PopoverDismiss,
  PopoverHeading,
  PopoverStateRenderCallbackProps,
} from "ariakit/popover";
import {
  Select,
  SelectArrow,
  SelectItem,
  SelectItemCheck,
  SelectLabel,
  SelectPopover,
  useSelectState,
} from "ariakit/select";
import assignStyle from "./assign-style";
import useMedia from "./use-media";
import "./style.css";

function applyMobileStyles(popover: HTMLElement, arrow?: HTMLElement | null) {
  const restorePopoverStyle = assignStyle(popover, {
    position: "fixed",
    bottom: "0",
    width: "100%",
    padding: "12px",
  });
  const restoreArrowStyle = assignStyle(arrow, { display: "none" });
  const restoreDesktopStyles = () => {
    restorePopoverStyle();
    restoreArrowStyle();
  };
  return restoreDesktopStyles;
}

export default function Example() {
  const isLarge = useMedia("(min-width: 640px)", true);

  const renderCallback = useCallback(
    (props: PopoverStateRenderCallbackProps) => {
      const { popover, arrow, defaultRenderCallback } = props;
      if (isLarge) return defaultRenderCallback();
      return applyMobileStyles(popover, arrow);
    },
    [isLarge]
  );

  const select = useSelectState({
    renderCallback,
    defaultValue: "Apple",
    defaultVisible: true,
  });

  return (
    <div className="wrapper">
      <SelectLabel state={select}>Favorite fruit</SelectLabel>
      <Select state={select} className="select">
        {select.value}
        <SelectArrow />
      </Select>
      <SelectPopover state={select} modal={!isLarge} className="popover">
        {!isLarge && (
          <div className="header">
            <PopoverHeading className="heading">Favorite fruit</PopoverHeading>
            <PopoverDismiss className="button dismiss" />
          </div>
        )}
        <SelectItem value="Apple">
          <SelectItemCheck />
          Apple
        </SelectItem>
        <SelectItem value="Banana">
          <SelectItemCheck />
          Banana
        </SelectItem>
        <SelectItem value="Cherry">
          <SelectItemCheck />
          Cherry
        </SelectItem>
        <SelectItem value="Grape">
          <SelectItemCheck />
          Grape
        </SelectItem>
        <SelectItem value="Lemon">
          <SelectItemCheck />
          Lemon
        </SelectItem>
        <SelectItem value="Orange">
          <SelectItemCheck />
          Orange
        </SelectItem>
      </SelectPopover>
    </div>
  );
}
