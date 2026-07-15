import { expect, test } from "vitest";
import { createFormStore } from "./form-store.ts";

test("gets and sets nested values with array and object paths", () => {
  const store = createFormStore({});

  store.setValue("users.0.name", "Ada");
  store.setValue("records.01.name", "Grace");

  expect(store.getValue("users.0.name")).toBe("Ada");
  expect(store.getValue("records.01.name")).toBe("Grace");
  expect(Array.isArray(store.getValue("users"))).toBe(true);
  expect(Array.isArray(store.getValue("records"))).toBe(false);
  expect(store.getState().values).toEqual({
    users: [{ name: "Ada" }],
    records: { "01": { name: "Grace" } },
  });
});

test("supports numeric array path segments at runtime", () => {
  const store = createFormStore({});

  Reflect.apply(store.setValue, store, [["users", 0, "name"], "Ada"]);

  expect(store.getValue("users.0.name")).toBe("Ada");
  expect(Array.isArray(store.getValue("users"))).toBe(true);
  expect(store.getState().values).toEqual({
    users: [{ name: "Ada" }],
  });
});

test("normalizes runtime array path segments", () => {
  const store = createFormStore({});
  const path = [new String("__proto__"), "polluted"];

  Reflect.apply(store.setValue, store, [path, true]);

  const { values } = store.getState();

  expect(Object.getPrototypeOf(values)).toBe(Object.prototype);
  expect("polluted" in values).toBe(false);
  expect(values).toEqual({});
  expect(Reflect.apply(store.getValue, store, [path])).toBeUndefined();
});

test("uses object paths for non-array index segments", () => {
  const store = createFormStore({});

  store.setValue("users.-1.name", "Ada");
  store.setValue("stats.Infinity.count", 1);
  store.setValue("meta.NaN.value", true);
  store.setValue("items.4294967295.name", "Grace");

  expect(store.getValue("users.-1.name")).toBe("Ada");
  expect(Array.isArray(store.getValue("users"))).toBe(false);
  expect(Array.isArray(store.getValue("items"))).toBe(false);
  expect(store.getState().values).toEqual({
    users: { "-1": { name: "Ada" } },
    stats: { Infinity: { count: 1 } },
    meta: { NaN: { value: true } },
    items: { "4294967295": { name: "Grace" } },
  });
});

test("ignores prototype path segments", () => {
  const store = createFormStore({});

  store.setValue("__proto__.polluted", true);
  store.setValue("user.__proto__.polluted", true);
  store.setValue("constructor.prototype.polluted", true);

  const { values } = store.getState();

  expect(Object.getPrototypeOf(values)).toBe(Object.prototype);
  expect("polluted" in values).toBe(false);
  expect(values).toEqual({});
  expect(store.getValue("__proto__.polluted")).toBeUndefined();
  expect(store.getValue("user.__proto__.polluted")).toBeUndefined();
  expect(store.getValue("constructor.prototype.polluted")).toBeUndefined();
});

test("replaces an existing array container for non-array index segments", () => {
  const store = createFormStore({});

  store.setValue("users.0.name", "Ada");
  store.setValue("users.-1.name", "Grace");

  expect(Array.isArray(store.getValue("users"))).toBe(false);
  expect(store.getState().values).toEqual({
    users: { "0": { name: "Ada" }, "-1": { name: "Grace" } },
  });
});

test("preserves values when ignoring prototype path segments", () => {
  const store = createFormStore({ defaultValues: { user: "Ada" } });

  store.setValue("user.__proto__.polluted", true);

  expect(store.getState().values).toEqual({ user: "Ada" });
});

test("updates nested values with setter functions", () => {
  const store = createFormStore({
    defaultValues: { user: { visits: 1 } },
  });

  store.setValue("user.visits", (visits: number) => visits + 1);

  expect(store.getValue("user.visits")).toBe(2);
});

test("pushes values and preserves array holes when removing values", () => {
  const store = createFormStore({});

  store.pushValue("tags", "one");
  store.pushValue("tags", "two");
  store.removeValue("tags", 0);

  expect(store.getValue("tags")).toEqual([null, "two"]);
});

test("names coerce to their dot-joined path and ignore other symbols", () => {
  const store = createFormStore({ defaultValues: { user: { name: "" } } });
  const { names } = store;

  // Documented string coercion paths all resolve to the field path. The
  // template literal intentionally coerces the string-like name object.
  // oxlint-disable-next-line restrict-template-expressions
  expect(`${names.user.name}`).toBe("user.name");
  expect(String(names.user.name)).toBe("user.name");
  expect(names.user.name.toString()).toBe("user.name");
  expect(names.user.name.valueOf()).toBe("user.name");

  // Absent symbol keys resolve to `undefined` like a plain object would, so
  // probing one never throws "Cannot convert a Symbol value to a string".
  expect(Reflect.get(names.user.name, Symbol.iterator)).toBe(undefined);
  expect(Object.prototype.toString.call(names.user.name)).toBe(
    "[object Object]",
  );

  // Repeated access returns the same cached proxy.
  expect(names.user).toBe(names.user);
});

test("marks nested values as touched on submit", async () => {
  const store = createFormStore({
    defaultValues: {
      user: { name: "" },
      items: [{ name: "" }, { name: "" }],
    },
  });

  await store.submit();

  expect(store.getState().touched).toEqual({
    user: { name: true },
    items: [{ name: true }, { name: true }],
  });
});

test("ignores prototype keys when marking values as touched", async () => {
  const defaultValues = JSON.parse('{"__proto__":{"polluted":true},"name":""}');
  const store = createFormStore({ defaultValues });

  await store.submit();

  const { touched } = store.getState();

  expect(Object.getPrototypeOf(touched)).toBe(Object.prototype);
  expect("polluted" in touched).toBe(false);
  expect(touched).toEqual({ name: true });
});

test("ignores prototype keys when updating values", () => {
  const defaultValues = JSON.parse('{"__proto__":{"polluted":true},"name":""}');
  const store = createFormStore({ defaultValues });

  store.setValue("name", "Ada");

  const { values } = store.getState();

  expect(Object.getPrototypeOf(values)).toBe(Object.prototype);
  expect("polluted" in values).toBe(false);
  expect(Object.hasOwn(values, "__proto__")).toBe(false);
  expect(values).toEqual({ name: "Ada" });
});

test("ignores prototype error keys when validating messages", () => {
  const defaultErrors = JSON.parse('{"__proto__":{"message":"Invalid"}}');
  const store = createFormStore({ defaultErrors });

  expect(store.getState().valid).toBe(true);
  expect(store.getError("__proto__.message")).toBeUndefined();

  store.setErrors(JSON.parse('{"constructor":{"message":"Invalid"}}'));

  expect(store.getState().valid).toBe(true);
  expect(store.getError("constructor.message")).toBeUndefined();
});
