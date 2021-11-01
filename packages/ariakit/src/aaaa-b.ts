import { useSafeLayoutEffect } from "ariakit-utils/hooks";

export default function Test() {
  useSafeLayoutEffect(() => {});
  return true;
}
