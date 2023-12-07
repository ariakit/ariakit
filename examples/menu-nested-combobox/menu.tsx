import * as React from "react";
import * as Ariakit from "@ariakit/react";
import clsx from "clsx";

const SearchableContext = React.createContext(false);

export interface MenuItemProps
  extends Omit<Ariakit.MenuItemProps, "store">,
    Omit<Ariakit.ComboboxItemProps, "store"> {}

export const MenuItem = React.forwardRef<HTMLDivElement, MenuItemProps>(
  function MenuItem(props, ref) {
    const searchable = React.useContext(SearchableContext);
    const Component = searchable ? Ariakit.ComboboxItem : Ariakit.MenuItem;
    return (
      <Component
        ref={ref}
        focusOnHover
        blurOnHoverEnd={false}
        {...props}
        className={clsx("menu-item", props.className)}
      />
    );
  },
);

export interface MenuProps extends Ariakit.MenuButtonProps<"div"> {
  label?: React.ReactNode;
  trigger?: Ariakit.MenuButtonProps["render"];
  children?: React.ReactNode;
  searchValue?: string;
  onSearch?: (value: string) => void;
  combobox?: Ariakit.ComboboxProps["render"];
}

export const Menu = React.forwardRef<HTMLDivElement, MenuProps>(function Menu(
  { label, searchValue, onSearch, children, combobox, ...props },
  ref,
) {
  const parentMenu = Ariakit.useMenuContext();
  const searchable = searchValue != null || !!onSearch || !!combobox;

  const trigger = parentMenu ? (
    <MenuItem render={props.trigger} />
  ) : (
    props.trigger
  );

  const content = searchable ? (
    <>
      <Ariakit.Combobox autoSelect className="combobox" render={combobox} />
      <Ariakit.ComboboxList className="combobox-list">
        {children}
      </Ariakit.ComboboxList>
    </>
  ) : (
    children
  );

  const element = (
    <Ariakit.MenuProvider placement={parentMenu ? "right" : "left"}>
      <Ariakit.MenuButton
        ref={ref}
        {...props}
        render={trigger}
        className={clsx(!parentMenu && "button", props.className)}
      >
        <span className="label">{label}</span>
        <Ariakit.MenuButtonArrow />
      </Ariakit.MenuButton>
      <Ariakit.Menu
        gutter={8}
        portal
        unmountOnHide
        shift={parentMenu ? -9 : 0}
        className="menu"
      >
        <SearchableContext.Provider value={searchable}>
          {content}
        </SearchableContext.Provider>
      </Ariakit.Menu>
    </Ariakit.MenuProvider>
  );

  if (searchable) {
    return (
      <Ariakit.ComboboxProvider
        resetValueOnHide
        value={searchValue}
        setValue={onSearch}
      >
        {element}
      </Ariakit.ComboboxProvider>
    );
  }

  return element;
});
