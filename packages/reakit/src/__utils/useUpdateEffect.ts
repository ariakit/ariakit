// https://github.com/reach/reach-ui/blob/34e52b029ba8330fa705804e6b71048267c46283/packages/tabs/src/index.js#L267-L276
import * as React from "react";

export function useUpdateEffect(
  effect: React.EffectCallback,
  deps?: ReadonlyArray<any> | undefined
) {
  const mounted = React.useRef(false);
  React.useEffect(() => {
    if (mounted.current) {
      return effect();
    }
    mounted.current = true;
    return undefined;
  }, deps);
}
