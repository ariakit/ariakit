import { unstable_CompositeState } from "../CompositeState";
import { findFirstEnabledItem } from "./findFirstEnabledItem";

export function getCurrentId(
  options: Pick<unstable_CompositeState, "currentId" | "items">,
  passedId?: unstable_CompositeState["currentId"]
) {
  if (passedId || passedId === null) {
    return passedId;
  }
  if (options.currentId || options.currentId === null) {
    return options.currentId;
  }
  return findFirstEnabledItem(options.items || [])?.id;
}
