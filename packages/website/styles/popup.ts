import { cx } from "ariakit-utils/misc";

type PopupProps = {
  elevation?: 0 | 1 | 2 | 3 | 4;
};

const elevationMap = [
  "",
  "z-20 drop-shadow-sm dark:drop-shadow-sm-dark",
  "z-30 drop-shadow dark:drop-shadow-dark",
  "z-40 drop-shadow-md dark:drop-shadow-md-dark",
  "z-50 drop-shadow-lg dark:drop-shadow-lg-dark",
] as const;

export default function popup({ elevation = 1 }: PopupProps = {}) {
  const className =
    "rounded-lg border border-solid border-canvas-4 dark:border-canvas-4-dark bg-canvas-4 text-canvas-4 dark:bg-canvas-4-dark focus-visible:ariakit-outline dark:text-canvas-4-dark";
  return cx(className, elevationMap[elevation]);
}
