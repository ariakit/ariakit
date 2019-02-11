import * as React from "react";
import { SetDynamoContext } from "./DynamoContext";

export function useSetThemeDynamo() {
  return React.useContext(SetDynamoContext);
}

export default useSetThemeDynamo;
