import { Avatar } from "@ariakit/ui/components/avatar.ariakit.react";

interface Person {
  name: string;
  role: string;
  hue: "magenta" | "blue" | "green";
}

const people: Person[] = [
  { name: "Hana Kobayashi", role: "Design lead", hue: "magenta" },
  { name: "Tom Becker", role: "Engineer", hue: "blue" },
  { name: "Rosa Delgado", role: "Product manager", hue: "green" },
];

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("");
}

export default function Example() {
  return (
    <ul aria-label="Team" className="grid w-64 max-w-full gap-4 text-sm">
      {people.map((person) => (
        <li key={person.name} className="flex items-center gap-3">
          {/* The name follows the avatar, so the avatar stays decorative. */}
          <Avatar $layer="brand" $hue={person.hue}>
            {getInitials(person.name)}
          </Avatar>
          <div className="min-w-0">
            <p className="truncate font-medium">{person.name}</p>
            <p className="ak-ink-70 truncate">{person.role}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}
