import { click, press, q, type } from "@ariakit/test";

const spyOnLog = () => vi.spyOn(console, "log").mockImplementation(() => {});

let log = spyOnLog();

beforeEach(() => {
  log = spyOnLog();
  return () => log.mockClear();
});

function getVisualState() {
  const checkboxes = q.menuitemcheckbox.all.includesHidden();
  const radios = q.menuitemradio.all.includesHidden();
  return [...checkboxes, ...radios].reduce<Record<string, string | string[]>>(
    (acc, element: HTMLElement | HTMLInputElement) => {
      if (!("name" in element)) return acc;
      if (element.getAttribute("role") === "menuitemradio") {
        acc[element.name] = element.checked
          ? element.value
          : acc[element.name] || "";
        return acc;
      }
      const accValue = acc[element.name];
      const withoutValue = Array.isArray(accValue)
        ? accValue.filter((v) => v !== element.value)
        : [];
      acc[element.name] = element.checked
        ? [...withoutValue, element.value]
        : withoutValue;
      return acc;
    },
    {},
  );
}

test("default values", async () => {
  expect(getVisualState()).toEqual({
    checkboxControlled: ["Banana"],
    checkboxParent: ["Orange"],
    checkboxUncontrolled: ["Banana", "Grape"],
    radioControlled: "Banana",
    radioParent: "Orange",
    radioUncontrolled: "Banana",
  });
  expect(log.mock.lastCall?.at(0)).toEqual({
    checkboxControlled: ["Banana"],
    checkboxParent: ["Orange"],
    checkboxUncontrolled: ["Banana", "Grape"],
    radioControlled: "Banana",
    radioParent: "Orange",
    radioUncontrolled: "Banana",
  });
});

test("interact with checkboxControlled items", async () => {
  await click(q.button());
  await click(q.menuitemcheckbox("Apple (checkboxControlled)"));
  await click(q.menuitemcheckbox("Banana (checkboxControlled)"));
  await click(q.menuitemcheckbox.includesHidden("Grape (checkboxControlled)"));
  await click(q.menuitemcheckbox("Orange (checkboxControlled)"));
  expect(getVisualState().checkboxControlled).toEqual(["Orange"]);
  expect(log.mock.lastCall?.at(0).checkboxControlled).toEqual(["Orange"]);
  log.mockClear();
  await click(q.menuitemcheckbox("Orange (checkboxControlled)"));
  expect(getVisualState().checkboxControlled).toEqual([]);
  expect(log.mock.lastCall?.at(0).checkboxControlled).toEqual([]);
});

test("interact with checkboxUncontrolled items", async () => {
  await click(q.button());
  await click(q.menuitemcheckbox("Apple (checkboxUncontrolled)"));
  await click(q.menuitemcheckbox("Banana (checkboxUncontrolled)"));
  await click(
    q.menuitemcheckbox.includesHidden("Grape (checkboxUncontrolled)"),
  );
  await click(q.menuitemcheckbox("Orange (checkboxUncontrolled)"));
  expect(getVisualState().checkboxUncontrolled).toEqual([
    "Apple",
    "Grape",
    "Orange",
  ]);
  expect(log.mock.lastCall?.at(0).checkboxUncontrolled).toEqual([
    "Grape",
    "Apple",
    "Orange",
  ]);
  log.mockClear();
  await click(q.menuitemcheckbox("Orange (checkboxUncontrolled)"));
  await click(q.menuitemcheckbox("Apple (checkboxUncontrolled)"));
  expect(getVisualState().checkboxUncontrolled).toEqual(["Grape"]);
  expect(log.mock.lastCall?.at(0).checkboxUncontrolled).toEqual(["Grape"]);
});

test("interact with checkboxParent items", async () => {
  await click(q.button());
  await click(q.menuitemcheckbox("Apple (checkboxParent)"));
  await click(q.menuitemcheckbox("Banana (checkboxParent)"));
  await click(q.menuitemcheckbox.includesHidden("Grape (checkboxParent)"));
  await click(q.menuitemcheckbox("Orange (checkboxParent)"));
  expect(getVisualState().checkboxParent).toEqual(["Banana"]);
  expect(log.mock.lastCall?.at(0).checkboxParent).toEqual(["Banana"]);
  log.mockClear();
  await click(q.menuitemcheckbox("Banana (checkboxParent)"));
  expect(getVisualState().checkboxParent).toEqual([]);
  expect(log.mock.lastCall?.at(0).checkboxParent).toEqual([]);
});

test("interact with radioControlled items", async () => {
  await click(q.button());
  log.mockClear();
  await click(q.menuitemradio("Apple (radioControlled)"));
  expect(getVisualState().radioControlled).toBe("Banana");
  expect(log.mock.calls).toHaveLength(0);
  log.mockClear();
  await click(q.menuitemradio("Banana (radioControlled)"));
  expect(getVisualState().radioControlled).toBe("Banana");
  expect(log.mock.calls).toHaveLength(0);
  log.mockClear();
  await click(q.menuitemradio.includesHidden("Grape (radioControlled)"));
  expect(getVisualState().radioControlled).toBe("Banana");
  expect(log.mock.calls).toHaveLength(0);
  log.mockClear();
  await click(q.menuitemradio("Orange (radioControlled)"));
  expect(getVisualState().radioControlled).toBe("Orange");
  expect(log.mock.lastCall?.at(0).radioControlled).toBe("Orange");
  log.mockClear();
  await click(q.menuitemradio("Banana (radioControlled)"));
  expect(getVisualState().radioControlled).toBe("Banana");
  expect(log.mock.lastCall?.at(0).radioControlled).toBe("Banana");
});

test("interact with radioUncontrolled items", async () => {
  await click(q.button());
  log.mockClear();
  await click(q.menuitemradio("Apple (radioUncontrolled)"));
  expect(getVisualState().radioUncontrolled).toBe("Apple");
  expect(log.mock.lastCall?.at(0).radioUncontrolled).toBe("Apple");
  log.mockClear();
  await click(q.menuitemradio("Banana (radioUncontrolled)"));
  expect(getVisualState().radioUncontrolled).toBe("Banana");
  expect(log.mock.lastCall?.at(0).radioUncontrolled).toBe("Banana");
  log.mockClear();
  await click(q.menuitemradio.includesHidden("Grape (radioUncontrolled)"));
  expect(getVisualState().radioUncontrolled).toBe("Banana");
  expect(log.mock.calls).toHaveLength(0);
  log.mockClear();
  await click(q.menuitemradio("Orange (radioUncontrolled)"));
  expect(getVisualState().radioUncontrolled).toBe("Orange");
  expect(log.mock.lastCall?.at(0).radioUncontrolled).toBe("Orange");
});

test("interact with radioParent items", async () => {
  await click(q.button());
  log.mockClear();
  await click(q.menuitemradio("Apple (radioParent)"));
  expect(getVisualState().radioParent).toBe("Orange");
  expect(log.mock.calls).toHaveLength(0);
  log.mockClear();
  await click(q.menuitemradio("Orange (radioParent)"));
  expect(getVisualState().radioParent).toBe("Orange");
  expect(log.mock.calls).toHaveLength(0);
  log.mockClear();
  await click(q.menuitemradio.includesHidden("Grape (radioParent)"));
  expect(getVisualState().radioParent).toBe("Orange");
  expect(log.mock.calls).toHaveLength(0);
  log.mockClear();
  await click(q.menuitemradio("Banana (radioParent)"));
  expect(getVisualState().radioParent).toBe("Banana");
  expect(log.mock.lastCall?.at(0).radioParent).toBe("Banana");
});

test("navigate with keyboard ignoring disabled items", async () => {
  await press.Tab();
  await press.Enter();
  expect(q.menuitemcheckbox("Apple (checkboxControlled)")).toHaveFocus();
  await press.ArrowDown();
  expect(q.menuitemcheckbox("Banana (checkboxControlled)")).toHaveFocus();
  await press.ArrowDown();
  expect(q.menuitemcheckbox("Orange (checkboxControlled)")).toHaveFocus();
  await press.ArrowDown();
  expect(q.menuitemcheckbox("Apple (checkboxUncontrolled)")).toHaveFocus();
  await press.ArrowDown();
  expect(q.menuitemcheckbox("Banana (checkboxUncontrolled)")).toHaveFocus();
  await press.ArrowDown();
  expect(q.menuitemcheckbox("Orange (checkboxUncontrolled)")).toHaveFocus();
  await type("bbbb");
  expect(q.menuitemradio("Banana (radioControlled)")).toHaveFocus();
  await press.ArrowDown();
  expect(q.menuitemradio("Orange (radioControlled)")).toHaveFocus();
});
