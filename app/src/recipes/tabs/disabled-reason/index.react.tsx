import {
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
} from "@ariakit/ui/components/tabs.ariakit.react";
import { Tooltip } from "@ariakit/ui/components/tooltip.ariakit.react";
import { useId } from "react";

export default function Example() {
  const reasonId = useId();
  const reason = "Audit log is part of the Business plan.";
  return (
    <div className="grid w-[28rem] max-w-full gap-2">
      <Tabs defaultSelectedId="team-members">
        <TabList aria-label="Team">
          <Tab id="team-members">Members</Tab>
          <Tab id="team-roles" separator>
            Roles
          </Tab>
          {/* Tabs stay focusable when disabled, so keyboard users get the
              tooltip too. Screen readers read the reason as the description. */}
          <Tooltip text={reason}>
            <Tab id="team-audit" disabled aria-describedby={reasonId} separator>
              Audit log
            </Tab>
          </Tooltip>
        </TabList>
        <TabPanels>
          <TabPanel tabId="team-members">Your team has six members.</TabPanel>
          <TabPanel tabId="team-roles">Two people can change billing.</TabPanel>
        </TabPanels>
      </Tabs>
      {/* Touch screens don't show tooltips, so the reason also shows here. */}
      <p id={reasonId} className="ak-ink-70 text-sm">
        {reason}
      </p>
    </div>
  );
}
