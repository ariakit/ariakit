import {
  Menu,
  MenuButton,
  MenuItem,
  MenuProvider,
  Tooltip,
  TooltipAnchor,
  TooltipProvider,
} from "@ariakit/react";
import { useState } from "react";
import "./style.css";

export default function Example() {
  const [unmountPortal, setUnmountPortal] = useState(false);
  const [unmountModal, setUnmountModal] = useState(false);
  const [timeout, setTimeout] = useState(0);
  return (
    <>
      <label>
        Timeout
        <br />
        <input
          type="text"
          value={timeout}
          onChange={(e) => setTimeout(Number.parseInt(e.target.value, 10) || 0)}
        />
      </label>
      <MenuProvider>
        <TooltipProvider timeout={timeout}>
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
        <TooltipProvider timeout={timeout}>
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
        <TooltipProvider timeout={timeout}>
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
        <TooltipProvider timeout={timeout}>
          <TooltipAnchor className="button" render={<MenuButton />}>
            unmount portal
          </TooltipAnchor>
          <Tooltip className="tooltip">unmount portal</Tooltip>
        </TooltipProvider>
        <Menu portal unmountOnHide className="menu">
          <MenuItem className="menu-item">unmount portal</MenuItem>
        </Menu>
      </MenuProvider>

      <MenuProvider open={unmountModal} setOpen={setUnmountModal}>
        <TooltipProvider timeout={timeout}>
          <TooltipAnchor className="button" render={<MenuButton />}>
            unmount modal
          </TooltipAnchor>
          <Tooltip className="tooltip">unmount modal</Tooltip>
        </TooltipProvider>
        <Menu modal unmountOnHide className="menu">
          <MenuItem className="menu-item">unmount modal</MenuItem>
        </Menu>
      </MenuProvider>
    </>
  );
}
