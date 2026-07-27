import type * as Ariakit from "@ariakit/react";
import type { ComboboxItemProps } from "@ariakit/react-components/combobox/combobox-item-offscreen";

export interface MatrixCase {
  autoSelect?: Ariakit.ComboboxProps["autoSelect"];
  defaultValue?: Ariakit.ComboboxProviderProps["defaultSelectedValue"];
  group: boolean;
  offscreenMode: Exclude<ComboboxItemProps["offscreenMode"], undefined>;
  type: "combobox" | "searchable" | "select";
  unmountOnHide: boolean;
}

const offscreenModes = ["lazy", "passive"] as const;
const autoSelects = [false, true, "always"] as const;
const unmountOnHides = [true, false] as const;
const groups = [false, true] as const;
const defaultValues = ["Select...", "Dominica"] as const;

const comboboxCases = offscreenModes.flatMap((offscreenMode) =>
  autoSelects.flatMap((autoSelect) =>
    unmountOnHides.flatMap((unmountOnHide) =>
      groups.map(
        (group) =>
          ({
            type: "combobox",
            offscreenMode,
            autoSelect,
            unmountOnHide,
            group,
          }) satisfies MatrixCase,
      ),
    ),
  ),
);

const selectCases = offscreenModes.flatMap((offscreenMode) =>
  defaultValues.flatMap((defaultValue) =>
    unmountOnHides.flatMap((unmountOnHide) =>
      groups.map(
        (group) =>
          ({
            type: "select",
            offscreenMode,
            defaultValue,
            unmountOnHide,
            group,
          }) satisfies MatrixCase,
      ),
    ),
  ),
);

const searchableCases = offscreenModes.flatMap((offscreenMode) =>
  defaultValues.flatMap((defaultValue) =>
    autoSelects.flatMap((autoSelect) =>
      unmountOnHides.flatMap((unmountOnHide) =>
        groups.map(
          (group) =>
            ({
              type: "searchable",
              offscreenMode,
              defaultValue,
              autoSelect,
              unmountOnHide,
              group,
            }) satisfies MatrixCase,
        ),
      ),
    ),
  ),
);

export const matrixCases: readonly MatrixCase[] = [
  ...comboboxCases,
  ...selectCases,
  ...searchableCases,
];

export function getCaseLabel(matrixCase: MatrixCase) {
  const parts: string[] = [];
  if (matrixCase.type === "select") {
    parts.push("select");
  } else if (matrixCase.type === "searchable") {
    parts.push("searchable");
  }
  parts.push(matrixCase.offscreenMode);
  if (!matrixCase.unmountOnHide) {
    parts.push("mounted");
  }
  if (matrixCase.defaultValue === "Dominica") {
    parts.push("defaultValue");
  }
  if (matrixCase.autoSelect === "always") {
    parts.push("autoSelect", "always");
  } else if (matrixCase.autoSelect) {
    parts.push("autoSelect");
  }
  if (matrixCase.group) {
    parts.push("group");
  }
  return parts.join(" ");
}
