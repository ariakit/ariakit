import * as React from "react";
import {
  unstable_useComboboxMenuGridState as useComboboxMenuGridState,
  unstable_Combobox as Combobox,
  unstable_ComboboxMenu as ComboboxMenu,
  unstable_ComboboxGridRow as ComboboxGridRow,
  unstable_ComboboxGridCell as ComboboxGridCell,
} from "reakit/Combobox";
import Block from "./Block";
import BlockGrid from "./BlockGrid";
import { data } from "./data";

type Props = Omit<React.InputHTMLAttributes<HTMLInputElement>, "list"> & {
  initialItems: typeof data;
};

function getValues(items: typeof data) {
  return items.map((item) => item.title);
}

function getIconFromValue(items: typeof data, value: string) {
  return items.find((item) => item.title === value)?.icon;
}

function onOptionClick(event: React.MouseEvent) {
  event.preventDefault();
}

function BlockList(
  { initialItems, ...props }: Props,
  ref: React.Ref<HTMLInputElement>
) {
  const initialValues = React.useMemo(() => getValues(initialItems), [
    initialItems,
  ]);
  const combobox = useComboboxMenuGridState({
    values: initialValues,
    limit: false,
    columns: 3,
    wrap: "horizontal",
    autoSelect: true,
    unstable_angular: true,
  });
  return (
    <>
      <Combobox
        {...combobox}
        {...props}
        ref={ref}
        aria-label="Block search"
        placeholder="Search for a block"
      />
      {combobox.inputValue ? (
        combobox.matches.length ? (
          <ComboboxMenu {...combobox} aria-label="Block suggestions">
            {combobox.matches.map((values, i) => (
              <ComboboxGridRow {...combobox} key={i}>
                {values.map((val) => (
                  <ComboboxGridCell
                    {...combobox}
                    as={Block}
                    key={val}
                    value={val}
                    title={val}
                    icon={getIconFromValue(initialItems, val)}
                    onClick={onOptionClick}
                  />
                ))}
              </ComboboxGridRow>
            ))}
          </ComboboxMenu>
        ) : (
          <span>No results found</span>
        )
      ) : (
        <BlockGrid
          aria-label="Blocks"
          items={data}
          onKeyDown={(event) => {
            const { key } = event;
            if (key && key.length === 1) {
              combobox.move(null);
              requestAnimationFrame(() => combobox.setInputValue(key));
            }
          }}
        />
      )}
      <footer>
        💡 Move through items with arrow key. Press any character to search.
      </footer>
    </>
  );
}

export default React.forwardRef(BlockList);
