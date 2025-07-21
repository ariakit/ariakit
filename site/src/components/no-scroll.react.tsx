/**
 * @license
 * Copyright 2025-present Ariakit FZ-LLC. All Rights Reserved.
 *
 * This software is proprietary. See the license.md file in the root of this
 * package for licensing terms.
 *
 * SPDX-License-Identifier: UNLICENSED
 */
import { useEffect, useId, useRef } from "react";

export function NoScroll() {
  const id = useId();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const doc = element.ownerDocument;
    if (!doc) return;
    const scrollPosition = { top: 0, left: 0 };
    const beforeSwap = () => {
      scrollPosition.top = doc.documentElement.scrollTop;
      scrollPosition.left = doc.documentElement.scrollLeft;
    };
    const afterSwap = () => {
      if (!doc.getElementById(id)) return;
      doc.documentElement.scrollTo({
        top: scrollPosition.top,
        left: scrollPosition.left,
        behavior: "instant",
      });
    };
    doc.addEventListener("astro:before-swap", beforeSwap);
    doc.addEventListener("astro:after-swap", afterSwap);
    return () => {
      doc.removeEventListener("astro:before-swap", beforeSwap);
      doc.removeEventListener("astro:after-swap", afterSwap);
    };
  }, [id]);

  return <div ref={ref} id={id} className="fixed hidden" />;
}
