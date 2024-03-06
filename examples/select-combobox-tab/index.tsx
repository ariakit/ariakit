import "./style.css";
import * as Ariakit from "@ariakit/react";

export default function Example() {
  return (
    <div className="wrapper">
      <Ariakit.ComboboxProvider>
        <Ariakit.SelectProvider>
          <Ariakit.Select />
          <Ariakit.SelectPopover unmountOnHide>
            <Ariakit.Combobox />
            <Ariakit.TabProvider>
              <Ariakit.TabList>
                <Ariakit.Tab className="select-item">Tab 1</Ariakit.Tab>
                <Ariakit.Tab className="select-item">Tab 2</Ariakit.Tab>
                <Ariakit.Tab className="select-item">Tab 3</Ariakit.Tab>
              </Ariakit.TabList>
              <Ariakit.TabPanel unmountOnHide>
                <Ariakit.ComboboxList>
                  <Ariakit.SelectItem
                    value="Item 1"
                    className="select-item"
                    render={<Ariakit.ComboboxItem />}
                  />
                  <Ariakit.SelectItem
                    value="Item 2"
                    className="select-item"
                    render={<Ariakit.ComboboxItem />}
                  />
                  <Ariakit.SelectItem
                    value="Item 3"
                    className="select-item"
                    render={<Ariakit.ComboboxItem />}
                  />
                </Ariakit.ComboboxList>
              </Ariakit.TabPanel>
              <Ariakit.TabPanel unmountOnHide>
                <Ariakit.ComboboxList>
                  <Ariakit.SelectItem
                    value="Item 3"
                    className="select-item"
                    render={<Ariakit.ComboboxItem />}
                  />
                  <Ariakit.SelectItem
                    value="Item 4"
                    className="select-item"
                    render={<Ariakit.ComboboxItem />}
                  />
                  <Ariakit.SelectItem
                    value="Item 5"
                    className="select-item"
                    render={<Ariakit.ComboboxItem />}
                  />
                </Ariakit.ComboboxList>
              </Ariakit.TabPanel>
              <Ariakit.TabPanel unmountOnHide>
                <Ariakit.ComboboxList>
                  <Ariakit.SelectItem
                    value="Item 6"
                    className="select-item"
                    render={<Ariakit.ComboboxItem />}
                  />
                  <Ariakit.SelectItem
                    value="Item 7"
                    className="select-item"
                    render={<Ariakit.ComboboxItem />}
                  />
                  <Ariakit.SelectItem
                    value="Item 8"
                    className="select-item"
                    render={<Ariakit.ComboboxItem />}
                  />
                </Ariakit.ComboboxList>
              </Ariakit.TabPanel>
            </Ariakit.TabProvider>
          </Ariakit.SelectPopover>
        </Ariakit.SelectProvider>
      </Ariakit.ComboboxProvider>
    </div>
  );
}
