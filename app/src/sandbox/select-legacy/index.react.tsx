import { useState } from "react";
import Select4593 from "./cases/select-4593.tsx";
import Select4767 from "./cases/select-4767.tsx";
import Select6319 from "./cases/select-6319.tsx";
import Select6324 from "./cases/select-6324.tsx";
import Select6347 from "./cases/select-6347.tsx";
import Select6623 from "./cases/select-6623.tsx";
import SelectCombobox3837 from "./cases/select-combobox-3837.tsx";
import SelectCombobox5047 from "./cases/select-combobox-5047.tsx";
import SelectCombobox6313 from "./cases/select-combobox-6313.tsx";
import SelectComboboxForm3323 from "./cases/select-combobox-form-3323.tsx";
import SelectItem4567 from "./cases/select-item-4567.tsx";
import SelectItem5691 from "./cases/select-item-5691.tsx";
import SelectRenderer from "./cases/select-renderer.tsx";
import SelectTypeahead from "./cases/select-typeahead.tsx";
import TabSelect6346 from "./cases/tab-select-6346.tsx";
import { legacyPublicSelectCases } from "./public-cases/index.ts";

const cases = {
  "select-4593": Select4593,
  "select-4767": Select4767,
  "select-6319": Select6319,
  "select-6324": Select6324,
  "select-6347": Select6347,
  "select-6623": Select6623,
  "select-combobox-3837": SelectCombobox3837,
  "select-combobox-5047": SelectCombobox5047,
  "select-combobox-6313": SelectCombobox6313,
  "select-combobox-form-3323": SelectComboboxForm3323,
  "select-item-4567": SelectItem4567,
  "select-item-5691": SelectItem5691,
  "select-renderer": SelectRenderer,
  "select-typeahead": SelectTypeahead,
  "tab-select-6346": TabSelect6346,
  ...legacyPublicSelectCases,
};

type CaseName = keyof typeof cases;

export default function Example() {
  const [caseName, setCaseName] = useState<CaseName>("select-4593");
  const Case = cases[caseName];
  return (
    <>
      <nav aria-label="Legacy Select cases">
        {Object.keys(cases).map((name) => (
          <button
            key={name}
            type="button"
            onClick={() => setCaseName(name as CaseName)}
          >
            Show {name}
          </button>
        ))}
      </nav>
      <section aria-label={caseName}>
        <Case />
      </section>
    </>
  );
}
