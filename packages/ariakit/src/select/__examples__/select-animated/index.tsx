import {
  Select,
  SelectItem,
  SelectLabel,
  SelectPopover,
  useSelectStore,
} from "ariakit/select/store";
import "./style.css";

export default function Example() {
  const select = useSelectStore({
    defaultValue: "Apple",
    animated: true,
    sameWidth: true,
    gutter: 4,
  });
  const mounted = select.useState("mounted");
  return (
    <div className="wrapper">
      <SelectLabel store={select}>Favorite fruit</SelectLabel>
      <Select store={select} className="select" />
      {mounted && (
        <SelectPopover store={select} portal className="popover">
          <SelectItem className="select-item" value="Apple" />
          <SelectItem className="select-item" value="Banana" />
          <SelectItem className="select-item" value="Grape" />
          <SelectItem className="select-item" value="Orange" />
        </SelectPopover>
      )}
    </div>
  );
}
