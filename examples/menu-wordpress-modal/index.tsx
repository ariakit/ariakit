import "./style.css";
import { useState } from "react";
import { SlotFillProvider } from "@wordpress/components";
import { Menu, MenuItem, createMenuSlot } from "./menu.jsx";
import { Modal } from "./modal.jsx";
import { Tooltip } from "./tooltip.jsx";

const OptionsMenu = createMenuSlot("OptionsMenu");
const OptionsMenuBubblesVirtually = createMenuSlot(
  "OptionsMenuBubblesVirtually",
  true,
);

export default function Example() {
  const [nested, setNested] = useState(false);
  const [sibling, setSibling] = useState(false);
  const [submenu, setSubmenu] = useState(false);
  const [slot, setSlot] = useState(false);
  const [slotSubmenu, setSlotSubmenu] = useState(false);
  const [slotBubblesVirtually, setSlotBubblesVirtually] = useState(false);
  const [slotBubblesVirtuallySubmenu, setSlotBubblesVirtuallySubmenu] =
    useState(false);

  const renderModal = (open = nested, setOpen = setNested) => {
    if (!open) return null;
    return (
      <Modal title="Modal" onRequestClose={() => setOpen(false)}>
        <Tooltip text="Menu">
          <Menu label="Menu">
            <MenuItem>Item 1</MenuItem>
            <MenuItem>Item 2</MenuItem>
            <Menu label="Item 3">
              <MenuItem>Item 3.1</MenuItem>
              <MenuItem>Item 3.2</MenuItem>
              <MenuItem>Item 3.3</MenuItem>
            </Menu>
          </Menu>
        </Tooltip>
      </Modal>
    );
  };

  return (
    <SlotFillProvider>
      <Menu label="Options">
        <MenuItem hideOnClick={false} onClick={() => setNested(true)}>
          Nested
        </MenuItem>
        <MenuItem hideOnClick={false} onClick={() => setSibling(true)}>
          Sibling
        </MenuItem>
        <MenuItem onClick={() => setSibling(true)}>
          Sibling (hideOnClick)
        </MenuItem>
        <Menu label="Submenu">
          <MenuItem hideOnClick={false} onClick={() => setNested(true)}>
            Nested
          </MenuItem>
          <MenuItem hideOnClick={false} onClick={() => setSibling(true)}>
            Sibling
          </MenuItem>
          <MenuItem onClick={() => setSibling(true)}>
            Sibling (hideOnClick)
          </MenuItem>
          <MenuItem hideOnClick={false} onClick={() => setSubmenu(true)}>
            Submenu
          </MenuItem>
          {renderModal(submenu, setSubmenu)}
        </Menu>
        <OptionsMenu.Slot />
        <OptionsMenuBubblesVirtually.Slot />
        {renderModal(nested, setNested)}
      </Menu>

      {renderModal(sibling, setSibling)}

      <OptionsMenu.Fill>
        <MenuItem hideOnClick={false} onClick={() => setSlot(true)}>
          Slot
        </MenuItem>
        <MenuItem hideOnClick={false} onClick={() => setNested(true)}>
          Slot - Nested
        </MenuItem>
        <MenuItem hideOnClick={false} onClick={() => setSibling(true)}>
          Slot - Sibling
        </MenuItem>
        <MenuItem onClick={() => setSibling(true)}>
          Slot - Sibling (hideOnClick)
        </MenuItem>
        <Menu label="Slot - Submenu">
          <MenuItem hideOnClick={false} onClick={() => setNested(true)}>
            Slot - Nested
          </MenuItem>
          <MenuItem hideOnClick={false} onClick={() => setSibling(true)}>
            Slot - Sibling
          </MenuItem>
          <MenuItem onClick={() => setSibling(true)}>
            Slot - Sibling (hideOnClick)
          </MenuItem>
          <MenuItem hideOnClick={false} onClick={() => setSlotSubmenu(true)}>
            Slot - Submenu
          </MenuItem>
          {renderModal(slotSubmenu, setSlotSubmenu)}
        </Menu>
        {renderModal(slot, setSlot)}
      </OptionsMenu.Fill>

      <OptionsMenuBubblesVirtually.Fill>
        <MenuItem
          hideOnClick={false}
          onClick={() => setSlotBubblesVirtually(true)}
        >
          Slot (bubblesVirtually)
        </MenuItem>
        <MenuItem hideOnClick={false} onClick={() => setNested(true)}>
          Slot (bubblesVirtually) - Nested
        </MenuItem>
        <MenuItem hideOnClick={false} onClick={() => setSibling(true)}>
          Slot (bubblesVirtually) - Sibling
        </MenuItem>
        <MenuItem onClick={() => setSibling(true)}>
          Slot (bubblesVirtually) - Sibling (hideOnClick)
        </MenuItem>
        <Menu label="Slot (bubblesVirtually) - Submenu">
          <MenuItem hideOnClick={false} onClick={() => setNested(true)}>
            Slot (bubblesVirtually) - Nested
          </MenuItem>
          <MenuItem hideOnClick={false} onClick={() => setSibling(true)}>
            Slot (bubblesVirtually) - Sibling
          </MenuItem>
          <MenuItem onClick={() => setSibling(true)}>
            Slot (bubblesVirtually) - Sibling (hideOnClick)
          </MenuItem>
          <MenuItem
            hideOnClick={false}
            onClick={() => setSlotBubblesVirtuallySubmenu(true)}
          >
            Slot (bubblesVirtually) - Submenu
          </MenuItem>
          {renderModal(
            slotBubblesVirtuallySubmenu,
            setSlotBubblesVirtuallySubmenu,
          )}
        </Menu>
        {renderModal(slotBubblesVirtually, setSlotBubblesVirtually)}
      </OptionsMenuBubblesVirtually.Fill>
    </SlotFillProvider>
  );
}
