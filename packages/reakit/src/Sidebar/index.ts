import Sidebar from "./Sidebar";
import SidebarContainer from "./SidebarContainer";
import SidebarToggle from "./SidebarToggle";
import SidebarShow from "./SidebarShow";
import SidebarHide from "./SidebarHide";

interface SidebarComponents {
  Container: typeof SidebarContainer;
  Hide: typeof SidebarHide;
  Show: typeof SidebarShow;
  Toggle: typeof SidebarToggle;
}

const S = Sidebar as typeof Sidebar & SidebarComponents;

S.Container = SidebarContainer;
S.Toggle = SidebarToggle;
S.Show = SidebarShow;
S.Hide = SidebarHide;

export * from "./Sidebar";
export * from "./SidebarContainer";
export * from "./SidebarToggle";
export * from "./SidebarShow";
export * from "./SidebarHide";

export default S;
