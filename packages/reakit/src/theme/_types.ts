import { HookContextType } from "./HookContext";
import { ConstantContextType } from "./ConstantContext";
import { VariableContextType } from "./VariableContext";
import { DynamoContextType } from "./DynamoContext";

export type Theme = {
  hooks?: HookContextType;
  constants?: ConstantContextType;
  variables?: VariableContextType;
  dynamos?: DynamoContextType;
};
