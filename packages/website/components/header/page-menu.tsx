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
import { cx } from "@ariakit/core/utils/misc";
import {
  useEvent,
  useId,
  useSafeLayoutEffect,
} from "@ariakit/react-core/utils/hooks";
import {
  Combobox,
  ComboboxCancel,
  ComboboxItem,
  ComboboxList,
  useComboboxStore,
} from "ariakit/combobox/store";
import {
  CompositeGroup,
  CompositeGroupLabel,
  CompositeSeparator,
} from "ariakit/composite/store";
import {
  Menu,
  MenuButton,
  MenuButtonArrow,
  MenuItem,
  MenuList,
  useMenuStore,
} from "ariakit/menu/store";
import { PopoverDismiss } from "ariakit/popover";
import { Role } from "ariakit/role";
import {
  Select,
  SelectItem,
  SelectPopover,
  useSelectStore,
} from "ariakit/select/store";
import { VisuallyHidden } from "ariakit/visually-hidden";
import Link from "next/link";
import tw from "../../utils/tw";
import useIdle from "../../utils/use-idle";
import whenIdle from "../../utils/when-idle";
import ChevronRight from "../icons/chevron-right";
import NewWindow from "../icons/new-window";
import Search from "../icons/search";
import Spinner from "../icons/spinner";
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
  loading?: boolean;
  contentLabel?: string;
  hasTitle?: boolean;
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
      loading = false,
      contentLabel,
      hasTitle,
      ...props
    },
    ref
  ) => {
    const popoverRef = useRef<HTMLDivElement>(null);
    const parent = useContext(ParentContext);
    const combobox = useComboboxStore({
      fitViewport: true,
      focusLoop: false,
      includesBaseElement: false,
      gutter: 4,
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
      store: combobox,
      fixed: true,
      placement: parent ? "right-start" : "bottom-start",
      getAnchorRect: (anchor) => {
        if (parent?.current) {
          return parent.current.getBoundingClientRect();
        }
        if (!anchor) return null;
        return anchor.getBoundingClientRect();
      },
    });

    const idle = useIdle();

    useSafeLayoutEffect(() => {
      return menu.batchSync(
        (state) => {
          if (!parent && state.open) {
            menu.setAutoFocusOnShow(true);
            menu.setInitialFocus("first");
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
      return whenIdle(() => onSearchProp(comboboxValue), 500);
    }, [comboboxValue, searchValue, onSearchProp]);

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
      <div
        {...props}
        aria-label={contentLabel}
        aria-busy={loading}
        className={cx(popoverStyle, popoverSizes[size])}
      >
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
                <div className="relative">
                  {loading ? (
                    <Spinner
                      className={cx(style.comboboxIcon, "animate-spin")}
                    />
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
        </div>
      </div>
    );

    const selectChildren = select.useState((state) => label ?? state.value);

    const button = selectable ? (
      <Select store={select} {...props} ref={ref}>
        {(props) => renderButton({ ...props, children: selectChildren })}
      </Select>
    ) : (
      <MenuButton store={menu} {...props} ref={ref}>
        {(props) => renderButton({ ...props, children: label })}
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
          >
            {(props) => (
              <MenuList
                {...props}
                store={menu}
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
        {menuMounted && (
          <Menu
            store={menu}
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

type PageMenuGroupProps = HTMLAttributes<HTMLDivElement> & {
  label?: string;
};

export const PageMenuGroup = forwardRef<HTMLDivElement, PageMenuGroupProps>(
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
