// @ts-nocheck
import { FocusTrap } from "@ariakit/solid";

const { TestCase } = testing;

export default function Fixture() {
  return (
    <>
      <TestCase name="trap">
        <button>Before</button>
        <FocusTrap>Trap</FocusTrap>
        <button>After</button>
      </TestCase>

      <TestCase name="redirect">
        <button>Before</button>
        <FocusTrap
          onFocus={() => document.getElementById("focus-target")?.focus()}
        >
          Trap
        </FocusTrap>
        <button>Skip</button>
        <button id="focus-target">Focus target</button>
      </TestCase>
    </>
  );
}
