import Hidden from "./Hidden";
import HiddenContainer from "./HiddenContainer";
import HiddenHide from "./HiddenHide";
import HiddenShow from "./HiddenShow";
import HiddenToggle from "./HiddenToggle";

interface HiddenComponents {
  Container: typeof HiddenContainer;
  Hide: typeof HiddenHide;
  Show: typeof HiddenShow;
  Toggle: typeof HiddenToggle;
}

const H = Hidden as typeof Hidden & HiddenComponents;

H.Container = HiddenContainer;
H.Hide = HiddenHide;
H.Show = HiddenShow;
H.Toggle = HiddenToggle;

export * from "./Hidden";
export * from "./HiddenHide";
export * from "./HiddenShow";
export * from "./HiddenToggle";

export default H;
