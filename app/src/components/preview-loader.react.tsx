/**
 * @license
 * Copyright 2025-present Ariakit FZ-LLC. All Rights Reserved.
 *
 * This software is proprietary. See the license.md file in the root of this
 * package for licensing terms.
 *
 * SPDX-License-Identifier: UNLICENSED
 */

import { usePerceptibleValue } from "@ariakit/ui/react-utils/use-perceptible-value.react";

/**
 * Returns whether a preview frame shows its loader while its page loads. A page
 * that loads within 300ms shows no loader, and a loader that shows stays for at
 * least 200ms, so it doesn't flash.
 */
export function usePreviewLoading(loading: boolean) {
  return usePerceptibleValue(loading, {
    delay: loading ? 300 : 0,
    minDuration: 200,
    initialValue: false,
  });
}

/**
 * The Ariakit symbol, with its dot rolling around the ring while the preview
 * loads.
 */
export function PreviewLoader() {
  return (
    <span className="ak-text ak-text-primary relative size-10 motion-reduce:animate-pulse">
      <svg viewBox="0 0 40 40" className="size-full fill-current">
        <path
          fillRule="evenodd"
          d="M8 0C3.58172 0 0 3.58172 0 8V32C0 36.4183 3.58172 40 8 40H32C36.4183 40 40 36.4183 40 32V8C40 3.58172 36.4183 0 32 0H8ZM19.9998 31.9997C26.6272 31.9997 31.9998 26.6271 31.9998 19.9997C31.9998 13.3723 26.6272 7.99967 19.9998 7.99967C13.3723 7.99967 7.99976 13.3723 7.99976 19.9997C7.99976 26.6271 13.3723 31.9997 19.9998 31.9997Z"
        />
      </svg>
      {/* The dot rests 4 units off the center of the ring, so turning its own
          svg around the center moves it in a circle inside the ring. Safari
          runs the animation of a group inside an svg on the main thread, even
          offscreen, and Chrome lays out the svg again on each frame. */}
      <svg
        viewBox="0 0 40 40"
        className="absolute inset-0 size-full fill-current motion-safe:animate-[spin_1.4s_cubic-bezier(0.65,0,0.35,1)_infinite]"
      >
        <circle cx="24" cy="20" r="6" />
      </svg>
    </span>
  );
}
