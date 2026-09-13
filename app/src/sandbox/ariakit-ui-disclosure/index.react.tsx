/**
 * @license
 * Copyright 2025-present Ariakit FZ-LLC. All Rights Reserved.
 *
 * This software is proprietary. See the license.md file in the root of this
 * package for licensing terms.
 *
 * SPDX-License-Identifier: UNLICENSED
 */
import * as ak from "@ariakit/react";
import { Button } from "@ariakit/ui/components/button.ariakit.react";
import {
  Combobox,
  ComboboxGroup,
  ComboboxItem,
  ComboboxPopover,
  ComboboxProvider,
  ComboboxSelect,
  ComboboxSelectLabel,
} from "@ariakit/ui/components/combobox.ariakit.react";
import {
  Disclosure,
  DisclosureButton,
  DisclosureButtonLabel,
  DisclosureButtonSlot,
  DisclosureContent,
  DisclosureGroup,
} from "@ariakit/ui/components/disclosure.ariakit.react";
import type { DisclosureButtonLabelProps } from "@ariakit/ui/components/disclosure.ariakit.react";
import { Frame } from "@ariakit/ui/components/frame.ariakit.react";
import { CreditCard, Folder, Settings, Users } from "lucide-react";
import { useId, useState } from "react";
import {
  Example,
  ExampleGrid,
} from "#app/components/ariakit-ui-example.react.tsx";

function CustomLabel(props: DisclosureButtonLabelProps) {
  return <DisclosureButtonLabel {...props} />;
}

interface DetailsProps {
  name: string;
  providerOpen?: boolean;
}

function Details({ name, providerOpen = false }: DetailsProps) {
  const store = ak.useDisclosureStore();
  const open = ak.useStoreState(store, "open");
  // The inner provider must not replace the parts' explicit store.
  return (
    <Disclosure open={open} $border $p={3} $rounded="md">
      <ak.DisclosureProvider defaultOpen={providerOpen}>
        <DisclosureButton store={store}>{name} details</DisclosureButton>
        <DisclosureContent store={store}>
          {name} details are available.
        </DisclosureContent>
      </ak.DisclosureProvider>
    </Disclosure>
  );
}

function DisclosureButtonStore() {
  return (
    <div className="grid gap-6">
      <Details name="Project" />
      <Details name="Team" providerOpen />
    </div>
  );
}

function DisclosureOptionalContent() {
  const [headings, setHeadings] = useState(false);
  // False omits optional content; zero still renders as a label, icon, or
  // description.
  return (
    <div className="grid gap-4">
      <label>
        <input
          type="checkbox"
          checked={headings}
          onChange={(event) => setHeadings(event.target.checked)}
        />
        Show filter headings
      </label>
      <Disclosure button={headings && "Project filters"}>
        <div className="grid gap-4">
          <Combobox label={headings && "Assignee"} aria-label="Assignee">
            <ComboboxGroup label={headings && "Team"}>
              <ComboboxItem value="Alice" />
              <ComboboxItem value="Bob" />
            </ComboboxGroup>
          </Combobox>
          <ComboboxProvider defaultSelectedValue="Active">
            {headings && <ComboboxSelectLabel>Status</ComboboxSelectLabel>}
            <ComboboxSelect aria-label="Status" />
            <ComboboxPopover>
              <ComboboxItem value="Active" checkmark="before" />
              <ComboboxItem value="Complete" checkmark="before" />
            </ComboboxPopover>
          </ComboboxProvider>
        </div>
      </Disclosure>
      <Disclosure button={0}>No pending requests</Disclosure>
      <Disclosure button={{ description: "Advanced options" }}>
        Advanced controls
      </Disclosure>
      <Disclosure button={{ children: "Pending requests", description: 0 }}>
        No requests need review
      </Disclosure>
      <Disclosure
        button={{ children: "Archived requests", description: false }}
      >
        Archived requests are available
      </Disclosure>
      <Disclosure button={{ children: false, description: "Optional title" }}>
        Optional settings
      </Disclosure>
      <Disclosure button={{ children: "Unread messages", icon: 0 }}>
        No unread messages
      </Disclosure>
    </div>
  );
}

/**
 * A disclosure whose open state the page owns, toggled from a separate button
 * as well as from its own.
 */
function ControlledDisclosure() {
  const [open, setOpen] = useState(false);
  const contentId = useId();
  return (
    <div className="grid w-full gap-3">
      <Button
        $kind="bevel"
        aria-expanded={open}
        aria-controls={contentId}
        className="w-max"
        onClick={() => setOpen(!open)}
      >
        Toggle delivery details
      </Button>
      <Disclosure
        open={open}
        setOpen={setOpen}
        content={{ id: contentId }}
        $border
        $rounded="xl"
        $p={3}
        button="Delivery details"
      >
        <p>Standard delivery takes three to five business days.</p>
      </Disclosure>
    </div>
  );
}

function DisclosureExplicitLabels() {
  return (
    <div className="grid gap-4">
      <Disclosure button={{ label: 0, description: "Pending invitations" }}>
        No invitations need review
      </Disclosure>
      <Disclosure
        button={{
          label: { id: "invitation-label", children: <>Invitation details</> },
          description: "Review workspace invitations",
          children: (
            <DisclosureButtonSlot $kind="badge">2</DisclosureButtonSlot>
          ),
        }}
      >
        Two invitations need review
      </Disclosure>
      <Disclosure
        button={{
          label: false,
          "aria-label": "Show invited members",
          description: "Members waiting for access",
          children: (
            <DisclosureButtonSlot>
              <Users />
            </DisclosureButtonSlot>
          ),
        }}
      >
        Invited members are available
      </Disclosure>
    </div>
  );
}

export default function DisclosureExamples() {
  return (
    <ExampleGrid>
      <Example
        title="Default"
        description="A disclosure with rounded corners and padding. The open content starts under the chevron."
        stretch
        code={`
          <Disclosure button="What is Ariakit?" defaultOpen>
            …
          </Disclosure>
        `}
      >
        <Disclosure button="What is Ariakit?" defaultOpen>
          <p>A toolkit for building accessible web apps with React.</p>
        </Disclosure>
      </Example>

      <Example
        title="No shape"
        description="Explicit props remove the default padding and corner radius."
        stretch
        code={`
          <Disclosure $rounded="none" $p={0} button="Compact details" defaultOpen>
            No extra space around this content.
          </Disclosure>
        `}
      >
        <Disclosure $rounded="none" $p={0} button="Compact details" defaultOpen>
          <p>No extra space around this content.</p>
        </Disclosure>
      </Example>

      <Example
        title="Trailing badge"
        description="A badge sits beside the label and before the end indicator. The open content starts under the label, with no leading icon."
        stretch
        code={`
          <Disclosure defaultOpen button={
            <DisclosureButton label="Notifications" indicator="chevron-down-end">
              <DisclosureButtonSlot $kind="badge">3</DisclosureButtonSlot>
            </DisclosureButton>
          }>
            Three messages need your attention.
          </Disclosure>
        `}
      >
        <Disclosure
          defaultOpen
          button={
            <DisclosureButton
              label="Notifications"
              indicator="chevron-down-end"
            >
              <DisclosureButtonSlot $kind="badge">3</DisclosureButtonSlot>
            </DisclosureButton>
          }
        >
          <p>Three messages need your attention.</p>
        </Disclosure>
      </Example>

      <Example
        title="Slots with description"
        description="The label and description share a column between a leading icon and a trailing badge. A custom label component receives the label props."
        stretch
        code={`
          function CustomLabel(props: DisclosureButtonLabelProps) {
            return <DisclosureButtonLabel {...props} />;
          }

          <Disclosure defaultOpen button={
            <DisclosureButton
              icon={<Users />}
              label={<CustomLabel id="workspace-members-label">Workspace members</CustomLabel>}
              description="People with access to this workspace"
            >
              <DisclosureButtonSlot $kind="badge">4</DisclosureButtonSlot>
            </DisclosureButton>
          }>
            Invite a teammate or change a role.
          </Disclosure>
        `}
      >
        <Disclosure
          defaultOpen
          button={
            <DisclosureButton
              icon={<Users />}
              label={
                <CustomLabel id="workspace-members-label">
                  Workspace members
                </CustomLabel>
              }
              description="People with access to this workspace"
            >
              <DisclosureButtonSlot $kind="badge">4</DisclosureButtonSlot>
            </DisclosureButton>
          }
        >
          <p>Invite a teammate or change a role.</p>
        </Disclosure>
      </Example>

      <Example
        title="Bordered"
        description="A frame with a border, rounded corners and padding. The closed button fills the whole frame."
        stretch
        code={`
          <Disclosure $border $rounded="xl" $p={3}>
            …
          </Disclosure>
        `}
      >
        <Disclosure
          $border
          $rounded="xl"
          $p={3}
          button={{ children: "Shipping details" }}
        >
          <p>Orders ship from our warehouse within two business days.</p>
        </Disclosure>
      </Example>

      <Example
        title="Filled"
        description="A lighter surface, not a border, separates the disclosure from the surface under it."
        stretch
        code={`
          <Disclosure $lightnessOffset $rounded="lg" $p={2} button="Order summary" defaultOpen>
            …
          </Disclosure>
        `}
      >
        <Disclosure
          $lightnessOffset
          $rounded="lg"
          $p={2}
          button="Order summary"
          defaultOpen
        >
          <p>Two items, shipped together in one package.</p>
        </Disclosure>
      </Example>

      <Example
        title="Bevel button"
        description="The button has a raised bevel surface instead of the flat hover fill."
        stretch
        code={`
          <Disclosure $rounded="2xl" $p={4} button={{ $kind: "bevel" }}>
            …
          </Disclosure>
        `}
      >
        <Disclosure
          $rounded="2xl"
          $p={4}
          button={{ children: "Advanced settings", $kind: "bevel" }}
        >
          <p>Change how the app stores and syncs your data.</p>
        </Disclosure>
      </Example>

      <Example
        title="Indicator after the label"
        description="The chevron comes right after the label instead of at the start of the row, and it points down."
        stretch
        code={`
          <Disclosure $border $rounded="xl" $p={3} button={{ indicator: "chevron-down-next" }}>
            …
          </Disclosure>
        `}
      >
        <Disclosure
          $border
          $rounded="xl"
          $p={3}
          button={{ children: "Show more", indicator: "chevron-down-next" }}
        >
          <p>Every plan includes unlimited projects.</p>
        </Disclosure>
      </Example>

      <Example
        title="No indicator"
        description="The button shows no indicator, so the label and the open content start at the same inset."
        stretch
        code={`
          <Disclosure $border $rounded="xl" $p={3} button={{ indicator: false }} defaultOpen>
            …
          </Disclosure>
        `}
      >
        <Disclosure
          $border
          $rounded="xl"
          $p={3}
          button={{ children: "Release notes", indicator: false }}
          defaultOpen
        >
          <p>This release fixes focus handling in nested menus.</p>
        </Disclosure>
      </Example>

      <Example
        title="Icon"
        description="An icon comes before the label. The open content aligns with the label, and the chevron moves to the end of the row."
        stretch
        code={`
          <Disclosure $border $rounded="xl" $p={3} defaultOpen button={<DisclosureButton icon={<Settings />}>Settings</DisclosureButton>}>
            …
          </Disclosure>
        `}
      >
        <Disclosure
          $border
          $rounded="xl"
          $p={3}
          defaultOpen
          button={
            <DisclosureButton icon={<Settings />}>Settings</DisclosureButton>
          }
        >
          <p>Choose a language, a time zone and a date format.</p>
        </Disclosure>
      </Example>

      <Example
        title="Description"
        description="Secondary text under the label. The label names the button, and the text under it describes the button."
        stretch
        code={`
          <Disclosure $border $rounded="xl" $p={3} button={<DisclosureButton icon={<CreditCard />} description="…">Billing</DisclosureButton>}>
            …
          </Disclosure>
        `}
      >
        <Disclosure
          $border
          $rounded="xl"
          $p={3}
          button={
            <DisclosureButton
              icon={<CreditCard />}
              description="Manage the cards on this account"
            >
              Billing
            </DisclosureButton>
          }
        >
          <p>Your next invoice is due on the first of the month.</p>
        </Disclosure>
      </Example>

      <Example
        title="Icon size"
        description="A larger icon moves the label and the open content farther from the start of the row."
        stretch
        code={`
          <Disclosure $iconSize={8} $border $rounded="xl" $p={3} defaultOpen button={<DisclosureButton icon={<Users />} description="…">Members</DisclosureButton>}>
            …
          </Disclosure>
        `}
      >
        <Disclosure
          $iconSize={8}
          $border
          $rounded="xl"
          $p={3}
          defaultOpen
          button={
            <DisclosureButton
              icon={<Users />}
              description="Invite people and manage roles"
            >
              Members
            </DisclosureButton>
          }
        >
          <p>Four people have access to this workspace.</p>
        </Disclosure>
      </Example>

      <Example
        title="Split"
        description="A line separates the button from the open content, and the bottom corners of the button become square."
        stretch
        code={`
          <Disclosure split $border $rounded="xl" $p={3} button="Payment method" defaultOpen>
            …
          </Disclosure>
        `}
      >
        <Disclosure
          split
          $border
          $rounded="xl"
          $p={3}
          button="Payment method"
          defaultOpen
        >
          <p>Visa ending in 4242, expires in 2031.</p>
        </Disclosure>
      </Example>

      <Example
        title="Spaced content"
        description="The open content keeps its own space above it, without a line, so the hover fill of the button does not fade out."
        stretch
        code={`
          <Disclosure $contentPadding $border $rounded="xl" $p={3} button="Return policy" defaultOpen>
            …
          </Disclosure>
        `}
      >
        <Disclosure
          $contentPadding
          $border
          $rounded="xl"
          $p={3}
          button="Return policy"
          defaultOpen
        >
          <p>Return any item within 30 days for a full refund.</p>
        </Disclosure>
      </Example>

      <Example
        title="Guide"
        description="A vertical line under the chevron connects the button to the open content, which aligns with the label."
        stretch
        code={`
          <Disclosure $border $rounded="xl" $p={3} button="Changelog" content={{ guide: true }} defaultOpen>
            …
          </Disclosure>
        `}
      >
        <Disclosure
          $border
          $rounded="xl"
          $p={3}
          button="Changelog"
          content={{ guide: true }}
          defaultOpen
        >
          <p>Version 2.4 adds keyboard shortcuts to every menu.</p>
        </Disclosure>
      </Example>

      <Example
        title="Prose body"
        description="The open content uses prose styles, with a gap between paragraphs that stays small in a tight frame."
        stretch
        code={`
          <Disclosure $border $rounded="xl" $p={3} button="Terms of service" content={{ prose: true }} defaultOpen>
            Last updated in March.
            …
            …
          </Disclosure>
        `}
      >
        <Disclosure
          $border
          $rounded="xl"
          $p={3}
          button="Terms of service"
          content={{ prose: true }}
          defaultOpen
        >
          <p>
            <strong>Last updated in March.</strong> These terms apply to every
            workspace on a paid plan.
          </p>
          <p>You can cancel at any time from the billing settings.</p>
        </Disclosure>
      </Example>

      <Example
        title="Group"
        description="An accordion. The members share the frame of the group, with lines between them, and a plus becomes a minus when a member opens."
        stretch
        code={`
          <DisclosureGroup>
            <Disclosure button={{ indicator: "plus-end" }} defaultOpen>
              …
            </Disclosure>
            <Disclosure button={{ indicator: "plus-end" }}>
              …
            </Disclosure>
            <Disclosure button={{ indicator: "plus-end" }}>
              …
            </Disclosure>
          </DisclosureGroup>
        `}
      >
        <DisclosureGroup>
          <Disclosure
            button={{
              children: "Can I change my plan?",
              indicator: "plus-end",
            }}
            defaultOpen
          >
            <p>Yes. The new price applies from the next billing cycle.</p>
          </Disclosure>
          <Disclosure
            button={{
              children: "Do you offer refunds?",
              indicator: "plus-end",
            }}
          >
            <p>We refund any payment made in the last 30 days.</p>
          </Disclosure>
          <Disclosure
            button={{ children: "How do I cancel?", indicator: "plus-end" }}
          >
            <p>Open the billing settings and choose to cancel your plan.</p>
          </Disclosure>
        </DisclosureGroup>
      </Example>

      <Example
        title="Framed group"
        description="A group with a border and rounded corners becomes a card, and its first and last members follow its corners."
        stretch
        code={`
          <DisclosureGroup $border $rounded="xl">
            <Disclosure button="Account">
              …
            </Disclosure>
            <Disclosure button="Security">
              …
            </Disclosure>
            <Disclosure button="Privacy" defaultOpen>
              …
            </Disclosure>
          </DisclosureGroup>
        `}
      >
        <DisclosureGroup $border $rounded="xl">
          <Disclosure button="Account">
            <p>Change your name, email and avatar.</p>
          </Disclosure>
          <Disclosure button="Security">
            <p>Set up two-factor authentication.</p>
          </Disclosure>
          <Disclosure button="Privacy" defaultOpen>
            <p>Choose who can see your profile.</p>
          </Disclosure>
        </DisclosureGroup>
      </Example>

      <Example
        title="Nested"
        description="A disclosure inside the content of another starts again: it does not take the icon indent or the icon size of the outer one."
        stretch
        code={`
          <Disclosure $border $rounded="xl" $p={4} defaultOpen button={<DisclosureButton icon={<Folder />}>Workspace</DisclosureButton>}>
            …
            <Disclosure $border $rounded="lg" $p={2} button="Archived files" defaultOpen>
              …
            </Disclosure>
          </Disclosure>
        `}
      >
        <Disclosure
          $border
          $rounded="xl"
          $p={4}
          defaultOpen
          button={
            <DisclosureButton icon={<Folder />}>Workspace</DisclosureButton>
          }
          content={{ body: { className: "grid gap-3" } }}
        >
          <p>Files shared with everyone in the workspace.</p>
          <Disclosure
            $border
            $rounded="lg"
            $p={2}
            button="Archived files"
            defaultOpen
          >
            <p>Files nobody opened in the last year.</p>
          </Disclosure>
        </Disclosure>
      </Example>

      <Example
        title="Composed parts"
        description="The button and the content are separate parts, and the content holds an action of its own."
        stretch
        code={`
          <Disclosure $border $rounded="xl" $p={3} defaultOpen>
            <DisclosureButton indicator="chevron-down-end">Notifications</DisclosureButton>
            <DisclosureContent>
              …
              <Button $kind="bevel" $size="sm">Manage alerts</Button>
            </DisclosureContent>
          </Disclosure>
        `}
      >
        <Disclosure $border $rounded="xl" $p={3} defaultOpen>
          <DisclosureButton indicator="chevron-down-end">
            Notifications
          </DisclosureButton>
          <DisclosureContent body={{ className: "grid gap-2" }}>
            <p>Email me when someone mentions me.</p>
            <Button $kind="bevel" $size="sm" className="w-max">
              Manage alerts
            </Button>
          </DisclosureContent>
        </Disclosure>
      </Example>

      <Example
        title="Controlled"
        description="The page keeps the open state, so a second button outside the disclosure can also open and close it."
        stretch
        code={`
          <Button $kind="bevel">Toggle delivery details</Button>
          <Disclosure open={false} $border $rounded="xl" $p={3} button="Delivery details" />
        `}
      >
        <ControlledDisclosure />
      </Example>

      <Example
        title="On a brand layer"
        description="On a strong brand color, the border, the split line, the text and the hover fill all adapt to the brand surface."
        stretch
        code={`
          <Frame $layer="brand" $rounded="xl" $p={4}>
            <Disclosure split $border $rounded="xl" $p={3} button="Upgrade plan" defaultOpen>
              …
            </Disclosure>
          </Frame>
        `}
      >
        <Frame $layer="brand" $rounded="xl" $p={4} className="w-full">
          <Disclosure
            split
            $border
            $rounded="xl"
            $p={3}
            button="Upgrade plan"
            defaultOpen
          >
            <p>Get more storage and priority support.</p>
          </Disclosure>
        </Frame>
      </Example>

      <Example
        title="Right to left"
        description="In a right-to-left direction the row is mirrored, and the closed chevron points left, to the end of the row."
        stretch
        code={`
          <div dir="rtl">
            <Disclosure $border $rounded="xl" $p={3} button="تفاصيل الشحن">
              …
            </Disclosure>
          </div>
        `}
      >
        <div dir="rtl" lang="ar">
          <Disclosure $border $rounded="xl" $p={3} button="تفاصيل الشحن">
            <p>تُشحن الطلبات خلال يومي عمل.</p>
          </Disclosure>
        </div>
      </Example>

      {/*
        Regression fixtures: Disclosure scenarios migrated from the
        disclosure-button-store and disclosure-optional-content sandboxes.
      */}
      <Example
        title="Disclosure button store"
        description="A DisclosureButton and a DisclosureContent that share an explicit store follow it, even inside an open DisclosureProvider."
        stretch
        code={`
          <Disclosure open={open} $border $p={3} $rounded="md">
            <ak.DisclosureProvider defaultOpen>
              <DisclosureButton store={store}>Team details</DisclosureButton>
              <DisclosureContent store={store}>
                Team details are available.
              </DisclosureContent>
            </ak.DisclosureProvider>
          </Disclosure>
        `}
      >
        <DisclosureButtonStore />
      </Example>

      <Example
        title="Explicit labels"
        description="Labels accept text, props, or a custom element. A false label leaves room for an icon beside the description."
        code={`
          <DisclosureButton label={0} description="Pending invitations" />
          <DisclosureButton label={{ children: <>Invitation details</> }}>
            <DisclosureButtonSlot $kind="badge">2</DisclosureButtonSlot>
          </DisclosureButton>
        `}
      >
        <DisclosureExplicitLabels />
      </Example>

      <Example
        title="Disclosure optional content"
        description="false omits the button, the label, the icon or the description, and 0 still renders as content. A checkbox toggles the filter headings."
        stretch
        code={`
          <Disclosure>
            <Combobox>
              <ComboboxGroup>
                <ComboboxItem />
                <ComboboxItem />
              </ComboboxGroup>
            </Combobox>
            <ComboboxProvider defaultSelectedValue="Active">
              <ComboboxSelect aria-label="Status" />
              <ComboboxPopover>
                <ComboboxItem value="Active" checkmark="before" />
                <ComboboxItem value="Complete" checkmark="before" />
              </ComboboxPopover>
            </ComboboxProvider>
          </Disclosure>
          <Disclosure>No pending requests</Disclosure>
          <Disclosure>Advanced controls</Disclosure>
          <Disclosure>No requests need review</Disclosure>
          <Disclosure>Archived requests</Disclosure>
          <Disclosure>Optional settings</Disclosure>
          <Disclosure>No unread messages</Disclosure>
        `}
      >
        <DisclosureOptionalContent />
      </Example>

      <Example
        title="Named description-only button"
        description="An aria-label names a button that shows only a description, so the description describes the button instead of naming it."
        code={`
          <Disclosure button={{ description: "Tune the results" }}>Filter controls</Disclosure>
        `}
      >
        <Disclosure
          button={{
            "aria-label": "Advanced filters",
            description: "Tune the results",
          }}
        >
          Filter controls
        </Disclosure>
      </Example>
    </ExampleGrid>
  );
}
