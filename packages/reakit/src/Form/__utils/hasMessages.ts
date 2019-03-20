import { isObject } from "../../__utils/isObject";
import { isEmpty } from "../../__utils/isEmpty";

export function hasMessages(errors: any) {
  return isObject(errors) && !isEmpty(errors);
}
