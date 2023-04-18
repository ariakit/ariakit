import * as Ariakit from "@ariakit/react";
import "./style.css";

export default function Example() {
  const select = Ariakit.useSelectStore({
    defaultValue: "Apple",
    animated: true,
  });
  const mounted = select.useState("mounted");
  return (
    <div className="wrapper">
      <Ariakit.SelectLabel store={select}>Favorite fruit</Ariakit.SelectLabel>
      <Ariakit.Select store={select} className="select" />
      {mounted && (
        <Ariakit.SelectPopover
          store={select}
          portal
          gutter={4}
          sameWidth
          className="popover"
        >
          <Ariakit.SelectItem className="select-item" value="Apple" />
          <Ariakit.SelectItem className="select-item" value="Banana" />
          <Ariakit.SelectItem className="select-item" value="Grape" />
          <Ariakit.SelectItem className="select-item" value="Orange" />
        </Ariakit.SelectPopover>
      )}
    </div>
  );
}
