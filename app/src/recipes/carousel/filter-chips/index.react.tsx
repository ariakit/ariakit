import * as ak from "@ariakit/react";
import {
  Carousel,
  CarouselViewport,
} from "@ariakit/ui/components/carousel.ariakit.react";
import {
  CheckboxCard,
  CheckboxCardCheck,
  CheckboxCardLabel,
  CheckboxGroup,
} from "@ariakit/ui/components/checkbox.ariakit.react";
import { useState } from "react";

const teams = [
  { value: "design", label: "Design" },
  { value: "engineering", label: "Engineering" },
  { value: "marketing", label: "Marketing" },
  { value: "support", label: "Support" },
  { value: "sales", label: "Sales" },
  { value: "finance", label: "Finance" },
  { value: "legal", label: "Legal" },
  { value: "operations", label: "Operations" },
  { value: "research", label: "Research" },
];

const roles = [
  { title: "Product designer", team: "design" },
  { title: "Frontend engineer", team: "engineering" },
  { title: "Backend engineer", team: "engineering" },
  { title: "Content writer", team: "marketing" },
  { title: "Support specialist", team: "support" },
  { title: "Account executive", team: "sales" },
  { title: "Financial analyst", team: "finance" },
  { title: "Privacy counsel", team: "legal" },
  { title: "Office manager", team: "operations" },
  { title: "User researcher", team: "research" },
];

export default function Example() {
  const [selected, setSelected] = useState(["engineering"]);
  // Without a filter, all roles show.
  const visibleRoles = selected.length
    ? roles.filter((role) => selected.includes(role.team))
    : roles;
  return (
    <div className="grid w-[24rem] max-w-full gap-4">
      <CheckboxGroup label="Filter by team">
        <Carousel $kind="row">
          {/* The chips stay on one row that scrolls sideways. */}
          <CarouselViewport>
            <ak.CheckboxProvider value={selected} setValue={setSelected}>
              {teams.map((team) => (
                <CheckboxCard
                  key={team.value}
                  name="teams"
                  value={team.value}
                  $rounded="full"
                  $size="sm"
                  className="shrink-0"
                >
                  <CheckboxCardCheck />
                  <CheckboxCardLabel>{team.label}</CheckboxCardLabel>
                </CheckboxCard>
              ))}
            </ak.CheckboxProvider>
          </CarouselViewport>
        </Carousel>
      </CheckboxGroup>
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
