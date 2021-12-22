import * as React from "react";
import {
  Menu,
  MenuArrow,
  MenuButton,
  MenuButtonArrow,
  MenuButtonProps,
  MenuItemCheck,
  MenuItemCheckbox,
  useMenuState,
} from "ariakit/menu";
import { Toolbar, ToolbarItem, useToolbarState } from "ariakit/toolbar";
import {
  HiOutlineArchive,
  HiOutlineEye,
  HiOutlineHeart,
  HiOutlineStar,
} from "react-icons/hi";
import "./style.css";

const menuWatch = [
  {
    name: "participatingandmetions",
    title: "Participating and @mentions",
    sumary:
      "Only receive notifications from this repository when participating or @mentioned.",
  },
  {
    name: "all-activity",
    title: "All Activity",
    sumary: "Notified of all notifications on this repository.",
  },
  {
    name: "ignore",
    title: "Ignore",
    sumary: "Never be notified.",
  },
];

const MenuWatch = React.forwardRef<HTMLButtonElement, MenuButtonProps>(
  (props, ref) => {
    const menu = useMenuState({
      defaultValues: {
        participatingandmetions: true,
        ignore: false,
        name: false,
      },
    });

    return (
      <>
        <MenuButton {...props} state={menu} ref={ref}>
          {props.children}
          <MenuButtonArrow />
        </MenuButton>
        <Menu state={menu} className="menu">
          <MenuArrow />
          {menuWatch.map((item) => (
            <MenuItemCheckbox
              key={item.name}
              name={item.name}
              className="menu-item-checkbox"
            >
              <div className="menu-item-check-wrapper">
                <MenuItemCheck />
              </div>
              <div className="menu-item-check-content">
                <p className="menu-item-check-title">{item.title}</p>
                <p className="menu-item-check-summary">{item.sumary}</p>
              </div>
            </MenuItemCheckbox>
          ))}
        </Menu>
      </>
    );
  }
);

export default function Example() {
  const state = useToolbarState();
  return (
    <div className="container">
      <Toolbar state={state} className="toolbar">
        <ToolbarItem className="button">
          <HiOutlineHeart />
          <span>Sponsor</span>
        </ToolbarItem>
        <ToolbarItem className="button" as={MenuWatch}>
          <HiOutlineEye />
          <span>Unwatch</span>
        </ToolbarItem>
        <ToolbarItem className="button">
          <HiOutlineArchive />
          <span>Fork</span>
        </ToolbarItem>
        <ToolbarItem className="button">
          <HiOutlineStar />
          <span>Star</span>
        </ToolbarItem>
      </Toolbar>
    </div>
  );
}
