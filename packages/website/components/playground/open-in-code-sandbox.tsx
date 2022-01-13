import {
  OpenInCodeSandbox as Action,
  OpenInCodeSandboxProps as ActionProps,
} from "ariakit-playground/actions/open-in-code-sandbox";
import { cx } from "ariakit-utils/misc";
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
      title="Open in CodeSandbox"
      {...props}
      className={cx(
        "h-10 sm:h-8 px-4 sm:px-3 text-base sm:text-sm rounded-md sm:rounded",
        "bg-alpha-2 hover:bg-alpha-2-hover dark:hover:bg-alpha-2-dark-hover",
        "text-black-fade dark:text-white-fade focus-visible:ariakit-outline",
        props.className
      )}
    >
      {codeSandboxIcon}
    </TooltipButton>
  );
}
