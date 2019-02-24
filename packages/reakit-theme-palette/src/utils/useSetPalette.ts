import { useSetVariable } from "reakit/theme/_useSetVariable";
import p from "./p";

type PaletteValue =
  | string
  | Array<string>
  | ReturnType<typeof p>
  | Array<ReturnType<typeof p>>;

export function useSetPalette() {
  const setVariable = useSetVariable();

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

export default useSetPalette;
