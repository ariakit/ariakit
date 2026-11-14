import { Avatar } from "@ariakit/ui/components/avatar.ariakit.react";
import {
  Button,
  ButtonLabel,
  ButtonSlot,
} from "@ariakit/ui/components/button.ariakit.react";
import {
  Nav,
  NavLink,
  NavLinkContent,
  NavLinkDescription,
  NavLinkLabel,
  NavList,
  NavSlot,
} from "@ariakit/ui/components/nav.ariakit.react";
import { ChevronsUpDown } from "lucide-react";

interface Person {
  name: string;
  email: string;
  hue: "magenta" | "blue";
}

const people: Person[] = [
  { name: "Hana Kobayashi", email: "hana@example.com", hue: "magenta" },
  { name: "Tom Becker", email: "tom@example.com", hue: "blue" },
];

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("");
}

export default function Example() {
  return (
    <div className="grid w-64 max-w-full gap-4 text-sm">
      <div className="flex items-center justify-between gap-2">
        <Button className="min-w-0 flex-1">
          {/* A box slot takes one line, and the avatar fills it. */}
          <ButtonSlot $kind="box">
            <Avatar $layer="brand" $rounded="md">
              A
            </Avatar>
          </ButtonSlot>
          <ButtonLabel $grow>Acme</ButtonLabel>
          <ButtonSlot>
            <ChevronsUpDown />
          </ButtonSlot>
        </Button>
        {/* The avatar is decorative, so the label names the button. */}
        <Button aria-label="Account" $rounded="full">
          <ButtonSlot $kind="box">
            <Avatar $layer="brand" $hue="green">
              RD
            </Avatar>
          </ButtonSlot>
        </Button>
      </div>
      <Nav aria-label="Direct messages">
        <NavList>
          {people.map((person) => (
            <NavLink key={person.name} href={`#${person.email}`}>
              {/* The slot spans the label and the description. */}
              <NavSlot $kind="box" $size="xl" $rowSpan={2}>
                <Avatar $layer="brand" $hue={person.hue}>
                  {getInitials(person.name)}
                </Avatar>
              </NavSlot>
              <NavLinkContent>
                <NavLinkLabel>{person.name}</NavLinkLabel>
                <NavLinkDescription>{person.email}</NavLinkDescription>
              </NavLinkContent>
            </NavLink>
          ))}
        </NavList>
      </Nav>
    </div>
  );
}
