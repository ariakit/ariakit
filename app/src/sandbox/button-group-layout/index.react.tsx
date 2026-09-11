import { Button } from "@ariakit/react";
import { ButtonGroup } from "@ariakit/ui/components/button.ariakit.react";
import {
  Tab,
  TabGlider,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
} from "@ariakit/ui/components/tabs.ariakit.react";
import { button, buttonGroup } from "@ariakit/ui/styles/button";

const groups = [
  { title: "Horizontal", $layout: "horizontal", $gap: "auto", $p: "none" },
  { title: "Stretched auto", $layout: "stretch", $gap: "auto", $p: "none" },
  { title: "Stretched", $layout: "stretch", $gap: "none", $p: "none" },
  { title: "Padded", $layout: "horizontal", $gap: "none", $p: 2 },
  { title: "Spaced", $layout: "horizontal", $gap: "md", $p: "none" },
  { title: "Vertical", $layout: "vertical", $gap: "auto", $p: "none" },
  { title: "Wrapped", $layout: "wrap", $gap: "auto", $p: "none" },
  // All of these lengths resolve to the same padding as "none".
  { title: "Numeric zero", $layout: "horizontal", $gap: "auto", $p: 0 },
  { title: "Pixel zero", $layout: "horizontal", $gap: "auto", $p: "0px" },
  { title: "Rem zero", $layout: "horizontal", $gap: "auto", $p: "0rem" },
  {
    title: "Calculated zero",
    $layout: "horizontal",
    $gap: "auto",
    $p: "calc(0px)",
  },
] as const;

export default function Example() {
  return (
    <div className="grid w-80 max-w-full gap-4">
      {groups.map(({ title, ...variants }) => (
        <section key={title}>
          <h2>{title}</h2>
          <div
            role="group"
            aria-label={title}
            {...buttonGroup.jsx({
              $border: 2,
              className: title === "Wrapped" ? "w-32" : undefined,
              ...variants,
            })}
          >
            {["Day", "Week", "Month"].map((label) => (
              <Button
                key={label}
                {...button.jsx({ $border: 2, $borderType: "border" })}
              >
                {label}
              </Button>
            ))}
          </div>
        </section>
      ))}
      {(
        [
          { title: "Independent", $p: "none" },
          { title: "Padded independent", $p: 2, $gap: "none" },
        ] as const
      ).map(({ title, ...props }) => (
        <section key={title}>
          <h2>{title}</h2>
          <ButtonGroup
            aria-label={title}
            $border={2}
            $joined={false}
            {...props}
          >
            {["Day", "Week", "Month"].map((label) => (
              <Button
                key={label}
                {...button.jsx({ $border: 2, $borderType: "border" })}
              >
                {label}
              </Button>
            ))}
          </ButtonGroup>
        </section>
      ))}
      {(["folder", "flat", "bevel"] as const).map((kind) => (
        <section key={kind} className="grid gap-2">
          <h2>{kind} tabs</h2>
          <Tabs $p="none" $rounded="xl">
            <TabList aria-label={`${kind} tabs`}>
              <Tab $kind={kind}>Preview</Tab>
              <Tab $kind={kind}>Code</Tab>
              <Tab $kind={kind}>Usage</Tab>
            </TabList>
            <TabPanels>
              <TabPanel single>The strip has no padding.</TabPanel>
            </TabPanels>
          </Tabs>
        </section>
      ))}
      <section className="grid gap-2">
        <h2>Folder glider</h2>
        <Tabs $p="none" $rounded="xl">
          <TabList aria-label="Folder glider">
            <Tab>Preview</Tab>
            <Tab>Code</Tab>
            <Tab>Usage</Tab>
            <TabGlider />
          </TabList>
          <TabPanels>
            <TabPanel single>The glider follows the selected tab.</TabPanel>
          </TabPanels>
        </Tabs>
      </section>
      <section className="grid gap-2">
        <h2>Joined tabs</h2>
        <Tabs $p="none" $rounded="xl">
          <TabList aria-label="Joined tabs" $joined>
            <Tab $kind="flat" $border={2} $borderType="border">
              Day
            </Tab>
            <Tab $kind="flat" $border={2} $borderType="border">
              Week
            </Tab>
            <Tab $kind="flat" $border={2} $borderType="border">
              Month
            </Tab>
          </TabList>
          <TabPanels>
            <TabPanel single>The tab list opts into joining.</TabPanel>
          </TabPanels>
        </Tabs>
      </section>
    </div>
  );
}
