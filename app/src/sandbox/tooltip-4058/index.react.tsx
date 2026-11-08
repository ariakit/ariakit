import * as ak from "@ariakit/react";
import { Button } from "@ariakit/ui/components/button.ariakit.react";
import { Frame } from "@ariakit/ui/components/frame.ariakit.react";
import { button } from "@ariakit/ui/styles/button";
import { link } from "@ariakit/ui/styles/link";
import { popover } from "@ariakit/ui/styles/popover";
import { tooltip } from "@ariakit/ui/styles/tooltip";
import type { ReactNode } from "react";
import { useRef, useState } from "react";

const lines = Array.from({ length: 24 }, (_, index) => index + 1);

const textStyles = [
  "Bold",
  "Italic",
  "Underline",
  "Strikethrough",
  "Code",
  "Quote",
  "Heading",
  "List",
];

interface PanelProps {
  label: string;
  children: ReactNode;
}

/** A scroll container with the given content above some filler lines. */
function Panel({ label, children }: PanelProps) {
  return (
    <Frame
      role="region"
      aria-label={label}
      tabIndex={0}
      $border
      $rounded="xl"
      $p={4}
      className="h-60 overflow-y-auto"
    >
      {children}
      {lines.map((line) => (
        <p key={line}>
          {label} line {line}
        </p>
      ))}
    </Frame>
  );
}

interface TooltipButtonProps extends ak.TooltipProviderProps {
  label: string;
  description: string;
  tooltipProps?: ak.TooltipProps;
}

function TooltipButton({
  label,
  description,
  tooltipProps,
  ...props
}: TooltipButtonProps) {
  return (
    <ak.TooltipProvider {...props}>
      <ak.TooltipAnchor render={<button type="button" {...button.jsx()} />}>
        {label}
      </ak.TooltipAnchor>
      <ak.Tooltip {...tooltip.jsx()} {...tooltipProps}>
        {description}
      </ak.Tooltip>
    </ak.TooltipProvider>
  );
}

function NativeDialog() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  return (
    <>
      <Button $border onClick={() => dialogRef.current?.showModal()}>
        Open native dialog
      </Button>
      <Frame
        render={<dialog ref={dialogRef} />}
        aria-label="Native dialog"
        $layer
        $border
        $rounded="xl"
        $p={4}
      >
        {/* The dialog is in the top layer, so the tooltip renders inside it
            instead of in a portal. */}
        <Panel label="Pinned">
          <TooltipButton
            label="Pin"
            description="Pin to the top"
            tooltipProps={{ portal: false }}
          />
        </Panel>
        <Button $border onClick={() => dialogRef.current?.close()}>
          Close
        </Button>
      </Frame>
    </>
  );
}

/** A notification whose dismiss button removes itself on click. */
function Notification() {
  const [dismissed, setDismissed] = useState(false);
  return (
    <ak.TooltipProvider>
      {dismissed ? (
        <p>Notification dismissed</p>
      ) : (
        <ak.TooltipAnchor
          render={
            <button
              type="button"
              {...button.jsx()}
              onClick={() => setDismissed(true)}
            />
          }
        >
          Dismiss
        </ak.TooltipAnchor>
      )}
      <ak.Tooltip {...tooltip.jsx()}>Dismiss this notification</ak.Tooltip>
    </ak.TooltipProvider>
  );
}

export default function Example() {
  return (
    <div className="flex flex-col gap-8 p-4">
      <TooltipButton label="Share" description="Share this page" />
      <Notification />
      {/* The space above the panel keeps a tooltip that follows its anchor out
          of the panel in view. */}
      <div className="mt-40">
        <Panel label="Bookmarks">
          <p>Hover the button, then scroll this panel with the mouse wheel.</p>
          <TooltipButton label="Bookmark" description="Add to bookmarks" />
        </Panel>
      </div>
      <Panel label="Formatting">
        {/* Firefox puts scroll containers in the tab order. The buttons
            already reach every part of this row. */}
        <div
          role="group"
          aria-label="Text styles"
          tabIndex={-1}
          className="flex w-64 gap-2 overflow-x-auto pb-2 *:shrink-0"
        >
          {textStyles.map((style) => (
            <TooltipButton
              key={style}
              label={style}
              description={`${style} text`}
            />
          ))}
        </div>
      </Panel>
      <Panel label="Archive">
        <TooltipButton
          label="Archive"
          description="Move to archive"
          tooltipProps={{ hideWhenAnchorHidden: false }}
        />
      </Panel>
      <Panel label="Contributors">
        <ak.HovercardProvider>
          <ak.HovercardAnchor href="#ariakit" {...link.jsx()}>
            @ariakit
          </ak.HovercardAnchor>
          <ak.Hovercard {...popover.jsx()}>
            <ak.HovercardHeading>Ariakit</ak.HovercardHeading>
            <div className="flex gap-2">
              <Button $border>Follow</Button>
              <ak.MenuProvider>
                <ak.MenuButton {...button.jsx({ $border: true })}>
                  Profile actions
                </ak.MenuButton>
                <ak.Menu portal {...popover.jsx()}>
                  <ak.MenuItem {...button.jsx()}>Copy profile link</ak.MenuItem>
                </ak.Menu>
              </ak.MenuProvider>
            </div>
          </ak.Hovercard>
        </ak.HovercardProvider>
      </Panel>
      <Panel label="Filters">
        <ak.PopoverProvider>
          <ak.PopoverDisclosure {...button.jsx({ $border: true })}>
            Filter
          </ak.PopoverDisclosure>
          <ak.Popover autoFocusOnShow={false} {...popover.jsx()}>
            Filter options
          </ak.Popover>
        </ak.PopoverProvider>
      </Panel>
      <Panel label="Sorting">
        <ak.PopoverProvider>
          <ak.PopoverDisclosure {...button.jsx({ $border: true })}>
            Sort
          </ak.PopoverDisclosure>
          <ak.Popover
            autoFocusOnShow={false}
            hideWhenAnchorHidden
            {...popover.jsx()}
          >
            Sort options
          </ak.Popover>
        </ak.PopoverProvider>
      </Panel>
      <Panel label="Actions">
        <ak.MenuProvider>
          <ak.MenuButton {...button.jsx({ $border: true })}>
            More actions
          </ak.MenuButton>
          <ak.Menu autoFocusOnShow={false} {...popover.jsx()}>
            <ak.MenuItem {...button.jsx()}>Rename</ak.MenuItem>
            <ak.MenuItem {...button.jsx()}>Delete</ak.MenuItem>
          </ak.Menu>
        </ak.MenuProvider>
      </Panel>
      <NativeDialog />
    </div>
  );
}
