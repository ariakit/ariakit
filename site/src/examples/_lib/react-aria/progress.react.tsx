import { mergeProps } from "@react-aria/utils";
import * as rac from "react-aria-components";

export interface ProgressProps extends rac.ProgressBarProps {}

export function Progress(props: ProgressProps) {
  return (
    <rac.ProgressBar
      maxValue={1}
      {...mergeProps(props, {
        className:
          "ak-progress ak-progress-value-(--progress) after:ak-progress-fill",
        style: { "--progress": props.value ?? 0 },
      })}
    />
  );
}
