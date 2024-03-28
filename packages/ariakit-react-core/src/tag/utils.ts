import { useEffect, useState } from "react";
import { isTouchDevice } from "@ariakit/core/utils/platform";

export function useTouchDevice() {
  const [touchDevice, setTouchDevice] = useState(false);

  useEffect(() => {
    setTouchDevice(isTouchDevice());
  }, []);

  return touchDevice;
}
