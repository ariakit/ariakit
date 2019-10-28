import * as React from "react";
import { render } from "@testing-library/react";
import {
  unstable_IdProvider as IdProvider,
  unstable_useIdState as useIdState,
  unstable_useId as useId,
  unstable_Id as Id,
  unstable_IdBase as IdBase
} from "..";
import {} from "../Id";

test("render", () => {
  const Test = () => {
    const id = useIdState();
    console.log(useId({ baseId: "b" }));
    console.log(useId({ baseId: "b" }));
    return (
      <IdBase {...id}>
        <Id {...id} />
        <Id {...id} />
      </IdBase>
    );
  };
  const { debug } = render(
    <>
      <Id />
      <IdProvider prefix="a">
        <Test />
        <div>
          <IdBase>
            <Id />
            <Id />
          </IdBase>
        </div>
      </IdProvider>
    </>
  );
  debug();
});
