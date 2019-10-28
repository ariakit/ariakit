import * as React from "react";

export type unstable_IdProviderProps = {
  children: React.ReactNode;
  prefix?: string;
};

const defaultPrefix = "id";

// TODO: Abstract into __utils
export function generateRandomString(prefix = defaultPrefix) {
  return `${prefix ? `${prefix}-` : ""}${Math.random()
    .toString(32)
    .substr(2, 6)}`;
}

export const unstable_IdContext = React.createContext(generateRandomString);

export function unstable_IdProvider({
  children,
  prefix = defaultPrefix
}: unstable_IdProviderProps) {
  const count = React.useRef(0);

  const generateId = React.useCallback(
    (localPrefix: string = prefix) =>
      `${localPrefix ? `${localPrefix}-` : ""}${++count.current}`,
    []
  );
  return (
    <unstable_IdContext.Provider value={generateId}>
      {children}
    </unstable_IdContext.Provider>
  );
}
