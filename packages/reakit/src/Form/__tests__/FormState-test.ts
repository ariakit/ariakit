/* eslint-disable no-console */
import { renderHook, act } from "@testing-library/react-hooks";
import { jestSerializerStripFunctions } from "reakit-utils/jestSerializerStripFunctions";
import { unstable_useFormState } from "../FormState";

expect.addSnapshotSerializer(jestSerializerStripFunctions);

test("initial state", () => {
  const { result } = renderHook(() =>
    unstable_useFormState({ baseId: "test" })
  );
  expect(result.current).toMatchInlineSnapshot(`
    Object {
      "baseId": "test",
      "errors": Object {},
      "messages": Object {},
      "submitFailed": 0,
      "submitSucceed": 0,
      "submitting": false,
      "touched": Object {},
      "valid": true,
      "validating": false,
      "values": Object {},
    }
  `);
});

test("initial state values", () => {
  const { result } = renderHook(() =>
    unstable_useFormState({
      baseId: "test",
      values: { a: "a", b: { c: ["d", "e"] } }
    })
  );
  expect(result.current).toMatchInlineSnapshot(`
    Object {
      "baseId": "test",
      "errors": Object {},
      "messages": Object {},
      "submitFailed": 0,
      "submitSucceed": 0,
      "submitting": false,
      "touched": Object {},
      "valid": true,
      "validating": false,
      "values": Object {
        "a": "a",
        "b": Object {
          "c": Array [
            "d",
            "e",
          ],
        },
      },
    }
  `);
});

test("update", () => {
  const { result } = renderHook(() =>
    unstable_useFormState({
      values: { a: "a", b: { c: ["d", "e"] } }
    })
  );
  expect(result.current.values.a).toBe("a");
  act(() => result.current.update("a", "b"));
  expect(result.current.values.a).toBe("b");
  expect(result.current.values.b.c).toEqual(["d", "e"]);
  act(() => result.current.update(["b", "c", 1] as const, "f"));
  expect(result.current.values.b.c).toEqual(["d", "f"]);
});

test("validate", async () => {
  const { result } = renderHook(() =>
    unstable_useFormState({
      values: { a: "a" },
      onValidate: values => {
        if (values.a === "a") {
          const error = { a: "error" };
          throw error;
        }
      }
    })
  );
  await act(() => {
    expect(result.current.validate()).rejects.toEqual({ a: "error" });
  });
});

test("submit", async () => {
  const { result } = renderHook(() =>
    unstable_useFormState({
      values: { a: "a" },
      onSubmit: values => {
        if (values.a === "a") {
          const error = { a: "error" };
          throw error;
        }
      }
    })
  );
  await act(result.current.submit);
  expect(result.current.errors).toEqual({ a: "error" });
});

test("blur", () => {
  const { result } = renderHook(() =>
    unstable_useFormState({ values: { a: "a", b: { c: ["d", "e"] } } })
  );
  expect(result.current.touched).toEqual({});
  act(() => result.current.blur("a"));
  expect(result.current.touched).toEqual({ a: true });
  act(() => result.current.blur(["b", "c", 1] as const));
  expect(result.current.touched).toEqual({ a: true, b: { c: [true] } });
});

test("push", () => {
  const { result } = renderHook(() =>
    unstable_useFormState({ values: { a: "a", b: { c: ["d", "e"] } } })
  );
  act(() => result.current.push(["b", "c"], "f"));
  expect(result.current.values.b.c).toEqual(["d", "e", "f"]);
});

test("remove", () => {
  const { result } = renderHook(() =>
    unstable_useFormState({ values: { a: "a", b: { c: ["d", "e"] } } })
  );
  act(() => result.current.remove(["b", "c"], 0));
  expect(result.current.values.b.c).toEqual([undefined, "e"]);
});

test("reset", () => {
  const { result } = renderHook(() =>
    unstable_useFormState({ values: { a: "a" } })
  );
  expect(result.current.values.a).toBe("a");
  act(() => result.current.update("a", "b"));
  expect(result.current.values.a).toBe("b");
  act(result.current.reset);
  expect(result.current.values.a).toBe("a");
});
