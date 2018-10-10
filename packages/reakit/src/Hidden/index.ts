import Hidden from "./Hidden";
import HiddenContainer from "./HiddenContainer";
import HiddenHide from "./HiddenHide";
import HiddenShow from "./HiddenShow";
import HiddenToggle from "./HiddenToggle";

export * from "./Hidden";
export * from "./HiddenContainer";
export * from "./HiddenHide";
export * from "./HiddenShow";
export * from "./HiddenToggle";

export default Object.assign(Hidden, {
  Container: HiddenContainer,
  Hide: HiddenHide,
  Show: HiddenShow,
  Toggle: HiddenToggle
});
