import { Group, GroupLabel } from "@ariakit/react";
import {
  checkboxCard,
  checkboxCardCheck,
  checkboxCardGrid,
  checkboxCardIcon,
  checkboxCardLabel,
} from "@ariakit/ui/styles/checkbox-card.ts";
import { CheckIcon, CodeIcon, ComputerIcon } from "lucide-react";
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
          <span
            {...checkboxCardCheck({
              // $size: "xs",
              // $frame: "auto",
            })}
          >
            <CheckIcon />
          </span>
          <input type="checkbox" defaultChecked disabled />
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
            Programming
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
      </div>
    </Group>
  );
}
