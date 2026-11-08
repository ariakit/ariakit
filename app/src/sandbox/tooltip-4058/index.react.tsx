import * as ak from "@ariakit/react";
import { Button } from "@ariakit/ui/components/button.ariakit.react";
import { Frame } from "@ariakit/ui/components/frame.ariakit.react";
import { button } from "@ariakit/ui/styles/button";
import { link } from "@ariakit/ui/styles/link";
import { popover } from "@ariakit/ui/styles/popover";
import { tooltip } from "@ariakit/ui/styles/tooltip";
import type { DetailedHTMLProps, HTMLAttributes, ReactNode } from "react";
import { useCallback, useRef, useState } from "react";
import { createPortal } from "react-dom";

type CopyLinkButtonProps = DetailedHTMLProps<
  HTMLAttributes<HTMLElement>,
  HTMLElement
>;

declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "copy-link-button": CopyLinkButtonProps;
    }
  }
}

// A design system button that renders its own button in a shadow root.
if (
  typeof customElements !== "undefined" &&
  !customElements.get("copy-link-button")
) {
  class CopyLinkButton extends HTMLElement {
    constructor() {
      super();
      const shadow = this.attachShadow({ mode: "open" });
      // Safari doesn't focus a clicked button without a tabindex.
      shadow.innerHTML = `
        <style>
          button {
            font: inherit;
            padding: 4px 12px;
          }
        </style>
        <button type="button" tabindex="0">Copy link</button>
      `;
    }
  }
  customElements.define("copy-link-button", CopyLinkButton);
}

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

interface ShadowRootProps {
  children: ReactNode;
}

/**
 * Returns a ref callback for a host element, and a container inside the open
 * shadow root of that host.
 */
function useShadowContainer() {
  const [container, setContainer] = useState<HTMLDivElement | null>(null);
  const setHost = useCallback((host: HTMLDivElement | null) => {
    if (!host) {
      setContainer(null);
      return;
    }
    const shadow = host.shadowRoot || host.attachShadow({ mode: "open" });
    const element =
      shadow.querySelector<HTMLDivElement>("[data-shadow-container]") ||
      host.ownerDocument.createElement("div");
    element.dataset.shadowContainer = "";
    if (!element.isConnected) {
      shadow.append(element);
    }
    setContainer(element);
  }, []);
  return [setHost, container] as const;
}

/** Renders its children inside an open shadow root. */
function ShadowRoot({ children }: ShadowRootProps) {
  const [setHost, container] = useShadowContainer();
  return (
    <>
      <div ref={setHost} />
      {container && createPortal(children, container)}
    </>
  );
}

/** A hovercard and its scroll container inside an open shadow root. */
function ShadowProfile() {
  return (
    <ShadowRoot>
      {/* Page styles don't reach into the shadow root, so the panel and the
          card set the styles their behavior needs inline. */}
      <div
        role="region"
        aria-label="Shadow contributors"
        tabIndex={0}
        style={{ height: 160, overflowY: "auto", border: "1px solid" }}
      >
        <ak.HovercardProvider>
          <ak.HovercardAnchor href="#shadow">@shadow</ak.HovercardAnchor>
          <ak.Hovercard
            style={{ background: "white", border: "1px solid", padding: 8 }}
          >
            <ak.HovercardHeading>Shadow profile</ak.HovercardHeading>
            <copy-link-button />
          </ak.Hovercard>
        </ak.HovercardProvider>
        {lines.map((line) => (
          <p key={line}>Shadow line {line}</p>
        ))}
      </div>
    </ShadowRoot>
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
  // An overlay layer inside a shadow root, like one that a design system uses
  // to keep page styles away from its popups.
  const [setOverlayHost, overlay] = useShadowContainer();
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
              <ak.PopoverProvider>
                <ak.PopoverDisclosure {...button.jsx({ $border: true })}>
                  Share profile
                </ak.PopoverDisclosure>
                {/* Page styles don't reach into the overlay layer. */}
                <ak.Popover
                  portal
                  portalElement={overlay}
                  style={{
                    background: "white",
                    border: "1px solid",
                    padding: 8,
                  }}
                >
                  <ak.PopoverHeading>Share profile</ak.PopoverHeading>
                  <copy-link-button />
                </ak.Popover>
              </ak.PopoverProvider>
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
      <ShadowProfile />
      <NativeDialog />
      <div ref={setOverlayHost} />
    </div>
  );
}
