import Popover from "./Popover";
import PopoverArrow from "./PopoverArrow";
import PopoverContainer from "./PopoverContainer";
import PopoverToggle from "./PopoverToggle";
import Hidden from "../Hidden";

Popover.Arrow = PopoverArrow;
Popover.Container = PopoverContainer;
Popover.Toggle = PopoverToggle;
Popover.Show = Hidden.Show;
Popover.Hide = Hidden.Hide;

export default Popover;
