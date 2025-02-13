import "./style.css";
import * as Ariakit from "@ariakit/react";
import clsx from "clsx";
import { forwardRef, useState } from "react";

function Content() {
  return (
    <div className="w-[calc(100%+24px)] opacity-50">
      {Array.from({ length: 256 }).map((_, i) => `${i} `)}
    </div>
  );
}

const Scroller = forwardRef<HTMLDivElement, Ariakit.RoleProps>(
  function Scroller(props, ref) {
    return (
      <Ariakit.Role
        ref={ref}
        {...props}
        className={clsx(
          props.className,
          "ak-popup-scroll ak-popup-cover !overflow-auto h-48",
        )}
      />
    );
  },
);

const Container = forwardRef<HTMLDivElement, Ariakit.RoleProps>(
  function Container(props, ref) {
    return (
      <Ariakit.Role
        ref={ref}
        {...props}
        className={clsx(
          props.className,
          "ak-popup ak-tab-border flex flex-col overflow-clip z-10",
        )}
      />
    );
  },
);

const TabList = forwardRef<HTMLDivElement, Ariakit.TabListProps>(
  function TabList(props, ref) {
    return (
      <Ariakit.TabList
        ref={ref}
        {...props}
        className={clsx(props.className, "ak-tab-list ak-popup-cover")}
      />
    );
  },
);

const Tab = forwardRef<HTMLButtonElement, Ariakit.TabProps>(
  function Tab(props, ref) {
    return (
      <Ariakit.Tab
        ref={ref}
        {...props}
        className={clsx(props.className, "ak-tab ak-tab-folder")}
      />
    );
  },
);

const TabPanel = forwardRef<HTMLDivElement, Ariakit.TabPanelProps>(
  function TabPanel(props, ref) {
    return (
      <Ariakit.TabPanel
        ref={ref}
        {...props}
        className={clsx(
          props.className,
          "ak-tab-panel ak-popup-cover ak-popup-layer overflow-clip flex-none",
        )}
      >
        {props.children ?? <Content />}
      </Ariakit.TabPanel>
    );
  },
);

function Default() {
  return (
    <Container>
      <Ariakit.TabProvider>
        <TabList aria-label="Default">
          <Tab>Default 1</Tab>
          <Tab>Default 2</Tab>
        </TabList>
        <TabPanel scrollRestoration render={<Scroller />} />
        <TabPanel scrollRestoration render={<Scroller />} />
      </Ariakit.TabProvider>
    </Container>
  );
}

function DefaultReset() {
  return (
    <Container>
      <Ariakit.TabProvider>
        <TabList aria-label="DefaultReset">
          <Tab>DefaultReset 1</Tab>
          <Tab>DefaultReset 2</Tab>
        </TabList>
        <TabPanel scrollRestoration="reset" render={<Scroller />} />
        <TabPanel scrollRestoration="reset" render={<Scroller />} />
      </Ariakit.TabProvider>
    </Container>
  );
}

function DefaultUnmount() {
  return (
    <Container>
      <Ariakit.TabProvider>
        <TabList aria-label="DefaultUnmount">
          <Tab>DefaultUnmount 1</Tab>
          <Tab>DefaultUnmount 2</Tab>
        </TabList>
        <TabPanel scrollRestoration unmountOnHide render={<Scroller />} />
        <TabPanel scrollRestoration unmountOnHide render={<Scroller />} />
      </Ariakit.TabProvider>
    </Container>
  );
}

function DefaultUnmountReset() {
  return (
    <Container>
      <Ariakit.TabProvider>
        <TabList aria-label="DefaultUnmountReset">
          <Tab>DefaultUnmountReset 1</Tab>
          <Tab>DefaultUnmountReset 2</Tab>
        </TabList>
        <TabPanel
          scrollRestoration="reset"
          unmountOnHide
          render={<Scroller />}
        />
        <TabPanel
          scrollRestoration="reset"
          unmountOnHide
          render={<Scroller />}
        />
      </Ariakit.TabProvider>
    </Container>
  );
}

function DefaultSingle() {
  const [tabId, setTabId] = useState<string | null | undefined>();
  return (
    <Container>
      <Ariakit.TabProvider selectedId={tabId} setSelectedId={setTabId}>
        <TabList aria-label="DefaultSingle">
          <Tab>DefaultSingle 1</Tab>
          <Tab>DefaultSingle 2</Tab>
        </TabList>
        <TabPanel tabId={tabId} scrollRestoration render={<Scroller />} />
      </Ariakit.TabProvider>
    </Container>
  );
}

function DefaultSingleReset() {
  const [tabId, setTabId] = useState<string | null | undefined>();
  return (
    <Container>
      <Ariakit.TabProvider selectedId={tabId} setSelectedId={setTabId}>
        <TabList aria-label="DefaultSingleReset">
          <Tab>DefaultSingleReset 1</Tab>
          <Tab>DefaultSingleReset 2</Tab>
        </TabList>
        <TabPanel
          tabId={tabId}
          scrollRestoration="reset"
          render={<Scroller />}
        />
      </Ariakit.TabProvider>
    </Container>
  );
}

function Child() {
  return (
    <Container>
      <Ariakit.TabProvider>
        <TabList aria-label="Child">
          <Tab>Child 1</Tab>
          <Tab>Child 2</Tab>
        </TabList>
        <TabPanel
          scrollRestoration
          scrollElement={(panel) => panel.querySelector(".scroller")}
        >
          <Scroller className="scroller">
            <Content />
          </Scroller>
        </TabPanel>
        <TabPanel
          scrollRestoration
          scrollElement={(panel) => panel.querySelector(".scroller")}
        >
          <Scroller className="scroller">
            <Content />
          </Scroller>
        </TabPanel>
      </Ariakit.TabProvider>
    </Container>
  );
}

function ChildReset() {
  return (
    <Container>
      <Ariakit.TabProvider>
        <TabList aria-label="ChildReset">
          <Tab>ChildReset 1</Tab>
          <Tab>ChildReset 2</Tab>
        </TabList>
        <TabPanel
          scrollRestoration="reset"
          scrollElement={(panel) => panel.querySelector(".scroller")}
        >
          <Scroller className="scroller">
            <Content />
          </Scroller>
        </TabPanel>
        <TabPanel
          scrollRestoration="reset"
          scrollElement={(panel) => panel.querySelector(".scroller")}
        >
          <Scroller className="scroller">
            <Content />
          </Scroller>
        </TabPanel>
      </Ariakit.TabProvider>
    </Container>
  );
}

function ChildUnmount() {
  return (
    <Container>
      <Ariakit.TabProvider>
        <TabList aria-label="ChildUnmount">
          <Tab>ChildUnmount 1</Tab>
          <Tab>ChildUnmount 2</Tab>
        </TabList>
        <TabPanel
          scrollRestoration
          unmountOnHide
          scrollElement={(panel) => panel.querySelector(".scroller")}
        >
          <Scroller className="scroller">
            <Content />
          </Scroller>
        </TabPanel>
        <TabPanel
          scrollRestoration
          unmountOnHide
          scrollElement={(panel) => panel.querySelector(".scroller")}
        >
          <Scroller className="scroller">
            <Content />
          </Scroller>
        </TabPanel>
      </Ariakit.TabProvider>
    </Container>
  );
}

function ChildUnmountReset() {
  return (
    <Container>
      <Ariakit.TabProvider>
        <TabList aria-label="ChildUnmountReset">
          <Tab>ChildUnmountReset 1</Tab>
          <Tab>ChildUnmountReset 2</Tab>
        </TabList>
        <TabPanel
          scrollRestoration="reset"
          unmountOnHide
          scrollElement={(panel) => panel.querySelector(".scroller")}
        >
          <Scroller className="scroller">
            <Content />
          </Scroller>
        </TabPanel>
        <TabPanel
          scrollRestoration="reset"
          unmountOnHide
          scrollElement={(panel) => panel.querySelector(".scroller")}
        >
          <Scroller className="scroller">
            <Content />
          </Scroller>
        </TabPanel>
      </Ariakit.TabProvider>
    </Container>
  );
}

function ChildSingle() {
  const [tabId, setTabId] = useState<string | null | undefined>();
  return (
    <Container>
      <Ariakit.TabProvider selectedId={tabId} setSelectedId={setTabId}>
        <TabList aria-label="ChildSingle">
          <Tab>ChildSingle 1</Tab>
          <Tab>ChildSingle 2</Tab>
        </TabList>
        <TabPanel
          tabId={tabId}
          scrollRestoration
          scrollElement={(panel) => panel.querySelector(".scroller")}
        >
          <Scroller key={tabId} className="scroller">
            <Content />
          </Scroller>
        </TabPanel>
      </Ariakit.TabProvider>
    </Container>
  );
}

function ChildSingleReset() {
  const [tabId, setTabId] = useState<string | null | undefined>();
  return (
    <Container>
      <Ariakit.TabProvider selectedId={tabId} setSelectedId={setTabId}>
        <TabList aria-label="ChildSingleReset">
          <Tab>ChildSingleReset 1</Tab>
          <Tab>ChildSingleReset 2</Tab>
        </TabList>
        <TabPanel
          tabId={tabId}
          scrollRestoration="reset"
          scrollElement={(panel) => panel.querySelector(".scroller")}
        >
          <Scroller key={tabId} className="scroller">
            <Content />
          </Scroller>
        </TabPanel>
      </Ariakit.TabProvider>
    </Container>
  );
}

function Parent() {
  return (
    <Container className="overflow-y-auto h-56">
      <Ariakit.TabProvider>
        <TabList
          aria-label="Parent"
          className="sticky top-[--negative-margin] z-10"
        >
          <Tab>Parent 1</Tab>
          <Tab>Parent 2</Tab>
        </TabList>
        <TabPanel
          scrollRestoration
          scrollElement={(panel) => panel.parentElement}
        />
        <TabPanel
          scrollRestoration
          scrollElement={(panel) => panel.parentElement}
        />
      </Ariakit.TabProvider>
    </Container>
  );
}

function ParentReset() {
  return (
    <Container className="overflow-y-auto h-56">
      <Ariakit.TabProvider>
        <TabList
          aria-label="ParentReset"
          className="sticky top-[--negative-margin] z-10"
        >
          <Tab>ParentReset 1</Tab>
          <Tab>ParentReset 2</Tab>
        </TabList>
        <TabPanel
          scrollRestoration="reset"
          scrollElement={(panel) => panel.parentElement}
        />
        <TabPanel
          scrollRestoration="reset"
          scrollElement={(panel) => panel.parentElement}
        />
      </Ariakit.TabProvider>
    </Container>
  );
}

function ParentUnmount() {
  return (
    <Container className="overflow-y-auto h-56">
      <Ariakit.TabProvider>
        <TabList
          aria-label="ParentUnmount"
          className="sticky top-[--negative-margin] z-10"
        >
          <Tab>ParentUnmount 1</Tab>
          <Tab>ParentUnmount 2</Tab>
        </TabList>
        <TabPanel
          scrollRestoration
          unmountOnHide
          scrollElement={(panel) => panel.parentElement}
        />
        <TabPanel
          scrollRestoration
          unmountOnHide
          scrollElement={(panel) => panel.parentElement}
        />
      </Ariakit.TabProvider>
    </Container>
  );
}

function ParentUnmountReset() {
  return (
    <Container className="overflow-y-auto h-56">
      <Ariakit.TabProvider>
        <TabList
          aria-label="ParentUnmountReset"
          className="sticky top-[--negative-margin] z-10"
        >
          <Tab>ParentUnmountReset 1</Tab>
          <Tab>ParentUnmountReset 2</Tab>
        </TabList>
        <TabPanel
          scrollRestoration="reset"
          unmountOnHide
          scrollElement={(panel) => panel.parentElement}
        />
        <TabPanel
          scrollRestoration="reset"
          unmountOnHide
          scrollElement={(panel) => panel.parentElement}
        />
      </Ariakit.TabProvider>
    </Container>
  );
}

function ParentSingle() {
  const [tabId, setTabId] = useState<string | null | undefined>();
  return (
    <Container className="overflow-y-auto h-56">
      <Ariakit.TabProvider selectedId={tabId} setSelectedId={setTabId}>
        <TabList
          aria-label="ParentSingle"
          className="sticky top-[--negative-margin] z-10"
        >
          <Tab>ParentSingle 1</Tab>
          <Tab>ParentSingle 2</Tab>
        </TabList>
        <TabPanel
          tabId={tabId}
          scrollRestoration
          scrollElement={(panel) => panel.parentElement}
        />
      </Ariakit.TabProvider>
    </Container>
  );
}

function ParentSingleReset() {
  const [tabId, setTabId] = useState<string | null | undefined>();
  return (
    <Container className="overflow-y-auto h-56">
      <Ariakit.TabProvider selectedId={tabId} setSelectedId={setTabId}>
        <TabList
          aria-label="ParentSingleReset"
          className="sticky top-[--negative-margin] z-10"
        >
          <Tab>ParentSingleReset 1</Tab>
          <Tab>ParentSingleReset 2</Tab>
        </TabList>
        <TabPanel
          tabId={tabId}
          scrollRestoration="reset"
          scrollElement={(panel) => panel.parentElement}
        />
      </Ariakit.TabProvider>
    </Container>
  );
}

export default function Example() {
  return (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-2 w-[768px] max-w-full">
      <Default />
      <DefaultReset />
      <DefaultUnmount />
      <DefaultUnmountReset />
      <DefaultSingle />
      <DefaultSingleReset />
      <Child />
      <ChildReset />
      <ChildUnmount />
      <ChildUnmountReset />
      <ChildSingle />
      <ChildSingleReset />
      <Parent />
      <ParentReset />
      <ParentUnmount />
      <ParentUnmountReset />
      <ParentSingle />
      <ParentSingleReset />
    </div>
  );
}
