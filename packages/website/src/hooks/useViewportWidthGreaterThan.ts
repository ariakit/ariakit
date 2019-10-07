import * as React from "react";
import { useIsomorphicEffect } from "reakit-utils/useIsomorphicEffect";

function useViewportWidthGreaterThan(width: number) {
  const [greater, setGreater] = React.useState(false);

  useIsomorphicEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > width) {
        setGreater(true);
      } else {
        setGreater(false);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [width]);

  return greater;
}

export default useViewportWidthGreaterThan;
