import * as React from "react";
import { HookContext, HookContextType } from "./_HookContext";
import { ConstantContext, ConstantContextType } from "./_ConstantContext";
import {
  VariableContext,
  SetVariableContext,
  VariableContextType
} from "./_VariableContext";
import {
  DynamoContext,
  SetDynamoContext,
  DynamoContextType
} from "./_DynamoContext";

export type ThemeProviderProps = {
  hooks?: HookContextType;
  constants?: ConstantContextType;
  variables?: VariableContextType;
  dynamos?: DynamoContextType;
  children: React.ReactNode;
};

export function ThemeProvider({
  hooks = {},
  constants = {},
  variables = {},
  dynamos = {},
  children
}: ThemeProviderProps) {
  const memoizedHooks = React.useMemo(() => hooks, []);
  const memoizedConstants = React.useMemo(() => constants, []);
  const [stateVariables, setVariables] = React.useState(variables);
  const [stateDynamos, setDynamos] = React.useState(dynamos);
  return (
    <HookContext.Provider value={memoizedHooks}>
      <ConstantContext.Provider value={memoizedConstants}>
        <VariableContext.Provider value={stateVariables}>
          <SetVariableContext.Provider value={setVariables}>
            <DynamoContext.Provider value={stateDynamos}>
              <SetDynamoContext.Provider value={setDynamos}>
                {children}
              </SetDynamoContext.Provider>
            </DynamoContext.Provider>
          </SetVariableContext.Provider>
        </VariableContext.Provider>
      </ConstantContext.Provider>
    </HookContext.Provider>
  );
}
