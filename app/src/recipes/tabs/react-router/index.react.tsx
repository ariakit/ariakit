import { Button } from "@ariakit/ui/components/button.ariakit.react";
import {
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
} from "@ariakit/ui/components/tabs.ariakit.react";
import {
  Link,
  MemoryRouter,
  Outlet,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from "react-router";

const pages = [
  { path: "/inbox", label: "Inbox" },
  { path: "/sent", label: "Sent" },
  { path: "/drafts", label: "Drafts" },
];

function MailTabs() {
  const location = useLocation();
  const navigate = useNavigate();
  return (
    <div className="grid w-[28rem] max-w-full gap-2">
      <div className="flex items-center gap-2">
        <Button $size="sm" onClick={() => navigate(-1)}>
          Back
        </Button>
        <p className="ak-ink-70 text-sm">
          Route: <code>{location.pathname}</code>
        </p>
      </div>
      {/* The URL owns the selection, so each tab id is its route. Only the
          links navigate: a setSelectedId that also navigates would add a second
          history entry for each click. Without selection on move, the arrow
          keys add no entries, and Enter follows the focused link. */}
      <Tabs selectedId={location.pathname} selectOnMove={false}>
        <TabList aria-label="Mail">
          {pages.map((page) => (
            <Tab
              key={page.path}
              id={page.path}
              render={<Link to={page.path} />}
            >
              {page.label}
            </Tab>
          ))}
        </TabList>
        <TabPanels>
          <TabPanel single>
            <Outlet />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </div>
  );
}

export default function Example() {
  return (
    // The route stays in the example with a memory router. An app can use
    // BrowserRouter or HashRouter here without other changes.
    <MemoryRouter initialEntries={["/inbox"]}>
      <Routes>
        <Route element={<MailTabs />}>
          <Route path="/inbox" element="Three new messages from your team." />
          <Route path="/sent" element="You sent two messages today." />
          <Route path="/drafts" element="One draft waits for your review." />
        </Route>
      </Routes>
    </MemoryRouter>
  );
}
