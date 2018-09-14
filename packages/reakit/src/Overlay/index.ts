import Overlay from "./Overlay";
import OverlayContainer from "./OverlayContainer";
import OverlayToggle from "./OverlayToggle";
import OverlayShow from "./OverlayShow";
import OverlayHide from "./OverlayHide";

interface OverlayComponents {
  Container: typeof OverlayContainer;
  Hide: typeof OverlayHide;
  Show: typeof OverlayShow;
  Toggle: typeof OverlayToggle;
}

const O = Overlay as typeof Overlay & OverlayComponents;

O.Container = OverlayContainer;
O.Toggle = OverlayToggle;
O.Show = OverlayShow;
O.Hide = OverlayHide;

export * from "./Overlay";
export * from "./OverlayContainer";
export * from "./OverlayToggle";
export * from "./OverlayShow";
export * from "./OverlayHide";

export default O;
