import * as ak from "@ariakit/react";
import {
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  TabRow,
  TabRowButton,
  Tabs,
  TabSlot,
} from "@ariakit/ui/components/tabs.ariakit.react";
import { PlusIcon } from "lucide-react";
import { StrictMode, useState } from "react";

interface NewTabButtonProps {
  onAdd: () => string;
}

// The button selects the new tab through the store of the tabs, in the same
// update that adds the tab, so the tab is selected as it mounts.
function NewTabButton({ onAdd }: NewTabButtonProps) {
  const store = ak.useTabContext();
  return (
    <TabRowButton
      aria-label="New tab"
      separator
      onClick={() => store?.setSelectedId(onAdd())}
    >
      <TabSlot>
        <PlusIcon />
      </TabSlot>
    </TabRowButton>
  );
}

function OpenTabs() {
  const [names, setNames] = useState(["Inbox", "Drafts", "Archive"]);
  // The number only goes up, so a new tab doesn't take the name of an open tab
  // after a tab closes.
  const [count, setCount] = useState(4);
  const addTab = () => {
    const name = `Tab ${count}`;
    setCount(count + 1);
    setNames([...names, name]);
    return `tab-${name}`;
  };
  return (
    <Tabs
      defaultSelectedId="tab-Inbox"
      $outerEdge={false}
      $darken={false}
      className="w-[24rem] max-w-full"
    >
      <TabRow>
        <TabList aria-label="Open tabs">
          {names.map((name, index) => (
            <Tab
              key={name}
              id={`tab-${name}`}
              separator={!!index}
              onRemove={() => setNames(names.filter((item) => item !== name))}
            >
              {name}
            </Tab>
          ))}
        </TabList>
        <NewTabButton onAdd={addTab} />
      </TabRow>
      <TabPanels>
        {names.map((name) => (
          <TabPanel key={name} tabId={`tab-${name}`}>
            {name}
          </TabPanel>
        ))}
      </TabPanels>
    </Tabs>
  );
}

export default function Example() {
  return (
    <StrictMode>
      <OpenTabs />
    </StrictMode>
  );
}
