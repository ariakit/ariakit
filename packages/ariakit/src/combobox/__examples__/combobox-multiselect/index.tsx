import { forwardRef, useLayoutEffect } from "react";
import { Button } from "ariakit/button";
import {
  Checkbox,
  CheckboxCheck,
  CheckboxProps,
  useCheckboxState,
} from "ariakit/checkbox";
import {
  Combobox,
  ComboboxItem,
  ComboboxItemProps,
  ComboboxLabel,
  ComboboxPopover,
  useComboboxState,
} from "ariakit/combobox";
import list from "./list";
import "./style.css";

type ComboboxCheckboxProps = Omit<ComboboxItemProps, "state"> & CheckboxProps;

const ComboboxCheckbox = forwardRef<HTMLInputElement, ComboboxCheckboxProps>(
  (props, ref) => {
    return (
      <Checkbox
        as={ComboboxItem}
        ref={ref}
        role="option"
        clickOnEnter
        {...props}
      >
        <CheckboxCheck />
        {props.children || props.value}
      </Checkbox>
    );
  }
);

export default function Example() {
  const combobox = useComboboxState({ gutter: 8, list });
  const checkbox = useCheckboxState({ defaultValue: ["Apple"] });
  useLayoutEffect(() => {
    combobox.render();
  }, [checkbox.value, combobox.render]);
  return (
    <div className="wrapper">
      <ComboboxLabel state={combobox}>Your favorite food</ComboboxLabel>
      <div className="tags">
        {checkbox.value.map((value) => (
          <Button
            className="button"
            key={value}
            onClick={() =>
              checkbox.setValue((prevValue) =>
                prevValue.filter((val) => val !== value)
              )
            }
          >
            {value} &times;
          </Button>
        ))}
      </div>
      <Combobox
        state={combobox}
        placeholder="e.g., Apple, Burger"
        className="combobox"
      />
      <ComboboxPopover state={combobox} className="popover">
        {combobox.matches.length ? (
          combobox.matches.map((value) => (
            <ComboboxCheckbox state={checkbox} key={value} value={value} />
          ))
        ) : (
          <div>No results found</div>
        )}
      </ComboboxPopover>
    </div>
  );
}
