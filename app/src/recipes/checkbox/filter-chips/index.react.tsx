import * as ak from "@ariakit/react";
import {
  CheckboxCard,
  CheckboxCardCheck,
  CheckboxCardLabel,
} from "@ariakit/ui/components/checkbox.ariakit.react";
import { useId, useState } from "react";

const teams = [
  { value: "design", label: "Design" },
  { value: "engineering", label: "Engineering" },
  { value: "marketing", label: "Marketing" },
  { value: "support", label: "Support" },
];

const roles = [
  { title: "Product designer", team: "design" },
  { title: "Frontend engineer", team: "engineering" },
  { title: "Backend engineer", team: "engineering" },
  { title: "Content writer", team: "marketing" },
  { title: "Growth marketer", team: "marketing" },
  { title: "Support specialist", team: "support" },
];

export default function Example() {
  const labelId = useId();
  const [selected, setSelected] = useState(["engineering"]);
  // Without a filter, all roles show.
  const visibleRoles = selected.length
    ? roles.filter((role) => selected.includes(role.team))
    : roles;
  return (
    <div className="grid w-[24rem] max-w-full gap-4">
      <div className="grid gap-2">
        <span id={labelId} className="text-sm font-medium">
          Filter by team
        </span>
        <div
          role="group"
          aria-labelledby={labelId}
          className="flex flex-wrap gap-2"
        >
          <ak.CheckboxProvider value={selected} setValue={setSelected}>
            {teams.map((team) => (
              <CheckboxCard
                key={team.value}
                name="teams"
                value={team.value}
                $rounded="full"
                $size="sm"
              >
                {/* The check keeps its small corners in the round chip, so
                    the chip doesn't look like a radio. */}
                <CheckboxCardCheck />
                <CheckboxCardLabel>{team.label}</CheckboxCardLabel>
              </CheckboxCard>
            ))}
          </ak.CheckboxProvider>
        </div>
      </div>
      <p role="status" className="text-sm font-medium">
        {visibleRoles.length} open{" "}
        {visibleRoles.length === 1 ? "role" : "roles"}
      </p>
      <ul className="ak-ink-70 -mt-2 grid gap-1 text-sm">
        {visibleRoles.map((role) => (
          <li key={role.title}>{role.title}</li>
        ))}
      </ul>
    </div>
  );
}
