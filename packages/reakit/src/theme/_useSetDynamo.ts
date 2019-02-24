import * as React from "react";
import { SetDynamoContext } from "./_DynamoContext";

export function useSetDynamo() {
  return React.useContext(SetDynamoContext);
}
