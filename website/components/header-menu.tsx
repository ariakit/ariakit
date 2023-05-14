"use client";

import type {
  ButtonHTMLAttributes,
  ComponentPropsWithRef,
  HTMLAttributes,
  MouseEvent,
  ReactNode,
  RefAttributes,
  RefObject,
} from "react";
import {
  Fragment,
  createContext,
  forwardRef,
  useContext,
  useEffect,
  useRef,
} from "react";
import { cx } from "@ariakit/core/utils/misc";
import {
  Combobox,
  ComboboxCancel,
  ComboboxItem,
  ComboboxList,
  useComboboxStore,
} from "@ariakit/react/combobox";
import {
  CompositeGroup,
  CompositeGroupLabel,
  CompositeSeparator,
} from "@ariakit/react/composite";
import {
  Menu,
  MenuButton,
  MenuButtonArrow,
  MenuItem,
  MenuList,
  useMenuStore,
} from "@ariakit/react/menu";
import { PopoverDismiss } from "@ariakit/react/popover";
import { Role } from "@ariakit/react/role";
import {
  Select,
  SelectItem,
  SelectPopover,
  useSelectStore,
} from "@ariakit/react/select";
import { VisuallyHidden } from "@ariakit/react/visually-hidden";
import {
  useEvent,
  useId,
  useSafeLayoutEffect,
} from "@ariakit/react-core/utils/hooks";
import { ChevronRight } from "icons/chevron-right.js";
import { NewWindow } from "icons/new-window.js";
import { Search } from "icons/search.js";
import { Spinner } from "icons/spinner.js";
import Link from "next/link.js";
import { afterTimeout } from "utils/after-timeout.js";
import { tw } from "utils/tw.js";
import { useIdle } from "utils/use-idle.js";
import { whenIdle } from "utils/when-idle.js";
import { Popup } from "./popup.js";

const style = {
  button: tw`
    flex items-center justify-center
    h-8 gap-2 px-3 overflow-hidden
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
  comboboxIcon: tw`
    absolute top-3 left-2 h-4 w-4 opacity-50
  `,
  combobox: tw`
    h-10 pl-[30px] pr-[50px] w-full
    text-base
    placeholder-black/60 dark:placeholder-white/[46%]
    rounded border-none
    text-black dark:text-white
    bg-gray-150/40 dark:bg-gray-850
    hover:bg-gray-150 dark:hover:bg-gray-900
    shadow-input dark:shadow-input-dark
    focus-visible:ariakit-outline-input
  `,
  comboboxCancel: tw`
    absolute top-2 right-2
    flex items-center justify-center
    h-6 p-2
    cursor-default
    border-none rounded-sm
    text-[10px]
    text-black/80 dark:text-white/80
    bg-black/10 dark:bg-white/10
    hover:bg-black/20 dark:hover:bg-white/20
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
    sticky
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
    rounded focus-visible:!outline-none
    active-item:bg-blue-200/40 dark:active-item:bg-blue-600/25
    active:bg-blue-200/70 dark:active:bg-blue-800/25
  `,
  itemDescription: tw`
    text-sm text-black/70 dark:text-white/70
    dark:[&_[data-autocomplete-value]]:text-white/[56%]
    [&_[data-user-value]]:font-semibold
    [&_[data-user-value]]:text-black dark:[&_[data-user-value]]:text-white
  `,
  itemIcon: tw`
    w-4 h-4
    stroke-black/75 dark:stroke-white/75 group-active-item:stroke-current
  `,
  itemThumbnail: tw`
    flex items-center justify-center flex-none
    w-16 h-16
    rounded-sm
    bg-gray-150 dark:bg-gray-800
    group-active-item:bg-black/[7.5%] dark:group-active-item:bg-black/70
  `,
  itemNestedThumbnail: tw`
    relative
    flex flex-col flex-none items-center justify-center
    w-16 h-16
    after:absolute after:-top-4 after:h-24 after:w-0.5 after:bg-black/10 after:dark:bg-white/10
  `,
  itemPathSegment: tw`
    truncate text-blue-700 dark:text-blue-400
    [&_[data-user-value]]:font-semibold
    [&_[data-user-value]]:text-blue-900 dark:[&_[data-user-value]]:text-blue-100
  `,
  separator: tw`
    w-full my-2 h-0
    border-t border-gray-250 dark:border-gray-550
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
const HasTitleContext = createContext(false);

type HeaderMenuProps = Omit<
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
  loading?: boolean;
  contentLabel?: string;
  hasTitle?: boolean;
  href?: string;
};

export const HeaderMenu = forwardRef<HTMLButtonElement, HeaderMenuProps>(
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
      loading = false,
      contentLabel,
      hasTitle,
      href,
      ...props
    },
    ref
  ) => {
    const popoverRef = useRef<HTMLDivElement>(null);
    const parent = useContext(ParentContext);
    const combobox = useComboboxStore({
      includesBaseElement: false,
      focusLoop: false,
      open,
      setOpen: (open) => {
        if (onToggle) {
          onToggle(open);
        }
      },
    });
    const select = useSelectStore({
      combobox,
      value,
      setValue: (value) => {
        if (onChange && typeof value === "string") {
          onChange(value);
        }
      },
    });
    const menu = useMenuStore({
      combobox,
      placement: parent ? "right-start" : "bottom-start",
    });

    const idle = useIdle();

    useSafeLayoutEffect(() => {
      return menu.syncBatch(
        (state) => {
          if (!parent && state.open) {
            menu.setAutoFocusOnShow(true);
          }
        },
        ["open", "autoFocusOnShow"]
      );
    }, [parent, menu]);

    useSafeLayoutEffect(() => {
      return select.sync(
        (state) => {
          if (!parent) {
            menu.setDisclosureElement(state.selectElement);
            select.setDisclosureElement(state.selectElement);
            combobox.setDisclosureElement(state.selectElement);
          }
        },
        ["selectElement", "disclosureElement"]
      );
    }, [parent, menu, select, combobox]);

    const selectable = value != null || !!onChange;
    const searchable = searchValue != null || !!onSearch;
    const onSearchProp = useEvent(onSearch);

    useSafeLayoutEffect(() => {
      if (searchValue != null) {
        combobox.setValue(searchValue);
      }
    }, [searchValue, combobox]);

    const comboboxValue = combobox.useState("value");

    useEffect(() => {
      if (comboboxValue === searchValue) return;
      if (process.env.NODE_ENV === "development") {
        return afterTimeout(500, () => onSearchProp(comboboxValue));
      }
      return whenIdle(() => onSearchProp(comboboxValue), 500);
    }, [comboboxValue, searchValue, onSearchProp]);

    const footerElement = footer && (
      <div className={style.footer}>{footer}</div>
    );

    const renderButton = (props: HTMLAttributes<HTMLElement>) =>
      parent ? (
        <HeaderMenuItem
          {...props}
          href={href}
          value={itemValue}
          className={cx("justify-between", props.className)}
        >
          {props.children}
          <MenuButtonArrow />
        </HeaderMenuItem>
      ) : (
        <button {...props} className={cx(style.button, props.className)} />
      );

    const renderPopover = (props: ComponentPropsWithRef<"div">) => (
      <Popup
        {...props}
        aria-label={contentLabel}
        aria-busy={loading}
        className={popoverSizes[size]}
        renderScoller={(props) => (
          <div
            {...props}
            className={cx(
              props.className,
              searchable && "pt-0",
              !!footer && "pb-0"
            )}
          />
        )}
      >
        {searchable ? (
          <>
            <div className={style.comboboxWrapper}>
              <div className="relative">
                {loading ? (
                  <Spinner className={cx(style.comboboxIcon, "animate-spin")} />
                ) : (
                  <Search className={style.comboboxIcon} />
                )}
                <Combobox
                  store={combobox}
                  placeholder={searchPlaceholder}
                  autoSelect={autoSelect}
                  className={style.combobox}
                />
                <ComboboxCancel
                  store={combobox}
                  as={PopoverDismiss}
                  aria-label="Cancel search"
                  className={style.comboboxCancel}
                >
                  ESC
                </ComboboxCancel>
              </div>
            </div>
            <ComboboxContext.Provider value={true}>
              <ComboboxList
                store={combobox}
                aria-label={contentLabel}
                className={style.comboboxList}
              >
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
      </Popup>
    );

    const selectChildren = select.useState((state) => label ?? state.value);

    const button = selectable ? (
      <Select store={select} {...props} ref={ref} render={renderButton}>
        {selectChildren}
      </Select>
    ) : (
      <MenuButton store={menu} {...props} ref={ref} render={renderButton}>
        {label}
      </MenuButton>
    );

    const selectMounted = select.useState((state) => idle || state.mounted);
    const menuMounted = menu.useState((state) => idle || state.mounted);

    const popover = selectable ? (
      <SelectContext.Provider value={true}>
        {selectMounted && (
          <SelectPopover
            ref={popoverRef}
            store={select}
            typeahead={!searchable}
            composite={!searchable}
            fixed
            fitViewport
            gutter={4}
            render={(props) => (
              <MenuList
                {...props}
                store={menu}
                typeahead={false}
                composite={false}
                render={renderPopover}
              />
            )}
          />
        )}
      </SelectContext.Provider>
    ) : (
      <SelectContext.Provider value={false}>
        {menuMounted && (
          <Menu
            store={menu}
            ref={popoverRef}
            fixed
            fitViewport
            gutter={4}
            portal
            typeahead={!searchable}
            composite={!searchable}
            getAnchorRect={(anchor) => {
              if (parent?.current) {
                return parent.current.getBoundingClientRect();
              }
              if (!anchor) return null;
              return anchor.getBoundingClientRect();
            }}
            render={renderPopover}
          />
        )}
      </SelectContext.Provider>
    );

    return (
      <FooterContext.Provider value={!!footer}>
        <HideAllContext.Provider value={menu.hideAll}>
          <ParentContext.Provider value={popoverRef}>
            <HasTitleContext.Provider value={!!hasTitle}>
              {button}
              {popover}
            </HasTitleContext.Provider>
          </ParentContext.Provider>
        </HideAllContext.Provider>
      </FooterContext.Provider>
    );
  }
);

type HeaderMenuGroupProps = HTMLAttributes<HTMLDivElement> & {
  label?: string;
};

export const HeaderMenuGroup = forwardRef<HTMLDivElement, HeaderMenuGroupProps>(
  ({ children, label, ...props }, ref) => {
    const hasTitle = useContext(HasTitleContext);
    return (
      <GroupContext.Provider value={label || true}>
        <CompositeGroup
          {...props}
          ref={ref}
          className={cx(style.group, props.className)}
        >
          {label && (
            <CompositeGroupLabel
              className={cx(
                style.groupLabel,
                hasTitle ? "top-[105px]" : "top-12"
              )}
            >
              {label}
            </CompositeGroupLabel>
          )}
          {children}
        </CompositeGroup>
      </GroupContext.Provider>
    );
  }
);

type HeaderMenuItemProps = HTMLAttributes<HTMLElement> & {
  href?: string;
  value?: string;
  title?: string;
  thumbnail?: ReactNode;
  description?: ReactNode;
  path?: ReactNode[];
  nested?: boolean;
  autoFocus?: boolean;
};

export const HeaderMenuItem = forwardRef<any, HeaderMenuItemProps>(
  (
    {
      children,
      value,
      title,
      thumbnail,
      description,
      path,
      nested,
      autoFocus,
      ...props
    },
    ref
  ) => {
    const id = useId();
    const hasTitle = useContext(HasTitleContext);
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
          aria-labelledby={`${id}-label`}
          aria-describedby={`${id}-path ${id}-description`}
          className={cx(
            style.item,
            combobox &&
              (group
                ? hasTitle
                  ? "scroll-mt-[145px]"
                  : "scroll-mt-[88px]"
                : hasTitle
                ? "scroll-mt-[113px]"
                : "scroll-mt-14"),
            !!thumbnail && "!items-start !gap-4 !p-4",
            !!footer && "scroll-mb-14",
            isExternalLink && "justify-between",
            props.className
          )}
        >
          {children}
          {!nested && thumbnail && (
            <div aria-hidden className={style.itemThumbnail}>
              {thumbnail}
            </div>
          )}
          {nested && <div className={style.itemNestedThumbnail} />}
          {description || thumbnail ? (
            <div className="flex min-w-0 flex-col">
              <span
                id={`${id}-label`}
                className="truncate font-semibold tracking-wide"
              >
                {title}
              </span>
              {path && (
                <span
                  id={`${id}-path`}
                  aria-hidden
                  className="flex items-center text-sm"
                >
                  <VisuallyHidden>In </VisuallyHidden>
                  {path.map(
                    (item, i) =>
                      item && (
                        <Fragment key={i}>
                          {i > 0 && (
                            <ChevronRight
                              aria-label="/"
                              className="h-3 w-3 opacity-50"
                            />
                          )}
                          <span
                            key={i}
                            className={cx(
                              style.itemPathSegment,
                              i === path.length - 1 && "flex-none"
                            )}
                          >
                            {item}
                          </span>
                        </Fragment>
                      )
                  )}
                  <VisuallyHidden>.</VisuallyHidden>
                </span>
              )}
              <span
                id={`${id}-description`}
                aria-hidden
                className={cx(
                  style.itemDescription,
                  path ? "truncate" : "line-clamp-2"
                )}
              >
                {description}
              </span>
            </div>
          ) : (
            isExternalLink && <NewWindow className={style.itemIcon} />
          )}
        </Role>
      );
      if (isLink && !isExternalLink) {
        return (
          <Link href={href} legacyBehavior>
            {item}
          </Link>
        );
      }
      return item;
    };

    const hideOnClick = (event: MouseEvent) => {
      const popupType = event.currentTarget.getAttribute("aria-haspopup");
      if (popupType === "dialog" && !href) return false;
      if (!hideAll) return true;
      hideAll();
      return false;
    };

    const renderSelectItem = (props: Props) => (
      <SelectItem
        {...props}
        hideOnClick={hideOnClick}
        autoFocus={autoFocus}
        value={value}
      >
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

type HeaderMenuSeparator = HTMLAttributes<HTMLHRElement>;

export const HeaderMenuSeparator = forwardRef<
  HTMLHRElement,
  HeaderMenuSeparator
>((props, ref) => {
  return (
    <CompositeSeparator
      {...props}
      ref={ref}
      className={cx(style.separator, props.className)}
    />
  );
});
