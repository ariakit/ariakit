import * as React from "react";
import { SetDynamoContext } from "./DynamoContext";

export function useSetDynamo() {
  return React.useContext(SetDynamoContext);
}
