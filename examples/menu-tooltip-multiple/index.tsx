import "./style.css";
import { useState } from "react";
import {
  Menu,
  MenuButton,
  MenuItem,
  MenuProvider,
} from "../menu-tooltip/menu.jsx";
import {
  Tooltip,
  TooltipAnchor,
  TooltipProvider,
} from "../menu-tooltip/tooltip.jsx";

export default function Example() {
  const [unmountPortal, setUnmountPortal] = useState(false);
  const [unmountModal, setUnmountModal] = useState(false);
  return (
    <>
      <MenuProvider>
        <TooltipProvider timeout={0}>
          <TooltipAnchor className="button" render={<MenuButton />}>
            default
          </TooltipAnchor>
          <Tooltip className="tooltip">default</Tooltip>
        </TooltipProvider>
        <Menu className="menu">
          <MenuItem className="menu-item">default</MenuItem>
        </Menu>
      </MenuProvider>

      <MenuProvider>
        <TooltipProvider timeout={0}>
          <TooltipAnchor className="button" render={<MenuButton />}>
            portal
          </TooltipAnchor>
          <Tooltip className="tooltip">portal</Tooltip>
        </TooltipProvider>
        <Menu portal className="menu">
          <MenuItem className="menu-item">portal</MenuItem>
        </Menu>
      </MenuProvider>

      <MenuProvider>
        <TooltipProvider timeout={0}>
          <TooltipAnchor className="button" render={<MenuButton />}>
            modal
          </TooltipAnchor>
          <Tooltip className="tooltip">modal</Tooltip>
        </TooltipProvider>
        <Menu modal className="menu">
          <MenuItem className="menu-item">modal</MenuItem>
        </Menu>
      </MenuProvider>

      <MenuProvider open={unmountPortal} setOpen={setUnmountPortal}>
        <TooltipProvider timeout={0}>
          <TooltipAnchor className="button" render={<MenuButton />}>
            unmount portal
          </TooltipAnchor>
          <Tooltip className="tooltip">unmount portal</Tooltip>
        </TooltipProvider>
        {unmountPortal && (
          <Menu portal className="menu">
            <MenuItem className="menu-item">unmount portal</MenuItem>
          </Menu>
        )}
      </MenuProvider>

      <MenuProvider open={unmountModal} setOpen={setUnmountModal}>
        <TooltipProvider timeout={0}>
          <TooltipAnchor className="button" render={<MenuButton />}>
            unmount modal
          </TooltipAnchor>
          <Tooltip className="tooltip">unmount modal</Tooltip>
        </TooltipProvider>
        {unmountModal && (
          <Menu modal className="menu">
            <MenuItem className="menu-item">unmount modal</MenuItem>
          </Menu>
        )}
      </MenuProvider>
    </>
  );
}
