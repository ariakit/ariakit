import { Frame } from "@ariakit/ui/components/frame.ariakit.react";
import {
  Tooltip,
  TooltipGroup,
} from "@ariakit/ui/components/tooltip.ariakit.react";
import { focus } from "@ariakit/ui/styles/focus";

interface Person {
  name: string;
  hue: "orange" | "green" | "cyan" | "blue" | "magenta";
}

const people: Person[] = [
  { name: "Ada Lovelace", hue: "magenta" },
  { name: "Grace Hopper", hue: "blue" },
  { name: "Alan Turing", hue: "green" },
  { name: "Katherine Johnson", hue: "orange" },
];

const MORE_COUNT = 3;

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("");
}

function getHref(name: string) {
  return `#${name.toLowerCase().replaceAll(" ", "-")}`;
}

// Each avatar overlaps the one before it, with a ring in the color of the
// surface around it.
const avatarClass = [
  focus.jsx({ $focus: true, $focusOffset: 2 }).className,
  "grid size-9 place-items-center text-xs font-semibold",
  "-ms-1.5 ring-2 ring-(--ak-layer-parent) first:ms-0",
].join(" ");

interface AvatarLinkProps {
  href: string;
  label: string;
  children: string;
  hue?: Person["hue"];
}

function AvatarLink({ href, label, children, hue }: AvatarLinkProps) {
  return (
    <Tooltip content={label}>
      <Frame
        render={<a href={href} />}
        aria-label={label}
        $layer={hue ? "brand" : true}
        $hue={hue}
        // A neutral avatar needs a surface that differs from the page.
        $lightnessOffset={hue ? undefined : true}
        $rounded="full"
        $p="none"
        className={avatarClass}
      >
        <span aria-hidden>{children}</span>
      </Frame>
    </Tooltip>
  );
}

export default function Example() {
  return (
    // The avatars share one tooltip, which slides from name to name.
    <TooltipGroup>
      <div role="group" aria-label="Project members" className="flex">
        {people.map((person) => (
          <AvatarLink
            key={person.name}
            href={getHref(person.name)}
            label={person.name}
            hue={person.hue}
          >
            {getInitials(person.name)}
          </AvatarLink>
        ))}
        <AvatarLink href="#members" label={`${MORE_COUNT} more members`}>
          {`+${MORE_COUNT}`}
        </AvatarLink>
      </div>
    </TooltipGroup>
  );
}
