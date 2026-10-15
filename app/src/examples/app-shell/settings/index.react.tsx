import {
  Button,
  ButtonLabel,
  ButtonSlot,
} from "@ariakit/ui/components/button.ariakit.react";
import { Frame } from "@ariakit/ui/components/frame.ariakit.react";
import {
  Heading,
  HeadingLevel,
} from "@ariakit/ui/components/heading.ariakit.react";
import { Input } from "@ariakit/ui/components/input.ariakit.react";
import { Nav, NavLink } from "@ariakit/ui/components/nav.ariakit.react";
import { Prose } from "@ariakit/ui/components/prose.ariakit.react";
import { Separator } from "@ariakit/ui/components/separator.ariakit.react";
import {
  Shell,
  ShellHeader,
  ShellSidebar,
  ShellSidebarBody,
  ShellMain,
  ShellMainIntro,
  ShellMainBody,
} from "@ariakit/ui/components/shell.ariakit.react";
import { CircleUser, Hexagon, PanelLeft } from "lucide-react";
import { useId, useState } from "react";

export default function Example() {
  const [open, setOpen] = useState(true);
  const [current, setCurrent] = useState("general");
  const sectionsId = useId();
  return (
    <Shell>
      <ShellHeader
        $blur
        start={
          <>
            <Button
              className="@max-3xl/shell:hidden"
              aria-label="Toggle sidebar"
              aria-expanded={open}
              aria-controls={sectionsId}
              onClick={() => setOpen((value) => !value)}
            >
              <ButtonSlot>
                <PanelLeft />
              </ButtonSlot>
            </Button>
            <a href="#" className="flex items-center gap-2 font-semibold">
              <Hexagon strokeWidth={1.5} className="size-5" /> Acme
            </a>
          </>
        }
        end={
          <Button>
            <ButtonSlot aria-hidden>
              <CircleUser />
            </ButtonSlot>
            <ButtonLabel>Alex Morgan</ButtonLabel>
          </Button>
        }
      />
      <ShellSidebar
        id={sectionsId}
        open={open}
        $from="intro"
        $width="sm"
        aria-label="Settings sections"
        render={<nav />}
      >
        <ShellSidebarBody>
          <Nav render={<div />}>
            {settingsSections.map((section) => (
              <NavLink
                key={section.id}
                href={`#${section.id}`}
                aria-current={current === section.id ? "page" : undefined}
                onClick={(event) => {
                  // Scroll to the card without changing the page hash.
                  event.preventDefault();
                  setCurrent(section.id);
                  document
                    .getElementById(section.id)
                    ?.scrollIntoView({ block: "start", behavior: "smooth" });
                }}
              >
                {section.title}
              </NavLink>
            ))}
          </Nav>
        </ShellSidebarBody>
      </ShellSidebar>
      <ShellMain>
        <ShellMainIntro>
          <Prose>
            <HeadingLevel>
              <Heading>Settings</Heading>
            </HeadingLevel>
            <p>Manage your workspace, your profile, and how we reach you.</p>
          </Prose>
        </ShellMainIntro>
        <ShellMainBody>
          <HeadingLevel>
            <HeadingLevel>
              <div className="grid gap-5 pb-12">
                {settingsSections.map((section) => (
                  <Frame
                    key={section.id}
                    id={section.id}
                    $border
                    $rounded="xl"
                    $p={5}
                    className="scroll-mt-24"
                  >
                    <Heading className="text-lg font-semibold">
                      {section.title}
                    </Heading>
                    <p className="ak-ink-70 mt-1 text-sm">
                      {section.description}
                    </p>
                    <div className="mt-5 grid gap-4 sm:grid-cols-2">
                      {section.fields.map((field) => (
                        <label
                          key={field.label}
                          className="grid gap-1.5 text-sm font-medium"
                        >
                          {field.label}
                          <Input
                            type={field.type}
                            defaultValue={field.value}
                            placeholder={field.placeholder}
                          />
                        </label>
                      ))}
                    </div>
                    <Separator $line="solid" $gap={5} />
                    <div className="flex justify-end">
                      <Button $kind="bevel" $layer="brand">
                        <ButtonLabel>Save changes</ButtonLabel>
                      </Button>
                    </div>
                  </Frame>
                ))}
                <Frame $layer="danger" $border $rounded="xl" $p={5}>
                  <Heading className="text-lg font-semibold">
                    Danger zone
                  </Heading>
                  <p className="mt-1 text-sm">
                    Deleting the workspace removes all projects, files, and
                    invoices. This cannot be undone.
                  </p>
                  <div className="mt-5 flex justify-end">
                    <Button $kind="bevel" $layer="danger">
                      <ButtonLabel>Delete workspace</ButtonLabel>
                    </Button>
                  </div>
                </Frame>
              </div>
            </HeadingLevel>
          </HeadingLevel>
        </ShellMainBody>
      </ShellMain>
    </Shell>
  );
}

interface SettingsField {
  label: string;
  value?: string;
  placeholder?: string;
  type?: string;
}

interface SettingsSection {
  id: string;
  title: string;
  description: string;
  fields: SettingsField[];
}

const settingsSections: SettingsSection[] = [
  {
    id: "general",
    title: "General",
    description: "Workspace details shown to everyone on your team.",
    fields: [
      { label: "Workspace name", value: "Acme Labs" },
      { label: "Workspace URL", value: "acme-labs" },
      { label: "Time zone", value: "Europe/Lisbon" },
      { label: "Language", value: "English (US)" },
    ],
  },
  {
    id: "profile",
    title: "Profile",
    description: "How your name and role appear in comments and mentions.",
    fields: [
      { label: "Full name", value: "Alex Morgan" },
      { label: "Email", value: "alex@acme.dev", type: "email" },
      { label: "Job title", value: "Product designer" },
      { label: "Display name", value: "Alex" },
    ],
  },
  {
    id: "notifications",
    title: "Notifications",
    description: "Choose when we send digests and alerts to your inbox.",
    fields: [
      { label: "Mention alerts", value: "Immediately" },
      { label: "Daily digest", value: "Weekdays at 09:00" },
      { label: "Weekly report", value: "Mondays" },
    ],
  },
  {
    id: "billing",
    title: "Billing",
    description: "Invoices and tax details for your workspace plan.",
    fields: [
      { label: "Billing email", value: "billing@acme.dev", type: "email" },
      { label: "Company name", value: "Acme Labs, Inc." },
      { label: "VAT number", placeholder: "Optional" },
    ],
  },
  {
    id: "security",
    title: "Security",
    description: "Use a password manager and a strong, unique password.",
    fields: [
      {
        label: "Current password",
        type: "password",
        placeholder: "Enter your current password",
      },
      {
        label: "New password",
        type: "password",
        placeholder: "At least 12 characters",
      },
      {
        label: "Confirm new password",
        type: "password",
        placeholder: "Repeat the new password",
      },
    ],
  },
];
