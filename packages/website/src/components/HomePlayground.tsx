// TODO: Refactor this mess
import * as React from "react";
import {
  TabList,
  useTabState,
  Tab,
  TabPanel,
  TabPanelOptions,
  TabPanelProps
} from "reakit";
import {
  usePlaygroundState,
  PlaygroundPreview,
  PlaygroundEditor,
  PlaygroundPreviewOptions,
  PlaygroundStateReturn
} from "reakit-playground";
import { css } from "emotion";
import { compileComponent } from "../../../reakit-playground/src/__utils/compileComponent";

const tabCode = `
import { useTabState, Tab, TabList, TabPanel } from "reakit";

const Tabs = () => {
  const tab = useTabState();
  return (
    <>
      <TabList {...tab}>
        <Tab {...tab}>Orders</Tab>
        <Tab {...tab}>Transactions</Tab>
      </TabList>
      <TabPanel {...tab}>
        <p>List of orders</p>
      </TabPanel>
      <TabPanel {...tab}>
        <p>List of transactions</p>
      </TabPanel>
    </>
  );
}
`.trim();

const dialogCode = `
import { useDialogState, Dialog, DialogDisclosure, Button } from "reakit";
import Tabs from "./Tabs";

const TabsModal = React.forwardRef((props, ref) => {
  const dialog = useDialogState();
  return (
    <>
      <DialogDisclosure {...dialog} {...props} ref={ref}>
        Open modal...
      </DialogDisclosure>
      <Dialog {...dialog}>
        <Tabs />
        <Button onClick={dialog.hide}>Close</Button>
      </Dialog>
    </>
  );
});
`.trim();

const menuCode = `
import { useMenuState, Menu, MenuButton, MenuItem } from "reakit";
import TabsModal from "./TabsModal";

const TabsModalMenu = React.forwardRef((props, ref) => {
  const menu = useMenuState();
  return (
    <>
      <MenuButton {...menu} {...props} ref={ref}>
        Menu
      </MenuButton>
      <Menu {...menu}>
        <MenuItem {...menu}>Item 1</MenuItem>
        <MenuItem {...menu}>Item 2</MenuItem>
        <MenuItem {...menu} as={TabsModal} />
      </Menu>
    </>
  );
});
`.trim();

const submenuCode = `
import { useMenuState, Menu, MenuButton, MenuItem } from "reakit";
import TabsModalMenu from "./TabsModalMenu";

const TabsModalMenuMenu = React.forwardRef((props, ref) => {
  const menu = useMenuState();
  return (
    <>
      <MenuButton {...menu} {...props} ref={ref}>
        Menu
      </MenuButton>
      <Menu {...menu}>
        <MenuItem {...menu}>Item 1</MenuItem>
        <MenuItem {...menu}>Item 2</MenuItem>
        <MenuItem {...menu} as={TabsModalMenu} />
      </Menu>
    </>
  );
});
`.trim();

const menubarCode = `
import { useMenuState, MenuBar, MenuItem } from "reakit";
import TabsModalMenuMenu from "./TabsModalMenuMenu";

const TabsModalMenuMenuBar = () => {
  const menu = useMenuState({ orientation: "horizontal" });
  return (
    <MenuBar {...menu}>
      <MenuItem {...menu}>Item 1</MenuItem>
      <MenuItem {...menu}>Item 2</MenuItem>
      <MenuItem {...menu} as={TabsModalMenuMenu} />
    </MenuBar>
  );
};
`.trim();

function Panel({
  modules,
  componentName,
  code,
  update,
  ...props
}: TabPanelOptions &
  TabPanelProps &
  PlaygroundPreviewOptions &
  PlaygroundStateReturn) {
  return (
    <TabPanel
      {...props}
      className={css`
        background: #282a36;
        color: white;
      `}
    >
      <div
        className={css`
          display: grid;
          max-width: 1024px;
          margin: 0 auto;
          grid-template-columns: minmax(200px, 780px) 320px;
          @media (max-width: 768px) {
            grid-template-columns: 100%;
            grid-template-rows: 400px 1fr;
          }
        `}
      >
        <PlaygroundEditor
          code={code}
          update={update}
          autoRefresh
          className={css`
            margin: 0;
            .CodeMirror-scroll {
              height: 400px;
            }
            .CodeMirror-lines {
              padding: 2em 0 1em;
            }
          `}
        />
        <PlaygroundPreview
          componentName={componentName}
          code={code}
          modules={modules}
          className={css`
            margin: 16px;
            background: white;
            color: black;
          `}
        />
      </div>
    </TabPanel>
  );
}

export default function HomePlayground() {
  const tab = useTabState();
  const tabPlayground = usePlaygroundState({ code: tabCode });
  const dialogPlayground = usePlaygroundState({ code: dialogCode });
  const menuPlayground = usePlaygroundState({ code: menuCode });
  const submenuPlayground = usePlaygroundState({ code: submenuCode });
  const menubarPlayground = usePlaygroundState({ code: menubarCode });

  const [modules, setModules] = React.useState<Record<string, any>>({});
  const [clientRendered, setClientRendered] = React.useState(false);

  React.useEffect(() => {
    requestAnimationFrame(() => setClientRendered(true));
  }, []);

  React.useEffect(() => {
    try {
      const obj = {} as Record<string, any>;
      obj["./Tabs"] = compileComponent(tabPlayground.code, obj, "Tabs");
      obj["./TabsModal"] = compileComponent(
        dialogPlayground.code,
        obj,
        "TabsModal"
      );
      obj["./TabsModalMenu"] = compileComponent(
        menuPlayground.code,
        obj,
        "TabsModalMenu"
      );
      obj["./TabsModalMenuMenu"] = compileComponent(
        submenuPlayground.code,
        obj,
        "TabsModalMenuMenu"
      );
      setModules(obj);
    } catch (e) {
      // do nothing for now
    }
  }, [
    tabPlayground.code,
    dialogPlayground.code,
    menuPlayground.code,
    submenuPlayground.code
  ]);

  return clientRendered ? (
    <div
      className={css`
        margin-top: -40px;
      `}
    >
      <TabList
        {...tab}
        className={css`
          margin: 0 auto;
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
          scrollbar-width: none;
          padding: 0.2em 1.5em;
          margin-bottom: -0.2em;
          max-width: 1024px;
          box-sizing: border-box;

          &::-webkit-scrollbar {
            width: 0;
            height: 0;
          }
          && > [role="tab"] {
            &[aria-selected="true"] {
              background: #282a36;
              color: white;
            }
          }
        `}
      >
        <Tab {...tab}>Tabs.js</Tab>
        <Tab {...tab}>TabsModal.js</Tab>
        <Tab {...tab}>TabsModalMenu.js</Tab>
        <Tab {...tab}>TabsModalMenuMenu.js</Tab>
        <Tab {...tab}>MenuBar.js</Tab>
      </TabList>
      <Panel
        {...tab}
        {...tabPlayground}
        componentName="Tabs"
        modules={modules}
      />
      <Panel
        {...tab}
        {...dialogPlayground}
        componentName="TabsModal"
        modules={modules}
      />
      <Panel
        {...tab}
        {...menuPlayground}
        componentName="TabsModalMenu"
        modules={modules}
      />
      <Panel
        {...tab}
        {...submenuPlayground}
        componentName="TabsModalMenuMenu"
        modules={modules}
      />
      <Panel
        {...tab}
        {...menubarPlayground}
        componentName="TabsModalMenuMenuBar"
        modules={modules}
      />
    </div>
  ) : null;
}
