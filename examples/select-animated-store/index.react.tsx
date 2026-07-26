import * as Ariakit from "@ariakit/react";
import "./style.css";

export default function Example() {
  const select = Ariakit.useComboboxStore({
    defaultSelectedValue: "Apple",
  });
  const mounted = Ariakit.useStoreState(select, "mounted");
  return (
    <div className="wrapper">
      <Ariakit.ComboboxSelectLabel store={select}>
        Favorite fruit
      </Ariakit.ComboboxSelectLabel>
      <Ariakit.ComboboxSelect store={select} className="button" />
      {mounted && (
        <Ariakit.ComboboxPopover
          store={select}
          portal
          gutter={4}
          sameWidth
          className="popover"
        >
          <Ariakit.ComboboxItem className="select-item" value="Apple" />
          <Ariakit.ComboboxItem className="select-item" value="Banana" />
          <Ariakit.ComboboxItem className="select-item" value="Grape" />
          <Ariakit.ComboboxItem className="select-item" value="Orange" />
        </Ariakit.ComboboxPopover>
      )}
    </div>
  );
}
