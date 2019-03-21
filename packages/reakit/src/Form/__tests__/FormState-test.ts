/* eslint-disable no-console */
import { renderHook, act } from "react-hooks-testing-library";
import { useFormState } from "../FormState";
import { jestSerializerStripFunctions } from "../../__utils/jestSerializerStripFunctions";
import { supressConsoleError } from "../../__utils/supressConsoleError";

expect.addSnapshotSerializer(jestSerializerStripFunctions);

test("initial state", () => {
  const { result } = renderHook(() => useFormState({ baseId: "test" }));
  expect(result.current).toMatchInlineSnapshot(`
Object {
  "baseId": "test",
  "errors": Object {},
  "initialValues": Object {},
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

test("initial state initialValues", () => {
  const { result } = renderHook(() =>
    useFormState({
      baseId: "test",
      initialValues: { a: "a", b: { c: ["d", "e"] } }
    })
  );
  expect(result.current).toMatchInlineSnapshot(`
Object {
  "baseId": "test",
  "errors": Object {},
  "initialValues": Object {
    "a": "a",
    "b": Object {
      "c": Array [
        "d",
        "e",
      ],
    },
  },
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
    useFormState({
      initialValues: { a: "a", b: { c: ["d", "e"] } }
    })
  );
  expect(result.current.values.a).toBe("a");
  act(() => result.current.update("a", "b"));
  expect(result.current.values.a).toBe("b");
  expect(result.current.values.b.c).toEqual(["d", "e"]);
  act(() => result.current.update(["b", "c", 1] as ["b", "c", 1], "f"));
  expect(result.current.values.b.c).toEqual(["d", "f"]);
});

test("validate", () => {
  const { result } = renderHook(() =>
    useFormState({
      initialValues: { a: "a" },
      onValidate: values => {
        if (values.a === "a") {
          const error = { a: "error" };
          throw error;
        }
      }
    })
  );
  act(() => {
    expect(result.current.validate()).rejects.toEqual({ a: "error" });
  });
});

test("submit", async () => {
  const { result, waitForNextUpdate } = renderHook(() =>
    useFormState({
      initialValues: { a: "a" },
      onSubmit: values => {
        if (values.a === "a") {
          const error = { a: "error" };
          throw error;
        }
      }
    })
  );
  const restoreConsoleError = supressConsoleError();
  act(result.current.submit);
  await waitForNextUpdate();
  expect(result.current.errors).toEqual({ a: "error" });
  restoreConsoleError();
});

test("blur", () => {
  const { result } = renderHook(() =>
    useFormState({ initialValues: { a: "a", b: { c: ["d", "e"] } } })
  );
  expect(result.current.touched).toEqual({});
  act(() => result.current.blur("a"));
  expect(result.current.touched).toEqual({ a: true });
  act(() => result.current.blur(["b", "c", 1] as ["b", "c", 1]));
  expect(result.current.touched).toEqual({ a: true, b: { c: [true] } });
});

test("push", () => {
  const { result } = renderHook(() =>
    useFormState({ initialValues: { a: "a", b: { c: ["d", "e"] } } })
  );
  act(() => result.current.push(["b", "c"], "f"));
  expect(result.current.values.b.c).toEqual(["d", "e", "f"]);
});

test("remove", () => {
  const { result } = renderHook(() =>
    useFormState({ initialValues: { a: "a", b: { c: ["d", "e"] } } })
  );
  act(() => result.current.remove(["b", "c"], 0));
  expect(result.current.values.b.c).toEqual([undefined, "e"]);
});

test("reset", () => {
  const { result } = renderHook(() =>
    useFormState({ initialValues: { a: "a" } })
  );
  expect(result.current.values.a).toBe("a");
  act(() => result.current.update("a", "b"));
  expect(result.current.values.a).toBe("b");
  act(result.current.reset);
  expect(result.current.values.a).toBe("a");
});
