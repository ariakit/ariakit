import * as React from "react";

export type ConstantContextType = Record<string, any>;

export const ConstantContext = React.createContext<ConstantContextType>({});

export default ConstantContext;
