import "./style.css";
import "@wordpress/components/build-style/style.css";
import { useCallback, useRef } from "react";
import * as Ariakit from "@ariakit/react";
import { Modal } from "@wordpress/components";

export default function Example() {
  const dialog = Ariakit.useDialogStore();
  const tooltip = Ariakit.useTooltipStore();
  const tooltipOpen = tooltip.useState("open");
  return (
    <Ariakit.MenuProvider>
      <Ariakit.MenuButton className="button">Menu</Ariakit.MenuButton>
      <Ariakit.Menu
        className="menu"
        modal
        // getPersistentElements={() => {
        //   const modal = document.querySelector(
        //     ".components-modal__screen-overlay",
        //   );
        //   if (!modal) return [];
        //   return [modal];
        // }}
      >
        <Ariakit.MenuItem
          className="menu-item"
          onClick={(event) => {
            dialog.show();
            // event.preventDefault();
          }}
          hideOnClick={false}
        >
          Item
        </Ariakit.MenuItem>
        {dialog.useState("open") && (
          <Modal
            onRequestClose={(event) => {
              dialog.hide();
              console.log(event);
            }}
          >
            dsadsa
            <Ariakit.TooltipProvider store={tooltip}>
              <Ariakit.TooltipAnchor className="button">
                Close
              </Ariakit.TooltipAnchor>
              {tooltipOpen && (
                <Ariakit.Tooltip
                  // portalElement={portalElement}
                  style={{ zIndex: 999999 }}
                  className="tooltip"
                >
                  Test
                </Ariakit.Tooltip>
              )}
            </Ariakit.TooltipProvider>
          </Modal>
        )}
        {/* <Ariakit.Dialog
          store={dialog}
          className="dialog"
          // hideOnEscape={(event) => {
          //   return true;
          // }}
          // onKeyDown={(event) => {
          //   if (event.key !== "Escape") return;
          //   console.log(event);
          //   event.stopPropagation();
          // }}
        >
          <button>Button</button>
          <Ariakit.TooltipProvider store={tooltip}>
            <Ariakit.TooltipAnchor
              className="button"
              render={<Ariakit.DialogDismiss />}
            >
              Close
            </Ariakit.TooltipAnchor>
            {tooltipOpen && (
              <Ariakit.Tooltip className="tooltip">Close</Ariakit.Tooltip>
            )}
          </Ariakit.TooltipProvider>
        </Ariakit.Dialog> */}
      </Ariakit.Menu>
    </Ariakit.MenuProvider>
  );
}
