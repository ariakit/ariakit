import Sidebar from "./Sidebar";
import SidebarContainer from "./SidebarContainer";
import SidebarToggle from "./SidebarToggle";
import SidebarShow from "./SidebarShow";
import SidebarHide from "./SidebarHide";

export * from "./Sidebar";
export * from "./SidebarContainer";
export * from "./SidebarToggle";
export * from "./SidebarShow";
export * from "./SidebarHide";

export default Object.assign(Sidebar, {
  Container: SidebarContainer,
  Toggle: SidebarToggle,
  Show: SidebarShow,
  Hide: SidebarHide
});
