import * as React from "react";
import { render, focus, press } from "reakit-test-utils";
import {
  unstable_useCompositeState as useCompositeState,
  unstable_Composite as Composite,
  unstable_CompositeRow as CompositeRow,
  unstable_CompositeItem as CompositeItem
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

function template(string: string) {
  const items = Array.from(document.querySelectorAll("[data-item]"));
  const trimmedString = string.replace(/\s/gm, "");
  const activeElement = active();
  if (activeElement) {
    const activeIndex = items.indexOf(activeElement);
    return trimmedString[activeIndex] === "0" ? activeElement : null;
  }
  return null;
}

strategies.forEach(unstable_focusStrategy => {
  describe(unstable_focusStrategy, () => {
    test.skip("warning when there's no composite role", () => {
      const Test = () => {
        const composite = useCompositeState({ unstable_focusStrategy });
        return (
          <Composite {...composite} role="button">
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
          <Composite {...composite} role="toolbar">
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

    test("composite is a single tab stop", () => {
      const Test = () => {
        const composite = useCompositeState({ unstable_focusStrategy });
        return (
          <>
            <button>button1</button>
            <Composite {...composite} role="toolbar">
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
            <Composite {...composite} role="toolbar">
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
          <Composite {...composite} role="toolbar">
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

    test("move focus with arrow keys loop", () => {
      const Test = () => {
        const composite = useCompositeState({
          unstable_focusStrategy,
          loop: true
        });
        return (
          <Composite {...composite} role="toolbar">
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
          <Composite {...composite} role="toolbar">
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
          <Composite {...composite} role="toolbar">
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
          <Composite {...composite} role="toolbar">
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

    test("move to the next item when the current active item is unmounted", () => {
      const Test = ({ renderItem2 = false }) => {
        const composite = useCompositeState({ unstable_focusStrategy });
        return (
          <Composite {...composite} role="toolbar">
            <CompositeItem {...composite}>item1</CompositeItem>
            {renderItem2 && <CompositeItem {...composite}>item2</CompositeItem>}
            <CompositeItem {...composite}>item3</CompositeItem>
          </Composite>
        );
      };
      const { getByText, rerender } = render(<Test renderItem2 />);
      const item2 = getByText("item2");
      const item3 = getByText("item3");
      focus(item2);
      expect(item2).toHaveFocus();
      rerender(<Test />);
      expect(item3).toHaveFocus();
    });

    test("move to the previous item when the current active item is unmounted and it is the last one", () => {
      const Test = ({ renderItem3 = false }) => {
        const composite = useCompositeState({ unstable_focusStrategy });
        return (
          <Composite {...composite} role="toolbar">
            <CompositeItem {...composite}>item1</CompositeItem>
            <CompositeItem {...composite}>item2</CompositeItem>
            {renderItem3 && <CompositeItem {...composite}>item3</CompositeItem>}
          </Composite>
        );
      };
      const { getByText, rerender } = render(<Test renderItem3 />);
      const item2 = getByText("item2");
      const item3 = getByText("item3");
      focus(item3);
      expect(item3).toHaveFocus();
      rerender(<Test />);
      expect(item2).toHaveFocus();
    });

    test("move grid focus with arrow keys", () => {
      const Test = () => {
        const composite = useCompositeState({ unstable_focusStrategy });
        // 2 - enabled, 1 - disabled focusable, 0 - disabled
        const rows = [
          [2, 0, 0, 2],
          [2, 2, 1, 2],
          [2, 2, 2, 0]
        ];
        return (
          <Composite {...composite} role="grid">
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
          - - - 0
          - - - x
      `)
      );
      expect(key("<")).toBe(
        template(`
          - x x -
          - - 0 -
          - - - x
      `)
      );
      expect(key("<")).toBe(
        template(`
          - x x -
          - 0 - -
          - - - x
      `)
      );
      expect(key("<")).toBe(
        template(`
          - x x -
          0 - - -
          - - - x
      `)
      );
      expect(key("<")).toBe(
        template(`
          - x x -
          0 - - -
          - - - x
      `)
      );
      expect(key(">")).toBe(
        template(`
          - x x -
          - 0 - -
          - - - x
      `)
      );
      expect(key("v")).toBe(
        template(`
          - x x -
          - - - -
          - 0 - x
      `)
      );
      expect(key(">>")).toBe(
        template(`
          - x x -
          - - - -
          - - 0 x
      `)
      );
      expect(key("<<")).toBe(
        template(`
          - x x -
          - - - -
          0 - - x
      `)
      );
      expect(key(">")).toBe(
        template(`
          - x x -
          - - - -
          - 0 - x
      `)
      );
      expect(key("^^")).toBe(
        template(`
          - x x -
          - 0 - -
          - - - x
      `)
      );
      expect(key("^")).toBe(
        template(`
          - x x -
          - 0 - -
          - - - x
      `)
      );
      expect(key("<<<")).toBe(
        template(`
          0 x x -
          - - - -
          - - - x
      `)
      );
      expect(key("vv")).toBe(
        template(`
          - x x -
          - - - -
          0 - - x
      `)
      );
      expect(key("^")).toBe(
        template(`
          - x x -
          0 - - -
          - - - x
      `)
      );
      expect(key(">>>")).toBe(
        template(`
          - x x -
          - - - -
          - - 0 x
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
          <Composite {...composite} role="grid">
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
  });
});
