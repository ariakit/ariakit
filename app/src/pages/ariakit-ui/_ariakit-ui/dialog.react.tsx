/**
 * @license
 * Copyright 2025-present Ariakit FZ-LLC. All Rights Reserved.
 *
 * This software is proprietary. See the license.md file in the root of this
 * package for licensing terms.
 *
 * SPDX-License-Identifier: UNLICENSED
 */
import type { DialogProps } from "@ariakit/ui/components/dialog.ariakit.react.tsx";
import {
  Dialog,
  DialogDescription,
  DialogDisclosure,
  DialogDismiss,
  DialogHeading,
  DialogProvider,
  DialogScroll,
} from "@ariakit/ui/components/dialog.ariakit.react.tsx";
import { Input } from "@ariakit/ui/components/input.ariakit.react.tsx";
import { Layer } from "@ariakit/ui/components/layer.ariakit.react.tsx";
import { clsx } from "clsx";
import type * as React from "react";
import { Caption, Sample, Samples, Stage, LOREM } from "./gallery.react.tsx";

function SuccessContent() {
  return (
    <>
      <DialogHeading>Success</DialogHeading>
      <DialogDescription>
        Your payment has been successfully processed. We have emailed your
        receipt.
      </DialogDescription>
      <DialogDismiss $kind="bevel">OK</DialogDismiss>
    </>
  );
}

interface OpenDialogProps extends DialogProps {
  stageClassName?: string;
  /** Content rendered behind the dialog, under the backdrop. */
  behind?: React.ReactNode;
}

/**
 * A dialog held open inside its card. The stage is a size container, which
 * makes it the containing block of the fixed dialog and its backdrop, so
 * both lay out in the card instead of over the page. Focus stays where it
 * was so the page does not jump on load.
 */
function OpenDialog({
  stageClassName,
  behind,
  className,
  children,
  ...props
}: OpenDialogProps) {
  return (
    <Layer
      $lightnessOffset
      // Layout containment is what makes the stage the containing block of
      // the fixed dialog and backdrop; container-type alone stopped implying
      // it, and only sizes the dialog's viewport units.
      className={clsx(
        "relative h-72 overflow-clip rounded-xl p-4 contain-layout [container-type:size]",
        stageClassName,
      )}
    >
      {behind ?? <Caption>Page content behind the backdrop.</Caption>}
      <DialogProvider open>
        <Dialog
          portal={false}
          modal={false}
          backdrop
          autoFocusOnShow={false}
          hideOnInteractOutside={false}
          hideOnEscape={false}
          className={clsx("flex flex-col items-start gap-4", className)}
          {...props}
        >
          {children}
        </Dialog>
      </DialogProvider>
    </Layer>
  );
}

export function DialogSection() {
  return (
    <Samples>
      <Sample
        title="Interactive"
        code="DialogProvider > DialogDisclosure + Dialog > DialogHeading + DialogDescription + DialogDismiss"
        description="Open the modal to see it scale in over a blurred wash of the page. Focus moves into it and returns on close."
      >
        <Stage>
          <DialogProvider>
            <DialogDisclosure $kind="bevel">Show modal</DialogDisclosure>
            <Dialog className="flex flex-col items-start gap-4">
              <SuccessContent />
            </Dialog>
          </DialogProvider>
          <DialogProvider>
            <DialogDisclosure>With a form</DialogDisclosure>
            <Dialog className="flex flex-col gap-4">
              <DialogHeading>Rename project</DialogHeading>
              <DialogDescription>
                Pick a name your team will recognise.
              </DialogDescription>
              <Input defaultValue="Ariakit UI" aria-label="Project name" />
              <div className="flex justify-end gap-2">
                <DialogDismiss>Cancel</DialogDismiss>
                <DialogDismiss $layer="brand" $kind="bevel">
                  Save
                </DialogDismiss>
              </div>
            </Dialog>
          </DialogProvider>
          <DialogProvider>
            <DialogDisclosure>Nested</DialogDisclosure>
            <Dialog className="flex flex-col items-start gap-4">
              <DialogHeading>Outer dialog</DialogHeading>
              <DialogDescription>
                Open another dialog on top of this one.
              </DialogDescription>
              <DialogProvider>
                <DialogDisclosure $kind="bevel">Open inner</DialogDisclosure>
                <Dialog className="flex flex-col items-start gap-4">
                  <DialogHeading>Inner dialog</DialogHeading>
                  <DialogDescription>
                    Escape closes this one first.
                  </DialogDescription>
                  <DialogDismiss $kind="bevel">Close</DialogDismiss>
                </Dialog>
              </DialogProvider>
              <DialogDismiss>Close</DialogDismiss>
            </Dialog>
          </DialogProvider>
        </Stage>
      </Sample>

      <Sample
        title="Scrollable"
        code="Dialog > DialogScroll"
        description="Content longer than the viewport scrolls inside the dialog, which is capped by the visual viewport height."
      >
        <Stage>
          <DialogProvider>
            <DialogDisclosure>Terms of service</DialogDisclosure>
            <Dialog className="flex flex-col gap-4">
              <DialogScroll className="grid gap-4">
                <DialogHeading>Terms of service</DialogHeading>
                {Array.from({ length: 12 }, (_, index) => (
                  <DialogDescription key={index}>{LOREM}</DialogDescription>
                ))}
                <DialogDismiss $kind="bevel" className="w-max">
                  Agree
                </DialogDismiss>
              </DialogScroll>
            </Dialog>
          </DialogProvider>
        </Stage>
      </Sample>

      <Sample
        title="Open"
        code="DialogProvider open · Dialog portal={false} modal={false} backdrop"
        description="The default surface held open over a backdrop inside the card: a blurred wash, a lifted 2xl frame and the extra-large shadow."
      >
        <OpenDialog>
          <SuccessContent />
        </OpenDialog>
      </Sample>

      <Sample
        title="Open variants"
        code='$shadow="md" $rounded="lg" · className="max-w-64" · $layer="brand"'
        description="The dialog is a popover, so the shadow, radius, padding and color knobs apply. A max width class caps the channel."
      >
        <div className="grid gap-3">
          <OpenDialog $shadow="md" $rounded="lg" $p={3} stageClassName="h-56">
            <DialogHeading>Smaller radius</DialogHeading>
            <DialogDescription>
              Medium shadow and three steps of padding.
            </DialogDescription>
            <DialogDismiss>Close</DialogDismiss>
          </OpenDialog>
          <OpenDialog className="max-w-64" stageClassName="h-56">
            <DialogHeading>Narrow</DialogHeading>
            <DialogDescription>Capped at 16rem.</DialogDescription>
            <DialogDismiss $kind="bevel">OK</DialogDismiss>
          </OpenDialog>
          <OpenDialog $layer="brand" stageClassName="h-56">
            <DialogHeading>Brand surface</DialogHeading>
            <DialogDescription>The ink follows the layer.</DialogDescription>
            <DialogDismiss $kind="bevel">OK</DialogDismiss>
          </OpenDialog>
        </div>
      </Sample>

      <Sample
        title="Open with scroll"
        code="DialogScroll inside an open dialog"
        description="The scroll viewport covers the content box and keeps the frame's corners."
      >
        {/* The recipe's viewport cap is an arbitrary value that sorts after a plain
            max-h utility, so the sample cap needs the important flag. */}
        <OpenDialog className="max-h-56!">
          <DialogScroll className="grid gap-3">
            <DialogHeading>Release notes</DialogHeading>
            <DialogDescription>{LOREM}</DialogDescription>
            <DialogDescription>{LOREM}</DialogDescription>
            <DialogDescription>{LOREM}</DialogDescription>
          </DialogScroll>
        </OpenDialog>
      </Sample>

      <Sample
        title="On layers"
        code="Dialog over an inverted or brand backdrop"
        description="The backdrop is a wash of the surface behind the dialog, so it follows the layer."
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <Layer $invert className="grid gap-2 rounded-xl p-3">
            <Caption>Inverted</Caption>
            <OpenDialog
              stageClassName="h-56"
              behind={<Caption>Inverted page content.</Caption>}
            >
              <DialogHeading>Over an inverted layer</DialogHeading>
              <DialogDismiss $kind="bevel">OK</DialogDismiss>
            </OpenDialog>
          </Layer>
          <Layer $layer="brand" className="grid gap-2 rounded-xl p-3">
            <Caption>Brand</Caption>
            <OpenDialog
              stageClassName="h-56"
              behind={<Caption>Brand page content.</Caption>}
            >
              <DialogHeading>Over a brand layer</DialogHeading>
              <DialogDismiss $kind="bevel">OK</DialogDismiss>
            </OpenDialog>
          </Layer>
        </div>
      </Sample>
    </Samples>
  );
}
