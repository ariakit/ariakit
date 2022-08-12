import {
  OpenInCodeSandbox as Action,
  OpenInCodeSandboxProps as ActionProps,
} from "ariakit-playground/actions/open-in-code-sandbox";
import { cx } from "ariakit-utils/misc";
import NewWindow from "../icons/new-window";
import TooltipButton, { TooltipButtonOptions } from "../tooltip-button";

export type OpenInCodeSandboxProps = ActionProps &
  Partial<TooltipButtonOptions>;

const codeSandboxIcon = (
  <svg fill="currentColor" height="1.25em" viewBox="0 0 256 296">
    <path d="M115.498 261.088v-106.61L23.814 101.73v60.773l41.996 24.347v45.7l49.688 28.54zm23.814.627l50.605-29.151V185.78l42.269-24.495v-60.011l-92.874 53.621v106.82zm80.66-180.887l-48.817-28.289l-42.863 24.872l-43.188-24.897l-49.252 28.667l91.914 52.882l92.206-53.235zM0 222.212V74.495L127.987 0L256 74.182v147.797l-128.016 73.744L0 222.212z"></path>
  </svg>
);

export default function OpenInCodeSandbox(props: OpenInCodeSandboxProps) {
  return (
    <TooltipButton
      as={Action}
      title={
        <span className="flex items-center gap-1">
          Open in CodeSandbox
          <NewWindow className="stroke-current h-[1em] w-[1em]" />
        </span>
      }
      {...props}
      className={cx(
        "h-10 rounded-md px-4 text-base sm:h-8 sm:rounded sm:px-3 sm:text-sm",
        "bg-transparent hover:bg-black/5 dark:hover:bg-white/5",
        "text-black/75 focus-visible:ariakit-outline dark:text-white/75",
        props.className
      )}
    >
      {codeSandboxIcon}
    </TooltipButton>
  );
}
