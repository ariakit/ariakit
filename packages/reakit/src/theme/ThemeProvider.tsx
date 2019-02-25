import * as React from "react";
import { unstable_HookContext, unstable_HookContextType } from "./HookContext";
import {
  unstable_ConstantContext,
  unstable_ConstantContextType
} from "./ConstantContext";
import {
  unstable_VariableContext,
  unstable_SetVariableContext,
  unstable_VariableContextType
} from "./VariableContext";
import {
  unstable_DynamoContext,
  unstable_SetDynamoContext,
  unstable_DynamoContextType
} from "./DynamoContext";

export type unstable_ThemeProviderProps = {
  hooks?: unstable_HookContextType;
  constants?: unstable_ConstantContextType;
  variables?: unstable_VariableContextType;
  dynamos?: unstable_DynamoContextType;
  children: React.ReactNode;
};

export function unstable_ThemeProvider({
  hooks = {},
  constants = {},
  variables = {},
  dynamos = {},
  children
}: unstable_ThemeProviderProps) {
  const memoizedHooks = React.useMemo(() => hooks, []);
  const memoizedConstants = React.useMemo(() => constants, []);
  const [stateVariables, setVariables] = React.useState(variables);
  const [stateDynamos, setDynamos] = React.useState(dynamos);
  return (
    <unstable_HookContext.Provider value={memoizedHooks}>
      <unstable_ConstantContext.Provider value={memoizedConstants}>
        <unstable_VariableContext.Provider value={stateVariables}>
          <unstable_SetVariableContext.Provider value={setVariables}>
            <unstable_DynamoContext.Provider value={stateDynamos}>
              <unstable_SetDynamoContext.Provider value={setDynamos}>
                {children}
              </unstable_SetDynamoContext.Provider>
            </unstable_DynamoContext.Provider>
          </unstable_SetVariableContext.Provider>
        </unstable_VariableContext.Provider>
      </unstable_ConstantContext.Provider>
    </unstable_HookContext.Provider>
  );
}
