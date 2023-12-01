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

    // TODO: Put focusOnHover here.
    const defaultProps: typeof props = {
      ref,
      ...props,
      className: clsx("menu-item", props.className),
    };

    if (searchable) {
      return <Ariakit.ComboboxItem focusOnHover {...defaultProps} />;
    }
    return <Ariakit.MenuItem {...defaultProps} />;
  },
);

export interface MenuProps extends Ariakit.MenuButtonProps<"div"> {
  label: React.ReactNode;
  children?: React.ReactNode;
  searchValue?: string;
  onSearch?: (value: string) => void;
}

export const Menu = React.forwardRef<HTMLDivElement, MenuProps>(function Menu(
  { label, searchValue, onSearch, children, ...props },
  ref,
) {
  const parentMenu = Ariakit.useMenuContext();
  const searchable = searchValue != null || !!onSearch;

  const menuItem = parentMenu ? (
    <MenuItem render={props.render} hideOnClick={false} />
  ) : undefined;

  const menuItems = searchable ? (
    <>
      <Ariakit.Combobox autoSelect className="combobox" />
      <Ariakit.ComboboxList className="combobox-list">
        {children}
      </Ariakit.ComboboxList>
    </>
  ) : (
    children
  );

  const element = (
    <Ariakit.MenuProvider>
      <Ariakit.MenuButton
        ref={ref}
        {...props}
        className={clsx(!parentMenu && "button", props.className)}
        render={menuItem}
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
          {menuItems}
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
