import * as React from "react";

/**
 * Whether the component has been painted once with its client state. It stays
 * `false` through the server render and hydration, and turns `true` after the
 * first paint that follows them, so motion switched on by it never plays the
 * difference between the server markup and the client state.
 */
export function useHasPainted() {
  const [hasPainted, setHasPainted] = React.useState(false);
  React.useEffect(() => {
    // Two frames: the first callback runs before the browser paints the
    // committed state, the second one after it.
    let frame = requestAnimationFrame(() => {
      frame = requestAnimationFrame(() => setHasPainted(true));
    });
    return () => cancelAnimationFrame(frame);
  }, []);
  return hasPainted;
}
