import * as React from "react";
import { unstable_DynamoContext } from "./DynamoContext";

export function unstable_useDynamo(dynamo: string) {
  React.useDebugValue(dynamo);
  const dynamos = React.useContext(unstable_DynamoContext);
  return dynamos[dynamo];
}
