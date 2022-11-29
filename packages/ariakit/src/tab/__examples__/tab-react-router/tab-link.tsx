import {
  Tab,
  TabList,
  TabPanel,
  TabProps,
  TabStoreProps,
  useTabStore,
} from "ariakit/tab/store";
import {
  useHref,
  useLinkClickHandler,
  useLocation,
  useNavigate,
} from "react-router-dom";

export const TabLinkList = TabList;

export const TabLinkPanel = TabPanel;

type TabLinkProps = TabProps<"a"> & { to: string };

export function TabLink({ to, ...props }: TabLinkProps) {
  const href = useHref(to);
  const onClick = useLinkClickHandler(to);
  return <Tab {...props} as="a" href={href} onClick={onClick} />;
}

export function useTabLinkStore(props: TabStoreProps = {}) {
  const { pathname: selectedId } = useLocation();
  const navigate = useNavigate();

  const tab = useTabStore({
    ...props,
    selectedId,
    setSelectedId: (id) => {
      // setSelectedId may be called more than once for the same id, so we make
      // sure we only navigate once.
      if (id !== selectedId) {
        navigate(id || "/");
      }
    },
  });

  return tab;
}
