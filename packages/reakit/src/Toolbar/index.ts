import Toolbar from "./Toolbar";
import ToolbarFocusable from "./ToolbarFocusable";
import ToolbarContent from "./ToolbarContent";

export * from "./Toolbar";
export * from "./ToolbarFocusable";
export * from "./ToolbarContent";

export default Object.assign(Toolbar, {
  Focusable: ToolbarFocusable,
  Content: ToolbarContent
});
