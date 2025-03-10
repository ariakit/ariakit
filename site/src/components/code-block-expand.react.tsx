import { type HTMLAttributes, useRef } from "react";
import { Icon } from "../icons/icon.react.tsx";

interface Props extends HTMLAttributes<HTMLButtonElement> {}

export function CodeBlockExpand({ className, ...props }: Props) {
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleClick = () => {
    const wrapper = buttonRef.current?.closest("*:has([data-collapsible])");
    const collapsible = buttonRef.current?.closest("[data-collapsible]");
    collapsible?.removeAttribute("data-collapsed");
    const pre = collapsible?.querySelector("pre");
    if (!pre) return;
    pre.inert = false;
    pre.focus({ preventScroll: true });
    wrapper?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  };

  return (
    <button
      ref={buttonRef}
      data-expand
      className={[
        "absolute group/expand grid outline-none not-in-data-collapsed:hidden ak-frame-cover/4 py-2 inset-0 ak-layer-current bg-transparent bg-gradient-to-b from-transparent from-[calc(100%-8rem)] to-[calc(100%-0.5rem)] to-(--ak-layer) z-1 justify-center items-end",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      onClick={handleClick}
      {...props}
    >
      <div className="ak-button h-9 ak-layer-current text-sm/[1.5rem] border ak-dark:shadow group-hover/expand:ak-button_hover hover:ak-layer-pop-[1.5] group-focus-visible/expand:ak-button_focus group-active/expand:ak-button_active">
        Expand code
        <Icon className="text-base" name="chevronDown" />
      </div>
    </button>
  );
}
