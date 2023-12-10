import * as React from "react";
import * as Ariakit from "@ariakit/react";
import clsx from "clsx";

const SearchableContext = React.createContext(false);

export interface MenuItemProps
  extends Omit<Ariakit.ComboboxItemProps, "store"> {
  name?: string;
  children?: React.ReactNode;
}

export const MenuItem = React.forwardRef<HTMLDivElement, MenuItemProps>(
  function MenuItem({ name, value, ...props }, ref) {
    const menu = Ariakit.useMenuContext();
    if (!menu) {
      throw new Error("MenuItem must be used inside a Menu");
    }

    const searchable = React.useContext(SearchableContext);
    const defaultProps = {
      ref,
      focusOnHover: true,
      blurOnHoverEnd: false,
      ...props,
      className: clsx("menu-item", props.className),
    } satisfies typeof props;

    const checkable = menu.useState((state) => {
      if (!name) return false;
      if (value == null) return false;
      return state.values[name] != null;
    });

    const checked = menu.useState((state) => {
      if (!name) return false;
      return state.values[name] === value;
    });

    if (checkable) {
      defaultProps.children = (
        <React.Fragment>
          <span className="label">{defaultProps.children}</span>
          <Ariakit.MenuItemCheck checked={checked} />
        </React.Fragment>
      );
    }

    if (!searchable) {
      if (name != null && value != null) {
        return (
          <Ariakit.MenuItemRadio
            {...defaultProps}
            name={name}
            value={value}
            hideOnClick
          />
        );
      }
      return <Ariakit.MenuItem {...defaultProps} />;
    }

    if (checkable) {
      defaultProps["aria-selected"] = checked;
    }

    return (
      <Ariakit.ComboboxItem
        {...defaultProps}
        value={value}
        setValueOnClick={false}
        selectValueOnClick={() => {
          if (name == null || value == null) return false;
          menu.setValue(name, value);
          return true;
        }}
        hideOnClick={(event) => {
          const expandable = event.currentTarget.hasAttribute("aria-expanded");
          if (expandable) return false;
          menu?.hideAll();
          return true;
        }}
      />
    );
  },
);

export interface MenuSeparatorProps extends Ariakit.MenuSeparatorProps {}

export const MenuSeparator = React.forwardRef<
  HTMLHRElement,
  MenuSeparatorProps
>(function MenuSeparator(props, ref) {
  return (
    <Ariakit.MenuSeparator
      ref={ref}
      {...props}
      className={clsx("separator", props.className)}
    />
  );
});

export interface MenuGroupProps extends Ariakit.MenuGroupProps {
  label?: React.ReactNode;
  children?: React.ReactNode;
}

export const MenuGroup = React.forwardRef<HTMLDivElement, MenuGroupProps>(
  function MenuGroup({ label, ...props }, ref) {
    return (
      <Ariakit.MenuGroup
        ref={ref}
        {...props}
        className={clsx("group", props.className)}
      >
        {label && (
          <Ariakit.MenuGroupLabel className="group-label">
            {label}
          </Ariakit.MenuGroupLabel>
        )}
        {props.children}
      </Ariakit.MenuGroup>
    );
  },
);

export interface MenuProps extends Ariakit.MenuButtonProps<"div"> {
  label?: React.ReactNode;
  children?: React.ReactNode;
  values?: Record<string, string>;
  onValuesChange?: (values: Record<string, string>) => void;
  searchValue?: string;
  onSearch?: (value: string) => void;
  combobox?: Ariakit.ComboboxProps["render"];
  trigger?: Ariakit.MenuButtonProps["render"];
}

export const Menu = React.forwardRef<HTMLDivElement, MenuProps>(function Menu(
  {
    label,
    children,
    values,
    onValuesChange,
    searchValue,
    onSearch,
    combobox,
    trigger,
    ...props
  },
  ref,
) {
  const parent = Ariakit.useMenuContext();
  const searchable = searchValue != null || !!onSearch || !!combobox;

  const element = (
    <Ariakit.MenuProvider
      showTimeout={100}
      placement={parent ? "right" : "left"}
      values={values}
      setValues={onValuesChange}
    >
      <Ariakit.MenuButton
        ref={ref}
        {...props}
        className={clsx(!parent && "button", props.className)}
        render={parent ? <MenuItem render={trigger} /> : trigger}
      >
        <span className="label">{label}</span>
        <Ariakit.MenuButtonArrow />
      </Ariakit.MenuButton>
      <Ariakit.Menu portal overlap unmountOnHide className="menu">
        <SearchableContext.Provider value={searchable}>
          {searchable ? (
            <React.Fragment>
              <Ariakit.Combobox
                autoSelect
                render={combobox}
                className="combobox"
              />
              <Ariakit.ComboboxList className="combobox-list">
                {children}
              </Ariakit.ComboboxList>
            </React.Fragment>
          ) : (
            children
          )}
        </SearchableContext.Provider>
      </Ariakit.Menu>
    </Ariakit.MenuProvider>
  );

  if (searchable) {
    return (
      <Ariakit.ComboboxProvider
        resetValueOnHide
        focusWrap={false}
        includesBaseElement={false}
        value={searchValue}
        setValue={onSearch}
      >
        {element}
      </Ariakit.ComboboxProvider>
    );
  }

  return element;
});
