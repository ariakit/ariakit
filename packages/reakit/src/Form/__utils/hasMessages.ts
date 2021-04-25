import { isObject, isEmpty } from "reakit-utils/misc";

export function hasMessages(errors: any) {
  return isObject(errors) && !isEmpty(errors);
}
