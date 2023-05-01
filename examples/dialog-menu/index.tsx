import { useState } from "react";
import { Button } from "@ariakit/react";
import { Dialog, DialogHeading } from "./dialog.jsx";
import { Menu, MenuButton, MenuItem, MenuPopover } from "./menu.jsx";
import "./style.css";

export default function Example() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)} className="button">
        View recipe
      </Button>
      <Dialog className="dialog" open={open} onClose={() => setOpen(false)}>
        <DialogHeading className="heading">Homemade Cake</DialogHeading>
        <p>
          Begin by mixing sugar and butter together. Whisk well until light and
          fluffy with a manual whisker or a fork. Once done, add the beaten eggs
          and blend well. Beat further so that the mixture turns white and
          creamy.
        </p>
        <Menu>
          <MenuButton className="button">Share</MenuButton>
          <MenuPopover className="menu">
            <MenuItem className="menu-item">Twitter</MenuItem>
            <MenuItem className="menu-item">Facebook</MenuItem>
            <MenuItem className="menu-item">Email</MenuItem>
          </MenuPopover>
        </Menu>
      </Dialog>
    </>
  );
}
