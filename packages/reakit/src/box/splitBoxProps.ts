import splitProps from "../_utils/splitProps";
import { UseBoxOptions } from "./useBox";

export function splitBoxProps<
  P extends Partial<UseBoxOptions>,
  K extends keyof P = never
>(props: P, keys: K[] = []) {
  return splitProps(props, ["theme", ...keys]);
}

export default splitBoxProps;
