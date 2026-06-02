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
