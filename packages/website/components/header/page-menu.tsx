import {
  ButtonHTMLAttributes,
  ComponentPropsWithRef,
  HTMLAttributes,
  ReactNode,
  RefAttributes,
  createContext,
  forwardRef,
  useContext,
} from "react";
import { cx } from "ariakit-utils/misc";
import {
  Combobox,
  ComboboxItem,
  ComboboxList,
  useComboboxState,
} from "ariakit/combobox";
import { Menu, MenuButton, MenuItem, useMenuState } from "ariakit/menu";
import {
  Select,
  SelectItem,
  SelectPopover,
  useSelectState,
} from "ariakit/select";
import Link from "next/link";
import useIdle from "../../utils/use-idle-state";

const className = {
  button: (...cls: string[]) =>
    cx(
      "flex h-8 gap-2 px-3 items-center justify-center",
      "whitespace-nowrap cursor-pointer",
      "border-none rounded-lg",
      "hover:bg-black/5 dark:hover:bg-white/5",
      "aria-expanded:bg-black/10 dark:aria-expanded:bg-white/10",
      ...cls
    ),
  popover: (...cls: string[]) =>
    cx(
      "flex flex-col z-50",
      "overflow-hidden",
      "max-h-[min(var(--popover-available-height,600px),600px)]",
      "rounded-lg shadow-lg dark:shadow-lg-dark",
      "bg-canvas-4 dark:bg-canvas-4-dark",
      "border border-solid border-canvas-4 dark:border-canvas-4-dark",
      ...cls
    ),
  popoverScroller: (...cls: string[]) =>
    cx(
      "flex flex-col p-2",
      "overflow-auto overscroll-contain",
      "bg-[color:inherit]",
      ...cls
    ),
  comboboxWrapper: (...cls: string[]) =>
    cx(
      "sticky top-0 w-full mb-2 pt-2 z-50",
      "rounded-b",
      "bg-[color:inherit]",
      ...cls
    ),
  combobox: (...cls: string[]) =>
    cx(
      "h-10 px-4 w-full text-base",
      "rounded border-none",
      "text-canvas-1 dark:text-canvas-1-dark",
      "bg-canvas-1 dark:bg-canvas-1-dark",
      "hover:bg-canvas-1 dark:hover:bg-canvas-1-dark-hover",
      "shadow-input dark:shadow-input-dark",
      "focus-visible:ariakit-outline-input",
      ...cls
    ),
  comboboxList: (...cls: string[]) =>
    cx("flex flex-col bg-[color:inherit]", ...cls),
  item: (...cls: string[]) =>
    cx(
      "flex items-center gap-2 rounded p-2 scroll-m-2",
      "outline-none cursor-pointer",
      "active-item:bg-primary-1 dark:active-item:bg-primary-2-dark/25",
      "active:bg-primary-1-hover dark:active:bg-primary-2-dark-hover/25",
      ...cls
    ),
};

const popoverSizes = {
  sm: "w-[240px]",
  md: "w-[320px]",
  lg: "w-[480px]",
};

const SelectContext = createContext(false);
const ComboboxContext = createContext(false);
const MenuContext = createContext(false);

type PageMenuProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  label?: ReactNode;
  defaultList?: string[];
  value?: string;
  onChange?: (value: string) => void;
  searchValue?: string;
  onSearch?: (value: string) => void;
  searchPlaceholder?: string;
  size?: "sm" | "md" | "lg";
};

export const PageMenu = forwardRef<HTMLButtonElement, PageMenuProps>(
  (
    {
      children,
      label,
      defaultList,
      value,
      onChange,
      searchValue,
      onSearch,
      searchPlaceholder,
      size = "md",
      ...props
    },
    ref
  ) => {
    const combobox = useComboboxState({
      gutter: 8,
      value: searchValue,
      setValue: (value) => {
        if (value !== combobox.value && onSearch) {
          onSearch(value);
        }
      },
    });
    const select = useSelectState({
      ...combobox,
      value,
      setValue: (value) => {
        if (value !== select.value && onChange) {
          onChange(value);
        }
      },
    });
    const menu = useMenuState(select);
    const withinMenu = useContext(MenuContext);
    const idle = useIdle();

    const selectable = value != null;
    const searchable = searchValue != null;

    const renderButton = (props: HTMLAttributes<HTMLElement>) =>
      withinMenu ? (
        <PageMenuItem {...props} />
      ) : (
        <button {...props} className={className.button()} />
      );

    const renderPopover = (props: ComponentPropsWithRef<"div">) => (
      <div {...props} className={className.popover(popoverSizes[size])}>
        <div
          role="presentation"
          className={className.popoverScroller(searchable ? "pt-0" : "")}
        >
          {searchable ? (
            <>
              <div className={className.comboboxWrapper()}>
                <Combobox
                  state={combobox}
                  placeholder={searchPlaceholder}
                  autoSelect
                  className={className.combobox()}
                />
              </div>
              <ComboboxContext.Provider value={true}>
                <ComboboxList
                  state={combobox}
                  className={className.comboboxList()}
                >
                  {children}
                </ComboboxList>
              </ComboboxContext.Provider>
            </>
          ) : (
            children
          )}
        </div>
      </div>
    );

    const button = selectable ? (
      <Select state={select} {...props} ref={ref}>
        {(props) => renderButton({ ...props, children: label ?? select.value })}
      </Select>
    ) : (
      <MenuButton state={menu} {...props} ref={ref}>
        {(props) => renderButton({ ...props, children: label })}
      </MenuButton>
    );

    const popover = selectable ? (
      <SelectContext.Provider value={true}>
        {(idle || select.mounted) && (
          <SelectPopover state={select} composite={!searchable}>
            {renderPopover}
          </SelectPopover>
        )}
      </SelectContext.Provider>
    ) : (
      <MenuContext.Provider value={true}>
        {(idle || menu.mounted) && (
          <Menu state={menu} composite={!searchable}>
            {renderPopover}
          </Menu>
        )}
      </MenuContext.Provider>
    );

    return (
      <>
        {button}
        {popover}
      </>
    );
  }
);

type PageMenuItemProps = HTMLAttributes<HTMLElement> & {
  href?: string;
  value?: string;
};

export const PageMenuItem = forwardRef<any, PageMenuItemProps>(
  ({ children, value, href, ...props }, ref) => {
    const select = useContext(SelectContext);
    const combobox = useContext(ComboboxContext);

    type Props = HTMLAttributes<HTMLElement> & RefAttributes<any>;

    const itemClassName = className.item(
      combobox ? "scroll-mt-14" : "",
      props.className || ""
    );

    const renderItem = (props: Props) =>
      href ? (
        <Link href={href}>
          <a {...props} className={itemClassName}>
            {children}
          </a>
        </Link>
      ) : (
        <div {...props} className={itemClassName}>
          {children}
        </div>
      );

    const renderSelectItem = (props: Props) => (
      <SelectItem {...props} value={value}>
        {renderItem}
      </SelectItem>
    );

    const renderComboboxItem = (props: Props) => (
      <ComboboxItem {...props} focusOnHover>
        {select ? renderSelectItem : renderItem}
      </ComboboxItem>
    );

    if (combobox) {
      return renderComboboxItem({ ...props, ref });
    }

    if (select) {
      return renderSelectItem({ ...props, ref });
    }

    return (
      <MenuItem {...props} ref={ref}>
        {renderItem}
      </MenuItem>
    );
  }
);
