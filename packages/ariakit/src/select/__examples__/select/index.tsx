import { useId } from "react";
import {
  Select,
  SelectArrow,
  SelectItem,
  SelectItemCheck,
  SelectLabel,
  SelectPopover,
  useSelectState,
} from "ariakit/select";
import "./style.css";

const list = [
  { value: "Apple", label: "Apple" },
  { value: "Banana", label: "Banana" },
  { value: "Cherry", label: "Cherry" },
  { value: "Elderberry", label: "Elderberry" },
  { value: "Fig", label: "Fig" },
  { value: "Grape", label: "Grape", disabled: true },
  { value: "Huckleberry", label: "Huckleberry" },
  { value: "Jackfruit", label: "Jackfruit" },
  { value: "Kiwi", label: "Kiwi" },
  { value: "Lemon", label: "Lemon" },
];

export default function Example() {
  const select = useSelectState({
    gutter: 8,
    // defaultValue: "Grape",
    // setValueOnMove: true,
  });
  const id = useId();
  return (
    <div className="wrapper">
      <SelectLabel state={select}>Your favorite fruit</SelectLabel>
      <Select
        state={select}
        moveOnKeyDown
        showOnKeyDown={false}
        aria-labelledby={id}
        className="button"
      >
        {select.value}
        <SelectArrow />
      </Select>
      <SelectPopover state={select} className="popover">
        {list.map((item) => (
          <SelectItem
            key={item.value}
            value={item.value}
            disabled={item.disabled}
          >
            <SelectItemCheck />
            {item.label}
          </SelectItem>
        ))}
      </SelectPopover>
    </div>
  );
}
