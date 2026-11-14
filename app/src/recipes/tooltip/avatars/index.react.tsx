import * as ak from "@ariakit/react";
import {
  Avatar,
  AvatarGroup,
} from "@ariakit/ui/components/avatar.ariakit.react";
import {
  TooltipAnchor,
  TooltipPopover,
  TooltipProvider,
} from "@ariakit/ui/components/tooltip.ariakit.react";

interface Person {
  name: string;
  hue: "orange" | "green" | "cyan" | "blue" | "magenta";
}

const people: Person[] = [
  { name: "Hana Kobayashi", hue: "magenta" },
  { name: "Tom Becker", hue: "blue" },
  { name: "Rosa Delgado", hue: "green" },
  { name: "Owen Walsh", hue: "orange" },
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

interface AvatarLinkProps {
  href: string;
  label: string;
  children: string;
  hue?: Person["hue"];
}

function AvatarLink({ href, label, children, hue }: AvatarLinkProps) {
  return (
    <TooltipAnchor
      render={
        // The avatar is a link, so the label names the link.
        <Avatar
          render={<a href={href} />}
          aria-label={label}
          $layer={hue ? "brand" : undefined}
          $hue={hue}
          $focus
          $focusOffset={2}
        />
      }
    >
      <span aria-hidden>{children}</span>
    </TooltipAnchor>
  );
}

// The avatars share this tooltip, which names the avatar that it shows for. The
// $slide variant slides it from name to name.
function SharedTooltip() {
  const store = ak.useTooltipContext();
  const anchor = ak.useStoreState(store, "anchorElement");
  return (
    <TooltipPopover $slide>{anchor?.getAttribute("aria-label")}</TooltipPopover>
  );
}

export default function Example() {
  return (
    <TooltipProvider>
      <AvatarGroup aria-label="Project members" $size={9}>
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
      </AvatarGroup>
      <SharedTooltip />
    </TooltipProvider>
  );
}
