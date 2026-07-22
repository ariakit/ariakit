import * as Ariakit from "@ariakit/react";
import { useCallback, useState } from "react";
import { createPortal } from "react-dom";

const lateFrameContent = '<button type="button">Late outside target</button>';
const initialFrameContent = "<p>Initial frame content</p>";
const navigatedFrameContent =
  '<button type="button">Navigated outside target</button>';
const containedFrameContent =
  '<button type="button">Late contained target</button>';

function NestedFrame() {
  const [iframeBody, setIframeBody] = useState<HTMLElement | null>(null);

  const setIframe = useCallback((element: HTMLIFrameElement | null) => {
    setIframeBody(element?.contentDocument?.body ?? null);
  }, []);

  return (
    <>
      {iframeBody
        ? createPortal(<input aria-label="Inside dialog frame" />, iframeBody)
        : null}
      <iframe ref={setIframe} title="Nested content" tabIndex={-1} />
    </>
  );
}

function EmbeddedDialog() {
  const [outsideTarget, setOutsideTarget] = useState("");
  const shouldHide = !!outsideTarget;

  return (
    <Ariakit.DialogProvider>
      <Ariakit.DialogDisclosure tabIndex={-1}>
        Open focused dialog
      </Ariakit.DialogDisclosure>
      <Ariakit.Dialog
        aria-label="Focused dialog"
        modal={false}
        unmountOnHide={false}
        hideOnInteractOutside={(event) => {
          if (event.type === "focusin") {
            const target = event.target as Element;
            setOutsideTarget(
              target.getAttribute("title") ?? target.textContent ?? "",
            );
          }
          return shouldHide;
        }}
      >
        Dialog content
        <NestedFrame />
      </Ariakit.Dialog>
      <output>Outside target: {outsideTarget}</output>
    </Ariakit.DialogProvider>
  );
}

function EmbeddedClickDialog() {
  const [outsideEvent, setOutsideEvent] = useState("");

  return (
    <Ariakit.DialogProvider>
      <Ariakit.DialogDisclosure tabIndex={-1}>
        Open click dialog
      </Ariakit.DialogDisclosure>
      <Ariakit.Dialog
        aria-label="Click dialog"
        modal={false}
        hideOnInteractOutside={(event) => {
          setOutsideEvent(event.type);
          return event.type === "click";
        }}
      >
        Click dialog content
      </Ariakit.Dialog>
      <output>Outside event: {outsideEvent}</output>
    </Ariakit.DialogProvider>
  );
}

function RootDialog() {
  return (
    <Ariakit.DialogProvider>
      <Ariakit.DialogDisclosure tabIndex={-1}>
        Open root dialog
      </Ariakit.DialogDisclosure>
      <Ariakit.Dialog
        aria-label="Root dialog"
        modal={false}
        hideOnInteractOutside
      >
        Root dialog content
      </Ariakit.Dialog>
    </Ariakit.DialogProvider>
  );
}

interface LifecycleDialogProps {
  addOutsideFrame: () => void;
  navigateFrame: () => void;
}

function LifecycleDialog({
  addOutsideFrame,
  navigateFrame,
}: LifecycleDialogProps) {
  const [showContainedFrame, setShowContainedFrame] = useState(false);

  return (
    <Ariakit.DialogProvider>
      <Ariakit.DialogDisclosure tabIndex={-1}>
        Open lifecycle dialog
      </Ariakit.DialogDisclosure>
      <Ariakit.Dialog
        aria-label="Lifecycle dialog"
        modal={false}
        hideOnInteractOutside={(event) => event.type === "click"}
      >
        <button type="button" onClick={addOutsideFrame}>
          Add outside frame
        </button>
        <button type="button" onClick={navigateFrame}>
          Navigate outside frame
        </button>
        <button type="button" onClick={() => setShowContainedFrame(true)}>
          Add contained frame
        </button>
        {showContainedFrame ? (
          <iframe
            srcDoc={containedFrameContent}
            title="Late contained frame"
            tabIndex={-1}
          />
        ) : null}
      </Ariakit.Dialog>
    </Ariakit.DialogProvider>
  );
}

interface MatchingDialogProps {
  label: string;
  open: boolean;
  setOpen: (open: boolean) => void;
}

function MatchingDialog({ label, open, setOpen }: MatchingDialogProps) {
  return (
    <Ariakit.DialogProvider open={open} setOpen={setOpen}>
      <Ariakit.Dialog
        id="matching-dialog"
        aria-label={`${label} matching dialog`}
        autoFocusOnShow={false}
        modal={false}
      >
        <button type="button">{label} matching target</button>
      </Ariakit.Dialog>
    </Ariakit.DialogProvider>
  );
}

interface EmbeddedContentProps {
  firstMatchingOpen: boolean;
  setFirstMatchingOpen: (open: boolean) => void;
  addOutsideFrame: () => void;
  navigateFrame: () => void;
}

function EmbeddedContent({
  firstMatchingOpen,
  setFirstMatchingOpen,
  addOutsideFrame,
  navigateFrame,
}: EmbeddedContentProps) {
  return (
    <>
      <Ariakit.ComboboxProvider>
        <Ariakit.ComboboxLabel>Favorite food</Ariakit.ComboboxLabel>
        <Ariakit.Combobox />
        <Ariakit.ComboboxPopover aria-label="Suggestions">
          <Ariakit.ComboboxItem value="Apple" />
          <Ariakit.ComboboxItem value="Banana" />
        </Ariakit.ComboboxPopover>
      </Ariakit.ComboboxProvider>
      <EmbeddedDialog />
      <EmbeddedClickDialog />
      <LifecycleDialog
        addOutsideFrame={addOutsideFrame}
        navigateFrame={navigateFrame}
      />
      <MatchingDialog
        label="First"
        open={firstMatchingOpen}
        setOpen={setFirstMatchingOpen}
      />
    </>
  );
}

export default function Example() {
  const [iframeBody, setIframeBody] = useState<HTMLElement | null>(null);
  const [siblingBody, setSiblingBody] = useState<HTMLElement | null>(null);
  const [showOutsideFrame, setShowOutsideFrame] = useState(false);
  const [frameNavigated, setFrameNavigated] = useState(false);
  const [firstMatchingOpen, setFirstMatchingOpen] = useState(false);
  const [secondMatchingOpen, setSecondMatchingOpen] = useState(false);

  const setIframe = useCallback((element: HTMLIFrameElement | null) => {
    setIframeBody(element?.contentDocument?.body ?? null);
  }, []);

  const setSiblingIframe = useCallback((element: HTMLIFrameElement | null) => {
    setSiblingBody(element?.contentDocument?.body ?? null);
  }, []);

  return (
    <div style={{ display: "grid", gap: 16 }}>
      {iframeBody
        ? createPortal(
            <EmbeddedContent
              firstMatchingOpen={firstMatchingOpen}
              setFirstMatchingOpen={setFirstMatchingOpen}
              addOutsideFrame={() => setShowOutsideFrame(true)}
              navigateFrame={() => setFrameNavigated(true)}
            />,
            iframeBody,
          )
        : null}
      {siblingBody
        ? createPortal(
            <>
              <div>Sibling click target</div>
              <MatchingDialog
                label="Second"
                open={secondMatchingOpen}
                setOpen={setSecondMatchingOpen}
              />
            </>,
            siblingBody,
          )
        : null}
      <RootDialog />
      <iframe title="Root outside frame" tabIndex={0} />
      <iframe
        ref={setIframe}
        title="Embedded content"
        style={{ border: "1px solid", height: 160, width: 320 }}
      />
      <iframe
        ref={setSiblingIframe}
        title="Sibling frame"
        // This preserves the default tab order while ensuring WebKit includes
        // the frame under the default macOS keyboard settings.
        tabIndex={0}
      />
      {showOutsideFrame ? (
        <iframe
          srcDoc={lateFrameContent}
          title="Late outside frame"
          tabIndex={-1}
        />
      ) : null}
      <iframe
        srcDoc={frameNavigated ? navigatedFrameContent : initialFrameContent}
        title="Navigated frame"
        tabIndex={-1}
      />
      <button
        type="button"
        onClick={() => {
          setFirstMatchingOpen(true);
          setSecondMatchingOpen(true);
        }}
      >
        Open matching dialogs
      </button>
      <button type="button">After iframe</button>
    </div>
  );
}
