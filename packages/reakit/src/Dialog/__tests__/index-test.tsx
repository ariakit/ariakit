import * as React from "react";
import { render, fireEvent, act, wait } from "react-testing-library";
import {
  focusNextTabbableIn,
  focusPreviousTabbableIn
} from "../__utils/tabbable";
import { Dialog, DialogDisclosure, useDialogState } from "..";

test("clicking on disclosure opens the modal", () => {
  const Test = () => {
    const dialog = useDialogState();
    return (
      <>
        <DialogDisclosure {...dialog}>Disclosure</DialogDisclosure>
        <Dialog label="Dialog" {...dialog} />
      </>
    );
  };
  const { getByText, getByLabelText } = render(<Test />);
  const disclosure = getByText("Disclosure");
  const dialog = getByLabelText("Dialog");
  expect(dialog).toHaveAttribute("hidden");
  fireEvent.click(disclosure);
  expect(dialog).not.toHaveAttribute("hidden");
});

test("focus the first tabbable element when dialog opens", () => {
  const Test = () => {
    const dialog = useDialogState();
    return (
      <>
        <DialogDisclosure {...dialog}>Disclosure</DialogDisclosure>
        <Dialog label="Dialog" {...dialog}>
          <button>Button 1</button>
          <button>Button 2</button>
        </Dialog>
      </>
    );
  };
  const { getByText } = render(<Test />);
  const disclosure = getByText("Disclosure");
  const button1 = getByText("Button 1");
  expect(document.body).toHaveFocus();
  fireEvent.click(disclosure);
  expect(button1).toHaveFocus();
});

test("focus the first tabbable element when non-modal dialog opens", () => {
  const Test = () => {
    const dialog = useDialogState();
    return (
      <>
        <DialogDisclosure {...dialog}>Disclosure</DialogDisclosure>
        <Dialog label="Dialog" modal={false} {...dialog}>
          <button>Button 1</button>
          <button>Button 2</button>
        </Dialog>
      </>
    );
  };
  const { getByText } = render(<Test />);
  const disclosure = getByText("Disclosure");
  const button1 = getByText("Button 1");
  expect(document.body).toHaveFocus();
  fireEvent.click(disclosure);
  expect(button1).toHaveFocus();
});

test("focus a given element when dialog opens and focusOnShow is passed in", () => {
  const Test = () => {
    const dialog = useDialogState();
    const ref = React.useRef<HTMLButtonElement>(null);
    return (
      <>
        <DialogDisclosure {...dialog}>Disclosure</DialogDisclosure>
        <Dialog label="Dialog" unstable_focusOnShow={ref} {...dialog}>
          <button>Button 1</button>
          <button ref={ref}>Button 2</button>
        </Dialog>
      </>
    );
  };
  const { getByText } = render(<Test />);
  const disclosure = getByText("Disclosure");
  const button1 = getByText("Button 2");
  expect(document.body).toHaveFocus();
  fireEvent.click(disclosure);
  expect(button1).toHaveFocus();
});

test("focus dialog itself if there is no tabbable descendant element", () => {
  const Test = () => {
    const dialog = useDialogState();
    return (
      <>
        <DialogDisclosure {...dialog}>Disclosure</DialogDisclosure>
        <Dialog label="Dialog" {...dialog}>
          Dialog
        </Dialog>
      </>
    );
  };
  const { getByText } = render(<Test />);
  const disclosure = getByText("Disclosure");
  const dialog = getByText("Dialog");
  expect(document.body).toHaveFocus();
  fireEvent.click(disclosure);
  expect(dialog).toHaveFocus();
});

test("focus is trapped within the dialog", () => {
  const Test = () => {
    const dialog = useDialogState({ visible: true });
    return (
      <>
        <button>Button 1</button>
        <DialogDisclosure {...dialog}>Disclosure</DialogDisclosure>
        <Dialog label="Dialog" {...dialog}>
          <button>Button 2</button>
          <button>Button 3</button>
        </Dialog>
        <button>Button 4</button>
      </>
    );
  };
  const { getByText, baseElement } = render(<Test />);
  const button2 = getByText("Button 2");
  const button3 = getByText("Button 3");
  expect(button2).toHaveFocus();

  act(() => focusNextTabbableIn(baseElement));
  expect(button3).toHaveFocus();
  act(() => focusNextTabbableIn(baseElement));
  expect(button2).toHaveFocus();

  act(() => focusPreviousTabbableIn(baseElement));
  expect(button3).toHaveFocus();
});

test("focus is not trapped within the non-modal dialog", async () => {
  const Test = () => {
    const dialog = useDialogState({ visible: true });
    return (
      <>
        <button>Button 1</button>
        <DialogDisclosure {...dialog}>Disclosure</DialogDisclosure>
        <Dialog
          label="Dialog"
          modal={false}
          hideOnClickOutside={false}
          {...dialog}
        >
          <button>Button 2</button>
          <button>Button 3</button>
        </Dialog>
        <button>Button 4</button>
      </>
    );
  };
  const { getByText, baseElement } = render(<Test />);
  const button1 = getByText("Button 1");
  const disclosure = getByText("Disclosure");
  const button2 = getByText("Button 2");
  const button3 = getByText("Button 3");
  const button4 = getByText("Button 4");
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
    return <Dialog label="Dialog" {...dialog} />;
  };
  const { getByLabelText } = render(<Test />);
  const dialog = getByLabelText("Dialog");
  expect(dialog).not.toHaveAttribute("hidden");
  fireEvent.keyDown(dialog, { key: "Escape" });
  expect(dialog).toHaveAttribute("hidden");
});

test("esc does not close the dialog when hideOnEsc is falsy", () => {
  const Test = () => {
    const dialog = useDialogState({ visible: true });
    return <Dialog label="Dialog" hideOnEsc={false} {...dialog} />;
  };
  const { getByLabelText } = render(<Test />);
  const dialog = getByLabelText("Dialog");
  expect(dialog).not.toHaveAttribute("hidden");
  fireEvent.keyDown(dialog, { key: "Escape" });
  expect(dialog).not.toHaveAttribute("hidden");
});

test("clicling outside closes the dialog", () => {
  const Test = () => {
    const dialog = useDialogState({ visible: true });
    return <Dialog label="Dialog" {...dialog} />;
  };
  const { getByLabelText, baseElement } = render(<Test />);
  const dialog = getByLabelText("Dialog");
  expect(dialog).not.toHaveAttribute("hidden");
  fireEvent.click(baseElement);
  expect(dialog).toHaveAttribute("hidden");
});

test("clicking on disclosure closes the dialog", () => {
  const Test = () => {
    const dialog = useDialogState({ visible: true });
    return (
      <>
        <DialogDisclosure {...dialog}>Disclosure</DialogDisclosure>
        <Dialog label="Dialog" {...dialog} />
      </>
    );
  };
  const { getByText, getByLabelText } = render(<Test />);
  const disclosure = getByText("Disclosure");
  const dialog = getByLabelText("Dialog");
  expect(dialog).not.toHaveAttribute("hidden");
  fireEvent.click(disclosure);
  expect(dialog).toHaveAttribute("hidden");
});

test("clicking outside does not close the dialog when hideOnClickOutside is falsy", () => {
  const Test = () => {
    const dialog = useDialogState({ visible: true });
    return <Dialog label="Dialog" hideOnClickOutside={false} {...dialog} />;
  };
  const { getByLabelText, baseElement } = render(<Test />);
  const dialog = getByLabelText("Dialog");
  expect(dialog).not.toHaveAttribute("hidden");
  fireEvent.click(baseElement);
  expect(dialog).not.toHaveAttribute("hidden");
});

test.skip("clicking outside puts focus on the dialog when hideOnClickOutside is falsy", async () => {
  const Test = () => {
    const dialog = useDialogState({ visible: true });
    return (
      <Dialog label="Dialog" hideOnClickOutside={false} {...dialog}>
        <button>Button</button>
      </Dialog>
    );
  };
  const { getByLabelText, getByText } = render(<Test />);
  const dialog = getByLabelText("Dialog");
  const button = getByText("Button");
  expect(button).toHaveFocus();
  act(() => button.blur());
  await wait(() => expect(dialog).toHaveFocus());
});

test.todo("focusing outside closes the non-modal dialog");

test("focusing disclosure does not close the non-modal dialog", () => {
  const Test = () => {
    const dialog = useDialogState({ visible: true });
    return (
      <>
        <DialogDisclosure {...dialog}>Disclosure</DialogDisclosure>
        <Dialog label="Dialog" modal={false} {...dialog} />
      </>
    );
  };
  const { getByText, getByLabelText } = render(<Test />);
  const disclosure = getByText("Disclosure");
  const dialog = getByLabelText("Dialog");
  expect(dialog).not.toHaveAttribute("hidden");
  act(() => disclosure.focus());
  expect(disclosure).toHaveFocus();
  expect(dialog).not.toHaveAttribute("hidden");
});

test.todo(
  "focusing outside does not close the non-modal dialog when hideOnClickOutside is falsy"
);

test.todo("focus disclosure when dialog closes");

test.todo("focus a given element when dialog closes");

test("focus the first tabbable element when nested dialog opens", () => {
  const Test = () => {
    const dialog = useDialogState();
    const dialog2 = useDialogState();
    return (
      <>
        <DialogDisclosure {...dialog}>Disclosure 1</DialogDisclosure>
        <Dialog label="Dialog 1" {...dialog}>
          <button>Button 1</button>
          <DialogDisclosure {...dialog2}>Disclosure 2</DialogDisclosure>
          <Dialog label="Dialog 2" {...dialog2}>
            <button>Button 2</button>
            <button>Button 3</button>
          </Dialog>
        </Dialog>
      </>
    );
  };
  const { getByText } = render(<Test />);
  const disclosure1 = getByText("Disclosure 1");
  const disclosure2 = getByText("Disclosure 2");
  const button1 = getByText("Button 1");
  const button2 = getByText("Button 2");
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
        <button>Button 1</button>
        <DialogDisclosure {...dialog}>Disclosure 1</DialogDisclosure>
        <Dialog label="Dialog 1" {...dialog}>
          <button>Button 2</button>
          <DialogDisclosure {...dialog2}>Disclosure 2</DialogDisclosure>
          <Dialog label="Dialog 2" {...dialog2}>
            <button>Button 3</button>
            <button>Button 4</button>
          </Dialog>
        </Dialog>
        <button>Button 5</button>
      </>
    );
  };
  const { getByText, baseElement } = render(<Test />);
  const button3 = getByText("Button 3");
  const button4 = getByText("Button 4");
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
        <button>Button 1</button>
        <DialogDisclosure {...dialog}>Disclosure 1</DialogDisclosure>
        <Dialog label="Dialog 1" {...dialog}>
          <button>Button 2</button>
          <DialogDisclosure {...dialog2}>Disclosure 2</DialogDisclosure>
          <Dialog
            label="Dialog 2"
            modal={false}
            hideOnClickOutside={false}
            {...dialog2}
          >
            <button>Button 3</button>
            <button>Button 4</button>
          </Dialog>
          <button>Button 5</button>
        </Dialog>
        <button>Button 6</button>
      </>
    );
  };
  const { getByText, baseElement } = render(<Test />);
  const button2 = getByText("Button 2");
  const disclosure2 = getByText("Disclosure 2");
  const button3 = getByText("Button 3");
  const button4 = getByText("Button 4");
  const button5 = getByText("Button 5");
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

  act(() => focusPreviousTabbableIn(baseElement));
  expect(button5).toHaveFocus();
});

test("focus is not trapped within two nested non-modal dialog", async () => {
  const Test = () => {
    const dialog = useDialogState({ visible: true });
    const dialog2 = useDialogState({ visible: true });
    return (
      <>
        <button>Button 1</button>
        <DialogDisclosure {...dialog}>Disclosure 1</DialogDisclosure>
        <Dialog
          label="Dialog 1"
          modal={false}
          hideOnClickOutside={false}
          {...dialog}
        >
          <button>Button 2</button>
          <DialogDisclosure {...dialog2}>Disclosure 2</DialogDisclosure>
          <Dialog
            label="Dialog 2"
            modal={false}
            hideOnClickOutside={false}
            {...dialog2}
          >
            <button>Button 3</button>
            <button>Button 4</button>
          </Dialog>
          <button>Button 5</button>
        </Dialog>
        <button>Button 6</button>
      </>
    );
  };
  const { getByText, baseElement } = render(<Test />);
  const button1 = getByText("Button 1");
  const disclosure1 = getByText("Disclosure 1");
  const button2 = getByText("Button 2");
  const disclosure2 = getByText("Disclosure 2");
  const button3 = getByText("Button 3");
  const button4 = getByText("Button 4");
  const button5 = getByText("Button 5");
  const button6 = getByText("Button 6");
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
      <Dialog label="Dialog 1" {...dialog}>
        <Dialog label="Dialog 2" {...dialog2} />
      </Dialog>
    );
  };
  const { getByLabelText } = render(<Test />);
  const dialog1 = getByLabelText("Dialog 1");
  const dialog2 = getByLabelText("Dialog 2");
  expect(dialog2).toHaveFocus();
  expect(dialog1).not.toHaveAttribute("hidden");
  expect(dialog2).not.toHaveAttribute("hidden");
  fireEvent.click(dialog2);
  expect(dialog1).not.toHaveAttribute("hidden");
  expect(dialog2).not.toHaveAttribute("hidden");
});

test("clicking on the parent dialog closes the nested dialog", () => {
  const Test = () => {
    const dialog = useDialogState({ visible: true });
    const dialog2 = useDialogState({ visible: true });
    return (
      <Dialog label="Dialog 1" {...dialog}>
        <Dialog label="Dialog 2" {...dialog2} />
      </Dialog>
    );
  };
  const { getByLabelText } = render(<Test />);
  const dialog1 = getByLabelText("Dialog 1");
  const dialog2 = getByLabelText("Dialog 2");
  expect(dialog2).toHaveFocus();
  expect(dialog1).not.toHaveAttribute("hidden");
  expect(dialog2).not.toHaveAttribute("hidden");
  fireEvent.click(dialog1);
  expect(dialog1).not.toHaveAttribute("hidden");
  expect(dialog2).toHaveAttribute("hidden");
});

test("esc closes nested dialog, but not parent dialog", () => {
  const Test = () => {
    const dialog = useDialogState({ visible: true });
    const dialog2 = useDialogState({ visible: true });
    return (
      <Dialog label="Dialog 1" {...dialog}>
        <Dialog label="Dialog 2" {...dialog2} />
      </Dialog>
    );
  };
  const { getByLabelText } = render(<Test />);
  const dialog1 = getByLabelText("Dialog 1");
  const dialog2 = getByLabelText("Dialog 2");
  expect(dialog1).not.toHaveAttribute("hidden");
  expect(dialog2).not.toHaveAttribute("hidden");
  fireEvent.keyDown(dialog2, { key: "Escape" });
  expect(dialog1).not.toHaveAttribute("hidden");
  expect(dialog2).toHaveAttribute("hidden");
});

test("esc on parent dialog closes nested dialogs", () => {
  const Test = () => {
    const dialog = useDialogState({ visible: true });
    const dialog2 = useDialogState({ visible: true });
    return (
      <Dialog label="Dialog 1" {...dialog}>
        <Dialog label="Dialog 2" {...dialog2} />
      </Dialog>
    );
  };
  const { getByLabelText } = render(<Test />);
  const dialog1 = getByLabelText("Dialog 1");
  const dialog2 = getByLabelText("Dialog 2");
  expect(dialog1).not.toHaveAttribute("hidden");
  expect(dialog2).not.toHaveAttribute("hidden");
  fireEvent.keyDown(dialog1, { key: "Escape" });
  expect(dialog1).toHaveAttribute("hidden");
  expect(dialog2).toHaveAttribute("hidden");
});
