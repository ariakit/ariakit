import "./style.css";
import * as Ariakit from "@ariakit/react";

export default function Example() {
  return (
    <Ariakit.MenuProvider defaultValues={{ sort: "popular" }}>
      <Ariakit.MenuButton className="button">
        Sort
        <Ariakit.MenuButtonArrow />
      </Ariakit.MenuButton>
      <Ariakit.Menu gutter={8} className="menu">
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
    </Ariakit.MenuProvider>
  );
}
