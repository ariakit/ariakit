import Overlay from "./Overlay";
import OverlayContainer from "./OverlayContainer";
import OverlayToggle from "./OverlayToggle";
import OverlayShow from "./OverlayShow";
import OverlayHide from "./OverlayHide";

export interface OverlayComponents {
  Container: typeof OverlayContainer;
  Toggle: typeof OverlayToggle;
  Show: typeof OverlayShow;
  Hide: typeof OverlayHide;
}

const O = Overlay as typeof Overlay & OverlayComponents;

O.Container = OverlayContainer;
O.Toggle = OverlayToggle;
O.Show = OverlayShow;
O.Hide = OverlayHide;

export default O;
