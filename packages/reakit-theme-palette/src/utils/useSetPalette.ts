import { useSetThemeVariable } from "reakit";
import p from "./p";

type PaletteValue =
  | string
  | Array<string>
  | ReturnType<typeof p>
  | Array<ReturnType<typeof p>>;

export function useSetPalette() {
  const setThemeVariable = useSetThemeVariable();

  return (palette: string, value: PaletteValue) => {
    return setThemeVariable(variables => ({
      ...variables,
      palette: {
        ...variables.palette,
        [palette]: value
      }
    }));
  };
}

export default useSetPalette;
