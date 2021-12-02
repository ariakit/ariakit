import { cx } from "ariakit-utils/misc";
import { Role } from "ariakit/role";
import { TabProps, useTab } from "ariakit/tab";

export type PlaygroundTabProps = TabProps;

export default function PlaygroundTab(props: PlaygroundTabProps) {
  const tabProps = useTab(props);
  const selected = !!tabProps["aria-selected"];
  return (
    <Role
      as="button"
      {...tabProps}
      className={cx(
        "h-8 px-3 rounded text-sm",
        !selected &&
          "bg-alpha-2 text-black-fade hover:bg-alpha-2-hover dark:hover:bg-alpha-2-dark-hover dark:text-white-fade",
        selected &&
          "bg-primary-2 text-primary-2 hover:to-primary-2-hover dark:bg-primary-2-dark dark:text-primary-2-dark dark:hover:bg-primary-2-dark-hover",
        tabProps.className
      )}
    />
  );
}
