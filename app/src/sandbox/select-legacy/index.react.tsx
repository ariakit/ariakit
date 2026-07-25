import { useState } from "react";
import { legacyPublicSelectCases } from "./public-cases/cases.react.tsx";

const cases = {
  ...legacyPublicSelectCases,
};

type CaseName = keyof typeof cases;

export default function Example() {
  const [caseName, setCaseName] = useState<CaseName>("public-select");
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
