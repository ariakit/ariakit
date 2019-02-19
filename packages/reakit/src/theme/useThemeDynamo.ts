import * as React from "react";
import DynamoContext from "./DynamoContext";

export function useThemeDynamo(dynamo: string) {
  React.useDebugValue(dynamo);
  const dynamos = React.useContext(DynamoContext);
  return dynamos[dynamo];
}

export default useThemeDynamo;
