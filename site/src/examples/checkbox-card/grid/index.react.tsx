import { Group, GroupLabel } from "@ariakit/react";
import {
  Tab,
  TabGlider,
  TabList,
  TabPanel,
  TabPanels,
  TabSeparator,
  Tabs,
} from "@ariakit/ui/ariakit/tabs.react.tsx";
import { BadgeLabel } from "@ariakit/ui/html/badge.react.tsx";
import {
  Button,
  ButtonContent,
  ButtonDescription,
  ButtonGlider,
  ButtonGroup,
  ButtonLabel,
  ButtonSeparator,
  ButtonSlot,
} from "@ariakit/ui/html/button.react.tsx";
import {
  checkboxCard,
  checkboxCardCheck,
  checkboxCardGrid,
  checkboxCardLabel,
} from "@ariakit/ui/styles/checkbox-card.ts";
import { controlGroup, controlSeparator } from "@ariakit/ui/styles/control.ts";
import {
  ActivityIcon,
  ArrowRightIcon,
  CheckIcon,
  ComputerIcon,
  EllipsisIcon,
  FilesIcon,
  LayoutDashboardIcon,
  ListIcon,
  MessageSquareIcon,
  PlusIcon,
  SettingsIcon,
  UserIcon,
  VerifiedIcon,
} from "lucide-react";
import { useState } from "react";
import {
  CheckboxCard,
  CheckboxCardCheck,
  CheckboxCardGrid,
  CheckboxCardLabel,
} from "../checkbox-card.react.tsx";
import { interests as data } from "../data.ts";

const interests = {
  culture: data.culture,
  finance: data.finance,
  food: data.food,
  health: data.health,
  history: data.history,
  productivity: data.productivity,
} as const;

export default function Example() {
  const [values, setValues] = useState<(keyof typeof interests)[]>(["finance"]);
  return (
    <Group className="flex flex-col gap-4">
      <GroupLabel className="text-xl font-medium  text-center">
        Select your interests
      </GroupLabel>
      <CheckboxCardGrid
        value={values}
        setValue={setValues}
        className="w-150 max-w-[100cqi] gap-4 p-4"
      >
        {Object.entries(interests).map(([key, interest]) => (
          <CheckboxCard key={key} value={key} disabled={key === "culture"}>
            <CheckboxCardLabel>{interest.label}</CheckboxCardLabel>
            <CheckboxCardCheck />
          </CheckboxCard>
        ))}
      </CheckboxCardGrid>
      <div {...checkboxCardGrid({})}>
        {Object.entries(interests).map(([key, interest]) => (
          <label
            key={key}
            {...checkboxCard({})}
            aria-disabled={key === "culture" || key === "history"}
          >
            <span {...checkboxCardCheck()}>
              <CheckIcon />
            </span>
            <input
              type="checkbox"
              className="sr-only"
              defaultChecked={key === "culture"}
              disabled={key === "culture" || key === "history"}
            />
            <span {...checkboxCardLabel()}>{interest.label}</span>
          </label>
        ))}
      </div>
      <div {...checkboxCardGrid({})}>
        {Object.entries(interests).map(([key, interest]) => (
          <label
            key={key}
            {...checkboxCard()}
            aria-disabled={key === "culture"}
          >
            <input
              type="checkbox"
              className="sr-only"
              defaultChecked={key === "culture"}
              disabled={key === "culture"}
            />
            <span {...checkboxCardLabel()}>{interest.label}</span>
            <span {...checkboxCardCheck()}>
              <CheckIcon />
            </span>
          </label>
        ))}
      </div>
      <div className="p-20 flex gap-8">
        <label
          aria-disabled
          {...checkboxCard({
            className: "w-max",
            // $padding: "field",
          })}
        >
          <input type="checkbox" defaultChecked disabled />
          <span
            {...checkboxCardCheck({
              // $size: "xs",
              // $frame: "auto",
            })}
          >
            <CheckIcon />
          </span>
          <span
            {...checkboxCardLabel({
              // $noStartGap: true,
              // className: "-ms-0.5",
            })}
          >
            Programming
          </span>
          {/* <span
            {...checkboxCardIcon({
              // $size: "xs",
            })}
          >
            <ComputerIcon />
          </span> */}
        </label>
        <label
          {...checkboxCard({
            className: "w-max",
            // $padding: "field",
          })}
        >
          <input type="checkbox" defaultChecked />
          <span
            {...checkboxCardLabel({
              // $noStartGap: true,
              // className: "-ms-0.5",
            })}
          >
            Technology
          </span>
          <span
            {...checkboxCardCheck({
              // $size: "xs",
              // $frame: "auto",
            })}
          >
            <CheckIcon />
          </span>
        </label>
        <label
          {...checkboxCard({
            className: "w-max",
            // $padding: "field",
          })}
        >
          <input type="checkbox" defaultChecked />
          <span
            {...checkboxCardCheck({
              // $size: "xs",
              // $frame: "auto",
            })}
          >
            <CheckIcon />
          </span>
          <span
            {...checkboxCardLabel({
              // $noStartGap: true,
              // className: "-ms-0.5",
            })}
          >
            Programming
          </span>
        </label>
      </div>

      <div className="flex flex-wrap gap-8 justify-center w-160 items-center">
        <ButtonGroup
          $bg="popLightDark"
          $rounded="full"
          $size="sm"
          $layout="stretch"
          className="overflow-hidden relative ak-dark:ring w-100!"
        >
          <Button $bg="ghost" $px="lg">
            <ButtonSlot>
              <UserIcon />
            </ButtonSlot>
            <ButtonLabel>Profile</ButtonLabel>
          </Button>
          <ButtonSeparator />
          <Button $bg="ghost" $px="lg">
            <ButtonSlot>
              <SettingsIcon />
            </ButtonSlot>
            <ButtonLabel>Settings</ButtonLabel>
          </Button>
          <ButtonSeparator />
          <Button $bg="ghost" $px="lg">
            <ButtonSlot>
              <SettingsIcon />
            </ButtonSlot>
            <ButtonLabel>Settings</ButtonLabel>
          </Button>
          <ButtonGlider $state="hover" />
          <ButtonGlider $state="focus" />
          <ButtonGlider
            $state="selected"
            // $bg="light2"
            // $border="adaptive"
            // $borderType="inset"
            $kind="bevel"
            className="shadow-[0_0_12px_--alpha(black/0.05),0_8px_16px_--alpha(black/0.05)]"
          />
        </ButtonGroup>
        <Tabs $rounded="2xl" $border $borderWidth={4} $p="none">
          <TabList>
            <Tab>Profile</Tab>
            <TabSeparator />
            <Tab>Settings</Tab>
            <TabSeparator />
            <Tab>Activity</Tab>
            <Tab>Files</Tab>
            <Tab>Comments</Tab>
          </TabList>
          <TabPanels>
            <TabPanel>Panel 1</TabPanel>
            <TabPanel>Panel 2</TabPanel>
            <TabPanel>Panel 3</TabPanel>
            <TabPanel>Panel 3</TabPanel>
            <TabPanel>Panel 3</TabPanel>
          </TabPanels>
        </Tabs>
        <Tabs $rounded="3xl" $border $borderWidth={4} $p="lg">
          <TabList>
            <Tab>Profile</Tab>
            <TabSeparator />
            <Tab>Settings</Tab>
            <TabSeparator />
            <Tab>Activity</Tab>
            <Tab>Files</Tab>
            <Tab>Comments</Tab>
          </TabList>
          <TabPanels>
            <TabPanel>Panel 1</TabPanel>
            <TabPanel>Panel 2</TabPanel>
            <TabPanel>Panel 3</TabPanel>
            <TabPanel>Panel 3</TabPanel>
            <TabPanel>Panel 3</TabPanel>
          </TabPanels>
        </Tabs>
        <div className="ak-frame-xl/10 ak-bordering shadow-lg ak-layer-pop-0.5 overflow-clip">
          <Tabs
            $p="sm"
            $rounded="2xl"
            $borderWidth={1}
            $borderColor="primary"
            $borderWeight="contrast"
          >
            <TabList>
              <Tab>Profile</Tab>
              <TabSeparator />
              <Tab>Settings</Tab>
              <TabSeparator />
              <Tab>Activity</Tab>
              <TabSeparator />
              <Tab>Files</Tab>
              <TabSeparator />
              <Tab>Comments</Tab>
              <TabGlider $state="hover" />
              <TabGlider $state="selected" $kind="folder" />
              <TabGlider $state="focus" $bg="primary" />
            </TabList>
            <TabPanels>
              <TabPanel single className="grid">
                <ButtonGroup
                  $layout="vertical"
                  $roundedType="overflow"
                  className="invisible"
                >
                  <Button $bg="ghost">Panel 1</Button>
                  <Button $bg="ghost">Panel 1</Button>
                  <Button $bg="ghost">Panel 1</Button>
                  <ButtonGlider $state="hover" />
                </ButtonGroup>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </div>
        <div className="ak-frame-xl ak-bordering shadow-lg ak-layer-pop-0.5 overflow-clip">
          <Tabs
            $p="none"
            $rounded="xl"
            $border={true}
            $borderType="bordering"
            $roundedType="overflow"
          >
            <TabList>
              <Tab $border={false}>Tab 1</Tab>
              <TabSeparator />
              <Tab $border={false}>Tab 2</Tab>
              <TabSeparator />
              <Tab $border={false}>Tab 3</Tab>
              <TabGlider $state="hover" />
              <TabGlider $state="selected" $kind="folder" $bg="light" $border />
              <TabGlider
                $state="focus"
                className="rounded-b-none -z-2 [clip-path:inset(-0.25em_-0.25em_0.25em_-0.25em)]"
              />
            </TabList>
            <TabPanel single className="grid">
              <ButtonGroup $layout="vertical" $roundedType="overflow">
                <Button $bg="ghost">Panel 1</Button>
                <Button $bg="ghost">Panel 1</Button>
                <Button $bg="ghost">Panel 1</Button>
                <ButtonGlider $state="hover" />
              </ButtonGroup>
            </TabPanel>
          </Tabs>
        </div>
        <div {...controlGroup({})}>
          <Button $bg="pop" $color="danger">
            <ButtonSlot>
              <LayoutDashboardIcon />
            </ButtonSlot>
            <ButtonLabel>Overview</ButtonLabel>
          </Button>
          <div {...controlSeparator({})}></div>
          <Button $bg="ghost">
            <ButtonSlot>
              <ListIcon />
            </ButtonSlot>
            <ButtonLabel>Details</ButtonLabel>
          </Button>
          <div {...controlSeparator({})}></div>
          <Button $bg="ghost">
            <ButtonSlot>
              <ActivityIcon />
            </ButtonSlot>
            <ButtonLabel>Activity</ButtonLabel>
          </Button>
          <div {...controlSeparator({})}></div>
          <Button $bg="ghost">
            <ButtonSlot>
              <FilesIcon />
            </ButtonSlot>
            <ButtonLabel>Files</ButtonLabel>
          </Button>
          <div {...controlSeparator({})}></div>
          <Button $bg="ghost">
            <ButtonSlot>
              <MessageSquareIcon />
            </ButtonSlot>
            <ButtonLabel>Comments</ButtonLabel>
          </Button>
        </div>

        <Button $px="xl" $bg="invert" $rounded="full">
          <ButtonSlot $kind="avatar" $rowSpan={2} $size="xl" $rounded="auto">
            <img
              src="https://pbs.twimg.com/profile_images/1964797260597772288/uQG557we_400x400.jpg"
              alt=""
            />
          </ButtonSlot>
          <ButtonContent $orientation="vertical">
            <ButtonLabel>Diego Haz</ButtonLabel>
            <ButtonDescription>@diegohaz</ButtonDescription>
          </ButtonContent>
          <ButtonSlot $kind="badge" $floating>
            4
          </ButtonSlot>
        </Button>
        <Button>
          <ButtonSlot>
            <PlusIcon />
          </ButtonSlot>
          <ButtonLabel className="sr-only">Add</ButtonLabel>
        </Button>
        <Button $rounded="full" $px="xl">
          <ButtonSlot>
            <CheckIcon />
          </ButtonSlot>
          <ButtonLabel>Following</ButtonLabel>
        </Button>
        <Button $bg="warning" $kind="bevel" $rounded="md" $px="xl">
          <ButtonSlot>
            <PlusIcon />
          </ButtonSlot>
          <ButtonLabel>Follow back</ButtonLabel>
        </Button>
        <Button $rounded="full" $size="sm" $px="lg">
          <ButtonSlot>
            <ComputerIcon />
          </ButtonSlot>
          <ButtonLabel>Technology</ButtonLabel>
          <ButtonSlot $kind="badge" $floating>
            <BadgeLabel>New</BadgeLabel>
          </ButtonSlot>
        </Button>
        <Button $rounded="full" $bg="invert">
          <ButtonLabel>Continue</ButtonLabel>
          <ButtonSlot $size="2xl" $bg="invert">
            <ArrowRightIcon />
          </ButtonSlot>
        </Button>
        <Button $rounded="xl" $p="sm" $bg="ghost" $border $size="sm">
          <ButtonSlot
            $kind="badge"
            $bg="primary"
            $mix={15}
            // $border="medium"
            $size="xl"
            $mx="2xl"
          >
            <BadgeLabel>New</BadgeLabel>
          </ButtonSlot>
          <ButtonLabel>We're lauching soon</ButtonLabel>
          <ButtonSlot>
            <ArrowRightIcon />
          </ButtonSlot>
        </Button>
        <Button $rounded="full" $gap="lg" className="min-w-50">
          <ButtonSlot $rowSpan={2} $kind="avatar">
            <img
              src="https://pbs.twimg.com/profile_images/1964797260597772288/uQG557we_400x400.jpg"
              alt=""
            />
          </ButtonSlot>
          <ButtonContent $orientation="vertical">
            <ButtonLabel className="flex items-center gap-1">
              Haz{" "}
              <VerifiedIcon className="size-4 ak-layer-contrast-primary-4 bg-transparent fill-(--ak-layer) [&_path:first-child]:stroke-0" />
            </ButtonLabel>
            <ButtonDescription>@hazdiego</ButtonDescription>
          </ButtonContent>
          <ButtonSlot $rowSpan={2}>
            <EllipsisIcon />
          </ButtonSlot>
        </Button>
      </div>
    </Group>
  );
}
