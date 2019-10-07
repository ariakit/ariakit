import * as React from "react";
import { useIsomorphicEffect } from "reakit-utils/useIsomorphicEffect";

export default function useScrolled(offset = 0) {
  const [scrolled, setScrolled] = React.useState(false);

  useIsomorphicEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > offset);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [offset]);

  return scrolled;
}
