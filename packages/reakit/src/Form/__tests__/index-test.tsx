import * as React from "react";
import { act, fireEvent, render, wait } from "@testing-library/react";
import {
  unstable_Form as Form,
  unstable_FormCheckbox as FormCheckbox,
  unstable_FormGroup as FormGroup,
  unstable_FormInput as FormInput,
  unstable_FormLabel as FormLabel,
  unstable_FormMessage as FormMessage,
  unstable_FormRadio as FormRadio,
  unstable_FormSubmitButton as FormSubmitButton,
  unstable_FormRemoveButton as FormRemoveButton,
  unstable_FormPushButton as FormPushButton,
  unstable_useFormState as useFormState,
  unstable_FormRadioGroup as FormRadioGroup
} from "..";

function keyDown(key: string) {
  fireEvent.keyDown(document.activeElement!, { key });
}

test("validate on change", async () => {
  const onValidate = jest.fn();
  const Test = () => {
    const form = useFormState({ onValidate });
    return (
      <Form {...form}>
        <FormLabel {...form} name="input" label="input" />
        <FormInput {...form} name="input" />
      </Form>
    );
  };
  const { getByLabelText } = render(<Test />);
  const input = getByLabelText("input");
  expect(onValidate).not.toHaveBeenCalled();
  fireEvent.change(input, { target: { value: "a" } });
  await wait(() => expect(onValidate).toHaveBeenCalledWith({ input: "a" }));
});

test("validate on blur", async () => {
  const onValidate = jest.fn();
  const Test = () => {
    const form = useFormState({ onValidate });
    return (
      <Form {...form}>
        <FormLabel {...form} name="input" label="input" />
        <FormInput {...form} name="input" />
      </Form>
    );
  };
  const { getByLabelText } = render(<Test />);
  const input = getByLabelText("input");
  expect(onValidate).not.toHaveBeenCalled();
  fireEvent.blur(input);
  await wait(() => expect(onValidate).toHaveBeenCalledWith({}));
});

test("display validation error", async () => {
  const Test = () => {
    const form = useFormState({
      values: {
        input: ""
      },
      onValidate: values => {
        if (!values.input) {
          const error = { input: "required" };
          throw error;
        }
      }
    });
    return (
      <Form {...form}>
        <FormLabel {...form} name="input" label="input" />
        <FormInput {...form} name="input" />
        <FormMessage {...form} name="input" data-testid="error" />
      </Form>
    );
  };
  const { getByLabelText, getByTestId } = render(<Test />);
  const input = getByLabelText("input");
  const error = getByTestId("error");
  expect(error).toBeEmpty();
  fireEvent.blur(input);
  await wait(() => expect(error).toHaveTextContent("required"));
});

test("display validation message", async () => {
  const Test = () => {
    const form = useFormState({
      values: {
        input: ""
      },
      onValidate: values => {
        if (values.input) {
          return { input: "nice" };
        }
        return {};
      }
    });
    return (
      <Form {...form}>
        <FormLabel {...form} name="input" label="input" />
        <FormInput {...form} name="input" />
        <FormMessage {...form} name="input" data-testid="message" />
      </Form>
    );
  };
  const { getByLabelText, getByTestId } = render(<Test />);
  const input = getByLabelText("input");
  const message = getByTestId("message");
  expect(message).toBeEmpty();
  fireEvent.change(input, { target: { value: "a" } });
  expect(message).toBeEmpty();
  fireEvent.blur(input);
  await wait(() => expect(message).toHaveTextContent("nice"));
});

test("display submission error", async () => {
  const Test = () => {
    const form = useFormState({
      values: {
        a: {
          b: {
            c: ["d", "e", "f"]
          }
        }
      },
      onSubmit: values => {
        if (values.a.b.c[1] === "e") {
          const error = {
            a: {
              b: {
                c: [null, "error"]
              }
            }
          };
          throw error;
        }
      }
    });
    return (
      <Form {...form}>
        <FormLabel {...form} name={["a", "b", "c", 1]} label="input" />
        <FormInput {...form} name={["a", "b", "c", 1]} />
        <FormMessage {...form} name={["a", "b", "c", 1]} data-testid="error" />
      </Form>
    );
  };
  const { getByRole, getByTestId } = render(<Test />);
  const form = getByRole("form");
  const error = getByTestId("error");
  expect(error).toBeEmpty();
  fireEvent.submit(form);
  await wait(() => expect(error).toHaveTextContent("error"));
});

test("display submission message", async () => {
  const Test = () => {
    const form = useFormState({
      values: {
        a: {
          b: {
            c: ["d", "e", "f"]
          }
        }
      },
      onSubmit: values => {
        if (values.a.b.c[1] === "e") {
          return {
            a: {
              b: {
                c: [null, "nice"]
              }
            }
          };
        }
        return {};
      }
    });
    return (
      <Form {...form}>
        <FormLabel {...form} name={["a", "b", "c", 1]} label="input" />
        <FormInput {...form} name={["a", "b", "c", 1]} />
        <FormMessage
          {...form}
          name={["a", "b", "c", 1]}
          data-testid="message"
        />
      </Form>
    );
  };
  const { getByRole, getByTestId } = render(<Test />);
  const form = getByRole("form");
  const message = getByTestId("message");
  expect(message).toBeEmpty();
  fireEvent.submit(form);
  await wait(() => expect(message).toHaveTextContent("nice"));
});

test("display group error", async () => {
  const Test = () => {
    const form = useFormState({
      values: {
        input: ["a"] as Array<"a" | "b" | "c">
      },
      onValidate: values => {
        if (values.input.length <= 1) {
          const error = { input: "error" };
          throw error;
        }
      }
    });
    return (
      <Form {...form}>
        <FormGroup {...form} name="input">
          <label>
            <FormCheckbox {...form} name="input" value="a" />a
          </label>
          <label>
            <FormCheckbox {...form} name="input" value="b" />b
          </label>
          <label>
            <FormCheckbox {...form} name="input" value="c" />c
          </label>
        </FormGroup>
        <FormMessage {...form} name="input" data-testid="error" />
      </Form>
    );
  };
  const { getByRole, getByTestId, getByLabelText } = render(<Test />);
  const form = getByRole("form");
  const error = getByTestId("error");
  const a = getByLabelText("a");
  const b = getByLabelText("b");
  expect(error).toBeEmpty();
  fireEvent.submit(form);
  await wait(() => expect(error).toHaveTextContent("error"));
  fireEvent.click(b);
  await wait(expect(error).toBeEmpty);
  fireEvent.click(a);
  await wait(() => expect(error).toHaveTextContent("error"));
});

test("display group message", async () => {
  const Test = () => {
    const form = useFormState({
      values: {
        input: false
      },
      onSubmit: values => {
        if (!values.input) {
          return { input: "nice" };
        }
        return {};
      }
    });
    return (
      <Form {...form}>
        <FormGroup {...form} name="input">
          <label>
            <FormCheckbox {...form} name="input" />
            checkbox
          </label>
        </FormGroup>
        <FormMessage {...form} name="input" data-testid="message" />
      </Form>
    );
  };
  const { getByRole, getByLabelText, getByTestId } = render(<Test />);
  const form = getByRole("form");
  const checkbox = getByLabelText("checkbox") as HTMLInputElement;
  const message = getByTestId("message");
  expect(message).toBeEmpty();
  fireEvent.submit(form);
  await wait(() => expect(message).toHaveTextContent("nice"));
  expect(checkbox.checked).toBe(false);
  fireEvent.click(checkbox);
  expect(checkbox.checked).toBe(true);
  fireEvent.submit(form);
  await wait(expect(message).toBeEmpty);
});

test("focus the first invalid input on failed submit", async () => {
  const Test = () => {
    const form = useFormState({
      values: {
        input1: "",
        input2: "",
        input3: ""
      },
      onValidate: values => {
        if (!values.input2) {
          const error = { input2: "error" };
          throw error;
        }
      }
    });
    return (
      <Form {...form}>
        <FormLabel {...form} name="input1" label="input1" />
        <FormInput {...form} name="input1" />
        <FormLabel {...form} name="input2" label="input2" />
        <FormInput {...form} name="input2" />
        <FormLabel {...form} name="input3" label="input3" />
        <FormInput {...form} name="input3" />
        <FormSubmitButton {...form} data-testid="submit" />
      </Form>
    );
  };
  const { getByLabelText, getByTestId } = render(<Test />);
  const input2 = getByLabelText("input2");
  const submit = getByTestId("submit");
  expect(input2).not.toHaveFocus();
  fireEvent.click(submit);
  await wait(expect(input2).toHaveFocus);
});

test("focus the first invalid fieldset on failed submit", async () => {
  const Test = () => {
    const form = useFormState({
      values: {
        input1: "",
        choice1: "",
        choice2: ""
      },
      onValidate: () => {
        const error = { choice1: "error", choice2: "error" };
        throw error;
      }
    });
    return (
      <Form {...form}>
        <FormLabel {...form} name="input1" label="input1" />
        <FormInput {...form} name="input1" />
        <FormRadioGroup {...form} name="choice1">
          <FormLabel {...form} as="legend" name="choice1" label="choice1" />
          <label>
            <FormRadio {...form} name="choice1" value="a" />a
          </label>
          <label>
            <FormRadio {...form} name="choice1" value="b" />b
          </label>
        </FormRadioGroup>
        <FormLabel {...form} name="choice2" label="choice2" />
        <FormInput {...form} name="choice2" />
        <FormSubmitButton {...form} data-testid="submit" />
      </Form>
    );
  };
  const { getByLabelText, getByTestId } = render(<Test />);
  const choice1 = getByLabelText("choice1");
  const submit = getByTestId("submit");
  expect(choice1).not.toHaveFocus();
  fireEvent.click(submit);
  await wait(expect(choice1).toHaveFocus);
});

test("arrow keys control radio buttons", async () => {
  const Test = () => {
    const form = useFormState({
      values: {
        input: "a"
      }
    });
    return (
      <Form {...form}>
        <FormRadioGroup {...form} name="input">
          <label>
            <FormRadio {...form} name="input" value="a" />a
          </label>
          <label>
            <FormRadio {...form} name="input" value="b" />b
          </label>
          <label>
            <FormRadio {...form} name="input" value="c" />c
          </label>
        </FormRadioGroup>
      </Form>
    );
  };
  const { getByLabelText } = render(<Test />);
  const a = getByLabelText("a") as HTMLInputElement;
  const b = getByLabelText("b") as HTMLInputElement;
  const c = getByLabelText("c") as HTMLInputElement;

  act(() => b.focus());
  expect(b).toHaveFocus();
  expect(b.checked).toBe(true);

  keyDown("ArrowDown");
  expect(c).toHaveFocus();
  expect(c.checked).toBe(true);

  keyDown("ArrowDown");
  expect(a).toHaveFocus();
  expect(a.checked).toBe(true);

  keyDown("ArrowUp");
  expect(c).toHaveFocus();
  expect(c.checked).toBe(true);

  keyDown("ArrowLeft");
  expect(b).toHaveFocus();
  expect(b.checked).toBe(true);

  keyDown("ArrowRight");
  expect(c).toHaveFocus();
  expect(c.checked).toBe(true);
});

test("push/remove button adds/removes entry and moves focus", async () => {
  const Test = () => {
    const form = useFormState({
      baseId: "form",
      values: {
        people: [] as Array<{ name: string; email: string }>
      }
    });
    return (
      <Form {...form}>
        {form.values.people.map((_, i) => (
          <React.Fragment key={i}>
            <FormInput
              {...form}
              placeholder={`name${i}`}
              name={["people", i, "name"]}
            />
            <FormInput
              {...form}
              placeholder={`email${i}`}
              name={["people", i, "email"]}
            />
            <FormRemoveButton
              {...form}
              data-testid={`remove${i}`}
              name="people"
              index={i}
            />
          </React.Fragment>
        ))}
        <FormPushButton
          {...form}
          data-testid="push"
          name="people"
          value={{ name: "", email: "" }}
        />
      </Form>
    );
  };
  const { getByTestId, getByPlaceholderText, baseElement } = render(<Test />);
  const push = getByTestId("push");

  expect(baseElement).toMatchInlineSnapshot(`
    <body>
      <div>
        <form
          novalidate=""
          role="form"
        >
          <button
            data-testid="push"
            id="form-people-push"
            tabindex="0"
            type="button"
          />
        </form>
      </div>
    </body>
  `);

  fireEvent.click(push);

  expect(baseElement).toMatchInlineSnapshot(`
    <body>
      <div>
        <form
          novalidate=""
          role="form"
        >
          <input
            aria-describedby="form-people-0-name-message"
            aria-invalid="false"
            aria-labelledby="form-people-0-name-label"
            id="form-people-0-name"
            name="people.0.name"
            placeholder="name0"
            tabindex="0"
            value=""
          />
          <input
            aria-describedby="form-people-0-email-message"
            aria-invalid="false"
            aria-labelledby="form-people-0-email-label"
            id="form-people-0-email"
            name="people.0.email"
            placeholder="email0"
            tabindex="0"
            value=""
          />
          <button
            data-testid="remove0"
            tabindex="0"
            type="button"
          />
          <button
            data-testid="push"
            id="form-people-push"
            tabindex="0"
            type="button"
          />
        </form>
      </div>
    </body>
  `);

  await wait(expect(getByPlaceholderText("name0")).toHaveFocus);

  fireEvent.click(push);
  await wait(expect(getByPlaceholderText("name1")).toHaveFocus);

  fireEvent.click(push);
  await wait(expect(getByPlaceholderText("name2")).toHaveFocus);

  const remove0 = getByTestId("remove0");
  const remove1 = getByTestId("remove1");
  const remove2 = getByTestId("remove2");

  fireEvent.click(remove0);
  await wait(expect(getByPlaceholderText("name1")).toHaveFocus);

  fireEvent.click(remove2);
  await wait(expect(getByPlaceholderText("name1")).toHaveFocus);

  fireEvent.click(remove1);
  await wait(expect(push).toHaveFocus);
});
