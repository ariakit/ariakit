// @ts-nocheck
import { As, Role } from "@ariakit/solid";
import { type JSX, createSignal } from "solid-js";

export default function Fixture() {
  const [values2, setValues2] = createSignal<Array<string>>([]);
  function addValue2(value: string) {
    setValues2((values) => [...values, value]);
  }
  const [values3, setValues3] = createSignal<Array<string>>([]);
  function addValue3(value: string) {
    setValues3((values) => [...values, value]);
  }
  return (
    <div role="group" aria-label="render">
      <Role>1</Role>
      <Role render={<As.p />}>2</Role>
      <Role data-outer render={<As.span data-inner />}>
        3
      </Role>
      <Role
        aria-label="merged2"
        data-outer
        data-both="outer"
        class="outer"
        style={{ "--outer": "value" } as JSX.CSSProperties}
        onClick={() => addValue2("outer")}
        render={
          <As.button
            data-inner
            data-both="inner"
            class="inner"
            style={{ "--inner": "value" } as JSX.CSSProperties}
            onClick={() => addValue2("inner")}
          >
            4 (inner)
          </As.button>
        }
      >
        4 (outer)
      </Role>
      <button aria-label="values2">{values2().join(", ")}</button>
      <Role
        aria-label="merged3"
        data-outer
        data-both="top"
        class="top"
        style={{ "--top": "value" } as JSX.CSSProperties}
        onClick={() => addValue3("top")}
        render={
          <As
            component={Role.button}
            data-middle
            data-both="middle"
            class="middle"
            style={{ "--middle": "value" } as JSX.CSSProperties}
            onClick={() => addValue3("middle")}
            render={
              <As.button
                data-inner
                data-both="bottom"
                class="bottom"
                style={{ "--bottom": "value" } as JSX.CSSProperties}
                onClick={() => addValue3("bottom")}
              >
                5 (bottom)
              </As.button>
            }
          >
            5 (middle)
          </As>
        }
      >
        5 (top)
      </Role>
      <button aria-label="values3">{values3().join(", ")}</button>
    </div>
  );
}
