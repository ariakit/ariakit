import Overlay from "./Overlay";
import OverlayContainer from "./OverlayContainer";
import OverlayToggle from "./OverlayToggle";
import OverlayShow from "./OverlayShow";
import OverlayHide from "./OverlayHide";

export * from "./Overlay";
export * from "./OverlayContainer";
export * from "./OverlayToggle";
export * from "./OverlayShow";
export * from "./OverlayHide";

export default Object.assign(Overlay, {
  Container: OverlayContainer,
  Toggle: OverlayToggle,
  Show: OverlayShow,
  Hide: OverlayHide
});
