import * as ak from "@ariakit/react";
import {
  Button,
  ButtonGroup,
  ButtonSlot,
} from "@ariakit/ui/components/button.ariakit.react";
import { Frame } from "@ariakit/ui/components/frame.ariakit.react";
import { HeadingLevel } from "@ariakit/ui/components/heading.ariakit.react";
import { Input } from "@ariakit/ui/components/input.ariakit.react";
import {
  Nav,
  NavLink,
  NavLinkLabel,
  NavSlot,
} from "@ariakit/ui/components/nav.ariakit.react";
import { Progress } from "@ariakit/ui/components/progress.ariakit.react";
import { Prose } from "@ariakit/ui/components/prose.ariakit.react";
import {
  Shell,
  ShellHeader,
  ShellHeaderCenter,
  ShellSidebar,
  ShellSidebarBody,
  ShellSidebarFooter,
  ShellSidebarHeader,
  ShellMain,
  ShellMainBody,
  ShellMainHeader,
  ShellMainIntro,
} from "@ariakit/ui/components/shell.ariakit.react";
import {
  Archive,
  CircleUser,
  FileText,
  Inbox,
  Mail,
  MessageSquare,
  PanelLeft,
  Plus,
  SendHorizontal,
  Star,
  Trash,
} from "lucide-react";
import { useId, useState } from "react";

const folders = [
  { id: "inbox", label: "Inbox", icon: Inbox },
  { id: "starred", label: "Starred", icon: Star },
  { id: "sent", label: "Sent", icon: SendHorizontal },
  { id: "drafts", label: "Drafts", icon: FileText },
  { id: "archive", label: "Archive", icon: Archive },
  { id: "trash", label: "Trash", icon: Trash },
] as const;

type FolderId = (typeof folders)[number]["id"];

interface Message {
  id: string;
  folder: FolderId;
  starred?: boolean;
  sender: string;
  subject: string;
  time: string;
  body: string;
  attachment?: string;
}

const messages: Message[] = [
  {
    id: "m1",
    folder: "inbox",
    starred: true,
    sender: "Maya Chen",
    subject: "Q4 roadmap review moved to Thursday",
    time: "09:42",
    body: "Hi team, I moved the roadmap review to Thursday at 14:00. Please send your top three items by Wednesday evening.",
    attachment: "q4-roadmap.pdf",
  },
  {
    id: "m2",
    folder: "inbox",
    sender: "Owen Brooks",
    subject: "Release branch failing on checkout tests",
    time: "08:15",
    body: "The release branch has failed twice since last night. I quarantined the flaky test. Can someone own the fix by Friday?",
  },
  {
    id: "m3",
    folder: "inbox",
    starred: true,
    sender: "Priya Raman",
    subject: "Design review notes for the shell layout",
    time: "Yesterday",
    body: "Notes are in the doc. The folder column reads well at xs width. The message list needs more contrast on hover.",
  },
  {
    id: "m4",
    folder: "inbox",
    sender: "Tom Becker",
    subject: "Invoice 2041 is ready",
    time: "Yesterday",
    body: "Invoice 2041 for September is attached to your account. Payment is due on the first of next month.",
  },
  {
    id: "m5",
    folder: "inbox",
    sender: "Lena Fischer",
    subject: "Lunch on Friday?",
    time: "Oct 13",
    body: "Are you free for lunch on Friday? The new ramen place opened near the station.",
  },
  {
    id: "m6",
    folder: "inbox",
    starred: true,
    sender: "Sam Okafor",
    subject: "Conference talk proposal accepted",
    time: "Oct 12",
    body: "Good news. The program committee accepted your talk on accessible shells. Slots are confirmed for the main track.",
  },
  {
    id: "m8",
    folder: "sent",
    sender: "Noah Park",
    subject: "Re: Shell sidebar widths",
    time: "Oct 11",
    body: "Sounds good. I will try xs for the folders and lg for the message list.",
  },
  {
    id: "m10",
    folder: "drafts",
    sender: "Hana Sato",
    subject: "Pricing page copy",
    time: "Oct 14",
    body: "Start with the simplest plan and keep the table short. Link to the full comparison at the end.",
  },
  {
    id: "m11",
    folder: "archive",
    sender: "Jonas Berg",
    subject: "Your October receipt",
    time: "Sep 30",
    body: "Thanks for your order. Your receipt is attached for your records.",
    attachment: "receipt-oct.pdf",
  },
  {
    id: "m12",
    folder: "trash",
    sender: "Flash Deals",
    subject: "48 hours only: 40% off",
    time: "Oct 3",
    body: "Our biggest sale of the year ends soon. Shop now before it is gone.",
  },
];

function isInFolder(message: Message, folder: FolderId) {
  if (folder === "starred") {
    return Boolean(message.starred);
  }
  return message.folder === folder;
}

function countInFolder(folder: FolderId) {
  return messages.filter((message) => isInFolder(message, folder)).length;
}

function isOutgoing(message: Message) {
  return message.folder === "sent" || message.folder === "drafts";
}

function initialsOf(name: string) {
  return name
    .split(" ")
    .map((word) => word.charAt(0))
    .join("");
}

export default function Example() {
  const [folder, setFolder] = useState<FolderId>("inbox");
  const [selectedId, setSelectedId] = useState("m1");
  const [foldersOpen, setFoldersOpen] = useState(true);
  const foldersId = useId();
  const folderMessages = messages.filter((message) =>
    isInFolder(message, folder),
  );
  // Derive the open message so that a folder change never leaves a stale id.
  const selectedMessage =
    folderMessages.find((message) => message.id === selectedId) ??
    folderMessages[0];

  return (
    <Shell>
      <ShellHeader
        $blur
        start={
          <>
            <Button
              className="@max-3xl/shell:hidden"
              aria-label="Toggle folders"
              aria-expanded={foldersOpen}
              aria-controls={foldersId}
              onClick={() => setFoldersOpen((open) => !open)}
            >
              <ButtonSlot>
                <PanelLeft />
              </ButtonSlot>
            </Button>
            <a href="#" className="flex items-center gap-2 font-semibold">
              <Mail strokeWidth={1.5} className="size-5" /> Mail
            </a>
          </>
        }
        center={
          <ShellHeaderCenter
            $grow
            className="hidden @[40rem]/shell-header:flex"
          >
            <Input
              aria-label="Search mail"
              placeholder="Search mail"
              className="w-full min-w-0"
            />
          </ShellHeaderCenter>
        }
        end={
          <>
            <Button aria-label="Account" $rounded="full">
              <ButtonSlot>
                <CircleUser />
              </ButtonSlot>
            </Button>
          </>
        }
      />
      <ShellSidebar
        id={foldersId}
        open={foldersOpen}
        $width="xs"
        $layer
        $darken={1}
        aria-label="Mailboxes"
        render={<nav />}
      >
        <ShellSidebarHeader $p={2}>
          <Button $layer="brand" $kind="bevel" className="w-full">
            <ButtonSlot>
              <Plus />
            </ButtonSlot>
            Compose
          </Button>
        </ShellSidebarHeader>
        <ShellSidebarBody $p={2}>
          <Nav render={<div />} glider={[{ $kind: "flat" }, { $kind: "bar" }]}>
            {folders.map((item) => (
              <NavLink
                key={item.id}
                href={`#${item.id}`}
                aria-current={item.id === folder ? "page" : undefined}
                onClick={(event) => {
                  event.preventDefault();
                  setFolder(item.id);
                }}
              >
                <NavSlot>
                  <item.icon strokeWidth={1.5} />
                </NavSlot>
                <NavLinkLabel>{item.label}</NavLinkLabel>
                <NavSlot $kind="badge">{countInFolder(item.id)}</NavSlot>
              </NavLink>
            ))}
          </Nav>
        </ShellSidebarBody>
        <ShellSidebarFooter className="px-4 py-3 text-xs">
          <Progress value={0.28} aria-label="Storage used" />
          <p className="ak-ink-70 mt-2">4.2 GB of 15 GB used</p>
        </ShellSidebarFooter>
      </ShellSidebar>
      <ShellSidebar
        $width="lg"
        $show="4xl"
        aria-label="Messages"
        render={<aside />}
      >
        <ShellSidebarBody $p={2}>
          <Nav render={<div />} glider={[{ $kind: "flat" }, { $kind: "bar" }]}>
            {folderMessages.map((message) => (
              <NavLink
                key={message.id}
                href={`#${message.id}`}
                aria-current={
                  message.id === selectedMessage?.id ? "true" : undefined
                }
                onClick={(event) => {
                  event.preventDefault();
                  setSelectedId(message.id);
                }}
              >
                <span className="grid min-w-0 flex-1 gap-1 py-1">
                  <span className="flex items-center justify-between gap-2">
                    <span className="flex min-w-0 items-center gap-1">
                      <NavLinkLabel className="truncate font-semibold">
                        {message.sender}
                      </NavLinkLabel>
                      {message.starred && (
                        <Star className="size-3.5 shrink-0 fill-current" />
                      )}
                    </span>
                    <time className="ak-ink-70 shrink-0 text-xs">
                      {message.time}
                    </time>
                  </span>
                  <span className="truncate text-sm font-medium">
                    {message.subject}
                  </span>
                  <span className="ak-ink-70 line-clamp-2 text-sm">
                    {message.body}
                  </span>
                </span>
              </NavLink>
            ))}
          </Nav>
        </ShellSidebarBody>
      </ShellSidebar>
      <ShellMain>
        <ShellMainHeader $blur>
          <div className="flex w-full items-center justify-between gap-4">
            <ButtonGroup aria-label="Message actions">
              <Button>
                <ButtonSlot>
                  <MessageSquare />
                </ButtonSlot>
                Reply
              </Button>
              <Button aria-label="Archive">
                <ButtonSlot>
                  <Archive />
                </ButtonSlot>
              </Button>
              <Button aria-label="Delete">
                <ButtonSlot>
                  <Trash />
                </ButtonSlot>
              </Button>
            </ButtonGroup>
            <p className="ak-ink-70 text-sm">
              {folderMessages.length}{" "}
              {folderMessages.length === 1 ? "message" : "messages"}
            </p>
          </div>
        </ShellMainHeader>
        {selectedMessage ? (
          <>
            <ShellMainIntro>
              <HeadingLevel>
                <ak.Heading className="text-2xl font-semibold tracking-tight">
                  {selectedMessage.subject}
                </ak.Heading>
              </HeadingLevel>
              <div className="flex items-center gap-3">
                <Frame
                  $layer="brand"
                  $rounded="full"
                  $p="none"
                  className="grid size-10 shrink-0 place-items-center rounded-full text-sm font-semibold"
                >
                  {initialsOf(selectedMessage.sender)}
                </Frame>
                <div className="text-sm">
                  <p className="font-medium">
                    {isOutgoing(selectedMessage)
                      ? `To ${selectedMessage.sender}`
                      : selectedMessage.sender}
                  </p>
                  <p className="ak-ink-70">{selectedMessage.time}</p>
                </div>
              </div>
            </ShellMainIntro>
            <ShellMainBody>
              <Prose>
                <p>{selectedMessage.body}</p>
              </Prose>
              {selectedMessage.attachment && (
                <Button>
                  <ButtonSlot>
                    <FileText strokeWidth={1.5} />
                  </ButtonSlot>
                  {selectedMessage.attachment}
                </Button>
              )}
            </ShellMainBody>
          </>
        ) : null}
      </ShellMain>
    </Shell>
  );
}
