import { isTouchDevice } from "@ariakit/utils";
import { useEffect, useState } from "react";

export function useTouchDevice() {
  const [touchDevice, setTouchDevice] = useState(false);

  useEffect(() => {
    setTouchDevice(isTouchDevice());
  }, []);

  return touchDevice;
}
