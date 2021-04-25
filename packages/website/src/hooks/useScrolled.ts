import * as React from "react";
import { useSafeLayoutEffect } from "reakit-utils/hooks";

export default function useScrolled(offset = 0) {
  const [scrolled, setScrolled] = React.useState(false);

  useSafeLayoutEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > offset);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [offset]);

  return scrolled;
}
