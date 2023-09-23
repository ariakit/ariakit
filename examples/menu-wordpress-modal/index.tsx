import "./style.css";
import { useCallback, useRef, useState } from "react";
import * as Ariakit from "@ariakit/react";
import { Modal, SlotFillProvider } from "@wordpress/components";
import {
  DropdownMenu,
  DropdownMenuItem,
  MenuSlotContext,
  createMenuSlot,
} from "./dropdown-menu.jsx";

const OptionsMenu = createMenuSlot("OptionsMenu");
const OptionsMenuBubblesVirtually = createMenuSlot(
  "OptionsMenuBubblesVirtually",
  true,
);

export default function Example() {
  const [sibling, setSibling] = useState(false);

  const renderModal = (open: boolean, setOpen: (open: boolean) => void) => {
    if (!open) return null;
    return (
      <Modal
        title="Modal"
        bodyOpenClassName="examples-menu-wordpress-modal"
        overlayClassName="backdrop"
        className="dialog"
        onRequestClose={() => setOpen(false)}
      >
        <MenuSlotContext.Provider value={null}>
          <Ariakit.TooltipProvider>
            <Ariakit.TooltipAnchor
              render={
                <DropdownMenu
                  label="Options"
                  modal={false}
                  menu={<div style={{ zIndex: 100 }} />}
                />
              }
            >
              <DropdownMenuItem>Item</DropdownMenuItem>
              <DropdownMenuItem>Item</DropdownMenuItem>
              <DropdownMenuItem>Item</DropdownMenuItem>
            </Ariakit.TooltipAnchor>
            <Ariakit.Tooltip className="tooltip" style={{ zIndex: 100 }}>
              Options
            </Ariakit.Tooltip>
          </Ariakit.TooltipProvider>
        </MenuSlotContext.Provider>
      </Modal>
    );
  };

  return (
    <SlotFillProvider>
      <DropdownMenu label="Options">
        <DropdownMenuItem>Modal</DropdownMenuItem>
        <DropdownMenuItem hideOnClick={false} onClick={() => setSibling(true)}>
          Modal (sibling)
        </DropdownMenuItem>
        <DropdownMenuItem>Create pattern</DropdownMenuItem>
        <OptionsMenu.Slot />
        <OptionsMenuBubblesVirtually.Slot />
        <DropdownMenu label="Submenu">
          <DropdownMenuItem>Item</DropdownMenuItem>
          <DropdownMenuItem>Item</DropdownMenuItem>
          <DropdownMenuItem>Item</DropdownMenuItem>
        </DropdownMenu>
        {renderModal(sibling, setSibling)}
      </DropdownMenu>
      <OptionsMenu.Fill>
        <DropdownMenuItem>Fill 1</DropdownMenuItem>
        <DropdownMenu label="Submenu">
          <DropdownMenuItem>Item</DropdownMenuItem>
          <DropdownMenuItem>Item</DropdownMenuItem>
          <DropdownMenuItem>Item</DropdownMenuItem>
        </DropdownMenu>
      </OptionsMenu.Fill>
      <OptionsMenuBubblesVirtually.Fill>
        <DropdownMenuItem>Fill 2</DropdownMenuItem>
        <DropdownMenu label="Submenu">
          <DropdownMenuItem>Item</DropdownMenuItem>
          <DropdownMenuItem>Item</DropdownMenuItem>
          <DropdownMenuItem>Item</DropdownMenuItem>
        </DropdownMenu>
      </OptionsMenuBubblesVirtually.Fill>
    </SlotFillProvider>
  );
  // return (
  //   <Ariakit.MenuProvider>
  //     <Ariakit.MenuButton className="button">Menu</Ariakit.MenuButton>
  //     <Ariakit.Menu
  //       className="menu"
  //       modal
  //     >
  //       <Ariakit.MenuItem
  //         className="menu-item"
  //         onClick={(event) => {
  //           dialog.show();
  //           // event.preventDefault();
  //         }}
  //         hideOnClick={false}
  //       >
  //         Item
  //       </Ariakit.MenuItem>
  //       {dialog.useState("open") && (
  //         <Modal
  //           onRequestClose={(event) => {
  //             dialog.hide();
  //             console.log(event);
  //           }}
  //         >
  //           dsadsa
  //           <Ariakit.TooltipProvider store={tooltip}>
  //             <Ariakit.TooltipAnchor className="button">
  //               Close
  //             </Ariakit.TooltipAnchor>
  //             {tooltipOpen && (
  //               <Ariakit.Tooltip
  //                 // portalElement={portalElement}
  //                 style={{ zIndex: 999999 }}
  //                 className="tooltip"
  //               >
  //                 Test
  //               </Ariakit.Tooltip>
  //             )}
  //           </Ariakit.TooltipProvider>
  //         </Modal>
  //       )}
  //     </Ariakit.Menu>
  //   </Ariakit.MenuProvider>
  // );
}
