import type { ElementType } from "react";
import { useId } from "react";
import { createElement, createHook, forwardRef } from "../utils/system.tsx";
import type { Options, Props } from "../utils/types.ts";

const TagName = "span" satisfies ElementType;
type TagName = typeof TagName;

/**
 * Hook for creating an accessible label for the progress bar.
 * @see https://ariakit.org/components/progress
 * @example
 * ```jsx
 * const props = useProgressLabel({ text: "Uploading files..."});
 * <Role {...props} />
 * ```
 */
export const useProgressLabel = createHook<TagName, ProgressLabelOptions>(
  function useProgressLabel({ text, id, ...props }) {
    const labelId = id || useId();

    return {
      id: labelId,
      children: text,
      className: "progress-label",
      ...props,
    };
  },
);

/**
 * Visual label component for the progress bar.
 * @see https://ariakit.org/components/progress
 * @example
 * ```jsx
 * <ProgressLabel text="Uploading: 60% complete" />
 * ```
 */
export const ProgressLabel = forwardRef(function ProgressLabel(
  props: ProgressLabelProps,
) {
  const htmlProps = useProgressLabel(props);
  return createElement(TagName, htmlProps);
});

export interface ProgressLabelOptions<_T extends ElementType = TagName>
  extends Options {
  /**
   * Text content of the label.
   * Should provide meaningful description of the progress state.
   */
  text: string;
}

export type ProgressLabelProps<T extends ElementType = TagName> = Props<
  T,
  ProgressLabelOptions<T>
>;
