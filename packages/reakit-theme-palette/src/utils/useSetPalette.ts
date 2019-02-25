import { unstable_useSetVariable } from "reakit/theme/useSetVariable";
import { p } from "./p";

type PaletteValue =
  | string
  | Array<string>
  | ReturnType<typeof p>
  | Array<ReturnType<typeof p>>;

export function useSetPalette() {
  const setVariable = unstable_useSetVariable();

  return (palette: string, value: PaletteValue) => {
    return setVariable(variables => ({
      ...variables,
      palette: {
        ...variables.palette,
        [palette]: value
      }
    }));
  };
}
