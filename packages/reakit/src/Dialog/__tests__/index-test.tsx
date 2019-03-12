import * as React from "react";
import { render, fireEvent } from "react-testing-library";
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
  // TODO
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

test("focus dialog itself if there's no tabbable descendant element", () => {
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

test.todo("focus is trapped within the dialog");

test.todo("focus isn't trapped within the non-modal dialog");

test.todo("scrolling inside the dialog works");

test.todo("scrolling page doesn't work");

test.todo("scrolling page works when preventScroll is falsy");

test.todo("focus the first tabbable element when nested dialog opens");

test.todo("esc closes the dialog");

test.todo("esc doesn't close the dialog when hideOnEsc is falsy");

test.todo("clicling outside closes the dialog");

test.todo(
  "clicking outside doesn't close the dialog when hideOnClickOutside is falsy"
);

test.todo("focusing outside closes the non-modal dialog");

test.todo(
  "focusing outside doesn't close the non-modal dialog when hideOnClickOutside is falsy"
);

test.todo("focus disclosure when dialog closes");

test.todo("focus a given element when dialog closes");
