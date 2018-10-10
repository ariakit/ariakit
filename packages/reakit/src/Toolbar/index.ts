import Toolbar from "./Toolbar";
import ToolbarContent from "./ToolbarContent";
import ToolbarFocusable from "./ToolbarFocusable";

export * from "./Toolbar";
export * from "./ToolbarContent";
export * from "./ToolbarFocusable";

export default Object.assign(Toolbar, {
  Content: ToolbarContent,
  Focusable: ToolbarFocusable
});
