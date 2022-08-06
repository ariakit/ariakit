import {
  ButtonHTMLAttributes,
  ComponentPropsWithRef,
  HTMLAttributes,
  ReactNode,
  RefAttributes,
  RefObject,
  createContext,
  forwardRef,
  useContext,
  useEffect,
  useRef,
} from "react";
import { useEvent, useSafeLayoutEffect } from "ariakit-utils/hooks";
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
import NewWindow from "../icons/new-window";

const style = {
  button: tw`
    flex items-center justify-center
    h-8 gap-2 px-3
    whitespace-nowrap cursor-default
    border-none rounded-lg
    hover:bg-black/5 dark:hover:bg-white/5
    aria-expanded:bg-black/10 dark:aria-expanded:bg-white/10
    focus-visible:ariakit-outline-input
  `,
  popover: tw`
    flex flex-col
    overflow-hidden
    max-h-[min(var(--popover-available-height,600px),600px)]
    shadow-lg dark:shadow-lg-dark
    rounded-lg border border-solid border-canvas-4 dark:border-canvas-4-dark
    bg-canvas-4 dark:bg-canvas-4-dark
    transition-[width]
    z-50
  `,
  popoverScroller: tw`
    flex flex-col
    p-2
    overflow-auto overscroll-contain
    bg-[color:inherit]
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
    active-item:bg-primary-1 dark:active-item:bg-primary-2-dark/25
    active:bg-primary-1-hover dark:active:bg-primary-2-dark-hover/25
  `,
  itemDescription: tw`
    text-sm opacity-70
    overflow-hidden
    [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2]
  `,
  itemThumbnail: tw`
    flex items-center justify-center flex-none
    w-16 h-16
    rounded-sm
    bg-canvas-1 dark:bg-canvas-2-dark
    group-active-item:bg-white/50 dark:group-active-item:bg-black/70
  `,
  itemIcon: tw`
    w-4 h-4
    stroke-black/75 dark:stroke-white/75 group-active-item:stroke-current
  `,
  separator: tw`
    w-full my-2 h-0
    border-t border-canvas-4 dark:border-canvas-4-dark
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
};

const SelectContext = createContext(false);
const ComboboxContext = createContext(false);
const ParentContext = createContext<RefObject<HTMLElement> | null>(null);
const GroupContext = createContext<string | boolean>(false);
const FooterContext = createContext(false);

type PageMenuProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  label?: ReactNode;
  open?: boolean;
  onToggle?: (open: boolean) => void;
  value?: string;
  onChange?: (value: string) => void;
  searchValue?: string;
  onSearch?: (value: string) => void;
  searchPlaceholder?: string;
  size?: "sm" | "md" | "lg";
  footer?: ReactNode;
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
      ...props
    },
    ref
  ) => {
    const popoverRef = useRef<HTMLDivElement>(null);
    const parent = useContext(ParentContext);
    const combobox = useComboboxState({
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

    const renderButton = ({ role, ...props }: HTMLAttributes<HTMLElement>) =>
      parent ? (
        <PageMenuItem {...props} className="justify-between">
          {props.children}
          <MenuButtonArrow />
        </PageMenuItem>
      ) : (
        <button {...props} className={style.button} />
      );

    const renderPopover = (props: ComponentPropsWithRef<"div">) => (
      <div
        {...props}
        className={cx(
          style.popover,
          combobox.value ? popoverSizes["lg"] : popoverSizes[size]
        )}
      >
        <div
          role="presentation"
          className={cx(
            style.popoverScroller,
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
                  autoSelect
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
            composite={!searchable}
          >
            {(props) => (
              <MenuList {...props} state={menu} composite={false}>
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
            composite={!searchable}
            onKeyDown={(event) => {
              if (event.key === "Escape") {
                event.stopPropagation();
              }
            }}
          >
            {renderPopover}
          </Menu>
        )}
      </SelectContext.Provider>
    );

    return (
      <FooterContext.Provider value={!!footer}>
        <ParentContext.Provider value={popoverRef}>
          {button}
          {popover}
        </ParentContext.Provider>
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
  thumbnail?: ReactNode;
  description?: ReactNode;
};

export const PageMenuItem = forwardRef<any, PageMenuItemProps>(
  ({ children, value, thumbnail, description, ...props }, ref) => {
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
            !!thumbnail && "!pr-4 !gap-4 !items-start",
            !!footer && "scroll-mb-14",
            isExternalLink && "justify-between",
            props.className
          )}
        >
          {thumbnail && <div className={style.itemThumbnail}>{thumbnail}</div>}
          {description || thumbnail ? (
            <div className="flex flex-col">
              <span className="font-semibold">{children}</span>
              <span className={style.itemDescription}>{description}</span>
            </div>
          ) : (
            <>
              {children}
              {isExternalLink && <NewWindow className={style.itemIcon} />}
            </>
          )}
        </Role>
      );
      if (isLink && !isExternalLink) {
        return <Link href={href}>{item}</Link>;
      }
      return item;
    };

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

type PageMenuSeparator = HTMLAttributes<HTMLHRElement>;

export const PageMenuSeparator = forwardRef<HTMLHRElement, PageMenuSeparator>(
  (props, ref) => {
    return (
      <CompositeSeparator
        {...props}
        ref={ref}
        className={cx(style.separator, props.className)}
      />
    );
  }
);
