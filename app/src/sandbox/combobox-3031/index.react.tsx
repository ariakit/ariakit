import * as Ariakit from "@ariakit/react";
import { useCallback, useState } from "react";
import { createPortal } from "react-dom";

const lateFrameContent = '<button type="button">Late outside target</button>';
const initialFrameContent = "<p>Initial frame content</p>";
const navigatedFrameContent =
  '<button type="button">Navigated outside target</button>';
const containedFrameContent =
  '<button type="button">Late contained target</button>';
const focusTimingFrameContent = '<input aria-label="Focus timing target" />';

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
          if (event.type === "focus" || event.type === "focusin") {
            const target = event.target;
            if ((target as Element | null)?.nodeType !== 1) {
              setOutsideTarget("Sibling frame");
              return shouldHide;
            }
            const element = target as Element;
            setOutsideTarget(
              element.getAttribute("title") ?? element.textContent ?? "",
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

interface FocusTimingDialogProps {
  setOpen: (open: boolean) => void;
}

function FocusTimingDialog({ setOpen }: FocusTimingDialogProps) {
  return (
    <Ariakit.DialogProvider setOpen={setOpen}>
      <Ariakit.DialogDisclosure tabIndex={-1}>
        Open focus timing dialog
      </Ariakit.DialogDisclosure>
      <Ariakit.Dialog
        aria-label="Focus timing dialog"
        modal={false}
        hideOnInteractOutside={(event) =>
          (event.target as Node | null)?.nodeType !== 1
        }
      >
        Focus timing dialog content
      </Ariakit.Dialog>
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
  const [outsideEvent, setOutsideEvent] = useState("");

  return (
    <Ariakit.DialogProvider>
      <Ariakit.DialogDisclosure tabIndex={-1}>
        Open root dialog
      </Ariakit.DialogDisclosure>
      <Ariakit.Dialog
        aria-label="Root dialog"
        modal={false}
        hideOnInteractOutside={(event) => {
          const nativeEvent =
            "nativeEvent" in event ? event.nativeEvent : event;
          const activeElement = document.activeElement;
          const activeWindow =
            activeElement?.tagName === "IFRAME"
              ? (activeElement as HTMLIFrameElement).contentWindow
              : null;
          const activeView = activeWindow?.document.defaultView;
          const sameRealm = activeView
            ? event instanceof activeView.FocusEvent
            : false;
          setOutsideEvent(
            `${event.type}; trusted: ${String(event.isTrusted)}; ` +
              `current target: ${event.currentTarget ? "set" : "null"}; ` +
              `path: ${nativeEvent.composedPath().length}; ` +
              `same realm: ${String(sameRealm)}`,
          );
          return true;
        }}
      >
        Root dialog content
        <button
          type="button"
          tabIndex={-1}
          onClick={() => {
            const frame = document.createElement("iframe");
            frame.title = "Synchronously focused frame";
            frame.srcdoc = initialFrameContent;
            document.body.append(frame);
            frame.contentWindow?.focus();
          }}
        >
          Add and focus outside frame
        </button>
        <button
          type="button"
          tabIndex={-1}
          onClick={() => {
            const frame = document.createElement("iframe");
            frame.title = "Pending synchronously focused frame";
            frame.src = "/pending-frame";
            document.body.append(frame);
            frame.contentWindow?.focus();
          }}
        >
          Add and focus pending frame
        </button>
      </Ariakit.Dialog>
      <output>Root outside event: {outsideEvent}</output>
    </Ariakit.DialogProvider>
  );
}

interface LifecycleDialogProps {
  addOutsideFrame: () => void;
  navigateFrame: () => void;
  navigateAndFocusFrame: () => void;
}

function LifecycleDialog({
  addOutsideFrame,
  navigateFrame,
  navigateAndFocusFrame,
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
        hideOnInteractOutside={(event) =>
          event.type === "click" || event.type === "focusin"
        }
      >
        <button type="button" onClick={addOutsideFrame}>
          Add outside frame
        </button>
        <button type="button" onClick={navigateFrame}>
          Navigate outside frame
        </button>
        <button type="button" onClick={navigateAndFocusFrame}>
          Navigate and focus outside frame
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
  setFocusTimingOpen: (open: boolean) => void;
  addOutsideFrame: () => void;
  navigateFrame: () => void;
  navigateAndFocusFrame: () => void;
}

function EmbeddedContent({
  firstMatchingOpen,
  setFirstMatchingOpen,
  setFocusTimingOpen,
  addOutsideFrame,
  navigateFrame,
  navigateAndFocusFrame,
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
      <FocusTimingDialog setOpen={setFocusTimingOpen} />
      <EmbeddedClickDialog />
      <LifecycleDialog
        addOutsideFrame={addOutsideFrame}
        navigateFrame={navigateFrame}
        navigateAndFocusFrame={navigateAndFocusFrame}
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
  const [focusFrameNavigated, setFocusFrameNavigated] = useState(false);
  const [firstMatchingOpen, setFirstMatchingOpen] = useState(false);
  const [secondMatchingOpen, setSecondMatchingOpen] = useState(false);
  const [focusTimingOpen, setFocusTimingOpen] = useState(false);

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
              setFocusTimingOpen={setFocusTimingOpen}
              addOutsideFrame={() => setShowOutsideFrame(true)}
              navigateFrame={() => setFrameNavigated(true)}
              navigateAndFocusFrame={() => setFocusFrameNavigated(true)}
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
        srcDoc={focusTimingFrameContent}
        title="Focus timing frame"
        tabIndex={focusTimingOpen ? 0 : -1}
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
      <iframe
        srcDoc={
          focusFrameNavigated
            ? '<input aria-label="Load focus target" />'
            : initialFrameContent
        }
        title="Focus navigated frame"
        tabIndex={-1}
        onLoad={(event) => {
          if (!focusFrameNavigated) return;
          event.currentTarget.contentDocument
            ?.querySelector<HTMLElement>("[aria-label='Load focus target']")
            ?.focus();
        }}
      />
      <iframe
        srcDoc={initialFrameContent}
        title="Cross-origin frame"
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
