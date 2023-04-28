import * as React from "react";
import * as Ariakit from "@ariakit/react";
import {
  useHref,
  useLinkClickHandler,
  useLocation,
  useNavigate,
} from "react-router-dom";
import type { To } from "react-router-dom";
import invariant from "tiny-invariant";

const PrefixContext = React.createContext("tab");
const TabContext = React.createContext<Ariakit.TabStore | null>(null);

interface TabsProps extends Ariakit.TabStoreProps {
  children: React.ReactNode;
}

export function Tabs({ children, ...props }: TabsProps) {
  const prefix = React.useId();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const tab = Ariakit.useTabStore({
    ...props,
    selectedId: getIdFromHref(pathname, prefix),
    setSelectedId: (id) => navigate(getHrefFromId(id, prefix)),
  });

  return (
    <PrefixContext.Provider value={prefix}>
      <TabContext.Provider value={tab}>{children}</TabContext.Provider>
    </PrefixContext.Provider>
  );
}

type TabListProps = Partial<Ariakit.TabListProps>;

export const TabList = React.forwardRef<HTMLDivElement, TabListProps>(
  (props, ref) => {
    const tab = React.useContext(TabContext);
    invariant(tab, "TabList must be wrapped in a Tabs component");
    return (
      <Ariakit.TabList className="tab-list" {...props} ref={ref} store={tab} />
    );
  }
);

interface TabProps extends Ariakit.TabProps<"a"> {
  to: To;
}

export const Tab = React.forwardRef<HTMLAnchorElement, TabProps>(
  ({ to, ...props }, ref) => {
    const prefix = React.useContext(PrefixContext);
    const href = useHref(to);
    const onClick = useLinkClickHandler(to);
    const id = getIdFromHref(href, prefix);
    return (
      <Ariakit.Tab
        className="tab"
        {...props}
        as="a"
        id={id}
        ref={ref}
        href={href}
        onClick={(event: React.MouseEvent<HTMLAnchorElement>) => {
          props.onClick?.(event);
          if (event.defaultPrevented) return;
          onClick(event);
        }}
      />
    );
  }
);

type TabPanelProps = Partial<Ariakit.TabPanelProps>;

export const TabPanel = React.forwardRef<HTMLDivElement, TabPanelProps>(
  (props, ref) => {
    const tab = React.useContext(TabContext);
    invariant(tab, "TabPanel must be wrapped in a Tabs component");
    const selectedId = tab.useState("selectedId");
    return (
      <Ariakit.TabPanel {...props} ref={ref} store={tab} tabId={selectedId} />
    );
  }
);

function getIdFromHref(href: string, prefix = "tab") {
  return `${prefix}${href}`;
}

function getHrefFromId(id?: string | null, prefix = "tab") {
  if (!id) return "/";
  return id.replace(prefix, "");
}
