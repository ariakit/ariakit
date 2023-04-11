import * as Ariakit from "@ariakit/react";
import {
  useHref,
  useLinkClickHandler,
  useLocation,
  useNavigate,
} from "react-router-dom";

export const TabLinkList = Ariakit.TabList;

export const TabLinkPanel = Ariakit.TabPanel;

type TabLinkProps = Ariakit.TabProps<"a"> & { to: string };

export function TabLink({ to, ...props }: TabLinkProps) {
  const href = useHref(to);
  const onClick = useLinkClickHandler(to);
  return <Ariakit.Tab {...props} as="a" href={href} onClick={onClick} />;
}

export function useTabLinkStore(props: Ariakit.TabStoreProps = {}) {
  const { pathname: selectedId } = useLocation();
  const navigate = useNavigate();

  const tab = Ariakit.useTabStore({
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
