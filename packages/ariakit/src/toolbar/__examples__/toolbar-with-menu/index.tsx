import { forwardRef } from "react";
import { Button } from "ariakit/button";
import { Menu, MenuButton, MenuItem, useMenuState } from "ariakit/menu";
import {
  Toolbar,
  ToolbarItem,
  ToolbarSeparator,
  useToolbarState,
} from "ariakit/toolbar";
import { BiChevronDown } from "react-icons/bi";
import {
  ImBold,
  ImItalic,
  ImParagraphCenter,
  ImParagraphLeft,
  ImParagraphRight,
  ImUnderline,
} from "react-icons/im";
import "./style.css";

const MoreItems = forwardRef((props, ref) => {
  const menu = useMenuState({ orientation: "horizontal" });
  return (
    <>
      {/* @ts-ignore */}
      <MenuButton state={menu} ref={ref} {...props} />
      <Menu state={menu} aria-label="Alignment" className="menu">
        <MenuItem>
          <ImParagraphLeft />
          Left
        </MenuItem>
        <MenuItem>
          <ImParagraphCenter />
          Center
        </MenuItem>
        <MenuItem>
          <ImParagraphRight />
          Right
        </MenuItem>
      </Menu>
    </>
  );
});

export default function Example() {
  const toolbar = useToolbarState();

  return (
    <Toolbar state={toolbar} className="toolbar">
      <ToolbarItem as={Button} className="button">
        <ImBold />
        Bold
      </ToolbarItem>
      <ToolbarItem as={Button} className="button">
        <ImItalic />
        Italic
      </ToolbarItem>
      <ToolbarItem as={Button} className="button">
        <ImUnderline />
        Underline
      </ToolbarItem>
      <ToolbarSeparator className="toolbar-separator" />
      {/* @ts-ignore */}
      <ToolbarItem as={MoreItems} className="button" aria-label="Alignment">
        Alignment
        <BiChevronDown />
      </ToolbarItem>
    </Toolbar>
  );
}
