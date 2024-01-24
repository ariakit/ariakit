import type { ReactNode } from "react";
import {
  AIIcon,
  AppStoreIcon,
  BooksIcon,
  CalculatorIcon,
  CalendarIcon,
  ColorPickerIcon,
  ContactsIcon,
  DeveloperIcon,
  FaceTimeIcon,
  MailIcon,
  PodcastsIcon,
} from "./icons.js";

export interface Command {
  name: string;
  title: string;
  icon?: ReactNode;
  extension?: Omit<Extension, "commands">;
}

export interface Extension {
  name: string;
  title: string;
  icon: ReactNode;
  commands: Command[];
}

export const applications: Command[] = [
  { name: "app-app-store", title: "App Store", icon: <AppStoreIcon /> },
  { name: "app-books", title: "Books", icon: <BooksIcon /> },
  { name: "app-calculator", title: "Calculator", icon: <CalculatorIcon /> },
  { name: "app-calendar", title: "Calendar", icon: <CalendarIcon /> },
  { name: "app-contacts", title: "Contacts", icon: <ContactsIcon /> },
  { name: "app-facetime", title: "FaceTime", icon: <FaceTimeIcon /> },
  { name: "app-mail", title: "Mail", icon: <MailIcon /> },
  { name: "app-podcasts", title: "Podcasts", icon: <PodcastsIcon /> },
];

export const extensions: Extension[] = [
  {
    name: "ext-calendar",
    title: "Calendar",
    icon: <CalendarIcon />,
    commands: [{ name: "cmd-calendar-my-schedule", title: "My Schedule" }],
  },
  {
    name: "ext-color-picker",
    title: "Color Picker",
    icon: <ColorPickerIcon />,
    commands: [
      { name: "cmd-color-picker-menu-bar", title: "Menu Bar Color Picker" },
      { name: "cmd-color-picker-organize-colors", title: "Organize Colors" },
      { name: "cmd-color-picker-pick", title: "Pick Color" },
    ],
  },
  {
    name: "ext-contacts",
    title: "Contacts",
    icon: <ContactsIcon />,
    commands: [{ name: "cmd-contacts-search", title: "Search Contacts" }],
  },
  {
    name: "ext-developer",
    title: "Developer",
    icon: <DeveloperIcon />,
    commands: [
      { name: "cmd-developer-create-extension", title: "Create Extension" },
      {
        name: "cmd-developer-extension-diagnostics",
        title: "Extension Diagnostics",
      },
      { name: "cmd-developer-import-extension", title: "Import Extension" },
      { name: "cmd-developer-manage-extension", title: "Manage Extensions" },
    ],
  },
  {
    name: "ext-ai",
    title: "AI",
    icon: <AIIcon />,
    commands: [
      { name: "cmd-ai-chat", title: "AI Chat" },
      { name: "cmd-ai-create-ai-command", title: "Create AI Command" },
      { name: "cmd-ai-import-ai-commands", title: "Import AI Commands" },
      { name: "cmd-ai-search-ai-commands", title: "Search AI Commands" },
      { name: "cmd-ai-send-to-ai-chat", title: "Send to AI Chat" },
      {
        name: "cmd-ai-fix-spelling-and-grammar",
        title: "Fix Spelling and Grammar",
      },
      { name: "cmd-ai-improve-writing", title: "Improve Writing" },
    ],
  },
];

export const commands = extensions.flatMap(({ commands, ...extension }) =>
  commands?.map((command) => ({
    icon: extension.icon,
    extension,
    ...command,
  })),
);

export const allItems = [...applications, ...commands];

export const suggestions = [
  "cmd-contacts-search",
  "cmd-ai-improve-writing",
  "app-calendar",
  "app-app-store",
  "app-books",
]
  .map((name) => allItems.find((item) => item.name === name))
  .filter((item): item is NonNullable<typeof item> => !!item);
