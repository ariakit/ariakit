import * as ak from "@ariakit/react";
import {
  Button,
  ButtonLabel,
  ButtonSlot,
} from "@ariakit/ui/components/button.ariakit.react";
import { Frame } from "@ariakit/ui/components/frame.ariakit.react";
import { Input } from "@ariakit/ui/components/input.ariakit.react";
import {
  Nav,
  NavGroup,
  NavGroupLabel,
  NavLink,
  NavLinkLabel,
  NavList,
  NavSlot,
} from "@ariakit/ui/components/nav.ariakit.react";
import {
  Shell,
  ShellFooter,
  ShellFooterCenter,
  ShellHeader,
  ShellHeaderStart,
  ShellMain,
  ShellMainBody,
  ShellSidebar,
  ShellSidebarBody,
  ShellSidebarFooter,
  ShellSidebarHeader,
} from "@ariakit/ui/components/shell.ariakit.react";
import {
  ChevronDown,
  Hash,
  Hexagon,
  PanelLeft,
  SendHorizontal,
  Users,
} from "lucide-react";
import { useId, useRef, useState } from "react";
import { flushSync } from "react-dom";

interface Person {
  id: string;
  name: string;
  hue: "green" | "red" | "blue" | "orange" | "magenta";
  online: boolean;
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("");
}

interface AvatarProps {
  person: Person;
  className?: string;
}

function Avatar({ person, className = "size-7 text-xs" }: AvatarProps) {
  return (
    <Frame
      $layer="brand"
      $hue={person.hue}
      $rounded="full"
      $p="none"
      className={`${className} grid shrink-0 place-items-center font-semibold`}
    >
      {getInitials(person.name)}
    </Frame>
  );
}

export default function Example() {
  const [channelsOpen, setChannelsOpen] = useState(true);
  const channelsId = useId();
  const [membersOpen, setMembersOpen] = useState(true);
  const membersId = useId();
  const [messages, setMessages] = useState(initialMessages);
  const [draft, setDraft] = useState("");
  const messagesRef = useRef<HTMLOListElement>(null);
  const onlineCount = members.filter((person) => person.online).length;
  return (
    <Shell>
      <ShellSidebar
        id={channelsId}
        open={channelsOpen}
        $width="sm"
        aria-label="Workspace"
        render={<nav />}
      >
        <ShellSidebarHeader>
          <Button className="w-full justify-start">
            <ButtonSlot>
              <Hexagon strokeWidth={1.5} />
            </ButtonSlot>
            <ButtonLabel $grow>Acme Inc</ButtonLabel>
            <ButtonSlot>
              <ChevronDown />
            </ButtonSlot>
          </Button>
        </ShellSidebarHeader>
        <ShellSidebarBody>
          <Nav
            list={false}
            render={<div />}
            glider={[{ $kind: "flat" }, { $kind: "bar" }]}
          >
            <NavGroup>
              <NavGroupLabel>Channels</NavGroupLabel>
              <NavList>
                {channels.map((channel) => (
                  <NavLink
                    key={channel.name}
                    href={`#${channel.name}`}
                    aria-current={channel.current ? "page" : undefined}
                  >
                    <NavSlot>
                      <Hash strokeWidth={1.5} />
                    </NavSlot>
                    <NavLinkLabel>{channel.name}</NavLinkLabel>
                    {channel.unread > 0 && (
                      <NavSlot $kind="badge">{channel.unread}</NavSlot>
                    )}
                  </NavLink>
                ))}
              </NavList>
            </NavGroup>
            <NavGroup>
              <NavGroupLabel>Direct messages</NavGroupLabel>
              <NavList>
                {directMessages.map(({ person, unread }) => (
                  <NavLink key={person.id} href={`#${person.id}`}>
                    <NavSlot
                      $kind="avatar"
                      $layer="brand"
                      $hue={person.hue}
                      $size={6}
                    >
                      {getInitials(person.name)}
                    </NavSlot>
                    <NavLinkLabel className="truncate">
                      {person.name}
                    </NavLinkLabel>
                    {unread > 0 && <NavSlot $kind="badge">{unread}</NavSlot>}
                  </NavLink>
                ))}
              </NavList>
            </NavGroup>
          </Nav>
        </ShellSidebarBody>
        <ShellSidebarFooter className="flex items-center gap-2 p-3">
          <Avatar person={maya} className="size-8 text-xs" />
          <div className="min-w-0 text-sm">
            <p className="truncate font-semibold">{maya.name}</p>
            <p className="ak-ink-70 truncate text-xs">In a meeting</p>
          </div>
        </ShellSidebarFooter>
      </ShellSidebar>
      {/* The nested shell takes the outer shell's main cell. */}
      <Shell>
        <ShellHeader
          start={
            <ShellHeaderStart
              $shrink
              className="flex min-w-0 items-center gap-2"
            >
              <Button
                className="@max-3xl/shell:hidden"
                aria-label="Toggle channels"
                aria-expanded={channelsOpen}
                aria-controls={channelsId}
                onClick={() => setChannelsOpen((open) => !open)}
              >
                <ButtonSlot>
                  <PanelLeft />
                </ButtonSlot>
              </Button>
              <Hash className="size-4 shrink-0" />
              <ak.Heading className="text-base font-medium">design</ak.Heading>
              <span className="ak-ink-70 truncate text-sm">
                Design reviews and component feedback
              </span>
            </ShellHeaderStart>
          }
          end={
            <Button
              className="@max-3xl/shell:hidden"
              aria-label="Toggle members"
              aria-expanded={membersOpen}
              aria-controls={membersId}
              onClick={() => setMembersOpen((open) => !open)}
            >
              <ButtonSlot>
                <Users />
              </ButtonSlot>
            </Button>
          }
        />
        <ShellSidebar
          id={membersId}
          open={membersOpen}
          $side="end"
          $width="sm"
          aria-label="Members"
          render={<aside />}
        >
          <ShellSidebarBody $p={3}>
            <p className="font-semibold">Members</p>
            <p className="ak-ink-70 mt-1 text-xs">{onlineCount} online</p>
            <ul className="mt-3 grid gap-3">
              {members.map((person) => (
                <li key={person.id} className="flex items-center gap-2 text-sm">
                  <Avatar person={person} />
                  <div className="min-w-0">
                    <p className="truncate font-medium">{person.name}</p>
                    <p className="ak-ink-70 truncate text-xs">
                      {person.online ? "Online" : "Away"}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </ShellSidebarBody>
        </ShellSidebar>
        <ShellMain>
          <ShellMainBody>
            <p className="ak-ink-70 py-4 text-center text-xs">Today</p>
            <ol
              ref={messagesRef}
              aria-label="Messages"
              className="grid gap-5 pb-6"
            >
              {messages.map((message) => (
                <li key={message.id} className="flex gap-3">
                  <Avatar person={message.author} />
                  <div className="min-w-0">
                    <p className="flex items-baseline gap-2">
                      <span className="font-semibold">
                        {message.author.name}
                      </span>
                      <time className="ak-ink-70 text-xs">{message.time}</time>
                    </p>
                    <p className="ak-ink-80 text-sm/6">{message.text}</p>
                  </div>
                </li>
              ))}
            </ol>
          </ShellMainBody>
        </ShellMain>
        <ShellFooter
          $sticky
          $blur
          center={
            <ShellFooterCenter $grow>
              <form
                className="flex w-full gap-2"
                onSubmit={(event) => {
                  event.preventDefault();
                  const text = draft.trim();
                  if (!text) {
                    return;
                  }
                  flushSync(() => {
                    setMessages((previous) => [
                      ...previous,
                      {
                        id: previous.length + 1,
                        author: maya,
                        time: "Now",
                        text,
                      },
                    ]);
                  });
                  setDraft("");
                  // The sent message can start below the sticky composer.
                  messagesRef.current?.lastElementChild?.scrollIntoView({
                    block: "nearest",
                  });
                }}
              >
                <Input
                  aria-label="Message"
                  placeholder="Message #design"
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  className="w-full min-w-0"
                />
                <Button
                  type="submit"
                  aria-label="Send message"
                  $layer="brand"
                  $kind="bevel"
                >
                  <ButtonSlot>
                    <SendHorizontal />
                  </ButtonSlot>
                </Button>
              </form>
            </ShellFooterCenter>
          }
        />
      </Shell>
    </Shell>
  );
}

const maya: Person = {
  id: "maya",
  name: "Maya Chen",
  hue: "green",
  online: true,
};

const ada: Person = {
  id: "ada",
  name: "Ada Lovelace",
  hue: "red",
  online: true,
};

const grace: Person = {
  id: "grace",
  name: "Grace Hopper",
  hue: "blue",
  online: true,
};

const linus: Person = {
  id: "linus",
  name: "Linus Torvalds",
  hue: "orange",
  online: false,
};

const margaret: Person = {
  id: "margaret",
  name: "Margaret Hamilton",
  hue: "magenta",
  online: true,
};

const members = [ada, grace, linus, margaret];

const channels = [
  { name: "general", unread: 0, current: false },
  { name: "design", unread: 4, current: true },
  { name: "launch", unread: 2, current: false },
  { name: "random", unread: 0, current: false },
];

const directMessages = [
  { person: ada, unread: 1 },
  { person: grace, unread: 0 },
  { person: linus, unread: 0 },
];

const initialMessages = [
  { id: 1, author: ada, time: "9:02", text: "Morning! Avatars are in Figma." },
  { id: 2, author: grace, time: "9:04", text: "Do small sizes read at 24px?" },
  { id: 3, author: ada, time: "9:05", text: "Yes, I checked the badge too." },
  {
    id: 4,
    author: maya,
    time: "9:11",
    text: "Composer now sits under thread.",
  },
  {
    id: 5,
    author: linus,
    time: "9:15",
    text: "Can the composer stay visible?",
  },
  { id: 6, author: maya, time: "9:17", text: "Yes, it sticks to the bottom." },
  {
    id: 7,
    author: margaret,
    time: "9:22",
    text: "Keyboard order follows reading.",
  },
  {
    id: 8,
    author: grace,
    time: "9:26",
    text: "Members panel collapses on mobile.",
  },
  { id: 9, author: ada, time: "9:31", text: "Shared the new empty state." },
  {
    id: 10,
    author: maya,
    time: "9:34",
    text: "Love it. Same copy for #launch?",
  },
  { id: 11, author: linus, time: "9:40", text: "Release build is green." },
  {
    id: 12,
    author: margaret,
    time: "9:43",
    text: "Two flaky tests pass on rerun.",
  },
  {
    id: 13,
    author: grace,
    time: "9:50",
    text: "Opened a ticket for Safari tooltips.",
  },
  {
    id: 14,
    author: ada,
    time: "9:58",
    text: "I will pair with Grace after lunch.",
  },
  {
    id: 15,
    author: maya,
    time: "10:05",
    text: "Great. Final specs before review.",
  },
];
