import * as Ariakit from "@ariakit/react";
import "./style.css";

export default function Example() {
  const menu = Ariakit.useMenuStore({
    defaultValues: { sort: "popular" },
  });
  return (
    <>
      <Ariakit.MenuButton store={menu} className="button">
        Sort
        <Ariakit.MenuButtonArrow />
      </Ariakit.MenuButton>
      <Ariakit.Menu store={menu} gutter={8} className="menu">
        <Ariakit.MenuItemRadio
          name="sort"
          value="popular"
          className="menu-item"
        >
          <Ariakit.MenuItemCheck />
          Popular
        </Ariakit.MenuItemRadio>
        <Ariakit.MenuItemRadio name="sort" value="newest" className="menu-item">
          <Ariakit.MenuItemCheck />
          Newest
        </Ariakit.MenuItemRadio>
        <Ariakit.MenuItemRadio name="sort" value="oldest" className="menu-item">
          <Ariakit.MenuItemCheck />
          Oldest
        </Ariakit.MenuItemRadio>
      </Ariakit.Menu>
    </>
  );
}
