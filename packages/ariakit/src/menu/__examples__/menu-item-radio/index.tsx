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
  const menu = useMenuState({ gutter: 8, defaultValues: { sort: "popular" } });

  return (
    <>
      <MenuButton state={menu} className="button">
        Sort
        <MenuButtonArrow />
      </MenuButton>
      <Menu state={menu} className="menu">
        <MenuItemRadio name="sort" value="popular" className="menu-item">
          <MenuItemCheck />
          Popular
        </MenuItemRadio>
        <MenuItemRadio name="sort" value="newest" className="menu-item">
          <MenuItemCheck />
          Newest
        </MenuItemRadio>
        <MenuItemRadio name="sort" value="oldest" className="menu-item">
          <MenuItemCheck />
          Oldest
        </MenuItemRadio>
      </Menu>
    </>
  );
}
