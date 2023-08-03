import "./style.css";
import { useState } from "react";
import { Menu, MenuButton, MenuItem, MenuProvider } from "./menu.jsx";
import { Tooltip, TooltipAnchor, TooltipProvider } from "./tooltip.jsx";

export default function Example() {
  const [unmountPortal, setUnmountPortal] = useState(false);
  const [unmountModal, setUnmountModal] = useState(false);
  return (
    <>
      <MenuProvider>
        <TooltipProvider timeout={0}>
          <TooltipAnchor render={<MenuButton />}>default</TooltipAnchor>
          <Tooltip>default</Tooltip>
        </TooltipProvider>
        <Menu>
          <MenuItem>default</MenuItem>
        </Menu>
      </MenuProvider>

      <MenuProvider>
        <TooltipProvider timeout={0}>
          <TooltipAnchor render={<MenuButton />}>portal</TooltipAnchor>
          <Tooltip>portal</Tooltip>
        </TooltipProvider>
        <Menu portal>
          <MenuItem>portal</MenuItem>
        </Menu>
      </MenuProvider>

      <MenuProvider>
        <TooltipProvider timeout={0}>
          <TooltipAnchor render={<MenuButton />}>modal</TooltipAnchor>
          <Tooltip>modal</Tooltip>
        </TooltipProvider>
        <Menu modal>
          <MenuItem>modal</MenuItem>
        </Menu>
      </MenuProvider>

      <MenuProvider open={unmountPortal} setOpen={setUnmountPortal}>
        <TooltipProvider timeout={0}>
          <TooltipAnchor render={<MenuButton />}>unmount portal</TooltipAnchor>
          <Tooltip>unmount portal</Tooltip>
        </TooltipProvider>
        {unmountPortal && (
          <Menu portal>
            <MenuItem>unmount portal</MenuItem>
          </Menu>
        )}
      </MenuProvider>

      <MenuProvider open={unmountModal} setOpen={setUnmountModal}>
        <TooltipProvider timeout={0}>
          <TooltipAnchor render={<MenuButton />}>unmount modal</TooltipAnchor>
          <Tooltip>unmount modal</Tooltip>
        </TooltipProvider>
        {unmountModal && (
          <Menu modal>
            <MenuItem>unmount modal</MenuItem>
          </Menu>
        )}
      </MenuProvider>
    </>
  );
}
