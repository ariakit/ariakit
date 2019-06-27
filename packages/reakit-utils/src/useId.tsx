// https://github.com/reach/reach-ui/blob/2a20f45849220c6bc71f8e7425e3ac4f41cd5a0a/packages/utils/src/lib/Context.js
import * as React from "react";

export type IdProviderProps = {
  children: React.ReactNode;
  unstable_prefix?: string;
};

const defaultPrefix = "id-";

const generateId = (prefix = defaultPrefix) =>
  `${prefix}${Math.random()
    .toString(32)
    .substr(2, 6)}`;

const Context = React.createContext(generateId);

export function IdProvider({
  children,
  unstable_prefix: prefix = ""
}: IdProviderProps) {
  const count = React.useRef(0);
  const genId = React.useMemo(
    () => (localPrefix: string = defaultPrefix) =>
      `${prefix}${localPrefix}${++count.current}`,
    [prefix]
  );
  return <Context.Provider value={genId}>{children}</Context.Provider>;
}

export function useId(prefix = defaultPrefix) {
  const genId = React.useContext(Context);
  const [id] = React.useState(() => genId(prefix));
  return id;
}
