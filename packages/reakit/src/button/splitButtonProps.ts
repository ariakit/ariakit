import { splitBoxProps } from "../box";
import { UseButtonOptions } from "./useButton";

export function splitButtonProps<
  P extends Partial<UseButtonOptions>,
  K extends keyof P = never
>(props: P, keys: K[] = []) {
  return splitBoxProps(props, keys);
}

export default splitButtonProps;
