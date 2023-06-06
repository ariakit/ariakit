"use client";

import { useEffect, useRef, useState } from "react";
import type { ComponentPropsWithoutRef } from "react";
import { flushSync } from "react-dom";

interface Props extends ComponentPropsWithoutRef<"video"> {
  gif?: boolean | "true" | "false";
  lazy?: boolean;
}

export function PageVideo({ gif, lazy, src, ...props }: Props) {
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
      { threshold: [0, 1] }
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
    />
  );
}
