import * as Ariakit from "@ariakit/react";
import { useRef } from "react";

export default function Example() {
  // TODO: Remove once https://github.com/ariakit/ariakit/issues/4938
  // is fixed.
  const interactedOutsideRef = useRef(false);

  return (
    <>
      <p>Please scroll down to partially see the menu button.</p>
      <div
        style={{
          margin: "1000px 250px",
        }}
      >
        <Ariakit.MenuProvider>
          <Ariakit.MenuButton
            style={{
              display: "flex",
              height: 40,
              alignItems: "center",
              gap: 8,
            }}
          >
            Actions
            <Ariakit.MenuButtonArrow />
          </Ariakit.MenuButton>
          <Ariakit.Menu
            gutter={8}
            preventBodyScroll={false}
            autoFocusOnHide={(element) => {
              // TODO: Remove once
              // https://github.com/ariakit/ariakit/issues/4938 is fixed.
              if (interactedOutsideRef.current) {
                interactedOutsideRef.current = false;
                return false;
              }
              element?.focus();
              return false;
            }}
            hideOnInteractOutside={(event) => {
              // TODO: Remove once
              // https://github.com/ariakit/ariakit/issues/4938 is fixed.
              interactedOutsideRef.current = true;
              return true;
            }}
            style={{
              display: "flex",
              minWidth: 180,
              flexDirection: "column",
              gap: 4,
              border: "1px solid",
              backgroundColor: "white",
              padding: 8,
            }}
          >
            <Ariakit.MenuItem>Edit</Ariakit.MenuItem>
            <Ariakit.MenuItem>Share</Ariakit.MenuItem>
            <Ariakit.MenuItem disabled>Delete</Ariakit.MenuItem>
            <Ariakit.MenuSeparator />
            <Ariakit.MenuItem>CLICK THIS</Ariakit.MenuItem>
          </Ariakit.Menu>
        </Ariakit.MenuProvider>
      </div>
    </>
  );
}
