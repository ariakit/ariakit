import {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  HTMLAttributes,
  RefAttributes,
  createContext,
  forwardRef,
  useContext,
  useEffect,
} from "react";
import { cx } from "ariakit-utils/misc";
import {
  Combobox,
  ComboboxItem,
  ComboboxList,
  useComboboxState,
} from "ariakit/combobox";
import {
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  useMenuState,
} from "ariakit/menu";
import {
  Select,
  SelectItem,
  SelectPopover,
  useSelectState,
} from "ariakit/select";
import Link from "next/link";

const SelectContext = createContext(false);
const ComboboxContext = createContext(false);
const MenuContext = createContext(false);

type PageMenuProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  defaultList?: string[];
  value?: string;
  onMatch?: (matches: string[]) => void;
};

export const PageMenu = forwardRef<HTMLButtonElement, PageMenuProps>(
  ({ defaultList, value, children, onMatch, ...props }, ref) => {
    const combobox = useComboboxState({ defaultList });
    const { value: _, setValue, ...selectProps } = combobox;
    const select = useSelectState({ value, ...selectProps });
    const menu = useMenuState(select);
    const isSubmenu = useContext(MenuContext);

    useEffect(() => {
      onMatch?.(combobox.matches);
    }, [combobox.matches]);

    const renderButton = (
      props: HTMLAttributes<HTMLButtonElement> &
        RefAttributes<HTMLButtonElement>
    ) => <MenuItem focusOnHover={false} as="button" {...props} />;

    const renderPopover = (
      props: HTMLAttributes<HTMLDivElement> & RefAttributes<HTMLDivElement>
    ) => (
      <div
        {...props}
        className={cx(
          "max-h-[var(--popover-available-height)] overflow-auto",
          "flex flex-col z-50 bg-canvas-5 dark:bg-canvas-5-dark",
          "rounded-lg drop-shadow-lg dark:drop-shadow-lg-dark",
          "p-2 border border-solid border-canvas-5 dark:border-canvas-5-dark"
        )}
      />
    );

    const button =
      value != null ? (
        <Select state={select}>
          {(props) => renderButton({ ...props, children: select.value })}
        </Select>
      ) : (
        <MenuButton showOnHover={false} state={menu}>
          {renderButton}
        </MenuButton>
      );

    if (value != null) {
      if (defaultList) {
        return (
          <>
            {button}
            <SelectContext.Provider value={true}>
              {select.mounted && (
                <SelectPopover state={select} composite={false}>
                  {(props) =>
                    renderPopover({
                      ...props,
                      children: (
                        <>
                          <div className="bg-inherit sticky top-0 mb-2 w-fit pt-2">
                            <Combobox state={combobox} />
                          </div>
                          <ComboboxContext.Provider value={true}>
                            <ComboboxList state={combobox}>
                              {children}
                            </ComboboxList>
                          </ComboboxContext.Provider>
                        </>
                      ),
                    })
                  }
                </SelectPopover>
              )}
            </SelectContext.Provider>
          </>
        );
      }
      return (
        <>
          {button}
          <SelectContext.Provider value={true}>
            <SelectPopover state={select}>
              {(props) => (
                <MenuList state={menu} {...props}>
                  {(props) => renderPopover({ ...props, children })}
                </MenuList>
              )}
            </SelectPopover>
          </SelectContext.Provider>
        </>
      );
    }

    return null;
  }
);

type PageMenuItemProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string;
  value?: string;
};

export const PageMenuItem = forwardRef<HTMLAnchorElement, PageMenuItemProps>(
  ({ children, value, href, ...props }, ref) => {
    const select = useContext(SelectContext);
    const combobox = useContext(ComboboxContext);

    type Props = HTMLAttributes<HTMLAnchorElement> &
      RefAttributes<HTMLAnchorElement>;

    const renderLink = (props: Props) => (
      <Link href={href}>
        <a
          {...props}
          className={cx(
            "outline-none flex items-center gap-2 rounded p-2 scroll-m-2",
            "active:bg-primary-2-hover dark:active:bg-primary-2-dark-hover",
            "active-item:text-primary-2 dark:active-item:text-primary-2-dark",
            "active-item:bg-primary-2 dark:active-item:bg-primary-2-dark",
            props.className
          )}
        >
          {children}
        </a>
      </Link>
    );

    const renderSelectItem = (props: Props) => (
      <SelectItem as="a" {...props} value={value}>
        {renderLink}
      </SelectItem>
    );

    const renderComboboxItem = (props: Props) => (
      <ComboboxItem as="a" {...props} focusOnHover>
        {select ? renderSelectItem : renderLink}
      </ComboboxItem>
    );

    if (combobox) {
      return renderComboboxItem({ ...props, ref });
    }

    if (select) {
      return renderSelectItem({ ...props, ref });
    }

    return (
      <MenuItem as="a" {...props} ref={ref}>
        {renderLink}
      </MenuItem>
    );
  }
);
