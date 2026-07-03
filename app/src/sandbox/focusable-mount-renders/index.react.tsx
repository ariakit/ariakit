import * as Ariakit from "@ariakit/react";
import { useFocusable } from "@ariakit/react-components/focusable/focusable";
import { useRef } from "react";

function ButtonRenders() {
  const renderCount = useRef(0);
  renderCount.current += 1;
  const props = useFocusable<"button">();
  return (
    <>
      <Ariakit.Role.button {...props}>Native button</Ariakit.Role.button>
      <output aria-label="Button renders">{renderCount.current}</output>
    </>
  );
}

function DivRenders() {
  const renderCount = useRef(0);
  renderCount.current += 1;
  const props = useFocusable();
  return (
    <>
      <Ariakit.Role {...props}>Div</Ariakit.Role>
      <output aria-label="Div renders">{renderCount.current}</output>
    </>
  );
}

function HintedDivRenders() {
  const renderCount = useRef(0);
  renderCount.current += 1;
  const props = useFocusable({ unstable_defaultTagName: "div" });
  return (
    <>
      <Ariakit.Role {...props}>Hinted div</Ariakit.Role>
      <output aria-label="Hinted div renders">{renderCount.current}</output>
    </>
  );
}

export default function Example() {
  return (
    <>
      <ButtonRenders />
      <DivRenders />
      <HintedDivRenders />
    </>
  );
}
