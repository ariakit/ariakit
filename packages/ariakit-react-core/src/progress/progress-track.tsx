import type { ElementType } from "react";
import { createElement, createHook, forwardRef } from "../utils/system.tsx";
import type { Options, Props } from "../utils/types.ts";

const TagName = "div" satisfies ElementType;
type TagName = typeof TagName;

/**
 * Hook for creating the track element of a progress bar.
 * @see https://ariakit.org/components/progress
 * @example
 * ```tsx
 * const props = useProgressTrack();
 * <ProgressTrack {...props} />
 * ```
 */
export const useProgressTrack = createHook<TagName, ProgressTrackOptions>(
  function useProgressTrack(props) {
    return {
      className: "progress-track",
      ...props,
    };
  },
);

/**
 * Track component that contains the progress indicator.
 * @see https://ariakit.org/components/progress
 * @example
 * ```tsx
 * <ProgressTrack>
 *   <ProgressIndicator value={60} />
 * </ProgressTrack>
 * ```
 */
export const ProgressTrack = forwardRef(function ProgressTrack(
  props: ProgressTrackProps,
) {
  const htmlProps = useProgressTrack(props);
  return createElement(TagName, htmlProps);
});

export interface ProgressTrackOptions<_T extends ElementType = TagName>
  extends Options {}

export type ProgressTrackProps<T extends ElementType = TagName> = Props<
  T,
  ProgressTrackOptions<T>
>;
