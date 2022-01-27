import { ReactNode, forwardRef, useRef } from "react";
import { getFirstTabbableIn, getLastTabbableIn } from "ariakit-utils/focus";
import { FocusTrap } from "ariakit/focus-trap";
import "./style.css";

type ContainerProps = {
  children: ReactNode;
  label: string;
};
const Container = forwardRef<HTMLDivElement, ContainerProps>(
  ({ children, label, ...rest }, ref) => (
    <div className="example-container" ref={ref} {...rest}>
      <span>{label}</span>
      <div className="buttons-container">{children}</div>
    </div>
  )
);

export default function Example() {
  const focusContainerRef = useRef<HTMLDivElement>(null);

  const handleOnFocusTrapStart = () => {
    const node = focusContainerRef.current as HTMLDivElement;
    getFirstTabbableIn(node).focus();
  };
  const handleOnFocusTrapEnd = () => {
    const node = focusContainerRef.current as HTMLDivElement;
    getLastTabbableIn(node).focus();
  };

  return (
    <div className="flex gap-2">
      <FocusTrap className="FocusTrap" onFocus={handleOnFocusTrapStart} />
      <Container label="Focus trapped" ref={focusContainerRef}>
        <button className="button">One</button>
        <button className="button">Two</button>
        <button className="button">Three</button>
      </Container>
      <FocusTrap className="FocusTrap" onFocus={handleOnFocusTrapEnd} />
      <Container label="Untrapped focus">
        <button className="button">Four</button>
        <button className="button">Five</button>
      </Container>
    </div>
  );
}
