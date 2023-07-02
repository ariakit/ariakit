"use client";

import type {
  ComponentPropsWithRef,
  ComponentPropsWithoutRef,
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
  useState,
} from "react";
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
import { twJoin } from "tailwind-merge";
import { whenIdle } from "utils/when-idle.js";
import { Popup } from "./popup.js";

const SelectContext = createContext(false);
const ComboboxContext = createContext(false);
const ParentContext = createContext<RefObject<HTMLElement> | null>(null);
const GroupContext = createContext<string | boolean>(false);
const FooterContext = createContext(false);
const HideAllContext = createContext<(() => void) | null>(null);
const HasTitleContext = createContext(false);

export interface HeaderMenuProps
  extends Omit<ComponentPropsWithoutRef<"button">, "value" | "onChange"> {
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
}

export const HeaderMenu = forwardRef<HTMLButtonElement, HeaderMenuProps>(
  function HeaderMenu(
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
  ) {
    const popoverRef = useRef<HTMLDivElement>(null);
    const parent = useContext(ParentContext);
    const combobox = useComboboxStore({
      includesBaseElement: false,
      focusLoop: false,
      open,
      setOpen: onToggle,
    });
    const select = useSelectStore({
      combobox,
      value,
      setValue(value) {
        if (typeof value !== "string") return;
        onChange?.(value);
      },
    });
    const menu = useMenuStore({
      combobox,
      showTimeout: 0,
      placement: parent ? "right-start" : "bottom-start",
    });

    useEffect(() => {
      return menu.syncBatch(
        (state) => {
          if (parent) return;
          if (!state.open) return;
          menu.setAutoFocusOnShow(true);
        },
        ["open", "autoFocusOnShow"]
      );
    }, [parent, menu]);

    useEffect(() => {
      return select.sync(
        (state) => {
          if (parent) return;
          menu.setDisclosureElement(state.selectElement);
          select.setDisclosureElement(state.selectElement);
          combobox.setDisclosureElement(state.selectElement);
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
      return whenIdle(() => onSearchProp(comboboxValue), 500);
    }, [comboboxValue, searchValue, onSearchProp]);

    const footerElement = footer && (
      <div
        className={twJoin(
          "sticky bottom-0 max-h-[theme(spacing.14)] min-h-[theme(spacing.14)] py-2",
          "z-40 bg-[color:inherit]"
        )}
      >
        {footer}
      </div>
    );

    const renderButton = (props: HTMLAttributes<HTMLElement>) =>
      parent ? (
        <HeaderMenuItem
          {...props}
          href={href}
          value={itemValue}
          className={twJoin("justify-between", props.className)}
        >
          {props.children}
          <MenuButtonArrow />
        </HeaderMenuItem>
      ) : (
        <button
          {...props}
          className={twJoin(
            "flex h-10 items-center justify-center gap-2 overflow-hidden px-3",
            "cursor-default whitespace-nowrap rounded-lg border-none",
            "hover:bg-black/5 dark:hover:bg-white/5",
            "aria-expanded:bg-black/10 dark:aria-expanded:bg-white/10",
            "[&:focus-visible]:ariakit-outline-input",
            props.className
          )}
        />
      );

    const renderPopover = (props: ComponentPropsWithRef<"div">) => (
      <Popup
        {...props}
        aria-label={contentLabel}
        aria-busy={loading}
        className={twJoin(
          size === "sm" && "max-w-[240px]",
          size === "md" && "max-w-[320px]",
          size === "lg" && "max-w-[480px]",
          size === "xl" && "max-w-[640px]"
        )}
        renderScroller={(props) => (
          <div
            {...props}
            className={twJoin(
              searchable && "pt-0",
              !!footer && "pb-0",
              props.className
            )}
          />
        )}
      >
        {searchable ? (
          <>
            <div
              className={twJoin(
                "sticky top-0 z-50 w-full rounded-b bg-[color:inherit] py-2",
                "[&:not(:focus-within)+*>[aria-expanded=true]]:bg-black/[7.5%]",
                "dark:[&:not(:focus-within)+*>[aria-expanded=true]]:bg-white/[7.5%]"
              )}
            >
              <div className="relative">
                {loading ? (
                  <Spinner className="absolute left-2 top-3 h-4 w-4 animate-spin opacity-50" />
                ) : (
                  <Search className="absolute left-2 top-3 h-4 w-4 opacity-50" />
                )}
                <Combobox
                  store={combobox}
                  placeholder={searchPlaceholder}
                  autoSelect={autoSelect}
                  className={twJoin(
                    "h-10 w-full pl-[30px] pr-[50px] text-base",
                    "placeholder-black/60 dark:placeholder-white/[46%]",
                    "rounded border-none",
                    "text-black dark:text-white",
                    "bg-gray-150/40 dark:bg-gray-850",
                    "hover:bg-gray-150 dark:hover:bg-gray-900",
                    "shadow-input dark:shadow-input-dark",
                    "focus-visible:ariakit-outline-input"
                  )}
                />
                <ComboboxCancel
                  store={combobox}
                  aria-label="Cancel search"
                  render={<PopoverDismiss />}
                  className={twJoin(
                    "absolute right-2 top-2 flex items-center justify-center",
                    "h-6 cursor-default rounded-sm border-none p-2",
                    "text-[10px] text-black/80 dark:text-white/80",
                    "bg-black/10 dark:bg-white/10",
                    "hover:bg-black/20 dark:hover:bg-white/20",
                    "focus-visible:ariakit-outline-input"
                  )}
                >
                  ESC
                </ComboboxCancel>
              </div>
            </div>
            <ComboboxContext.Provider value={true}>
              <ComboboxList
                store={combobox}
                aria-label={contentLabel}
                className="flex flex-col bg-[color:inherit]"
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

    const [canMount, setCanMount] = useState(false);
    const selectMounted = select.useState((state) => canMount || state.mounted);
    const menuMounted = menu.useState((state) => canMount || state.mounted);

    useEffect(() => {
      if (canMount) return;
      setCanMount(selectMounted || menuMounted);
    }, [canMount, selectMounted, menuMounted]);

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
            render={
              <MenuList
                store={menu}
                typeahead={false}
                composite={false}
                render={renderPopover}
              />
            }
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
            portal
            gutter={4}
            fitViewport
            typeahead={!searchable}
            composite={!searchable}
            render={renderPopover}
            getAnchorRect={(anchor) => {
              if (parent?.current) {
                return parent.current.getBoundingClientRect();
              }
              if (!anchor) return null;
              return anchor.getBoundingClientRect();
            }}
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

export interface HeaderMenuGroupProps extends ComponentPropsWithoutRef<"div"> {
  label?: string;
}

export const HeaderMenuGroup = forwardRef<HTMLDivElement, HeaderMenuGroupProps>(
  function HeaderMenuGroup({ children, label, ...props }, ref) {
    const hasTitle = useContext(HasTitleContext);
    return (
      <GroupContext.Provider value={label || true}>
        <CompositeGroup
          {...props}
          ref={ref}
          className={twJoin("bg-[color:inherit]", props.className)}
        >
          {label && (
            <CompositeGroupLabel
              className={twJoin(
                "sticky z-10 bg-[color:inherit] p-2 pt-3",
                "text-sm font-medium text-black/60 dark:text-white/50",
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

export interface HeaderMenuItemProps extends HTMLAttributes<HTMLElement> {
  href?: string;
  value?: string;
  title?: string;
  thumbnail?: ReactNode;
  description?: ReactNode;
  path?: ReactNode[];
  nested?: boolean;
  autoFocus?: boolean;
}

export const HeaderMenuItem = forwardRef<any, HeaderMenuItemProps>(
  function HeaderMenuItem(
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
  ) {
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
          {...linkProps}
          aria-labelledby={`${id}-label`}
          aria-describedby={`${id}-path ${id}-description`}
          render={
            isLink ? isExternalLink ? <a /> : <Link href={href} /> : <div />
          }
          className={twJoin(
            "group flex cursor-default scroll-m-2 items-center gap-2 rounded p-2",
            "active-item:bg-blue-200/40 active:bg-blue-200/70",
            "focus-visible:!outline-none dark:active-item:bg-blue-600/25",
            "dark:active:bg-blue-800/25 [a&]:cursor-pointer",
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
            <div
              aria-hidden
              className={twJoin(
                "flex h-16 w-16 flex-none items-center justify-center rounded-sm",
                "bg-gray-150 dark:bg-gray-800",
                "group-active-item:bg-black/[7.5%] dark:group-active-item:bg-black/70",
                "group-active:bg-black/[7.5%] dark:group-active:bg-black/70"
              )}
            >
              {thumbnail}
            </div>
          )}
          {nested && (
            <div
              className={twJoin(
                "relative flex flex-none flex-col items-center justify-center",
                "h-16 w-16 after:absolute after:-top-4 after:h-24 after:w-0.5",
                "after:bg-black/10 after:dark:bg-white/10"
              )}
            />
          )}
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
                            className={twJoin(
                              "truncate text-blue-700 dark:text-blue-400",
                              "[&_[data-user-value]]:font-semibold",
                              "[&_[data-user-value]]:text-blue-900",
                              "dark:[&_[data-user-value]]:text-blue-100",
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
                className={twJoin(
                  "text-sm text-black/70 dark:text-white/70",
                  "dark:[&_[data-autocomplete-value]]:text-white/[56%]",
                  "[&_[data-user-value]]:font-semibold",
                  "[&_[data-user-value]]:text-black dark:[&_[data-user-value]]:text-white",
                  path ? "truncate" : "line-clamp-2"
                )}
              >
                {description}
              </span>
            </div>
          ) : (
            isExternalLink && (
              <NewWindow className="h-4 w-4 stroke-black/75 group-active-item:stroke-current dark:stroke-white/75" />
            )
          )}
        </Role>
      );
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
        value={value}
        autoFocus={autoFocus}
        hideOnClick={hideOnClick}
        render={renderItem}
      />
    );

    const renderComboboxItem = (props: Props) => (
      <ComboboxItem
        {...props}
        focusOnHover
        hideOnClick={hideOnClick}
        render={select ? renderSelectItem : renderItem}
      />
    );

    if (combobox) {
      return renderComboboxItem({ ...props, ref });
    }

    if (select) {
      return renderSelectItem({ ...props, ref });
    }

    return <MenuItem {...props} ref={ref} render={renderItem} />;
  }
);

export type HeaderMenuSeparator = ComponentPropsWithoutRef<"hr">;

export const HeaderMenuSeparator = forwardRef<
  HTMLHRElement,
  HeaderMenuSeparator
>(function HeaderMenuSeparator(props, ref) {
  return (
    <CompositeSeparator
      {...props}
      ref={ref}
      className={twJoin(
        "my-2 h-0 w-full border-t border-gray-250 dark:border-gray-550",
        props.className
      )}
    />
  );
});
