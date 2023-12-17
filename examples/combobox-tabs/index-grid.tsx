import "./style.css";
import * as Ariakit from "@ariakit/react";

const list = [
  "Apple",
  "Bacon",
  "Banana",
  "Broccoli",
  "Burger",
  "Cake",
  "Candy",
];

const list2 = [
  "Apple1",
  "Bacon1",
  "Banana1",
  "Broccoli1",
  "Burger1",
  "Cake1",
  "Candy1",
];

// Try with Tabs

export default function Example() {
  const combobox = Ariakit.useComboboxStore({
    // virtualFocus: false,
    focusWrap: false,
    focusLoop: "vertical",
    focusShift: true,
  });
  const grid = Ariakit.useCompositeStore({
    focusWrap: false,
    focusLoop: false,
    // defaultActiveId: list[0],
  });
  const activeId = combobox.useState((state) => state.activeId);
  const groupId = grid.useState((state) => state.activeId);
  // console.log(combobox.useState("renderedItems"));
  return (
    <Ariakit.ComboboxProvider store={combobox}>
      <Ariakit.ComboboxLabel className="label">
        Your favorite food
      </Ariakit.ComboboxLabel>
      <div className="combobox-wrapper">
        <Ariakit.Combobox
          autoSelect
          placeholder="e.g., Apple"
          className="combobox"
        />
        <Ariakit.ComboboxCancel className="button secondary combobox-cancel" />
      </div>
      <Ariakit.ComboboxPopover
        role="dialog"
        className="popover"
        autoFocusOnShow={false}
        aria-label="Lol mano"
      >
        <Ariakit.Composite role="grid" store={grid}>
          <div role="rowgroup">
            <Ariakit.ComboboxRow role="row" className="flex">
              <Ariakit.ComboboxItem
                role="columnheader"
                className="combobox-item"
              >
                Cacete caraA
              </Ariakit.ComboboxItem>
              <Ariakit.ComboboxItem
                role="columnheader"
                className="combobox-item"
              >
                Que que isso mano
              </Ariakit.ComboboxItem>
            </Ariakit.ComboboxRow>
          </div>
          <Ariakit.CompositeRow role="row" store={grid} className="flex">
            <Ariakit.CompositeItem
              store={grid}
              id={activeId && list.includes(activeId) ? activeId : list[0]}
              render={({ role, ...props }) => (
                <div role="gridcell">
                  <div
                    role="listbox"
                    className="combobox-list"
                    // aria-label="Cacete cara"
                  >
                    {list.map((value) => {
                      const isActive = props.id === value;
                      return (
                        <Ariakit.ComboboxItem
                          key={value}
                          {...(isActive ? props : {})}
                          role="option"
                          value={value}
                          className="combobox-item"
                          id={value}
                          rowId={value}
                          store={combobox}
                          shouldRegisterItem={
                            !!groupId && list.includes(groupId)
                          }
                        />
                      );
                    })}
                  </div>
                </div>
              )}
            />

            <Ariakit.CompositeItem
              store={grid}
              id={activeId && list2.includes(activeId) ? activeId : list2[0]}
              render={({ role, ...props }) => (
                <div role="gridcell">
                  <div
                    role="listbox"
                    className="combobox-list"
                    // aria-label="Que que isso mano"
                  >
                    {list2.map((value) => {
                      const isActive = props.id === value;
                      return (
                        <Ariakit.ComboboxItem
                          key={value}
                          {...(isActive ? props : {})}
                          role="option"
                          value={value}
                          className="combobox-item"
                          id={value}
                          rowId={value}
                          store={combobox}
                          shouldRegisterItem={
                            !!groupId && list2.includes(groupId)
                          }
                        />
                      );
                    })}
                  </div>
                </div>
              )}
            />
          </Ariakit.CompositeRow>
        </Ariakit.Composite>
      </Ariakit.ComboboxPopover>
    </Ariakit.ComboboxProvider>
  );
}
