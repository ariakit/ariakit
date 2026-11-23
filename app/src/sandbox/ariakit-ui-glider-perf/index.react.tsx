/**
 * @license
 * Copyright 2025-present Ariakit FZ-LLC. All Rights Reserved.
 *
 * This software is proprietary. See the license.md file in the root of this
 * package for licensing terms.
 *
 * SPDX-License-Identifier: UNLICENSED
 */
import { Badge, BadgeLabel } from "@ariakit/ui/components/badge.ariakit.react";
import {
  Button,
  ButtonGroup,
} from "@ariakit/ui/components/button.ariakit.react";
import { CheckboxField } from "@ariakit/ui/components/checkbox.ariakit.react";
import { Frame } from "@ariakit/ui/components/frame.ariakit.react";
import { Glider } from "@ariakit/ui/components/glider.ariakit.react";
import {
  Input,
  InputField,
  InputLabel,
} from "@ariakit/ui/components/input.ariakit.react";
import { Nav, NavLink } from "@ariakit/ui/components/nav.ariakit.react";
import {
  Shell,
  ShellMain,
  ShellSidebar,
  ShellSidebarBody,
} from "@ariakit/ui/components/shell.ariakit.react";
import {
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  TabRow,
  Tabs,
} from "@ariakit/ui/components/tabs.ariakit.react";

const bots = [
  "Support",
  "Sales",
  "Onboarding",
  "Billing",
  "Feedback",
  "Recruiting",
];

// Enough styled elements around the tabs that the style and layout work that a
// tab change forces shows up in the metrics. These are constants, so React
// doesn't rerender them, and the measured work is the tab change: the tabs, the
// glider, and the panel that shows.
const links = (
  <Nav $p="none">
    {Array.from({ length: 30 }, (_, index) => (
      <NavLink
        key={index}
        href={`#project-${index + 1}`}
        aria-current={index === 0 ? "page" : undefined}
      >
        Project {index + 1}
      </NavLink>
    ))}
  </Nav>
);

function createChat(bot: string) {
  return (
    <div className="flex min-w-0 flex-1 flex-col gap-2">
      {Array.from({ length: 30 }, (_, index) => (
        <Frame key={index} $border className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <Badge>
              <BadgeLabel>{index % 2 ? "User" : bot}</BadgeLabel>
            </Badge>
            <span>Message {index + 1}</span>
          </div>
          <p>
            The {bot.toLowerCase()} bot answers question {index + 1} with the
            steps from the help center.
          </p>
          <ButtonGroup>
            <Button>Copy</Button>
            <Button>Retry</Button>
          </ButtonGroup>
        </Frame>
      ))}
    </div>
  );
}

function createSettings(bot: string) {
  return (
    <div className="flex w-80 shrink-0 flex-col gap-3">
      {Array.from({ length: 8 }, (_, index) => (
        <InputField key={index}>
          <InputLabel htmlFor={`${bot}-field-${index}`}>
            Field {index + 1}
          </InputLabel>
          <Input id={`${bot}-field-${index}`} defaultValue={`${bot} value`} />
        </InputField>
      ))}
      {Array.from({ length: 16 }, (_, index) => (
        <CheckboxField key={index} defaultChecked={index % 3 === 0}>
          Option {index + 1}
        </CheckboxField>
      ))}
    </div>
  );
}

const panels = bots.map((bot) => (
  <TabPanel key={bot} tabId={bot}>
    <div className="flex gap-4 p-4">
      {createChat(bot)}
      {createSettings(bot)}
    </div>
  </TabPanel>
));

export default function Example() {
  return (
    <Shell>
      <ShellSidebar open $show $width="sm" landmark="nav" aria-label="Projects">
        <ShellSidebarBody>{links}</ShellSidebarBody>
      </ShellSidebar>
      <ShellMain $size="auto">
        <Tabs defaultSelectedId={bots[0]}>
          <TabRow $sticky>
            <TabList aria-label="Bots">
              <Glider />
              {bots.map((bot, index) => (
                <Tab key={bot} id={bot} separator={!!index}>
                  {bot}
                </Tab>
              ))}
            </TabList>
          </TabRow>
          <TabPanels $p="none">{panels}</TabPanels>
        </Tabs>
      </ShellMain>
    </Shell>
  );
}
