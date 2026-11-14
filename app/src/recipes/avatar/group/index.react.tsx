import {
  Avatar,
  AvatarGroup,
} from "@ariakit/ui/components/avatar.ariakit.react";

interface Person {
  name: string;
  hue: "magenta" | "blue" | "green" | "orange" | "cyan";
}

const people: Person[] = [
  { name: "Hana Kobayashi", hue: "magenta" },
  { name: "Tom Becker", hue: "blue" },
  { name: "Rosa Delgado", hue: "green" },
  { name: "Owen Walsh", hue: "orange" },
  { name: "Lucia Moreno", hue: "cyan" },
  { name: "Dan Okafor", hue: "blue" },
  { name: "Mei Tanaka", hue: "green" },
];

const MAX_AVATARS = 4;

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("");
}

export default function Example() {
  const shown = people.slice(0, MAX_AVATARS);
  const rest = people.length - shown.length;
  return (
    // No names follow the avatars, so the group and each avatar have a label.
    <AvatarGroup aria-label="Project members" $size={10}>
      {shown.map((person) => (
        <Avatar
          key={person.name}
          aria-label={person.name}
          $layer="brand"
          $hue={person.hue}
        >
          {getInitials(person.name)}
        </Avatar>
      ))}
      {rest > 0 && <Avatar aria-label={`${rest} more members`}>+{rest}</Avatar>}
    </AvatarGroup>
  );
}
