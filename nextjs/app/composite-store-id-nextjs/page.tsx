"use client";

import * as Ariakit from "@ariakit/react";

const menuStyle = {
  display: "grid",
  padding: 4,
  border: "1px solid",
  background: "white",
  color: "black",
};

// Cache Components rejects Math.random() during the prerender of a Client
// Component outside a Suspense boundary. Stores without an explicit or
// synchronized ID must still receive a hydration-safe one from Ariakit.
// https://github.com/ariakit/ariakit/issues/7986
function ProjectTabs() {
  return (
    <Ariakit.TabProvider defaultSelectedId="overview">
      <Ariakit.TabList aria-label="Project">
        <Ariakit.Tab id="overview">Overview</Ariakit.Tab>
        <Ariakit.Tab id="activity">Activity</Ariakit.Tab>
      </Ariakit.TabList>
      <Ariakit.TabPanel tabId="overview">Project details</Ariakit.TabPanel>
      <Ariakit.TabPanel tabId="activity">Recent changes</Ariakit.TabPanel>
    </Ariakit.TabProvider>
  );
}

function ReportTabs() {
  const tab = Ariakit.useTabStore({ defaultSelectedId: "summary" });
  return (
    <Ariakit.TabProvider store={tab}>
      <Ariakit.TabList aria-label="Report">
        <Ariakit.Tab id="summary">Summary</Ariakit.Tab>
        <Ariakit.Tab id="details">Details</Ariakit.Tab>
      </Ariakit.TabList>
      <Ariakit.TabPanel tabId="summary">Report summary</Ariakit.TabPanel>
      <Ariakit.TabPanel tabId="details">Report details</Ariakit.TabPanel>
    </Ariakit.TabProvider>
  );
}

function FormattingToolbar() {
  return (
    <Ariakit.ToolbarProvider>
      <Ariakit.Toolbar aria-label="Formatting">
        <Ariakit.ToolbarItem>Bold</Ariakit.ToolbarItem>
        <Ariakit.ToolbarItem>Italic</Ariakit.ToolbarItem>
      </Ariakit.Toolbar>
    </Ariakit.ToolbarProvider>
  );
}

function ActionsMenu() {
  return (
    <Ariakit.MenuProvider>
      <Ariakit.MenuButton>Actions</Ariakit.MenuButton>
      <Ariakit.Menu style={menuStyle}>
        <Ariakit.MenuItem>Rename</Ariakit.MenuItem>
        <Ariakit.MenuItem>Archive</Ariakit.MenuItem>
      </Ariakit.Menu>
    </Ariakit.MenuProvider>
  );
}

function AppMenubar() {
  return (
    <Ariakit.MenubarProvider>
      <Ariakit.Menubar aria-label="Application">
        <Ariakit.MenuProvider>
          <Ariakit.MenuItem render={<Ariakit.MenuButton />}>
            File
          </Ariakit.MenuItem>
          <Ariakit.Menu style={menuStyle}>
            <Ariakit.MenuItem>New file</Ariakit.MenuItem>
          </Ariakit.Menu>
        </Ariakit.MenuProvider>
      </Ariakit.Menubar>
    </Ariakit.MenubarProvider>
  );
}

interface ViewSwitcherProps {
  id?: string;
}

// A wrapper that forwards an optional ID passes undefined when the consumer
// omits it.
function ViewSwitcher({ id }: ViewSwitcherProps) {
  return (
    <Ariakit.CompositeProvider id={id}>
      <Ariakit.Composite aria-label="View">
        <Ariakit.CompositeItem>Board</Ariakit.CompositeItem>
        <Ariakit.CompositeItem>List</Ariakit.CompositeItem>
      </Ariakit.Composite>
    </Ariakit.CompositeProvider>
  );
}

function WorkspaceId() {
  const tab = Ariakit.useTabContext();
  const id = Ariakit.useStoreState(tab, "id");
  return <p>Workspace store: {id}</p>;
}

// The provider synchronizes with a store that has its own ID, so the server and
// client must both render that ID.
function WorkspaceTabs() {
  const workspace = Ariakit.useTabStore({ id: "workspace-store" });
  return (
    <Ariakit.TabProvider store={workspace}>
      <WorkspaceId />
      <Ariakit.TabList aria-label="Workspace">
        <Ariakit.Tab>Files</Ariakit.Tab>
        <Ariakit.Tab>Members</Ariakit.Tab>
      </Ariakit.TabList>
      <Ariakit.TabPanel>Workspace files</Ariakit.TabPanel>
      <Ariakit.TabPanel>Workspace members</Ariakit.TabPanel>
    </Ariakit.TabProvider>
  );
}

// With Next.js `cacheComponents`, an explicit store id plus two tab/panel pairs
// reproduce https://github.com/ariakit/ariakit/issues/5147 during the build.
function SettingsTabs() {
  const tab = Ariakit.useTabStore({ id: "my-tabs" });
  return (
    <Ariakit.TabProvider store={tab}>
      <Ariakit.TabList aria-label="Settings">
        <Ariakit.Tab>Tab 1</Ariakit.Tab>
        <Ariakit.Tab>Tab 2</Ariakit.Tab>
      </Ariakit.TabList>
      <Ariakit.TabPanel>Panel 1</Ariakit.TabPanel>
      <Ariakit.TabPanel>Panel 2</Ariakit.TabPanel>
    </Ariakit.TabProvider>
  );
}

export default function Page() {
  return (
    <div style={{ display: "grid", gap: 16, justifyItems: "start" }}>
      <ProjectTabs />
      <ReportTabs />
      <FormattingToolbar />
      <ActionsMenu />
      <AppMenubar />
      <ViewSwitcher />
      <WorkspaceTabs />
      <SettingsTabs />
    </div>
  );
}
