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
  { value: "Mango", label: "Mango" },
  { value: "Nectarine", label: "Nectarine" },
  { value: "Orange", label: "Orange" },
  { value: "Papaya", label: "Papaya" },
  { value: "Quince", label: "Quince" },
  { value: "Raspberry", label: "Raspberry" },
  { value: "Strawberry", label: "Strawberry" },
  { value: "Tangerine", label: "Tangerine" },
  { value: "Ugli fruit", label: "Ugli fruit" },
  { value: "Watermelon", label: "Watermelon" },
];

export default function Example() {
  const select = useSelectState({
    gutter: 8,
    // animated: true,
    // fixed: true,
    // virtualFocus: false,
    // defaultValue: "Tangerine",
    setValueOnMove: true,
  });
  console.log(
    select.activeId,
    select.items.find((item) => item.id === select.activeId)?.ref.current
  );
  return (
    <div className="wrapper">
      <SelectLabel state={select}>Your favorite fruit</SelectLabel>
      <Select
        state={select}
        // moveOnKeyDown
        // showOnKeyDown={false}
        className="button"
      >
        {select.value}
        <SelectArrow />
      </Select>
      {select.mounted && (
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
      )}
    </div>
  );
}
