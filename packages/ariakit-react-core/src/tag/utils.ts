import { isTouchDevice } from "@ariakit/utils/platform";
import { useEffect, useState } from "react";

export function useTouchDevice() {
  const [touchDevice, setTouchDevice] = useState(false);

  useEffect(() => {
    setTouchDevice(isTouchDevice());
  }, []);

  return touchDevice;
}
