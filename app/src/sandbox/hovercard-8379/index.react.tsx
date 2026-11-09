import * as ak from "@ariakit/react";
import { link } from "@ariakit/ui/styles/link";
import { popover } from "@ariakit/ui/styles/popover";
import type { ComponentPropsWithoutRef } from "react";
import { useCallback, useState } from "react";
import { createPortal } from "react-dom";

const sections = Array.from(
  { length: 12 },
  (_, index) => `Section ${index + 1}`,
);

// A frame document doesn't get the page styles.
const nestedFrameStyle = {
  display: "block",
  width: "100%",
  height: 64,
  border: "1px solid",
};

// A same-origin frame with content from this React tree. The frame loads with
// the page, so it's there before the hovercard first opens. The hovercard
// doesn't unmount when it hides, so the frame doesn't load again either.
function PreviewFrame({
  children,
  ...props
}: ComponentPropsWithoutRef<"iframe">) {
  const [body, setBody] = useState<HTMLElement | null>(null);
  const ref = useCallback((element: HTMLIFrameElement | null) => {
    setBody(element?.contentDocument?.body ?? null);
  }, []);
  return (
    <>
      <iframe ref={ref} {...props} />
      {body ? createPortal(children, body) : null}
    </>
  );
}

export default function Example() {
  return (
    <div className="flex flex-col items-start gap-4">
      <PreviewFrame title="Outside preview" className="h-16 w-80 border">
        <button type="button">Outside button</button>
      </PreviewFrame>
      <ak.HovercardProvider placement="bottom-start">
        <ak.HovercardAnchor href="#button" hoverOnScroll {...link.jsx()}>
          Button
        </ak.HovercardAnchor>
        <ak.Hovercard {...popover.jsx({ className: "gap-2" })}>
          <ak.HovercardHeading>Button</ak.HovercardHeading>
          <PreviewFrame title="Button preview" className="h-48 w-80 border">
            <button type="button">Preview button</button>
            <PreviewFrame title="Nested preview" style={nestedFrameStyle}>
              <button type="button">Nested button</button>
            </PreviewFrame>
            {sections.map((section) => (
              <p key={section}>{section}</p>
            ))}
          </PreviewFrame>
        </ak.Hovercard>
      </ak.HovercardProvider>
    </div>
  );
}
