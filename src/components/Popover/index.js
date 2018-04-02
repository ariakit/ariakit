import Popover from "./Popover";
import PopoverArrow from "./PopoverArrow";
import PopoverState from "./PopoverState";
import PopoverToggle from "./PopoverToggle";
import Hidden from "../Hidden";

Popover.Arrow = PopoverArrow;
Popover.State = PopoverState;
Popover.Toggle = PopoverToggle;
Popover.Show = Hidden.Show;
Popover.Hide = Hidden.Hide;

export default Popover;
