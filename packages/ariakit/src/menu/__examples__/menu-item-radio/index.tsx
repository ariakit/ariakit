import {
  Menu,
  MenuButton,
  MenuButtonArrow,
  MenuItemCheck,
  MenuItemRadio,
  useMenuStore,
} from "ariakit/menu/store";
import "./style.css";

export default function Example() {
  const menu = useMenuStore({
    gutter: 8,
    defaultValues: { sort: "popular" },
  });
  return (
    <>
      <MenuButton store={menu} className="button">
        Sort
        <MenuButtonArrow />
      </MenuButton>
      <Menu store={menu} className="menu">
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
