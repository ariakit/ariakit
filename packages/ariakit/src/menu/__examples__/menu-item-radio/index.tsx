import {
  Menu,
  MenuButton,
  MenuButtonArrow,
  MenuItemCheck,
  MenuItemRadio,
  useMenuState,
} from "ariakit/menu";
import "./style.css";

export default function Example() {
  const menu = useMenuState({ gutter: 8, defaultValues: { view: "all" } });

  return (
    <>
      <MenuButton state={menu} className="button">
        View {menu.values.view}
        <MenuButtonArrow />
      </MenuButton>
      <Menu state={menu} className="menu">
        <MenuItemRadio name="view" value="all" className="menu-item">
          <MenuItemCheck />
          All
        </MenuItemRadio>
        <MenuItemRadio name="view" value="read" className="menu-item">
          <MenuItemCheck />
          Read
        </MenuItemRadio>
        <MenuItemRadio name="view" value="unread" className="menu-item">
          <MenuItemCheck />
          Unread
        </MenuItemRadio>
        <MenuItemRadio name="view" value="starred" className="menu-item">
          <MenuItemCheck />
          Starred
        </MenuItemRadio>
        <MenuItemRadio name="view" value="unstarred" className="menu-item">
          <MenuItemCheck />
          Unstarred
        </MenuItemRadio>
      </Menu>
    </>
  );
}
