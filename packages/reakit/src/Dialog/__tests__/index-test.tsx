import * as React from "react";
import { render, fireEvent, act } from "react-testing-library";
import {
  focusNextTabbableIn,
  focusPreviousTabbableIn
} from "../__utils/tabbable";
import { Dialog, DialogDisclosure, useDialogState } from "..";

test("clicking on disclosure opens the dialog", () => {
  const Test = () => {
    const dialog = useDialogState();
    return (
      <>
        <DialogDisclosure {...dialog}>disclosure</DialogDisclosure>
        <Dialog aria-label="dialog" {...dialog} />
      </>
    );
  };
  const { getByText, getByLabelText } = render(<Test />);
  const disclosure = getByText("disclosure");
  const dialog = getByLabelText("dialog");
  expect(dialog).not.toBeVisible();
  fireEvent.click(disclosure);
  expect(dialog).toBeVisible();
});

test("focus the first tabbable element when dialog opens", () => {
  const Test = () => {
    const dialog = useDialogState();
    return (
      <>
        <DialogDisclosure {...dialog}>disclosure</DialogDisclosure>
        <Dialog aria-label="dialog" {...dialog}>
          <button>button1</button>
          <button>button2</button>
        </Dialog>
      </>
    );
  };
  const { getByText } = render(<Test />);
  const disclosure = getByText("disclosure");
  const button1 = getByText("button1");
  expect(document.body).toHaveFocus();
  fireEvent.click(disclosure);
  expect(button1).toHaveFocus();
});

test("focus the first tabbable element when non-modal dialog opens", () => {
  const Test = () => {
    const dialog = useDialogState();
    return (
      <>
        <DialogDisclosure {...dialog}>disclosure</DialogDisclosure>
        <Dialog aria-label="dialog" modal={false} {...dialog}>
          <button>button1</button>
          <button>button2</button>
        </Dialog>
      </>
    );
  };
  const { getByText } = render(<Test />);
  const disclosure = getByText("disclosure");
  const button1 = getByText("button1");
  expect(document.body).toHaveFocus();
  fireEvent.click(disclosure);
  expect(button1).toHaveFocus();
});

test("focus a given element when dialog opens and initialFocusRef is passed in", () => {
  const Test = () => {
    const dialog = useDialogState();
    const ref = React.useRef<HTMLButtonElement>(null);
    return (
      <>
        <DialogDisclosure {...dialog}>disclosure</DialogDisclosure>
        <Dialog aria-label="dialog" initialFocusRef={ref} {...dialog}>
          <button>button1</button>
          <button ref={ref}>button2</button>
        </Dialog>
      </>
    );
  };
  const { getByText } = render(<Test />);
  const disclosure = getByText("disclosure");
  const button2 = getByText("button2");
  expect(document.body).toHaveFocus();
  fireEvent.click(disclosure);
  expect(button2).toHaveFocus();
});

test("focus dialog itself if there is no tabbable descendant element", () => {
  const Test = () => {
    const dialog = useDialogState();
    return (
      <>
        <DialogDisclosure {...dialog}>disclosure</DialogDisclosure>
        <Dialog aria-label="dialog" {...dialog} />
      </>
    );
  };
  const { getByText, getByLabelText } = render(<Test />);
  const disclosure = getByText("disclosure");
  const dialog = getByLabelText("dialog");
  expect(document.body).toHaveFocus();
  fireEvent.click(disclosure);
  expect(dialog).toHaveFocus();
});

test("focus is trapped within the dialog", () => {
  const Test = () => {
    const dialog = useDialogState({ visible: true });
    return (
      <>
        <button>button1</button>
        <DialogDisclosure {...dialog}>disclosure</DialogDisclosure>
        <Dialog aria-label="dialog" {...dialog}>
          <button>button2</button>
          <button>button3</button>
        </Dialog>
        <button>button4</button>
      </>
    );
  };
  const { getByText, baseElement } = render(<Test />);
  const button2 = getByText("button2");
  const button3 = getByText("button3");
  expect(button2).toHaveFocus();

  act(() => focusNextTabbableIn(baseElement));
  expect(button3).toHaveFocus();
  act(() => focusNextTabbableIn(baseElement));
  expect(button2).toHaveFocus();

  act(() => focusPreviousTabbableIn(baseElement));
  expect(button3).toHaveFocus();
});

test("focus is trapped within the dialog when hideOnClickOutside is falsy", () => {
  const Test = () => {
    const dialog = useDialogState({ visible: true });
    return (
      <>
        <button>button1</button>
        <DialogDisclosure {...dialog}>disclosure</DialogDisclosure>
        <Dialog aria-label="dialog" hideOnClickOutside={false} {...dialog}>
          <button>button2</button>
          <button>button3</button>
        </Dialog>
        <button>button4</button>
      </>
    );
  };
  const { getByText, baseElement } = render(<Test />);
  const button2 = getByText("button2");
  const button3 = getByText("button3");
  expect(button2).toHaveFocus();

  act(() => focusNextTabbableIn(baseElement));
  expect(button3).toHaveFocus();
  act(() => focusNextTabbableIn(baseElement));
  expect(button2).toHaveFocus();

  act(() => focusPreviousTabbableIn(baseElement));
  expect(button3).toHaveFocus();
});

test("focus is trapped within an empty dialog", () => {
  const Test = () => {
    const dialog = useDialogState({ visible: true });
    return (
      <>
        <button>button1</button>
        <Dialog aria-label="dialog" {...dialog} />
        <button>button2</button>
      </>
    );
  };
  const { getByLabelText, baseElement } = render(<Test />);
  const dialog = getByLabelText("dialog");
  expect(dialog).toHaveFocus();

  act(() => focusNextTabbableIn(baseElement));
  expect(dialog).toHaveFocus();
  act(() => focusNextTabbableIn(baseElement));
  expect(dialog).toHaveFocus();

  act(() => focusPreviousTabbableIn(baseElement));
  expect(dialog).toHaveFocus();
});

test("focus is not trapped within the non-modal dialog", async () => {
  const Test = () => {
    const dialog = useDialogState({ visible: true });
    return (
      <>
        <button>button1</button>
        <DialogDisclosure {...dialog}>disclosure</DialogDisclosure>
        <Dialog
          aria-label="dialog"
          modal={false}
          hideOnClickOutside={false}
          {...dialog}
        >
          <button>button2</button>
          <button>button3</button>
        </Dialog>
        <button>button4</button>
      </>
    );
  };
  const { getByText, baseElement } = render(<Test />);
  const button1 = getByText("button1");
  const disclosure = getByText("disclosure");
  const button2 = getByText("button2");
  const button3 = getByText("button3");
  const button4 = getByText("button4");
  expect(button2).toHaveFocus();

  act(() => focusNextTabbableIn(baseElement));
  expect(button3).toHaveFocus();
  act(() => focusNextTabbableIn(baseElement));
  expect(button1).toHaveFocus();
  act(() => focusNextTabbableIn(baseElement));
  expect(disclosure).toHaveFocus();
  act(() => focusNextTabbableIn(baseElement));
  expect(button4).toHaveFocus();
  act(() => focusNextTabbableIn(baseElement));
  expect(button2).toHaveFocus();

  act(() => focusPreviousTabbableIn(baseElement));
  expect(button4).toHaveFocus();
});

test("esc closes the dialog", () => {
  const Test = () => {
    const dialog = useDialogState({ visible: true });
    return <Dialog aria-label="dialog" {...dialog} />;
  };
  const { getByLabelText } = render(<Test />);
  const dialog = getByLabelText("dialog");
  expect(dialog).toBeVisible();
  fireEvent.keyDown(dialog, { key: "Escape" });
  expect(dialog).not.toBeVisible();
});

test("esc does not close the dialog when hideOnEsc is falsy", () => {
  const Test = () => {
    const dialog = useDialogState({ visible: true });
    return <Dialog aria-label="dialog" hideOnEsc={false} {...dialog} />;
  };
  const { getByLabelText } = render(<Test />);
  const dialog = getByLabelText("dialog");
  expect(dialog).toBeVisible();
  fireEvent.keyDown(dialog, { key: "Escape" });
  expect(dialog).toBeVisible();
});

test("clicking outside closes the dialog", () => {
  const Test = () => {
    const dialog = useDialogState({ visible: true });
    return <Dialog aria-label="dialog" {...dialog} />;
  };
  const { getByLabelText, baseElement } = render(<Test />);
  const dialog = getByLabelText("dialog");
  expect(dialog).toBeVisible();
  fireEvent.click(baseElement);
  expect(dialog).not.toBeVisible();
});

test("clicking on disclosure closes the dialog", () => {
  const Test = () => {
    const dialog = useDialogState({ visible: true });
    return (
      <>
        <DialogDisclosure {...dialog}>disclosure</DialogDisclosure>
        <Dialog aria-label="dialog" {...dialog} />
      </>
    );
  };
  const { getByText, getByLabelText } = render(<Test />);
  const disclosure = getByText("disclosure");
  const dialog = getByLabelText("dialog");
  expect(dialog).toBeVisible();
  fireEvent.click(disclosure);
  expect(dialog).not.toBeVisible();
});

test("clicking outside does not close the dialog when hideOnClickOutside is falsy", () => {
  const Test = () => {
    const dialog = useDialogState({ visible: true });
    return (
      <Dialog aria-label="dialog" hideOnClickOutside={false} {...dialog} />
    );
  };
  const { getByLabelText, baseElement } = render(<Test />);
  const dialog = getByLabelText("dialog");
  expect(dialog).toBeVisible();
  fireEvent.click(baseElement);
  expect(dialog).toBeVisible();
});

test("clicking outside puts focus on the dialog when hideOnClickOutside is falsy", () => {
  const Test = () => {
    const dialog = useDialogState({ visible: true });
    return (
      <Dialog aria-label="dialog" hideOnClickOutside={false} {...dialog}>
        <button>button</button>
      </Dialog>
    );
  };
  const { getByLabelText, getByText, baseElement } = render(<Test />);
  const dialog = getByLabelText("dialog");
  const button = getByText("button");
  expect(button).toHaveFocus();
  act(() => button.blur());
  fireEvent.click(baseElement);
  expect(dialog).toHaveFocus();
});

test("focusing outside closes the non-modal dialog", () => {
  const Test = () => {
    const dialog = useDialogState({ visible: true });
    return (
      <>
        <button>button</button>
        <Dialog aria-label="dialog" modal={false} {...dialog} />
      </>
    );
  };
  const { getByText, getByLabelText } = render(<Test />);
  const button = getByText("button");
  const dialog = getByLabelText("dialog");
  expect(dialog).toBeVisible();
  act(() => button.focus());
  expect(button).toHaveFocus();
  expect(dialog).not.toBeVisible();
});

test("focusing outside does not close the non-modal dialog when hideOnClickOutside is falsy", () => {
  const Test = () => {
    const dialog = useDialogState({ visible: true });
    return (
      <>
        <button>button</button>
        <Dialog
          aria-label="dialog"
          modal={false}
          hideOnClickOutside={false}
          {...dialog}
        />
      </>
    );
  };
  const { getByText, getByLabelText } = render(<Test />);
  const button = getByText("button");
  const dialog = getByLabelText("dialog");
  expect(dialog).toBeVisible();
  act(() => button.focus());
  expect(button).toHaveFocus();
  expect(dialog).toBeVisible();
});

test("focusing disclosure does not close the non-modal dialog", () => {
  const Test = () => {
    const dialog = useDialogState({ visible: true });
    return (
      <>
        <DialogDisclosure {...dialog}>disclosure</DialogDisclosure>
        <Dialog aria-label="dialog" modal={false} {...dialog} />
      </>
    );
  };
  const { getByText, getByLabelText } = render(<Test />);
  const disclosure = getByText("disclosure");
  const dialog = getByLabelText("dialog");
  expect(dialog).toBeVisible();
  act(() => disclosure.focus());
  expect(disclosure).toHaveFocus();
  expect(dialog).toBeVisible();
});

test("focus disclosure when dialog closes", () => {
  const Test = () => {
    const dialog = useDialogState({ visible: true });
    return (
      <>
        <DialogDisclosure {...dialog}>disclosure</DialogDisclosure>
        <Dialog aria-label="dialog" {...dialog} />
      </>
    );
  };
  const { getByText, getByLabelText, baseElement } = render(<Test />);
  const disclosure = getByText("disclosure");
  const dialog = getByLabelText("dialog");
  fireEvent.click(baseElement);
  expect(dialog).not.toBeVisible();
  expect(disclosure).toHaveFocus();
});

test("focus disclosure when non-modal dialog closes", () => {
  const Test = () => {
    const dialog = useDialogState({ visible: true });
    return (
      <>
        <DialogDisclosure {...dialog}>disclosure</DialogDisclosure>
        <Dialog aria-label="dialog" modal={false} {...dialog} />
      </>
    );
  };
  const { getByText, getByLabelText, baseElement } = render(<Test />);
  const disclosure = getByText("disclosure");
  const dialog = getByLabelText("dialog");
  fireEvent.click(baseElement);
  expect(dialog).not.toBeVisible();
  expect(disclosure).toHaveFocus();
});

test("focus a given element when dialog closes", () => {
  const Test = () => {
    const ref = React.useRef<HTMLButtonElement>(null);
    const dialog = useDialogState({ visible: true });
    return (
      <>
        <button ref={ref}>button</button>
        <DialogDisclosure {...dialog}>disclosure</DialogDisclosure>
        <Dialog aria-label="dialog" finalFocusRef={ref} {...dialog} />
      </>
    );
  };
  const { getByText, getByLabelText, baseElement } = render(<Test />);
  const button = getByText("button");
  const dialog = getByLabelText("dialog");
  fireEvent.click(baseElement);
  expect(dialog).not.toBeVisible();
  expect(button).toHaveFocus();
});

test("focusing an element outside keeps focus on it after the non-modal dialog closes", () => {
  const Test = () => {
    const dialog = useDialogState({ visible: true });
    return (
      <>
        <button>button</button>
        <DialogDisclosure {...dialog}>disclosure</DialogDisclosure>
        <Dialog aria-label="dialog" modal={false} {...dialog} />
      </>
    );
  };
  const { getByText, getByLabelText } = render(<Test />);
  const button = getByText("button");
  const dialog = getByLabelText("dialog");
  act(() => button.focus());
  expect(dialog).not.toBeVisible();
  expect(button).toHaveFocus();
});

test("focus a given element when non-modal dialog closes", () => {
  const Test = () => {
    const ref = React.useRef<HTMLButtonElement>(null);
    const dialog = useDialogState({ visible: true });
    return (
      <>
        <button ref={ref}>button</button>
        <DialogDisclosure {...dialog}>disclosure</DialogDisclosure>
        <Dialog
          aria-label="dialog"
          modal={false}
          finalFocusRef={ref}
          {...dialog}
        />
      </>
    );
  };
  const { getByText, getByLabelText, baseElement } = render(<Test />);
  const button = getByText("button");
  const dialog = getByLabelText("dialog");
  fireEvent.click(baseElement);
  expect(dialog).not.toBeVisible();
  expect(button).toHaveFocus();
});

test("focus the first tabbable element when nested dialog opens", () => {
  const Test = () => {
    const dialog = useDialogState();
    const dialog2 = useDialogState();
    return (
      <>
        <DialogDisclosure {...dialog}>disclosure</DialogDisclosure>
        <Dialog aria-label="dialog1" {...dialog}>
          <button>button1</button>
          <DialogDisclosure {...dialog2}>disclosure2</DialogDisclosure>
          <Dialog aria-label="dialog2" {...dialog2}>
            <button>button2</button>
            <button>button3</button>
          </Dialog>
        </Dialog>
      </>
    );
  };
  const { getByText } = render(<Test />);
  const disclosure1 = getByText("disclosure");
  const disclosure2 = getByText("disclosure2");
  const button1 = getByText("button1");
  const button2 = getByText("button2");
  expect(document.body).toHaveFocus();
  fireEvent.click(disclosure1);
  expect(button1).toHaveFocus();
  fireEvent.click(disclosure2);
  expect(button2).toHaveFocus();
});

test("focus is trapped within the nested dialog", () => {
  const Test = () => {
    const dialog = useDialogState({ visible: true });
    const dialog2 = useDialogState({ visible: true });
    return (
      <>
        <button>button1</button>
        <DialogDisclosure {...dialog}>disclosure</DialogDisclosure>
        <Dialog aria-label="dialog1" {...dialog}>
          <button>button2</button>
          <DialogDisclosure {...dialog2}>disclosure2</DialogDisclosure>
          <Dialog aria-label="dialog2" {...dialog2}>
            <button>button3</button>
            <button>button4</button>
          </Dialog>
        </Dialog>
        <button>button5</button>
      </>
    );
  };
  const { getByText, baseElement } = render(<Test />);
  const button3 = getByText("button3");
  const button4 = getByText("button4");
  expect(button3).toHaveFocus();

  act(() => focusNextTabbableIn(baseElement));
  expect(button4).toHaveFocus();
  act(() => focusNextTabbableIn(baseElement));
  expect(button3).toHaveFocus();

  act(() => focusPreviousTabbableIn(baseElement));
  expect(button4).toHaveFocus();
});

test("focus is not trapped within the nested non-modal dialog", async () => {
  const Test = () => {
    const dialog = useDialogState({ visible: true });
    const dialog2 = useDialogState({ visible: true });
    return (
      <>
        <button>button1</button>
        <DialogDisclosure {...dialog}>disclosure1</DialogDisclosure>
        <Dialog aria-label="dialog1" {...dialog}>
          <button>button2</button>
          <DialogDisclosure {...dialog2}>disclosure2</DialogDisclosure>
          <Dialog
            aria-label="dialog2"
            modal={false}
            hideOnClickOutside={false}
            {...dialog2}
          >
            <button>button3</button>
            <button>button4</button>
          </Dialog>
          <button>button5</button>
        </Dialog>
        <button>button6</button>
      </>
    );
  };
  const { getByText, baseElement } = render(<Test />);
  const button2 = getByText("button2");
  const disclosure2 = getByText("disclosure2");
  const button3 = getByText("button3");
  const button4 = getByText("button4");
  const button5 = getByText("button5");
  expect(button3).toHaveFocus();

  act(() => focusNextTabbableIn(baseElement));
  expect(button4).toHaveFocus();
  act(() => focusNextTabbableIn(baseElement));
  expect(button2).toHaveFocus();
  act(() => focusNextTabbableIn(baseElement));
  expect(disclosure2).toHaveFocus();
  act(() => focusNextTabbableIn(baseElement));
  expect(button5).toHaveFocus();
  act(() => focusNextTabbableIn(baseElement));
  expect(button3).toHaveFocus();
  act(() => focusNextTabbableIn(baseElement));
  expect(button4).toHaveFocus();
  act(() => focusNextTabbableIn(baseElement));
  expect(button2).toHaveFocus();

  act(() => focusPreviousTabbableIn(baseElement));
  expect(button5).toHaveFocus();
});

test("focus is not trapped within two nested non-modal dialog", async () => {
  const Test = () => {
    const dialog = useDialogState({ visible: true });
    const dialog2 = useDialogState({ visible: true });
    return (
      <>
        <button>button1</button>
        <DialogDisclosure {...dialog}>disclosure</DialogDisclosure>
        <Dialog
          aria-label="dialog1"
          modal={false}
          hideOnClickOutside={false}
          {...dialog}
        >
          <button>button2</button>
          <DialogDisclosure {...dialog2}>disclosure2</DialogDisclosure>
          <Dialog
            aria-label="dialog2"
            modal={false}
            hideOnClickOutside={false}
            {...dialog2}
          >
            <button>button3</button>
            <button>button4</button>
          </Dialog>
          <button>button5</button>
        </Dialog>
        <button>button6</button>
      </>
    );
  };
  const { getByText, baseElement } = render(<Test />);
  const button1 = getByText("button1");
  const disclosure1 = getByText("disclosure");
  const button2 = getByText("button2");
  const disclosure2 = getByText("disclosure2");
  const button3 = getByText("button3");
  const button4 = getByText("button4");
  const button5 = getByText("button5");
  const button6 = getByText("button6");
  expect(button3).toHaveFocus();

  act(() => focusNextTabbableIn(baseElement));
  expect(button4).toHaveFocus();
  act(() => focusNextTabbableIn(baseElement));
  expect(button1).toHaveFocus();
  act(() => focusNextTabbableIn(baseElement));
  expect(disclosure1).toHaveFocus();
  act(() => focusNextTabbableIn(baseElement));
  expect(button6).toHaveFocus();
  act(() => focusNextTabbableIn(baseElement));
  expect(button2).toHaveFocus();
  act(() => focusNextTabbableIn(baseElement));
  expect(disclosure2).toHaveFocus();
  act(() => focusNextTabbableIn(baseElement));
  expect(button5).toHaveFocus();
  act(() => focusNextTabbableIn(baseElement));
  expect(button3).toHaveFocus();
  act(() => focusNextTabbableIn(baseElement));
  expect(button4).toHaveFocus();
  act(() => focusNextTabbableIn(baseElement));
  expect(button1).toHaveFocus();

  act(() => focusPreviousTabbableIn(baseElement));
  expect(button4).toHaveFocus();
});

test("clicking on the nested dialog does not close the parent dialog", () => {
  const Test = () => {
    const dialog = useDialogState({ visible: true });
    const dialog2 = useDialogState({ visible: true });
    return (
      <Dialog aria-label="dialog1" {...dialog}>
        <Dialog aria-label="dialog2" {...dialog2} />
      </Dialog>
    );
  };
  const { getByLabelText } = render(<Test />);
  const dialog1 = getByLabelText("dialog1");
  const dialog2 = getByLabelText("dialog2");
  expect(dialog2).toHaveFocus();
  expect(dialog1).toBeVisible();
  expect(dialog2).toBeVisible();
  fireEvent.click(dialog2);
  expect(dialog1).toBeVisible();
  expect(dialog2).toBeVisible();
});

test("clicking on the parent dialog closes the nested dialog", () => {
  const Test = () => {
    const dialog = useDialogState({ visible: true });
    const dialog2 = useDialogState({ visible: true });
    return (
      <Dialog aria-label="dialog1" {...dialog}>
        <Dialog aria-label="dialog2" {...dialog2} />
      </Dialog>
    );
  };
  const { getByLabelText } = render(<Test />);
  const dialog1 = getByLabelText("dialog1");
  const dialog2 = getByLabelText("dialog2");
  expect(dialog2).toHaveFocus();
  expect(dialog1).toBeVisible();
  expect(dialog2).toBeVisible();
  fireEvent.click(dialog1);
  expect(dialog1).toBeVisible();
  expect(dialog2).not.toBeVisible();
});

test("esc closes nested dialog, but not parent dialog", () => {
  const Test = () => {
    const dialog = useDialogState({ visible: true });
    const dialog2 = useDialogState({ visible: true });
    return (
      <Dialog aria-label="dialog1" {...dialog}>
        <Dialog aria-label="dialog2" {...dialog2} />
      </Dialog>
    );
  };
  const { getByLabelText } = render(<Test />);
  const dialog1 = getByLabelText("dialog1");
  const dialog2 = getByLabelText("dialog2");
  expect(dialog1).toBeVisible();
  expect(dialog2).toBeVisible();
  fireEvent.keyDown(dialog2, { key: "Escape" });
  expect(dialog1).toBeVisible();
  expect(dialog2).not.toBeVisible();
});

test("esc on parent dialog closes nested dialogs", () => {
  const Test = () => {
    const dialog = useDialogState({ visible: true });
    const dialog2 = useDialogState({ visible: true });
    return (
      <Dialog aria-label="dialog1" {...dialog}>
        <Dialog aria-label="dialog2" {...dialog2} />
      </Dialog>
    );
  };
  const { getByLabelText } = render(<Test />);
  const dialog1 = getByLabelText("dialog1");
  const dialog2 = getByLabelText("dialog2");
  expect(dialog1).toBeVisible();
  expect(dialog2).toBeVisible();
  fireEvent.keyDown(dialog1, { key: "Escape" });
  expect(dialog1).not.toBeVisible();
  expect(dialog2).not.toBeVisible();
});
