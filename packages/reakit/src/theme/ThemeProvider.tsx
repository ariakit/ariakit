import * as React from "react";
import HookContext from "./HookContext";
import ConstantContext from "./ConstantContext";
import VariableContext, { SetVariableContext } from "./VariableContext";
import DynamoContext, { SetDynamoContext } from "./DynamoContext";
import { Theme } from "./_types";

export type ThemeProviderProps = Theme & {
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

export default ThemeProvider;
