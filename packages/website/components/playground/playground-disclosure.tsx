import { forwardRef } from "react";
import { cx } from "ariakit-utils/misc";
import { ButtonProps, useButton } from "ariakit/button";
import { Role } from "ariakit/role";

export type PlaygroundDisclosureProps = ButtonProps;

function renderArrow(down = false) {
  return (
    <svg
      display="block"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.5pt"
      viewBox="0 0 16 16"
      height="1em"
      width="1em"
    >
      <polyline points={down ? "4,6 8,10 12,6" : "4,10 8,6 12,10"} />
    </svg>
  );
}

const PlaygroundDisclosure = forwardRef<
  HTMLButtonElement,
  PlaygroundDisclosureProps
>((props, ref) => {
  const buttonProps = useButton({ ...props, ref });
  const expanded = !!buttonProps["aria-expanded"];
  return (
    <Role
      as="button"
      {...buttonProps}
      style={{
        background: expanded
          ? undefined
          : "linear-gradient(hsla(204, 3%, 12%, 0), hsl(204, 3%, 12%) 3.25em)",
        ...buttonProps.style,
      }}
      className={cx(
        "flex items-center justify-center gap-1 w-full text-base border-none",
        "cursor-pointer text-[color:inherit] hover:underline",
        expanded && "bg-none p-2",
        !expanded &&
          "absolute bottom-0 p-4 pt-12 rounded-bl-[inherit] rounded-br-[inherit] text-canvas-1-dark",
        buttonProps.className
      )}
    >
      {expanded ? (
        <>Collapse code {renderArrow()}</>
      ) : (
        <>Expand code {renderArrow(true)}</>
      )}
    </Role>
  );
});

export default PlaygroundDisclosure;
