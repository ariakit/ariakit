import * as Ariakit from "@ariakit/react";
import { useState } from "react";

const fruits = ["사과", "바나나", "체리", "레몬", "오렌지"];

export default function Example() {
  const [keyword, setKeyword] = useState("");

  return (
    <>
      <p>
        Current keyword: <output>{keyword || "(empty)"}</output>
      </p>
      <Ariakit.ComboboxProvider>
        <Ariakit.ComboboxLabel>Fruit</Ariakit.ComboboxLabel>
        <Ariakit.Combobox
          autoSelect
          placeholder="과일을 검색하세요"
          value={keyword}
          onChange={(event) => setKeyword(event.target.value)}
        />
        <Ariakit.ComboboxPopover gutter={4} sameWidth>
          {fruits.map((fruit) => (
            <Ariakit.ComboboxItem key={fruit} value={fruit} />
          ))}
        </Ariakit.ComboboxPopover>
      </Ariakit.ComboboxProvider>
    </>
  );
}
