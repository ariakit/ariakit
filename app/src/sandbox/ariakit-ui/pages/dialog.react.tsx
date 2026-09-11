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
  Dialog,
  DialogDescription,
  DialogDisclosure,
  DialogDismiss,
  DialogHeading,
  DialogProvider,
  DialogScroll,
} from "@ariakit/ui/components/dialog.ariakit.react";
import { Input } from "@ariakit/ui/components/input.ariakit.react";
import { useState } from "react";
import { Example, ExampleGrid, screenshotFocus } from "../example.react.tsx";
import { createGalleryPage } from "../shell.react.tsx";

const releaseNotes = [
  "Popovers now lift off the surface behind them and take an adaptive edge, so they read as raised material on light and dark pages alike.",
  "Dialogs cap their height to the visual viewport, so a virtual keyboard shrinks them instead of covering their actions.",
  "Tooltips wrap long labels instead of running across the page, and keep their padding on every line.",
];

// Enough sections to outgrow any desktop viewport, so the dialog reaches the
// cap that Ariakit measures from the visual viewport.
const termsSections = Array.from(
  { length: 12 },
  (_, index) =>
    `Section ${index + 1}. You keep the rights to the content you create. We only use it to run the service, and we remove it when you delete your account.`,
);

/**
 * A dialog with a form. Saving submits the form, stores the new name and closes
 * the dialog. The dialog unmounts when it closes, so the field starts from the
 * saved name each time it opens.
 */
function RenameProjectExample() {
  const [name, setName] = useState("Ariakit UI");
  const store = ak.useDialogStore();
  return (
    <div className="flex flex-col items-start gap-2">
      <p className="ak-ink-70 text-sm">Current name: {name}</p>
      <DialogProvider store={store}>
        <DialogDisclosure $kind="bevel">Rename project</DialogDisclosure>
        <Dialog unmountOnHide className="flex flex-col gap-4">
          <DialogHeading>Rename project</DialogHeading>
          <DialogDescription>
            Pick a name your team will recognize.
          </DialogDescription>
          <form
            className="flex flex-col gap-4"
            onSubmit={(event) => {
              event.preventDefault();
              const data = new FormData(event.currentTarget);
              const next = data.get("name");
              if (typeof next === "string" && next.trim()) {
                setName(next.trim());
              }
              store.hide();
            }}
          >
            <Input name="name" defaultValue={name} aria-label="Project name" />
            <div className="flex justify-end gap-2">
              <DialogDismiss>Cancel</DialogDismiss>
              <Button type="submit" $layer="brand" $kind="bevel">
                Save
              </Button>
            </div>
          </form>
        </Dialog>
      </DialogProvider>
    </div>
  );
}

export function DialogExamples() {
  return (
    <ExampleGrid>
      <Example
        title="Default"
        description="A raised surface over a blurred wash of the page. It stretches between the viewport insets up to a maximum width."
      >
        <DialogProvider>
          <DialogDisclosure $kind="bevel" {...screenshotFocus}>
            View receipt
          </DialogDisclosure>
          <Dialog className="flex flex-col gap-4">
            <DialogHeading>Success</DialogHeading>
            <DialogDescription>
              Your payment has been processed. We have emailed your receipt.
            </DialogDescription>
            <div className="flex justify-end gap-2">
              <DialogDismiss $kind="bevel">OK</DialogDismiss>
            </div>
          </Dialog>
        </DialogProvider>
      </Example>

      <Example
        title="Close button"
        description="A dismiss without children is a square icon button at the end of the heading row."
      >
        <DialogProvider>
          <DialogDisclosure $kind="bevel">Invite member</DialogDisclosure>
          <Dialog className="flex flex-col gap-4">
            <div className="flex items-center justify-between gap-2">
              <DialogHeading>Invite sent</DialogHeading>
              <DialogDismiss />
            </div>
            <DialogDescription>
              We emailed an invite to the new member.
            </DialogDescription>
          </Dialog>
        </DialogProvider>
      </Example>

      <Example
        title="Form"
        description="A field and an end-aligned action row. Save submits the form, and the dialog closes with the new name."
        code={
          <DialogProvider>
            <DialogDisclosure $kind="bevel">Rename project</DialogDisclosure>
            <Dialog>
              <DialogHeading>Rename project</DialogHeading>
              <DialogDescription>…</DialogDescription>
              <Input />
              <DialogDismiss>Cancel</DialogDismiss>
              <Button type="submit" $layer="brand" $kind="bevel">
                Save
              </Button>
            </Dialog>
          </DialogProvider>
        }
      >
        <RenameProjectExample />
      </Example>

      <Example
        title="Scroll body with header and footer"
        description="The max-h-64 class caps the dialog. The body scrolls between the fixed heading and action, and bleeds to the side edges."
      >
        <DialogProvider>
          <DialogDisclosure $kind="bevel">Release notes</DialogDisclosure>
          <Dialog className="flex max-h-64 flex-col">
            <DialogHeading>Release notes</DialogHeading>
            <DialogScroll className="grid gap-3">
              {releaseNotes.map((note) => (
                <DialogDescription key={note}>{note}</DialogDescription>
              ))}
            </DialogScroll>
            <div className="flex justify-end gap-2">
              <DialogDismiss $kind="bevel">Done</DialogDismiss>
            </div>
          </Dialog>
        </DialogProvider>
      </Example>

      <Example
        title="Long content"
        description="Content taller than the viewport. The dialog stops at the viewport insets, and only the body scrolls."
      >
        <DialogProvider>
          <DialogDisclosure $kind="bevel">Terms of service</DialogDisclosure>
          <Dialog className="flex flex-col">
            <DialogHeading>Terms of service</DialogHeading>
            <DialogScroll className="grid gap-3">
              {termsSections.map((section) => (
                <DialogDescription key={section}>{section}</DialogDescription>
              ))}
            </DialogScroll>
            <div className="flex justify-end gap-2">
              <DialogDismiss $kind="bevel">Agree</DialogDismiss>
            </div>
          </Dialog>
        </DialogProvider>
      </Example>

      <Example
        title="Custom max width"
        description="The max-w-64 class narrows the dialog below its default maximum width. It stays centered between the insets."
      >
        <DialogProvider>
          <DialogDisclosure $kind="bevel">Sign out</DialogDisclosure>
          <Dialog className="flex max-w-64 flex-col gap-4">
            <DialogHeading>Sign out?</DialogHeading>
            <DialogDescription>
              You can sign back in at any time.
            </DialogDescription>
            <div className="flex justify-end gap-2">
              <DialogDismiss>Cancel</DialogDismiss>
              <DialogDismiss $kind="bevel">Sign out</DialogDismiss>
            </div>
          </Dialog>
        </DialogProvider>
      </Example>

      <Example
        title="Brand surface"
        description="The dialog, its ink and its dismiss take the brand color. The backdrop does not, because it washes the page behind the dialog."
      >
        <DialogProvider>
          <DialogDisclosure $kind="bevel">Upgrade</DialogDisclosure>
          <Dialog $layer="brand" className="flex flex-col gap-4">
            <DialogHeading>Upgrade to Pro</DialogHeading>
            <DialogDescription>
              Unlock unlimited projects and priority support.
            </DialogDescription>
            <div className="flex justify-end gap-2">
              <DialogDismiss $kind="bevel">Maybe later</DialogDismiss>
            </div>
          </Dialog>
        </DialogProvider>
      </Example>

      <Example
        title="Nested dialogs"
        description="A dialog opened from another one shows on top of it. Escape closes the inner dialog first, and focus goes back to the button that opened it."
      >
        <DialogProvider>
          <DialogDisclosure $kind="bevel">Project settings</DialogDisclosure>
          <Dialog className="flex flex-col gap-4">
            <DialogHeading>Project settings</DialogHeading>
            <DialogDescription>
              Rename, transfer or delete this project.
            </DialogDescription>
            <div className="flex justify-end gap-2">
              <DialogProvider>
                <DialogDisclosure>Delete project</DialogDisclosure>
                <Dialog className="flex max-w-80 flex-col gap-4">
                  <DialogHeading>Delete project?</DialogHeading>
                  <DialogDescription>
                    This removes the project for every member.
                  </DialogDescription>
                  <div className="flex justify-end gap-2">
                    <DialogDismiss>Cancel</DialogDismiss>
                    <DialogDismiss $layer="danger" $kind="bevel">
                      Delete
                    </DialogDismiss>
                  </div>
                </Dialog>
              </DialogProvider>
              <DialogDismiss $kind="bevel">Done</DialogDismiss>
            </div>
          </Dialog>
        </DialogProvider>
      </Example>
    </ExampleGrid>
  );
}

export default createGalleryPage("dialog", DialogExamples);
