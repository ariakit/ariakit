import * as Ariakit from "@ariakit/react";
import { useState } from "react";
import "./style.css";

function FileMenu() {
  return (
    <Ariakit.MenuProvider>
      <Ariakit.MenuItem render={<Ariakit.MenuButton />}>File</Ariakit.MenuItem>
      <Ariakit.Menu className="menu" gutter={4}>
        <Ariakit.MenuItem className="menu-item">New Tab</Ariakit.MenuItem>
        <input aria-label="Search" defaultValue="abc" className="input" />
        <Ariakit.MenuItem
          aria-label="Rename"
          hideOnClick={false}
          render={<input defaultValue="abc" className="input" />}
        />
        <a href="#help" tabIndex={0}>
          Help
        </a>
        <button type="button" tabIndex={0}>
          Action
        </button>
      </Ariakit.Menu>
    </Ariakit.MenuProvider>
  );
}

export default function Example() {
  const [vertical, setVertical] = useState(false);
  return (
    <div className="controls">
      <label>
        <input
          type="checkbox"
          checked={vertical}
          onChange={(event) => setVertical(event.currentTarget.checked)}
        />
        Vertical menubar
      </label>
      <Ariakit.Menubar
        className="menubar"
        orientation={vertical ? "vertical" : "horizontal"}
      >
        <FileMenu />
        <Ariakit.MenuProvider>
          <Ariakit.MenuItem render={<Ariakit.MenuButton />}>
            Edit
          </Ariakit.MenuItem>
          <Ariakit.Menu className="menu" gutter={4}>
            <Ariakit.MenuItem className="menu-item">Undo</Ariakit.MenuItem>
          </Ariakit.Menu>
        </Ariakit.MenuProvider>
        <Ariakit.ComboboxProvider defaultValue="abc">
          <Ariakit.MenuProvider>
            <Ariakit.MenuItem render={<Ariakit.MenuButton />}>
              Insert
            </Ariakit.MenuItem>
            <Ariakit.Menu className="menu" gutter={4}>
              <Ariakit.Combobox aria-label="Search blocks" className="input" />
              <Ariakit.ComboboxList>
                <Ariakit.ComboboxItem value="Paragraph" className="menu-item" />
              </Ariakit.ComboboxList>
            </Ariakit.Menu>
          </Ariakit.MenuProvider>
        </Ariakit.ComboboxProvider>
      </Ariakit.Menubar>
    </div>
  );
}
