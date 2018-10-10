import Popover from "./Popover";
import PopoverArrow from "./PopoverArrow";
import PopoverContainer from "./PopoverContainer";
import PopoverToggle from "./PopoverToggle";
import PopoverShow from "./PopoverShow";
import PopoverHide from "./PopoverHide";

export * from "./Popover";
export * from "./PopoverArrow";
export * from "./PopoverContainer";
export * from "./PopoverToggle";
export * from "./PopoverShow";
export * from "./PopoverHide";

export default Object.assign(Popover, {
  Arrow: PopoverArrow,
  Container: PopoverContainer,
  Toggle: PopoverToggle,
  Show: PopoverShow,
  Hide: PopoverHide
});
