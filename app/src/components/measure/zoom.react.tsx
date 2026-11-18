/**
 * @license
 * Copyright 2025-present Ariakit FZ-LLC. All Rights Reserved.
 *
 * This software is proprietary. See the license.md file in the root of this
 * package for licensing terms.
 *
 * SPDX-License-Identifier: UNLICENSED
 */
import { getWindow } from "@ariakit/utils";
import { cx } from "clava";
import { useLayoutEffect, useRef, useState } from "react";
import type { ReactNode } from "react";

// The grid layer goes this far past the subject on each side, so it fills the
// stage around it. The stage clips the rest.
const GRID_OVERFLOW = 2000;

interface Size {
  width: number;
  height: number;
}

export interface ZoomProps {
  /**
   * How many times larger the subject shows. When the subject doesn't fit the
   * width around the zoom at this level, as on a phone, it shows smaller, so it
   * fits.
   */
  level: number;
  /**
   * Shows a grid behind the subject, with a cell for every 4 pixels of the
   * subject, so readers can count lengths at the zoom.
   * @default level > 1
   */
  grid?: boolean;
  children?: ReactNode;
}

/**
 * Shows its children larger with a scale transform. The layout of the children
 * keeps its size, so components that measure themselves, such as a glider, and
 * the measurement parts read the true values. A transform doesn't grow the box
 * of the children, so the zoom sizes its own box from them. Before it measures
 * them, on the server, it hides them.
 * @example
 * <Zoom level={2}>
 *   <div className="ak-frame ak-frame-xl/2" />
 * </Zoom>
 */
export function Zoom({ level, grid = level > 1, children }: ZoomProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const subjectRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState<Size | null>(null);
  const [room, setRoom] = useState<number | null>(null);

  useLayoutEffect(() => {
    const subject = subjectRef.current;
    const parent = rootRef.current?.parentElement;
    if (!subject) return;
    if (!parent) return;
    const update = () => {
      const width = subject.offsetWidth;
      const height = subject.offsetHeight;
      setSize((current) => {
        if (current?.width === width && current.height === height) {
          return current;
        }
        return { width, height };
      });
      // The room for the zoom is the content box of its parent.
      const style = getWindow(parent).getComputedStyle(parent);
      const padding =
        Number.parseFloat(style.paddingLeft) +
        Number.parseFloat(style.paddingRight);
      setRoom(parent.clientWidth - padding);
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(subject);
    observer.observe(parent);
    return () => observer.disconnect();
  }, []);

  const scale =
    size?.width && room ? Math.min(level, room / size.width) : level;
  const cell = 4 * scale;
  return (
    <div
      ref={rootRef}
      data-zoom={scale}
      className={cx("relative", !size && "invisible")}
      style={
        size
          ? { width: size.width * scale, height: size.height * scale }
          : undefined
      }
    >
      {grid && (
        <div
          aria-hidden
          className="pointer-events-none absolute text-current opacity-10"
          style={{
            inset: -GRID_OVERFLOW,
            // The lines start at the corner of the subject.
            backgroundPosition: `${GRID_OVERFLOW}px ${GRID_OVERFLOW}px`,
            backgroundSize: `${cell}px ${cell}px`,
            backgroundImage: [
              "linear-gradient(to right, currentColor 1px, transparent 1px)",
              "linear-gradient(to bottom, currentColor 1px, transparent 1px)",
            ].join(", "),
          }}
        />
      )}
      <div
        ref={subjectRef}
        // The subject lays out at its own width, so the scale doesn't change
        // where its text wraps.
        className="absolute top-0 left-0 w-max origin-top-left"
        style={{ transform: `scale(${scale})` }}
      >
        {children}
      </div>
    </div>
  );
}
