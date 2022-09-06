import {
  ButtonHTMLAttributes,
  ComponentPropsWithRef,
  Fragment,
  HTMLAttributes,
  MouseEvent,
  ReactNode,
  RefAttributes,
  RefObject,
  createContext,
  forwardRef,
  useContext,
  useEffect,
  useRef,
} from "react";
import { useEvent, useSafeLayoutEffect } from "ariakit-react-utils/hooks";
import { cx } from "ariakit-utils/misc";
import {
  Combobox,
  ComboboxItem,
  ComboboxList,
  useComboboxState,
} from "ariakit/combobox";
import {
  CompositeGroup,
  CompositeGroupLabel,
  CompositeSeparator,
} from "ariakit/composite";
import {
  Menu,
  MenuButton,
  MenuButtonArrow,
  MenuItem,
  MenuList,
  useMenuState,
} from "ariakit/menu";
import { Role } from "ariakit/role";
import {
  Select,
  SelectItem,
  SelectPopover,
  useSelectState,
} from "ariakit/select";
import Link from "next/link";
import tw from "../../utils/tw";
import useIdle from "../../utils/use-idle-state";
import whenIdle from "../../utils/when-idle";
import ChevronRight from "../icons/chevron-right";
import NewWindow from "../icons/new-window";
import {
  itemIconStyle,
  popoverScrollerStyle,
  popoverStyle,
  separatorStyle,
} from "./style";

const style = {
  button: tw`
    flex items-center justify-center
    h-8 gap-2 px-3
    whitespace-nowrap cursor-default
    border-none rounded-lg
    hover:bg-black/5 dark:hover:bg-white/5
    aria-expanded:bg-black/10 dark:aria-expanded:bg-white/10
    [&:focus-visible]:ariakit-outline-input
  `,
  comboboxWrapper: tw`
    sticky top-0
    w-full py-2
    rounded-b
    bg-[color:inherit]
    z-50
    [&:not(:focus-within)+*>[aria-expanded="true"]]:bg-black/[7.5%]
    dark:[&:not(:focus-within)+*>[aria-expanded="true"]]:bg-white/[7.5%]
  `,
  combobox: tw`
    h-10 px-4 w-full
    text-base
    placeholder-black/60 dark:placeholder-white/[46%]
    rounded border-none
    text-canvas-1 dark:text-canvas-1-dark
    bg-canvas-1/40 dark:bg-canvas-1-dark
    hover:bg-canvas-1 dark:hover:bg-canvas-1-dark-hover
    shadow-input dark:shadow-input-dark
    focus-visible:ariakit-outline-input
  `,
  comboboxList: tw`
    flex flex-col
    bg-[color:inherit]
  `,
  group: tw`
    bg-[color:inherit]
  `,
  groupLabel: tw`
    sticky top-12
    p-2 pt-3
    text-sm font-medium text-black/60 dark:text-white/50
    bg-[color:inherit]
    z-10
  `,
  item: tw`
    group
    flex items-center gap-2
    p-2 scroll-m-2
    cursor-default [a&]:cursor-pointer
    rounded outline-none
    active-item:bg-primary-1/70 dark:active-item:bg-primary-2-dark/25
    active:bg-primary-1-hover/70 dark:active:bg-primary-2-dark-hover/25
  `,
  itemDescription: tw`
    text-sm text-black/70 dark:text-white/70
    dark:[&_[data-autocomplete-value]]:text-white/[56%]
    [&_[data-user-value]]:font-semibold
    [&_[data-user-value]]:text-black dark:[&_[data-user-value]]:text-white
  `,
  itemThumbnail: tw`
    flex items-center justify-center flex-none
    w-16 h-16
    rounded-sm
    bg-canvas-1 dark:bg-canvas-2-dark
    group-active-item:bg-black/[7.5%] dark:group-active-item:bg-black/70
  `,
  itemNestedThumbnail: tw`
    relative
    flex flex-col flex-none items-center justify-center
    w-16 h-16
    after:absolute after:-top-4 after:h-24 after:w-0.5 after:bg-black/10 after:dark:bg-white/10
  `,
  itemPathSegment: tw`
    truncate text-link dark:text-link-dark
    [&_[data-user-value]]:font-semibold
    [&_[data-user-value]]:text-primary-1 dark:[&_[data-user-value]]:text-primary-1-dark
  `,
  footer: tw`
    sticky bottom-0
    py-2 max-h-[theme(spacing.14)] min-h-[theme(spacing.14)]
    bg-[color:inherit]
    z-40
  `,
};

const popoverSizes = {
  sm: tw`w-[240px]`,
  md: tw`w-[320px]`,
  lg: tw`w-[480px]`,
  xl: tw`w-[640px]`,
};

const SelectContext = createContext(false);
const ComboboxContext = createContext(false);
const ParentContext = createContext<RefObject<HTMLElement> | null>(null);
const GroupContext = createContext<string | boolean>(false);
const FooterContext = createContext(false);
const HideAllContext = createContext<(() => void) | null>(null);

type PageMenuProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "value" | "onChange"
> & {
  label?: ReactNode;
  open?: boolean;
  onToggle?: (open: boolean) => void;
  value?: string;
  onChange?: (value: string) => void;
  searchValue?: string;
  onSearch?: (value: string) => void;
  searchPlaceholder?: string;
  size?: "sm" | "md" | "lg" | "xl";
  footer?: ReactNode;
  itemValue?: string;
  autoSelect?: boolean;
};

export const PageMenu = forwardRef<HTMLButtonElement, PageMenuProps>(
  (
    {
      children,
      label,
      open,
      onToggle,
      value,
      onChange,
      searchValue,
      onSearch,
      searchPlaceholder,
      size = "md",
      footer,
      itemValue,
      autoSelect,
      ...props
    },
    ref
  ) => {
    const popoverRef = useRef<HTMLDivElement>(null);
    const parent = useContext(ParentContext);
    const combobox = useComboboxState({
      fitViewport: true,
      includesBaseElement: false,
      gutter: 4,
      open,
      setOpen: (open) => {
        if (open !== combobox.open && onToggle) {
          onToggle(open);
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
    const menu = useMenuState({
      ...select,
      fixed: true,
      placement: undefined,
      getAnchorRect: (anchor) => {
        if (parent?.current) {
          return parent.current.getBoundingClientRect();
        }
        if (!anchor) return null;
        return anchor.getBoundingClientRect();
      },
    });

    const idle = useIdle();

    if (!parent && menu.open && !menu.autoFocusOnShow) {
      menu.setAutoFocusOnShow(true);
      menu.setInitialFocus("first");
    }

    useEffect(() => {
      if (!parent) {
        menu.disclosureRef.current =
          select.disclosureRef.current =
          combobox.disclosureRef.current =
            menu.anchorRef.current;
      }
    });

    const selectable = value != null || !!onChange;
    const searchable = searchValue != null || !!onSearch;
    const onSearchProp = useEvent(onSearch);

    useSafeLayoutEffect(() => {
      if (searchValue != null) {
        combobox.setValue(searchValue);
      }
    }, [searchValue, combobox.setValue]);

    useEffect(() => {
      if (combobox.value === searchValue) return;
      return whenIdle(() => onSearchProp(combobox.value), 500);
    }, [combobox.value, searchValue, onSearchProp]);

    const footerElement = footer && (
      <div className={style.footer}>{footer}</div>
    );

    const renderButton = (props: HTMLAttributes<HTMLElement>) =>
      parent ? (
        <PageMenuItem {...props} value={itemValue} className="justify-between">
          {props.children}
          <MenuButtonArrow />
        </PageMenuItem>
      ) : (
        <button {...props} className={style.button} />
      );

    const renderPopover = (props: ComponentPropsWithRef<"div">) => (
      <div {...props} className={cx(popoverStyle, popoverSizes[size])}>
        <div
          role="presentation"
          className={cx(
            popoverScrollerStyle,
            searchable && "pt-0",
            !!footer && "pb-0"
          )}
        >
          {searchable ? (
            <>
              <div className={style.comboboxWrapper}>
                <Combobox
                  state={combobox}
                  placeholder={searchPlaceholder}
                  autoSelect={autoSelect}
                  className={style.combobox}
                />
              </div>
              <ComboboxContext.Provider value={true}>
                <ComboboxList state={combobox} className={style.comboboxList}>
                  {children}
                </ComboboxList>
              </ComboboxContext.Provider>
              {footerElement}
            </>
          ) : (
            <ComboboxContext.Provider value={false}>
              {children}
              {footerElement}
            </ComboboxContext.Provider>
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
          <SelectPopover
            ref={popoverRef}
            state={select}
            typeahead={!searchable}
            composite={!searchable}
          >
            {(props) => (
              <MenuList
                {...props}
                state={menu}
                typeahead={false}
                composite={false}
              >
                {renderPopover}
              </MenuList>
            )}
          </SelectPopover>
        )}
      </SelectContext.Provider>
    ) : (
      <SelectContext.Provider value={false}>
        {(idle || menu.mounted) && (
          <Menu
            state={menu}
            ref={popoverRef}
            portal
            typeahead={!searchable}
            composite={!searchable}
          >
            {renderPopover}
          </Menu>
        )}
      </SelectContext.Provider>
    );

    return (
      <FooterContext.Provider value={!!footer}>
        <HideAllContext.Provider value={menu.hideAll}>
          <ParentContext.Provider value={popoverRef}>
            {button}
            {popover}
          </ParentContext.Provider>
        </HideAllContext.Provider>
      </FooterContext.Provider>
    );
  }
);

type PageMenuGroupProps = HTMLAttributes<HTMLDivElement> & {
  label?: string;
};

export const PageMenuGroup = forwardRef<HTMLDivElement, PageMenuGroupProps>(
  ({ children, label, ...props }, ref) => {
    return (
      <GroupContext.Provider value={label || true}>
        <CompositeGroup
          {...props}
          ref={ref}
          className={cx(style.group, props.className)}
        >
          {label && (
            <CompositeGroupLabel className={style.groupLabel}>
              {label}
            </CompositeGroupLabel>
          )}
          {children}
        </CompositeGroup>
      </GroupContext.Provider>
    );
  }
);

type PageMenuItemProps = HTMLAttributes<HTMLElement> & {
  href?: string;
  value?: string;
  title?: string;
  thumbnail?: ReactNode;
  description?: ReactNode;
  path?: ReactNode[];
  nested?: boolean;
};

export const PageMenuItem = forwardRef<any, PageMenuItemProps>(
  (
    { children, value, title, thumbnail, description, path, nested, ...props },
    ref
  ) => {
    const hideAll = useContext(HideAllContext);
    const select = useContext(SelectContext);
    const combobox = useContext(ComboboxContext);
    const group = useContext(GroupContext);
    const footer = useContext(FooterContext);

    type Props = HTMLAttributes<HTMLElement> & RefAttributes<any>;
    const href = props.href;

    const renderItem = (props: Props) => {
      const isLink = !!href;
      const isExternalLink = isLink && href?.startsWith("http");

      const linkProps = {
        ...props,
        target: isExternalLink ? "_blank" : undefined,
      };

      const item = (
        <Role
          as={href ? "a" : "div"}
          {...linkProps}
          className={cx(
            style.item,
            combobox && (group ? "scroll-mt-[88px]" : "scroll-mt-14"),
            !!thumbnail && "!items-start !gap-4 !p-4",
            !!footer && "scroll-mb-14",
            isExternalLink && "justify-between",
            props.className
          )}
        >
          {children}
          {!nested && thumbnail && (
            <div className={style.itemThumbnail}>{thumbnail}</div>
          )}
          {nested && <div className={style.itemNestedThumbnail} />}
          {description || thumbnail ? (
            <div className="flex min-w-0 flex-col">
              <span className="font-semibold tracking-wide">{title}</span>
              {path && (
                <span className="flex items-center text-sm">
                  {path.map(
                    (item, i) =>
                      item && (
                        <Fragment key={i}>
                          {i > 0 && (
                            <ChevronRight className="h-3 w-3 opacity-50" />
                          )}
                          <span key={i} className={style.itemPathSegment}>
                            {item}
                          </span>
                        </Fragment>
                      )
                  )}
                </span>
              )}
              <span
                className={cx(
                  style.itemDescription,
                  path ? "truncate" : "truncate-[2]"
                )}
              >
                {description}
              </span>
            </div>
          ) : (
            isExternalLink && <NewWindow className={itemIconStyle} />
          )}
        </Role>
      );
      if (isLink && !isExternalLink) {
        return <Link href={href}>{item}</Link>;
      }
      return item;
    };

    const hideOnClick = (event: MouseEvent) => {
      const popupType = event.currentTarget.getAttribute("aria-haspopup");
      if (popupType === "dialog") return false;
      if (!hideAll) return true;
      hideAll();
      return false;
    };

    const renderSelectItem = (props: Props) => (
      <SelectItem {...props} hideOnClick={hideOnClick} value={value}>
        {renderItem}
      </SelectItem>
    );

    const renderComboboxItem = (props: Props) => (
      <ComboboxItem {...props} hideOnClick={hideOnClick} focusOnHover>
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

type PageMenuSeparator = HTMLAttributes<HTMLHRElement>;

export const PageMenuSeparator = forwardRef<HTMLHRElement, PageMenuSeparator>(
  (props, ref) => {
    return (
      <CompositeSeparator
        {...props}
        ref={ref}
        className={cx(separatorStyle, props.className)}
      />
    );
  }
);
