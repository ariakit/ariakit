import * as React from "react";
import { DynamoContext } from "./_DynamoContext";

export function useDynamo(dynamo: string) {
  React.useDebugValue(dynamo);
  const dynamos = React.useContext(DynamoContext);
  return dynamos[dynamo];
}
