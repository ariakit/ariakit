import * as React from "react";
import * as Ariakit from "@ariakit/react";
import clsx from "clsx";

const SearchableContext = React.createContext(false);

export interface MenuItemProps extends Ariakit.ComboboxItemProps {}

export const MenuItem = React.forwardRef<HTMLDivElement, MenuItemProps>(
  function MenuItem(props, ref) {
    const searchable = React.useContext(SearchableContext);

    const defaultProps = {
      ref,
      focusOnHover: true,
      blurOnHoverEnd: false,
      ...props,
      className: clsx("menu-item", props.className),
    } satisfies typeof props;

    if (searchable) {
      return (
        <Ariakit.ComboboxRow>
          <Ariakit.ComboboxItem {...defaultProps} />
        </Ariakit.ComboboxRow>
      );
    }

    return <Ariakit.MenuItem {...defaultProps} />;
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
  const parent = Ariakit.useMenuContext();
  const searchable = searchValue != null || !!onSearch || !!combobox;

  const trigger = parent ? <MenuItem render={props.trigger} /> : props.trigger;

  const content = searchable ? (
    <React.Fragment>
      <Ariakit.Combobox autoSelect className="combobox" render={combobox} />
      <Ariakit.ComboboxList className="combobox-list" role="grid">
        {children}
      </Ariakit.ComboboxList>
    </React.Fragment>
  ) : (
    children
  );

  const element = (
    <Ariakit.MenuProvider placement={parent ? "right" : "left"}>
      <Ariakit.MenuButton
        ref={ref}
        {...props}
        render={trigger}
        className={clsx(!parent && "button", props.className)}
      >
        <span className="label">{label}</span>
        <Ariakit.MenuButtonArrow />
      </Ariakit.MenuButton>
      <Ariakit.Menu
        gutter={8}
        portal
        unmountOnHide
        shift={parent ? -9 : 0}
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
        focusWrap={false}
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
