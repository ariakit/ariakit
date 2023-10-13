import "./style.css";
import { useState } from "react";
import * as Ariakit from "@ariakit/react";

const fruits = ["Apple", "Banana", "Grape", "Orange"];

export default function Example() {
  const [controlledValues, setControlledValues] = useState(["Banana"]);
  const [parentValues, setParentValues] = useState(["Orange"]);

  const [controlledValue, setControlledValue] = useState("Banana");
  const [parentValue, setParentValue] = useState("Orange");

  const isChecked = (currentValue: string | string[], value: string) => {
    if (Array.isArray(currentValue)) return currentValue.includes(value);
    return currentValue === value;
  };

  const onChange =
    (setValue: typeof setControlledValue) => (event: React.SyntheticEvent) => {
      const element = event.target as HTMLInputElement;
      const { value, checked } = element;
      if (!value) return;
      if (value === "Apple") return;
      setValue((prev) => {
        if (checked) return value;
        return prev === value ? "" : prev;
      });
    };

  const onArrayChange =
    (setValue: typeof setControlledValues) => (event: React.SyntheticEvent) => {
      const element = event.target as HTMLInputElement;
      const { value, checked } = element;
      if (!value) return;
      if (value === "Apple") return;
      if (checked) {
        return setValue((prev) => [...prev, value]);
      }
      setValue((prev) => prev.filter((v) => v !== value));
    };

  return (
    <div className="wrapper">
      <Ariakit.MenuProvider setValues={(values) => console.log(values)}>
        <Ariakit.MenuButton className="button">
          Menu
          <Ariakit.MenuButtonArrow />
        </Ariakit.MenuButton>
        <Ariakit.Menu gutter={8} className="menu">
          {fruits.map((value) => (
            <Ariakit.MenuItemCheckbox
              key={value}
              name="checkboxControlled"
              value={value}
              className="menu-item"
              checked={isChecked(controlledValues, value)}
              onChange={onArrayChange(setControlledValues)}
              disabled={value === "Grape"}
            >
              <Ariakit.MenuItemCheck />
              {value} (checkboxControlled)
            </Ariakit.MenuItemCheckbox>
          ))}

          <Ariakit.MenuSeparator className="separator" />

          {fruits.map((value) => (
            <Ariakit.MenuItemCheckbox
              key={value}
              name="checkboxUncontrolled"
              value={value}
              className="menu-item"
              defaultChecked={value === "Banana" || value === "Grape"}
              disabled={value === "Grape"}
            >
              <Ariakit.MenuItemCheck />
              {value} (checkboxUncontrolled)
            </Ariakit.MenuItemCheckbox>
          ))}

          <Ariakit.MenuSeparator className="separator" />

          <div onClick={onArrayChange(setParentValues)}>
            {fruits.map((value) => (
              <Ariakit.MenuItemCheckbox
                key={value}
                name="checkboxParent"
                value={value}
                className="menu-item"
                checked={isChecked(parentValues, value)}
                disabled={value === "Grape"}
              >
                <Ariakit.MenuItemCheck />
                {value} (checkboxParent)
              </Ariakit.MenuItemCheckbox>
            ))}
          </div>

          <Ariakit.MenuSeparator className="separator" />

          {fruits.map((value) => (
            <Ariakit.MenuItemRadio
              key={value}
              name="radioControlled"
              value={value}
              className="menu-item"
              checked={isChecked(controlledValue, value)}
              onChange={onChange(setControlledValue)}
              disabled={value === "Grape"}
            >
              <Ariakit.MenuItemCheck />
              {value} (radioControlled)
            </Ariakit.MenuItemRadio>
          ))}

          <Ariakit.MenuSeparator className="separator" />

          {fruits.map((value) => (
            <Ariakit.MenuItemRadio
              key={value}
              name="radioUncontrolled"
              value={value}
              className="menu-item"
              defaultChecked={value === "Banana"}
              disabled={value === "Grape"}
            >
              <Ariakit.MenuItemCheck />
              {value} (radioUncontrolled)
            </Ariakit.MenuItemRadio>
          ))}

          <Ariakit.MenuSeparator className="separator" />

          <div onClick={onChange(setParentValue)}>
            {fruits.map((value) => (
              <Ariakit.MenuItemRadio
                key={value}
                name="radioParent"
                value={value}
                className="menu-item"
                checked={isChecked(parentValue, value)}
                disabled={value === "Grape"}
              >
                <Ariakit.MenuItemCheck />
                {value} (radioParent)
              </Ariakit.MenuItemRadio>
            ))}
          </div>
        </Ariakit.Menu>
      </Ariakit.MenuProvider>
    </div>
  );
}
