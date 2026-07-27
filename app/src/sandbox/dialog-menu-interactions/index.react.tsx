import * as Ariakit from "@ariakit/react";
import { useState } from "react";

export default function Example() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Ariakit.Button onClick={() => setOpen(true)} className="button">
        View recipe
      </Ariakit.Button>
      <Ariakit.Dialog
        open={open}
        onClose={() => setOpen(false)}
        backdrop={<div className="backdrop fixed inset-0 bg-black/20" />}
        className="dialog fixed inset-x-4 top-20 mx-auto max-w-lg items-start rounded bg-white p-6"
      >
        <Ariakit.DialogHeading className="heading">
          Homemade Cake
        </Ariakit.DialogHeading>
        <p>
          Begin by mixing sugar and butter together. Whisk well until light and
          fluffy with a manual whisker or a fork. Once done, add the beaten eggs
          and blend well. Beat further so that the mixture turns white and
          creamy.
        </p>
        <Ariakit.MenuProvider>
          <Ariakit.MenuButton className="button">Share</Ariakit.MenuButton>
          <Ariakit.Menu
            portal
            className="menu z-50 rounded bg-white p-2 shadow"
          >
            <Ariakit.MenuItem className="menu-item">Bluesky</Ariakit.MenuItem>
            <Ariakit.MenuItem className="menu-item">Facebook</Ariakit.MenuItem>
            <Ariakit.MenuItem className="menu-item">Email</Ariakit.MenuItem>
          </Ariakit.Menu>
        </Ariakit.MenuProvider>
      </Ariakit.Dialog>
    </>
  );
}
