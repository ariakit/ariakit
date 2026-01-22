import { Group, GroupLabel } from "@ariakit/react";
import {
  Button,
  ButtonAdornment,
  ButtonContent,
  ButtonDescription,
  ButtonLabel,
} from "@ariakit/ui/html/button.react.tsx";
import { badgeText } from "@ariakit/ui/styles/badge.ts";
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
      <div className="flex flex-wrap gap-4 justify-center w-120 items-center">
        <Button>Button</Button>
        <Button>
          <ButtonAdornment>
            <PlusIcon />
          </ButtonAdornment>
          <ButtonLabel className="sr-only">Add</ButtonLabel>
        </Button>
        <Button $radius="round" $px="xl">
          <ButtonAdornment>
            <CheckIcon />
          </ButtonAdornment>
          <ButtonLabel>Following</ButtonLabel>
        </Button>
        <Button $bg="invert" $radius="round" $px="xl">
          <ButtonAdornment>
            <PlusIcon />
          </ButtonAdornment>
          <ButtonLabel>Follow back</ButtonLabel>
        </Button>
        <Button $radius="round" $size="sm">
          <ButtonAdornment>
            <ComputerIcon />
          </ButtonAdornment>
          <ButtonLabel>Technology</ButtonLabel>
          <ButtonAdornment $kind="badge" $floating>
            New
          </ButtonAdornment>
        </Button>
        <Button $radius="round" $bg="invert">
          <ButtonLabel>Continue</ButtonLabel>
          <ButtonAdornment $size="2xl" $bg="invert">
            <ArrowRightIcon />
          </ButtonAdornment>
        </Button>
        <Button $radius="round" $bg="pop" $size="sm">
          <ButtonAdornment
            $kind="badge"
            $bg="warning"
            $mix={25}
            $border="medium"
          >
            <span {...badgeText()}>New</span>
          </ButtonAdornment>
          <ButtonLabel>We're lauching soon</ButtonLabel>
          <ButtonAdornment>
            <ArrowRightIcon />
          </ButtonAdornment>
        </Button>
        <Button $radius="round" $gap="lg" className="min-w-50">
          <ButtonAdornment $rowSpan={2} $kind="avatar">
            <img
              src="https://pbs.twimg.com/profile_images/1964797260597772288/uQG557we_400x400.jpg"
              alt=""
            />
          </ButtonAdornment>
          <ButtonContent $orientation="vertical">
            <ButtonLabel className="flex items-center gap-1">
              Haz{" "}
              <VerifiedIcon className="size-4 ak-layer-contrast-primary-4 bg-transparent fill-(--ak-layer) [&_path:first-child]:stroke-0" />
            </ButtonLabel>
            <ButtonDescription>@hazdiego</ButtonDescription>
          </ButtonContent>
          <ButtonAdornment $rowSpan={2}>
            <EllipsisIcon />
          </ButtonAdornment>
        </Button>
      </div>
    </Group>
  );
}
