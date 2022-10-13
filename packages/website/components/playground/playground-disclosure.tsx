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
      className={cx(
        "flex w-full items-center justify-center gap-1",
        "text-base text-[color:inherit] md:text-sm",
        "cursor-pointer hover:underline focus-visible:ariakit-outline-input",
        expanded && "absolute top-full rounded bg-none p-2",
        !expanded &&
          "bg-gradient-to-b from-white/0 to-[theme(colors.white.DEFAULT)_3.25em] dark:from-gray-850/0 dark:to-[theme(colors.gray.850)_3.25em]",
        !expanded &&
          "absolute bottom-0 rounded-bl-[inherit] rounded-br-[inherit] p-4 pt-12 text-black dark:text-white",
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
