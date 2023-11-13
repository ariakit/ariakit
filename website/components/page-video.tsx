"use client";

import { useEffect, useRef, useState } from "react";
import type { ComponentProps } from "react";
import type { Element } from "hast";
import { flushSync } from "react-dom";
import { twJoin } from "tailwind-merge";

export interface PageVideoProps extends ComponentProps<"video"> {
  node?: Element;
  gif?: boolean | "true" | "false";
  lazy?: boolean;
}

export function PageVideo({ node, gif, lazy, src, ...props }: PageVideoProps) {
  const ref = useRef<HTMLVideoElement>(null);
  const [source, setSource] = useState(lazy ? undefined : src);
  gif = gif === "true" || gif === true;
  lazy = lazy ?? gif;

  useEffect(() => {
    if (!lazy) return;
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          flushSync(() => {
            setSource(src);
          });
          if (entry.intersectionRatio === 1) {
            element.play();
          }
        } else {
          element.pause();
          element.currentTime = 0;
        }
      },
      { threshold: [0, 1] },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [src, lazy]);

  return (
    <video
      ref={ref}
      playsInline={gif}
      loop={gif}
      muted={gif}
      src={source}
      {...props}
      className={twJoin(
        "overflow-hidden rounded-lg data-[large]:!max-w-[832px] data-[wide]:!max-w-5xl md:rounded-xl data-[wide]:md:rounded-2xl",
        props.className,
      )}
    />
  );
}
