import { Button } from "@ariakit/ui/components/button.ariakit.react";
import {
  Dialog,
  DialogClose,
  DialogDisclosure,
  DialogDismiss,
  DialogHeading,
  DialogProvider,
  DialogScroll,
} from "@ariakit/ui/components/dialog.ariakit.react";
import {
  Heading,
  HeadingLevel,
} from "@ariakit/ui/components/heading.ariakit.react";
import {
  Input,
  InputDescription,
  InputField,
  InputLabel,
} from "@ariakit/ui/components/input.ariakit.react";
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
  ShellEnd,
  ShellFooter,
  ShellMain,
  ShellMainBody,
  ShellMainHeader,
  ShellSidebar,
  ShellSidebarBody,
  ShellSidebarHeader,
  ShellStart,
} from "@ariakit/ui/components/shell.ariakit.react";
import { TextFrame } from "@ariakit/ui/components/text-frame.ariakit.react";
import {
  BellIcon,
  CreditCardIcon,
  KeyRoundIcon,
  PaletteIcon,
  SettingsIcon,
  UserIcon,
  UsersIcon,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useId, useState } from "react";

interface Section {
  id: string;
  label: string;
  icon: LucideIcon;
}

interface SectionGroup {
  label: string;
  sections: Section[];
}

const groups: SectionGroup[] = [
  {
    label: "Workspace",
    sections: [
      { id: "general", label: "General", icon: SettingsIcon },
      { id: "members", label: "Members", icon: UsersIcon },
      { id: "billing", label: "Billing", icon: CreditCardIcon },
      { id: "security", label: "Security", icon: KeyRoundIcon },
    ],
  },
  {
    label: "Account",
    sections: [
      { id: "profile", label: "Profile", icon: UserIcon },
      { id: "notifications", label: "Notifications", icon: BellIcon },
      { id: "appearance", label: "Appearance", icon: PaletteIcon },
    ],
  },
];

const sections = groups.flatMap((group) => group.sections);

interface FieldProps {
  label: string;
  value: string;
  hint?: string;
}

function Field({ label, value, hint }: FieldProps) {
  const id = useId();
  const hintId = useId();
  return (
    <InputField>
      <InputLabel htmlFor={id}>{label}</InputLabel>
      <Input
        id={id}
        defaultValue={value}
        aria-describedby={hint ? hintId : undefined}
      />
      {hint && <InputDescription id={hintId}>{hint}</InputDescription>}
    </InputField>
  );
}

export default function Example() {
  const [open, setOpen] = useState(false);
  const [saved, setSaved] = useState(false);
  const [sectionId, setSectionId] = useState("general");
  const section = sections.find((item) => item.id === sectionId);
  return (
    <div className="flex flex-col items-start gap-3">
      <DialogProvider open={open} setOpen={setOpen}>
        <DialogDisclosure $kind="bevel" onClick={() => setSaved(false)}>
          Open settings
        </DialogDisclosure>
        {/* The dialog has a set height, so it doesn't change size between
            sections. */}
        <Dialog $p="none" $height={136} $maxWidth={208}>
          <DialogScroll>
            <Shell $size="md">
              <ShellSidebar
                $width="sm"
                $darken={0.5}
                $show
                landmark="nav"
                aria-label="Sections"
              >
                {/* The title names the dialog. The header and the body have
                    the same space, and the text frame has the side padding of
                    the links, so the title lines up with their labels. */}
                <ShellSidebarHeader $p={2}>
                  <TextFrame $p={2}>
                    <DialogHeading $size="md">Settings</DialogHeading>
                  </TextFrame>
                </ShellSidebarHeader>
                <ShellSidebarBody $p={2}>
                  <Nav $cover list={false} bar={{ $offset: "halfway" }}>
                    {groups.map((group) => (
                      <NavGroup key={group.label}>
                        <NavGroupLabel>{group.label}</NavGroupLabel>
                        <NavList>
                          {group.sections.map((item) => (
                            <NavLink
                              key={item.id}
                              href={`#${item.id}`}
                              aria-current={
                                item.id === sectionId ? "page" : undefined
                              }
                              onClick={(event) => {
                                event.preventDefault();
                                setSectionId(item.id);
                              }}
                            >
                              <NavSlot>
                                <item.icon strokeWidth={1.5} />
                              </NavSlot>
                              <NavLinkLabel>{item.label}</NavLinkLabel>
                            </NavLink>
                          ))}
                        </NavList>
                      </NavGroup>
                    ))}
                  </Nav>
                </ShellSidebarBody>
              </ShellSidebar>
              {/* A shell in main has its own footer, so the footer spans main
                  and not the sidebar. */}
              <Shell>
                <ShellMain $size="auto" $p={4}>
                  {/* Like the header of a side sheet, the space puts the hover
                      surface of the close button as far from the top as from
                      the end, and the sides keep the gutter of main. */}
                  <ShellMainHeader $blur $p={2} $px={4}>
                    <ShellStart>
                      <HeadingLevel>
                        <Heading className="text-base">
                          {section?.label}
                        </Heading>
                      </HeadingLevel>
                    </ShellStart>
                    <ShellEnd>
                      <DialogClose />
                    </ShellEnd>
                  </ShellMainHeader>
                  <ShellMainBody className="gap-y-6">
                    {sectionId === "general" ? (
                      <>
                        <Field label="Workspace name" value="Acme" />
                        <Field
                          label="Workspace URL"
                          value="acme"
                          hint="People open the workspace at acme.example.com."
                        />
                        <Field label="Contact email" value="team@example.com" />
                        <Field label="Time zone" value="America/Sao_Paulo" />
                        <Field label="Week starts on" value="Monday" />
                      </>
                    ) : (
                      <p className="ak-ink-70">
                        This section has no settings yet.
                      </p>
                    )}
                  </ShellMainBody>
                </ShellMain>
                <ShellFooter $sticky $p={4}>
                  <ShellEnd>
                    <DialogDismiss>Cancel</DialogDismiss>
                    <Button
                      $layer="brand"
                      $kind="bevel"
                      onClick={() => {
                        setSaved(true);
                        setOpen(false);
                      }}
                    >
                      Save changes
                    </Button>
                  </ShellEnd>
                </ShellFooter>
              </Shell>
            </Shell>
          </DialogScroll>
        </Dialog>
      </DialogProvider>
      <p role="status">{saved && "Settings saved"}</p>
    </div>
  );
}
