import * as React from "react";
import { render, focus, press, click, type, wait } from "reakit-test-utils";
import {
  unstable_useCompositeState as useCompositeState,
  unstable_Composite as Composite,
  unstable_CompositeRow as CompositeRow,
  unstable_CompositeItem as CompositeItem,
  unstable_CompositeItemWidget as CompositeItemWidget
} from "..";

const strategies = ["roving-tabindex", "aria-activedescendant"] as const;

const emojiMap = {
  "^": ["ArrowUp"],
  ">": ["ArrowRight"],
  v: ["ArrowDown"],
  "<": ["ArrowLeft"],
  "^^": ["PageUp"],
  vv: ["PageDown"],
  "<<": ["Home"],
  ">>": ["End"],
  "<<<": ["Home", { ctrlKey: true }],
  ">>>": ["End", { ctrlKey: true }]
} as const;

function active() {
  const { activeElement } = document;
  const activeDescendant = activeElement?.getAttribute("aria-activedescendant");
  if (activeDescendant) {
    return document.getElementById(activeDescendant);
  }
  return activeElement;
}

function key(char: keyof typeof emojiMap) {
  const [k, options] = emojiMap[char];
  press[k](null, options);
  return active();
}

function template(value: string) {
  const items = Array.from(document.querySelectorAll("[data-item]"));
  const withoutSpaces = value.replace(/\s/gm, "");
  return items[withoutSpaces.indexOf("0")];
}

strategies.forEach(unstable_focusStrategy => {
  describe(unstable_focusStrategy, () => {
    test("warning when there's no composite role", () => {
      const Test = () => {
        const composite = useCompositeState({ unstable_focusStrategy });
        return (
          <Composite {...composite} role="button" aria-label="composite">
            <CompositeItem {...composite}>item1</CompositeItem>
            <CompositeItem {...composite}>item2</CompositeItem>
            <CompositeItem {...composite}>item3</CompositeItem>
          </Composite>
        );
      };
      render(<Test />);
      expect(console).toHaveWarned();
    });

    test("warning when there's no label", () => {
      const Test = () => {
        const composite = useCompositeState({ unstable_focusStrategy });
        return (
          <Composite {...composite} role="toolbar">
            <CompositeItem {...composite}>item1</CompositeItem>
            <CompositeItem {...composite}>item2</CompositeItem>
            <CompositeItem {...composite}>item3</CompositeItem>
          </Composite>
        );
      };
      render(<Test />);
      expect(console).toHaveWarned();
    });

    test("first list item is active", () => {
      const Test = () => {
        const composite = useCompositeState({ unstable_focusStrategy });
        return (
          <Composite {...composite} role="toolbar" aria-label="composite">
            <CompositeItem {...composite}>item1</CompositeItem>
            <CompositeItem {...composite}>item2</CompositeItem>
            <CompositeItem {...composite}>item3</CompositeItem>
          </Composite>
        );
      };
      const { getByText } = render(<Test />);
      const item1 = getByText("item1");
      expect(item1).not.toHaveFocus();
      press.Tab();
      expect(item1).toHaveFocus();
    });

    test("list item is active when currentId is set", () => {
      const Test = () => {
        const composite = useCompositeState({
          unstable_focusStrategy,
          currentId: "item2"
        });
        return (
          <Composite {...composite} role="toolbar" aria-label="composite">
            <CompositeItem {...composite}>item1</CompositeItem>
            <CompositeItem {...composite} id="item2">
              item2
            </CompositeItem>
            <CompositeItem {...composite}>item3</CompositeItem>
          </Composite>
        );
      };
      const { getByText } = render(<Test />);
      const item2 = getByText("item2");
      expect(item2).not.toHaveFocus();
      press.Tab();
      expect(item2).toHaveFocus();
    });

    test("click item", () => {
      const onClick = jest.fn();
      const Test = () => {
        const composite = useCompositeState({ unstable_focusStrategy });
        return (
          <Composite {...composite} role="toolbar" aria-label="composite">
            <CompositeItem {...composite}>item1</CompositeItem>
            <CompositeItem {...composite} onClick={onClick}>
              item2
            </CompositeItem>
            <CompositeItem {...composite}>item3</CompositeItem>
          </Composite>
        );
      };
      const { getByText } = render(<Test />);
      const item2 = getByText("item2");
      expect(item2).not.toHaveFocus();
      expect(onClick).toHaveBeenCalledTimes(0);
      click(item2);
      expect(item2).toHaveFocus();
      expect(onClick).toHaveBeenCalledTimes(1);
      press.Enter();
      expect(onClick).toHaveBeenCalledTimes(2);
      press.Space();
      expect(onClick).toHaveBeenCalledTimes(3);
    });

    test("composite is a single tab stop", () => {
      const Test = () => {
        const composite = useCompositeState({ unstable_focusStrategy });
        return (
          <>
            <button>button1</button>
            <Composite {...composite} role="toolbar" aria-label="composite">
              <CompositeItem {...composite}>item1</CompositeItem>
              <CompositeItem {...composite}>item2</CompositeItem>
              <CompositeItem {...composite}>item3</CompositeItem>
            </Composite>
            <button>button2</button>
          </>
        );
      };
      const { getByText } = render(<Test />);
      const button1 = getByText("button1");
      const item1 = getByText("item1");
      const button2 = getByText("button2");
      focus(button1);
      press.Tab();
      expect(item1).toHaveFocus();
      press.Tab();
      expect(button2).toHaveFocus();
      press.ShiftTab();
      expect(item1).toHaveFocus();
    });

    test("remember the last focused item", () => {
      const Test = () => {
        const composite = useCompositeState({ unstable_focusStrategy });
        return (
          <>
            <Composite {...composite} role="toolbar" aria-label="composite">
              <CompositeItem {...composite}>item1</CompositeItem>
              <CompositeItem {...composite}>item2</CompositeItem>
              <CompositeItem {...composite}>item3</CompositeItem>
            </Composite>
            <button>button</button>
          </>
        );
      };
      const { getByText } = render(<Test />);
      const button = getByText("button");
      const item2 = getByText("item2");
      focus(item2);
      press.Tab();
      expect(button).toHaveFocus();
      press.ShiftTab();
      expect(item2).toHaveFocus();
    });

    test("move focus with arrow keys", () => {
      const Test = () => {
        const composite = useCompositeState({ unstable_focusStrategy });
        return (
          <Composite {...composite} role="toolbar" aria-label="composite">
            <CompositeItem {...composite} data-item />
            <CompositeItem {...composite} data-item disabled />
            <CompositeItem {...composite} data-item disabled focusable />
            <CompositeItem {...composite} data-item />
          </Composite>
        );
      };
      render(<Test />);
      press.Tab();
      expect(active()).toBe(template("0x--"));
      expect(key(">")).toBe(template("-x0-"));
      expect(key("v")).toBe(template("-x-0"));
      expect(key("<")).toBe(template("-x0-"));
      expect(key("^")).toBe(template("0x--"));
      expect(key("<")).toBe(template("0x--"));
      expect(key(">>")).toBe(template("-x-0"));
      expect(key("<<")).toBe(template("0x--"));
      expect(key("vv")).toBe(template("-x-0"));
      expect(key("^^")).toBe(template("0x--"));
    });

    test("move focus with arrow keys rtl", () => {
      const Test = () => {
        const composite = useCompositeState({
          unstable_focusStrategy,
          rtl: true
        });
        return (
          <Composite {...composite} role="toolbar" aria-label="composite">
            <CompositeItem {...composite} data-item />
            <CompositeItem {...composite} data-item disabled />
            <CompositeItem {...composite} data-item disabled focusable />
            <CompositeItem {...composite} data-item />
          </Composite>
        );
      };
      render(<Test />);
      press.Tab();
      expect(active()).toBe(template("0x--"));
      expect(key("<")).toBe(template("-x0-"));
      expect(key("^")).toBe(template("-x-0"));
      expect(key(">")).toBe(template("-x0-"));
      expect(key("v")).toBe(template("0x--"));
      expect(key(">")).toBe(template("0x--"));
      expect(key("<<")).toBe(template("-x-0"));
      expect(key(">>")).toBe(template("0x--"));
      expect(key("^^")).toBe(template("-x-0"));
      expect(key("vv")).toBe(template("0x--"));
    });

    test("move focus with arrow keys loop", () => {
      const Test = () => {
        const composite = useCompositeState({
          unstable_focusStrategy,
          loop: true
        });
        return (
          <Composite {...composite} role="toolbar" aria-label="composite">
            <CompositeItem {...composite} data-item />
            <CompositeItem {...composite} data-item disabled focusable />
            <CompositeItem {...composite} data-item />
            <CompositeItem {...composite} data-item disabled />
          </Composite>
        );
      };
      render(<Test />);
      press.Tab();
      expect(active()).toBe(template("0--x"));
      expect(key(">")).toBe(template("-0-x"));
      expect(key("v")).toBe(template("--0x"));
      expect(key("<")).toBe(template("-0-x"));
      expect(key("^")).toBe(template("0--x"));
      expect(key("<")).toBe(template("--0x"));
      expect(key(">")).toBe(template("0--x"));
      expect(key(">>")).toBe(template("--0x"));
      expect(key("<<")).toBe(template("0--x"));
      expect(key("vv")).toBe(template("--0x"));
      expect(key("^^")).toBe(template("0--x"));
    });

    test("move focus with arrow keys horizontal", () => {
      const Test = () => {
        const composite = useCompositeState({
          unstable_focusStrategy,
          orientation: "horizontal"
        });
        return (
          <Composite {...composite} role="toolbar" aria-label="composite">
            <CompositeItem {...composite} data-item />
            <CompositeItem {...composite} data-item />
            <CompositeItem {...composite} data-item />
          </Composite>
        );
      };
      render(<Test />);
      press.Tab();
      expect(active()).toBe(template("0--"));
      expect(key(">")).toBe(template("-0-"));
      expect(key("v")).toBe(template("-0-"));
      expect(key(">")).toBe(template("--0"));
      expect(key(">")).toBe(template("--0"));
      expect(key("<")).toBe(template("-0-"));
      expect(key("^")).toBe(template("-0-"));
      expect(key("<")).toBe(template("0--"));
      expect(key("<")).toBe(template("0--"));
      expect(key(">>")).toBe(template("--0"));
      expect(key("<<")).toBe(template("0--"));
      expect(key("vv")).toBe(template("--0"));
      expect(key("^^")).toBe(template("0--"));
    });

    test("move focus with arrow keys vertical", () => {
      const Test = () => {
        const composite = useCompositeState({
          unstable_focusStrategy,
          orientation: "vertical"
        });
        return (
          <Composite {...composite} role="toolbar" aria-label="composite">
            <CompositeItem {...composite} data-item />
            <CompositeItem {...composite} data-item />
            <CompositeItem {...composite} data-item />
          </Composite>
        );
      };
      render(<Test />);
      press.Tab();
      expect(active()).toBe(template("0--"));
      expect(key("v")).toBe(template("-0-"));
      expect(key(">")).toBe(template("-0-"));
      expect(key("v")).toBe(template("--0"));
      expect(key("v")).toBe(template("--0"));
      expect(key("^")).toBe(template("-0-"));
      expect(key("<")).toBe(template("-0-"));
      expect(key("^")).toBe(template("0--"));
      expect(key("^")).toBe(template("0--"));
      expect(key(">>")).toBe(template("--0"));
      expect(key("<<")).toBe(template("0--"));
      expect(key("vv")).toBe(template("--0"));
      expect(key("^^")).toBe(template("0--"));
    });

    test("keep DOM order", () => {
      const Test = ({ renderItem2 = false }) => {
        const composite = useCompositeState({ unstable_focusStrategy });
        return (
          <Composite {...composite} role="toolbar" aria-label="composite">
            <CompositeItem {...composite}>item1</CompositeItem>
            {renderItem2 && <CompositeItem {...composite}>item2</CompositeItem>}
            <CompositeItem {...composite}>item3</CompositeItem>
          </Composite>
        );
      };
      const { getByText, rerender } = render(<Test />);
      const item1 = getByText("item1");
      const item3 = getByText("item3");
      focus(item1);
      expect(item1).toHaveFocus();
      press.ArrowRight();
      expect(item3).toHaveFocus();
      rerender(<Test renderItem2 />);
      expect(item3).toHaveFocus();
      press.ArrowLeft();
      expect(getByText("item2")).toHaveFocus();
    });

    ["disabled", "unmounted"].forEach(state => {
      test(`move to the next item when the current active item is ${state}`, () => {
        const Test = ({ disabled = false }) => {
          const composite = useCompositeState({ unstable_focusStrategy });
          return (
            <Composite {...composite} role="toolbar" aria-label="composite">
              <CompositeItem {...composite}>item1</CompositeItem>
              {(!disabled || state !== "unmounted") && (
                <CompositeItem {...composite} disabled={disabled}>
                  item2
                </CompositeItem>
              )}
              <CompositeItem {...composite} disabled>
                item3
              </CompositeItem>
              <CompositeItem {...composite}>item4</CompositeItem>
            </Composite>
          );
        };
        const { getByText, rerender } = render(<Test />);
        const item2 = getByText("item2");
        const item4 = getByText("item4");
        focus(item2);
        expect(item2).toHaveFocus();
        rerender(<Test disabled />);
        expect(item4).toHaveFocus();
      });

      test(`move to the previous item when the current active item is ${state} and it is the last one`, () => {
        const Test = ({ disabled = false }) => {
          const composite = useCompositeState({ unstable_focusStrategy });
          return (
            <Composite {...composite} role="toolbar" aria-label="composite">
              <CompositeItem {...composite}>item1</CompositeItem>
              <CompositeItem {...composite}>item2</CompositeItem>
              <CompositeItem {...composite} disabled>
                item3
              </CompositeItem>
              {(!disabled || state !== "unmounted") && (
                <CompositeItem {...composite} disabled={disabled}>
                  item4
                </CompositeItem>
              )}
            </Composite>
          );
        };
        const { getByText, rerender } = render(<Test />);
        const item2 = getByText("item2");
        const item4 = getByText("item4");
        focus(item4);
        expect(item4).toHaveFocus();
        rerender(<Test disabled />);
        expect(item2).toHaveFocus();
      });
    });

    test("list item with tabbable content inside", async () => {
      const Test = () => {
        const composite = useCompositeState({ unstable_focusStrategy });
        return (
          <>
            <Composite {...composite} role="toolbar" aria-label="composite">
              <CompositeItem {...composite}>item1</CompositeItem>
              <CompositeItem {...composite} aria-label="item2">
                <CompositeItemWidget
                  {...composite}
                  as="input"
                  type="text"
                  aria-label="input"
                />
              </CompositeItem>
              <CompositeItem {...composite} as="div" aria-label="item3">
                <CompositeItemWidget {...composite} as="button">
                  innerButton
                </CompositeItemWidget>
              </CompositeItem>
            </Composite>
            <button>outerButton</button>
          </>
        );
      };
      const { getByLabelText, getByText } = render(<Test />);
      const item2 = getByLabelText("item2");
      const item3 = getByLabelText("item3");
      const input = getByLabelText("input");
      const innerButton = getByText("innerButton");
      const outerButton = getByText("outerButton");
      click(item2);
      expect(item2).not.toHaveFocus();
      expect(input).toHaveFocus();
      press.Escape();
      expect(item2).toHaveFocus();
      press.Tab();
      expect(outerButton).toHaveFocus();
      press.ShiftTab();
      expect(item2).toHaveFocus();
      press.Enter();
      expect(input).toHaveFocus();
      press.ArrowDown();
      press.ArrowRight();
      expect(input).toHaveFocus();
      press.Tab();
      expect(innerButton).toHaveFocus();
      press.Tab();
      expect(outerButton).toHaveFocus();
      press.ShiftTab();
      expect(item3).toHaveFocus();
      press("a");
      expect(item3).toHaveFocus();
      press.Enter();
      expect(innerButton).toHaveFocus();
      press.Escape();
      expect(item3).toHaveFocus();
      press.Space();
      expect(innerButton).toHaveFocus();
      press.ShiftTab();
      expect(input).toHaveFocus();
      press.Escape();
      expect(input).not.toHaveFocus();
      press.Space();
      expect(input).toHaveFocus();
      await wait(() => expect(input).toHaveValue(""));
      press.Escape();
      expect(input).not.toHaveFocus();
      press("a");
      expect(input).toHaveFocus();
      await wait(() => expect(input).toHaveValue("a"));
      type("bc d");
      await wait(() => expect(input).toHaveValue("abc d"));
      press.Escape();
      expect(input).not.toHaveFocus();
      await wait(() => expect(input).toHaveValue(""));
      press("b");
      expect(input).toHaveFocus();
      await wait(() => expect(input).toHaveValue("b"));
      type("c");
      await wait(() => expect(input).toHaveValue("bc"));
      press.Enter();
      expect(item2).toHaveFocus();
      await wait(() => expect(input).toHaveValue("bc"));
      press("b");
      expect(input).toHaveFocus();
      await wait(() => expect(input).toHaveValue("b"));
      press.Escape();
      expect(item2).toHaveFocus();
      await wait(() => expect(input).toHaveValue("bc"));
      press.Backspace();
      expect(item2).toHaveFocus();
      await wait(() => expect(input).toHaveValue(""));
      press("#");
      expect(input).toHaveFocus();
      await wait(() => expect(input).toHaveValue("#"));
      press.Escape();
      press.Delete();
      expect(item2).toHaveFocus();
      await wait(() => expect(input).toHaveValue(""));
    });

    test("move grid focus with arrow keys", () => {
      const Test = () => {
        const composite = useCompositeState({ unstable_focusStrategy });
        // 2 - enabled, 1 - disabled focusable, 0 - disabled
        const rows = [
          [2, 2, 1, 2],
          [2, 0, 0, 2],
          [2, 2, 2, 0]
        ];
        return (
          <Composite {...composite} role="grid" aria-label="composite">
            {rows.map((items, i) => (
              <CompositeRow {...composite} key={i}>
                {items.map((item, j) => (
                  <CompositeItem
                    {...composite}
                    key={j}
                    disabled={item < 2}
                    focusable={item === 1}
                    data-item
                  />
                ))}
              </CompositeRow>
            ))}
          </Composite>
        );
      };

      render(<Test />);
      press.Tab();
      expect(active()).toBe(
        template(`
          0 - - -
          - x x -
          - - - x
      `)
      );
      expect(key(">")).toBe(
        template(`
          - 0 - -
          - x x -
          - - - x
      `)
      );
      expect(key(">")).toBe(
        template(`
          - - 0 -
          - x x -
          - - - x
      `)
      );
      expect(key(">")).toBe(
        template(`
          - - - 0
          - x x -
          - - - x
      `)
      );
      expect(key(">")).toBe(
        template(`
          - - - 0
          - x x -
          - - - x
      `)
      );
      expect(key("v")).toBe(
        template(`
          - - - -
          - x x 0
          - - - x
      `)
      );
      expect(key(">")).toBe(
        template(`
          - - - -
          - x x 0
          - - - x
      `)
      );
      expect(key("<")).toBe(
        template(`
          - - - -
          0 x x -
          - - - x
      `)
      );
      expect(key("v")).toBe(
        template(`
          - - - -
          - x x -
          0 - - x
      `)
      );
      expect(key(">>")).toBe(
        template(`
          - - - -
          - x x -
          - - 0 x
      `)
      );
      expect(key("<<")).toBe(
        template(`
          - - - -
          - x x -
          0 - - x
      `)
      );
      expect(key(">")).toBe(
        template(`
          - - - -
          - x x -
          - 0 - x
      `)
      );
      expect(key("^^")).toBe(
        template(`
          - 0 - -
          - x x -
          - - - x
      `)
      );
      expect(key("^")).toBe(
        template(`
          - 0 - -
          - x x -
          - - - x
      `)
      );
      expect(key("<<<")).toBe(
        template(`
          0 - - -
          - x x -
          - - - x
      `)
      );
      expect(key("vv")).toBe(
        template(`
          - - - -
          - x x -
          0 - - x
      `)
      );
      expect(key("^")).toBe(
        template(`
          - - - -
          0 x x -
          - - - x
      `)
      );
      expect(key(">>>")).toBe(
        template(`
          - - - -
          - x x -
          - - 0 x
      `)
      );
    });

    test("move grid focus with arrow keys rtl", () => {
      const Test = () => {
        const composite = useCompositeState({
          unstable_focusStrategy,
          rtl: true
        });
        // 2 - enabled, 1 - disabled focusable, 0 - disabled
        const rows = [
          [2, 0, 0, 2],
          [2, 2, 1, 2],
          [2, 2, 2, 0]
        ];
        return (
          <Composite {...composite} role="grid" aria-label="composite">
            {rows.map((items, i) => (
              <CompositeRow {...composite} key={i}>
                {items.map((item, j) => (
                  <CompositeItem
                    {...composite}
                    key={j}
                    disabled={item < 2}
                    focusable={item === 1}
                    data-item
                  />
                ))}
              </CompositeRow>
            ))}
          </Composite>
        );
      };

      render(<Test />);
      press.Tab();
      expect(active()).toBe(
        template(`
          0 x x -
          - - - -
          - - - x
      `)
      );
      expect(key("<")).toBe(
        template(`
          - x x 0
          - - - -
          - - - x
      `)
      );
      expect(key("<")).toBe(
        template(`
          - x x 0
          - - - -
          - - - x
      `)
      );
      expect(key("v")).toBe(
        template(`
          - x x -
          - - - 0
          - - - x
      `)
      );
      expect(key(">")).toBe(
        template(`
          - x x -
          - - 0 -
          - - - x
      `)
      );
      expect(key(">>")).toBe(
        template(`
          - x x -
          0 - - -
          - - - x
      `)
      );
      expect(key(">>>")).toBe(
        template(`
          0 x x -
          - - - -
          - - - x
      `)
      );
      expect(key("<<<")).toBe(
        template(`
          - x x -
          - - - -
          - - 0 x
      `)
      );
      expect(key("^^")).toBe(
        template(`
          - x x -
          - - 0 -
          - - - x
      `)
      );
    });

    test("move grid focus with arrow keys wrap", () => {
      const Test = () => {
        const composite = useCompositeState({
          unstable_focusStrategy,
          wrap: true
        });
        // 2 - enabled, 1 - disabled focusable, 0 - disabled
        const rows = [
          [2, 0, 0, 2],
          [2, 2, 1, 2],
          [2, 2, 2, 0]
        ];
        return (
          <Composite {...composite} role="grid" aria-label="composite">
            {rows.map((items, i) => (
              <CompositeRow {...composite} key={i}>
                {items.map((item, j) => (
                  <CompositeItem
                    {...composite}
                    key={j}
                    disabled={item < 2}
                    focusable={item === 1}
                    data-item
                  />
                ))}
              </CompositeRow>
            ))}
          </Composite>
        );
      };

      render(<Test />);
      press.Tab();
      expect(active()).toBe(
        template(`
          0 x x -
          - - - -
          - - - x
      `)
      );
      expect(key(">")).toBe(
        template(`
          - x x 0
          - - - -
          - - - x
      `)
      );
      expect(key(">")).toBe(
        template(`
          - x x -
          0 - - -
          - - - x
      `)
      );
      expect(key("<")).toBe(
        template(`
          - x x 0
          - - - -
          - - - x
      `)
      );
      expect(key("^")).toBe(
        template(`
          - x x -
          - - - -
          - - 0 x
      `)
      );
      expect(key("v")).toBe(
        template(`
          - x x 0
          - - - -
          - - - x
      `)
      );
    });

    test("move grid focus with arrow keys wrap horizontal", () => {
      const Test = () => {
        const composite = useCompositeState({
          unstable_focusStrategy,
          orientation: "horizontal",
          wrap: true
        });
        // 2 - enabled, 1 - disabled focusable, 0 - disabled
        const rows = [
          [2, 0, 0, 2],
          [2, 2, 1, 2],
          [2, 2, 2, 0]
        ];
        return (
          <Composite {...composite} role="grid" aria-label="composite">
            {rows.map((items, i) => (
              <CompositeRow {...composite} key={i}>
                {items.map((item, j) => (
                  <CompositeItem
                    {...composite}
                    key={j}
                    disabled={item < 2}
                    focusable={item === 1}
                    data-item
                  />
                ))}
              </CompositeRow>
            ))}
          </Composite>
        );
      };

      render(<Test />);
      press.Tab();
      expect(active()).toBe(
        template(`
          0 x x -
          - - - -
          - - - x
      `)
      );
      expect(key(">")).toBe(
        template(`
          - x x 0
          - - - -
          - - - x
      `)
      );
      expect(key(">")).toBe(
        template(`
          - x x -
          0 - - -
          - - - x
      `)
      );
      expect(key("<")).toBe(
        template(`
          - x x 0
          - - - -
          - - - x
      `)
      );
      expect(key("^")).toBe(
        template(`
          - x x 0
          - - - -
          - - - x
      `)
      );
    });

    test("move grid focus with arrow keys wrap vertical", () => {
      const Test = () => {
        const composite = useCompositeState({
          unstable_focusStrategy,
          orientation: "vertical",
          wrap: true
        });
        // 2 - enabled, 1 - disabled focusable, 0 - disabled
        const rows = [
          [2, 0, 0, 2],
          [2, 2, 1, 2],
          [2, 2, 2, 0]
        ];
        return (
          <Composite {...composite} role="grid" aria-label="composite">
            {rows.map((items, i) => (
              <CompositeRow {...composite} key={i}>
                {items.map((item, j) => (
                  <CompositeItem
                    {...composite}
                    key={j}
                    disabled={item < 2}
                    focusable={item === 1}
                    data-item
                  />
                ))}
              </CompositeRow>
            ))}
          </Composite>
        );
      };

      render(<Test />);
      press.Tab();
      expect(active()).toBe(
        template(`
          0 x x -
          - - - -
          - - - x
      `)
      );
      expect(key(">")).toBe(
        template(`
          - x x 0
          - - - -
          - - - x
      `)
      );
      expect(key(">")).toBe(
        template(`
          - x x 0
          - - - -
          - - - x
      `)
      );
      expect(key("^")).toBe(
        template(`
          - x x -
          - - - -
          - - 0 x
      `)
      );
      expect(key("v")).toBe(
        template(`
          - x x 0
          - - - -
          - - - x
      `)
      );
    });

    test("move grid focus with arrow keys different number of cells", () => {
      const Test = () => {
        const composite = useCompositeState({ unstable_focusStrategy });
        // 2 - enabled, 1 - disabled focusable, 0 - disabled
        const rows = [
          [2, 0, 0, 0, 1],
          [2, 2, 0],
          [2, 2, 2, 2, 1],
          [2, 2, 2]
        ];
        return (
          <Composite {...composite} role="grid" aria-label="composite">
            {rows.map((items, i) => (
              <CompositeRow {...composite} key={i}>
                {items.map((item, j) => (
                  <CompositeItem
                    {...composite}
                    key={j}
                    disabled={item < 2}
                    focusable={item === 1}
                    data-item
                  />
                ))}
              </CompositeRow>
            ))}
          </Composite>
        );
      };

      render(<Test />);
      press.Tab();
      expect(active()).toBe(
        template(`
          0 x x x -
          - - x
          - - - - -
          - - -
      `)
      );
      expect(key(">")).toBe(
        template(`
          - x x x 0
          - - x
          - - - - -
          - - -
      `)
      );
      expect(key(">")).toBe(
        template(`
          - x x x 0
          - - x
          - - - - -
          - - -
      `)
      );
      expect(key("^")).toBe(
        template(`
          - x x x 0
          - - x
          - - - - -
          - - -
      `)
      );
      expect(key("v")).toBe(
        template(`
          - x x x -
          - - x
          - - - - 0
          - - -
      `)
      );
      expect(key("v")).toBe(
        template(`
          - x x x -
          - - x
          - - - - 0
          - - -
      `)
      );
      expect(key("^")).toBe(
        template(`
          - x x x 0
          - - x
          - - - - -
          - - -
      `)
      );
      expect(key(">>>")).toBe(
        template(`
          - x x x -
          - - x
          - - - - -
          - - 0
      `)
      );
      expect(key("^")).toBe(
        template(`
          - x x x -
          - - x
          - - 0 - -
          - - -
      `)
      );
      expect(key("<<")).toBe(
        template(`
          - x x x -
          - - x
          0 - - - -
          - - -
      `)
      );
      expect(key("v")).toBe(
        template(`
          - x x x -
          - - x
          - - - - -
          0 - -
      `)
      );
      expect(key(">")).toBe(
        template(`
          - x x x -
          - - x
          - - - - -
          - 0 -
      `)
      );
      expect(key(">")).toBe(
        template(`
          - x x x -
          - - x
          - - - - -
          - - 0
      `)
      );
      expect(key(">")).toBe(
        template(`
          - x x x -
          - - x
          - - - - -
          - - 0
      `)
      );
      expect(key("^^")).toBe(
        template(`
          - x x x -
          - - x
          - - 0 - -
          - - -
      `)
      );
      expect(key(">>")).toBe(
        template(`
          - x x x -
          - - x
          - - - - 0
          - - -
      `)
      );
    });

    test("move grid focus with arrow keys different number of cells wrap", () => {
      const Test = () => {
        const composite = useCompositeState({
          unstable_focusStrategy,
          wrap: true
        });
        // 2 - enabled, 1 - disabled focusable, 0 - disabled
        const rows = [
          [2, 0, 0, 0, 1],
          [2, 2, 0],
          [2, 2, 2, 2, 1],
          [2, 2, 2]
        ];
        return (
          <Composite {...composite} role="grid" aria-label="composite">
            {rows.map((items, i) => (
              <CompositeRow {...composite} key={i}>
                {items.map((item, j) => (
                  <CompositeItem
                    {...composite}
                    key={j}
                    disabled={item < 2}
                    focusable={item === 1}
                    data-item
                  />
                ))}
              </CompositeRow>
            ))}
          </Composite>
        );
      };

      render(<Test />);
      press.Tab();
      expect(active()).toBe(
        template(`
          0 x x x -
          - - x
          - - - - -
          - - -
      `)
      );
      expect(key(">")).toBe(
        template(`
          - x x x 0
          - - x
          - - - - -
          - - -
      `)
      );
      expect(key(">")).toBe(
        template(`
          - x x x -
          0 - x
          - - - - -
          - - -
      `)
      );
      expect(key(">>>")).toBe(
        template(`
          - x x x -
          - - x
          - - - - -
          - - 0
      `)
      );
      expect(key("^")).toBe(
        template(`
          - x x x -
          - - x
          - - 0 - -
          - - -
      `)
      );
      expect(key(">")).toBe(
        template(`
          - x x x -
          - - x
          - - - 0 -
          - - -
      `)
      );
      expect(key("^")).toBe(
        template(`
          - x x x -
          - - x
          - - - - -
          - - 0
      `)
      );
      expect(key("v")).toBe(
        template(`
          - x x x -
          - - x
          - - - 0 -
          - - -
      `)
      );
    });

    test("grid item with tabbable content inside", () => {
      const Test = () => {
        const composite = useCompositeState({
          unstable_focusStrategy,
          orientation: "vertical",
          wrap: true
        });
        // 2 - enabled, 1 - disabled focusable, 0 - disabled, .5 - has widget
        const rows = [
          [2, 0.5, 0, 2],
          [2, 2.5, 1, 2],
          [2, 2, 1.5, 0.5]
        ];
        return (
          <Composite {...composite} role="grid" aria-label="composite">
            {rows.map((items, i) => (
              <CompositeRow {...composite} key={i}>
                {items.map((item, j) => (
                  <CompositeItem
                    {...composite}
                    key={j}
                    disabled={Math.floor(item) < 2}
                    focusable={Math.floor(item) === 1}
                    aria-label={`${i}-${j}`}
                  >
                    {item % 1 !== 0 && (
                      <CompositeItemWidget
                        {...composite}
                        as="input"
                        type="text"
                        aria-label={`input-${i}-${j}`}
                      />
                    )}
                  </CompositeItem>
                ))}
              </CompositeRow>
            ))}
          </Composite>
        );
      };

      const { getByLabelText } = render(<Test />);
      press.Tab();
      expect(getByLabelText("0-0")).toHaveFocus();
      press.ArrowDown();
      press.ArrowRight();
      expect(getByLabelText("1-1")).toHaveFocus();
      press.Enter();
      expect(getByLabelText("1-1")).not.toHaveFocus();
      expect(getByLabelText("input-1-1")).toHaveFocus();
      press.Tab();
      expect(getByLabelText("2-2")).not.toHaveFocus();
      expect(getByLabelText("input-2-2")).toHaveFocus();
      press.ShiftTab();
      expect(getByLabelText("1-1")).not.toHaveFocus();
      expect(getByLabelText("input-1-1")).toHaveFocus();
      press.Escape();
      expect(getByLabelText("1-1")).toHaveFocus();
      expect(getByLabelText("input-1-1")).not.toHaveFocus();
    });

    test("move to the next row when the current row is unmounted", () => {
      const Test = ({ disableRow = false, disableItems = false }) => {
        const composite = useCompositeState({
          unstable_focusStrategy
        });
        const [rows, setRows] = React.useState<string[][]>([[]]);

        React.useEffect(() => {
          if (disableRow) {
            setRows([
              ["1-1", "1-2", "1-3"],
              ["3-1", "3-2", "3-3"]
            ]);
          } else {
            setRows([
              ["1-1", "1-2", "1-3"],
              ["2-1", "2-2", "2-3"],
              ["3-1", "3-2", "3-3"]
            ]);
          }
        }, [disableRow]);

        return (
          <Composite {...composite} role="grid" aria-label="composite">
            {rows.map((items, i) => (
              <CompositeRow {...composite} key={items.join("")}>
                {items.map(item => (
                  <CompositeItem
                    {...composite}
                    key={item}
                    disabled={disableItems && i === 1}
                    aria-label={item}
                  />
                ))}
              </CompositeRow>
            ))}
          </Composite>
        );
      };
      const { getByLabelText, rerender } = render(<Test />);
      press.Tab();
      expect(getByLabelText("1-1")).toHaveFocus();
      press.ArrowDown();
      press.ArrowRight();
      expect(getByLabelText("2-2")).toHaveFocus();
      rerender(<Test disableRow />);
      expect(getByLabelText("3-2")).toHaveFocus();
      rerender(<Test />);
      expect(getByLabelText("3-2")).toHaveFocus();
      press.ArrowUp();
      expect(getByLabelText("2-2")).toHaveFocus();
      rerender(<Test disableItems />);
      expect(getByLabelText("3-1")).toHaveFocus();
    });
  });
});
