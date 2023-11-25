import "./style.css";
import * as React from "react";
import * as Ariakit from "@ariakit/react";
import clsx from "clsx";
import { matchSorter } from "match-sorter";

const ComboboxContext = React.createContext<{
  matches?: string[];
  setList?: React.Dispatch<React.SetStateAction<string[]>>;
}>({});

export interface ComboboxProps extends Omit<Ariakit.ComboboxProps, "onChange"> {
  value?: Ariakit.ComboboxProviderProps["value"];
  onChange?: Ariakit.ComboboxProviderProps["setValue"];
  children?: React.ReactNode;
}

export const Combobox = React.forwardRef<HTMLInputElement, ComboboxProps>(
  function Combobox({ value, onChange, children, ...props }, ref) {
    const [list, setList] = React.useState<string[]>([]);

    const combobox = Ariakit.useComboboxStore({ value, setValue: onChange });
    const searchValue = combobox.useState("value");

    // Use deferred value to avoid lag when typing.
    const deferredValue = React.useDeferredValue(searchValue);

    // matchSorter may be expensive to run on every render, so we memoize it.
    const matches = React.useMemo(() => {
      return matchSorter(list, deferredValue);
    }, [list, deferredValue]);

    const contextValue = React.useMemo(() => ({ matches, setList }), [matches]);

    return (
      <>
        <Ariakit.Combobox
          ref={ref}
          store={combobox}
          {...props}
          className={clsx("combobox", props.className)}
        />
        <Ariakit.ComboboxPopover
          store={combobox}
          gutter={8}
          portal
          sameWidth
          unmountOnHide
          className="popover"
        >
          <ComboboxContext.Provider value={contextValue}>
            {children}
          </ComboboxContext.Provider>
        </Ariakit.ComboboxPopover>
      </>
    );
  },
);

export interface ComboboxItemProps extends Ariakit.ComboboxItemProps {}

export const ComboboxItem = React.forwardRef<HTMLDivElement, ComboboxItemProps>(
  function ComboboxItem({ value, ...props }, ref) {
    const { matches, setList } = React.useContext(ComboboxContext);

    // Add item to list when it mounts, remove it when it unmounts.
    React.useLayoutEffect(() => {
      if (!setList) return;
      if (value == null) return;
      setList((list) => [...list, value]);
      return () => {
        setList((list) => list.filter((v) => v !== value));
      };
    }, [setList, value]);

    const match = value != null && matches && matches?.includes(value);

    // If the item is not in the list, don't render it.
    if (!match) return null;

    return (
      <Ariakit.ComboboxItem
        ref={ref}
        focusOnHover
        blurOnHoverEnd={false}
        {...props}
        value={value}
        className={clsx("combobox-item", props.className)}
      />
    );
  },
);

export interface ComboboxEmptyProps extends Ariakit.RoleProps {}

export const ComboboxEmpty = React.forwardRef<
  HTMLDivElement,
  ComboboxEmptyProps
>(function ComboboxEmpty(props, ref) {
  const { matches } = React.useContext(ComboboxContext);

  if (matches?.length) return null;

  return (
    <Ariakit.Role
      ref={ref}
      {...props}
      className={clsx("no-results", props.className)}
    />
  );
});
