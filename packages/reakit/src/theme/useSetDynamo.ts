import * as React from "react";
import { unstable_SetDynamoContext } from "./DynamoContext";

export function unstable_useSetDynamo() {
  return React.useContext(unstable_SetDynamoContext);
}
