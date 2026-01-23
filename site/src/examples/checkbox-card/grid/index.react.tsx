import { Group, GroupLabel } from "@ariakit/react";
import { BadgeLabel } from "@ariakit/ui/html/badge.react.tsx";
import {
  Button,
  ButtonContent,
  ButtonDescription,
  ButtonLabel,
  ButtonSlot,
} from "@ariakit/ui/html/button.react.tsx";
import {
  checkboxCard,
  checkboxCardCheck,
  checkboxCardGrid,
  checkboxCardLabel,
} from "@ariakit/ui/styles/checkbox-card.ts";
import {
  ArrowRightIcon,
  CheckIcon,
  ComputerIcon,
  EllipsisIcon,
  PlusIcon,
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
      <div className="flex flex-wrap gap-8 justify-center w-120 items-center">
        <Button $px="xl" $bg="invert" $radius="round">
          <ButtonSlot $kind="avatar" $rowSpan={2} $size="xl" $radius="auto">
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
        <Button $radius="round" $px="xl">
          <ButtonSlot>
            <CheckIcon />
          </ButtonSlot>
          <ButtonLabel>Following</ButtonLabel>
        </Button>
        <Button $bg="warning" $kind="classic" $radius="field" $px="xl">
          <ButtonSlot>
            <PlusIcon />
          </ButtonSlot>
          <ButtonLabel>Follow back</ButtonLabel>
        </Button>
        <Button $radius="round" $size="sm" $px="lg">
          <ButtonSlot>
            <ComputerIcon />
          </ButtonSlot>
          <ButtonLabel>Technology</ButtonLabel>
          <ButtonSlot $kind="badge" $floating>
            New
          </ButtonSlot>
        </Button>
        <Button $radius="round" $bg="invert">
          <ButtonLabel>Continue</ButtonLabel>
          <ButtonSlot $size="2xl" $bg="invert">
            <ArrowRightIcon />
          </ButtonSlot>
        </Button>
        <Button $radius="round" $padding="badge" $bg="ghost" $border $size="sm">
          <ButtonSlot
            $kind="badge"
            $bg="primary"
            $mix={15}
            $border="medium"
            // $size="full"
          >
            <BadgeLabel>New</BadgeLabel>
          </ButtonSlot>
          <ButtonLabel>We're lauching soon</ButtonLabel>
          <ButtonSlot>
            <ArrowRightIcon />
          </ButtonSlot>
        </Button>
        <Button $radius="round" $gap="lg" className="min-w-50">
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
