import * as React from "react";
import { object, string } from "yup";
import {
  unstable_useFormState as useFormState,
  unstable_Form as Form,
  unstable_FormMessage as FormMessage,
  unstable_FormLabel as FormLabel,
  unstable_FormInput as FormInput,
  unstable_FormSubmitButton as FormSubmitButton,
} from "reakit";
import { unstable_setIn } from "reakit/Form/utils/setIn";
import { css } from "emotion";
import Paragraph from "./Paragraph";
import Anchor from "./Anchor";

const schema = object({
  "member[email]": string()
    .email("Please, provide a valid email address")
    .required("Email is required"),
  "member[first_name]": string(),
});

export default function NewsletterForm() {
  const form = useFormState({
    resetOnSubmitSucceed: false,
    resetOnUnmount: false,
    validateOnBlur: true,
    values: {
      _: "",
      "member[email]": "",
      "member[first_name]": "",
    },
    onValidate: async (values) => {
      try {
        await schema.validate(values, { abortEarly: false });
      } catch (e) {
        if (e.inner.length) {
          throw e.inner.reduce(
            (acc: any, curr: any) =>
              unstable_setIn(acc, curr.path, curr.message),
            {}
          );
        }
      }
    },
  });
  return (
    <>
      <Paragraph
        className={css`
          margin: 0;
        `}
      >
        Receive important updates and tips about Reakit and React ecosystem
        directly in your inbox.
      </Paragraph>
      <Paragraph
        className={css`
          margin: 0 0 32px;
        `}
      >
        Past emails include <strong>Enzyme vs. @testing-library/react</strong>,{" "}
        <strong>TypeScript</strong> and others.
      </Paragraph>
      {form.submitSucceed ? (
        <FormMessage
          {...form}
          name="_"
          className={css`
            font-size: 1em;
          `}
        />
      ) : (
        <>
          <FormMessage {...form} name="_" />
          <Form {...form}>
            {({ onSubmit, ...formProps }) => (
              <form
                {...formProps}
                action="https://www.getrevue.co/profile/diegohaz/add_subscriber"
                method="post"
                target="_blank"
              >
                <div>
                  <FormLabel {...form} name="member[first_name]">
                    First name
                  </FormLabel>
                  <FormInput {...form} name="member[first_name]" />
                  <FormMessage {...form} name="member[first_name]" />
                </div>
                <div>
                  <FormLabel {...form} name="member[email]">
                    Email
                  </FormLabel>
                  <FormInput {...form} name="member[email]" type="email" />
                  <FormMessage {...form} name="member[email]" />
                </div>
                <FormSubmitButton {...form}>Subscribe</FormSubmitButton>
              </form>
            )}
          </Form>
        </>
      )}
      <Paragraph
        className={css`
          font-size: 0.875em;
          margin-top: 1.5em;
        `}
      >
        Emails will be sent by{" "}
        <Anchor
          target="_blank"
          rel="noreferrer"
          href="https://twitter.com/diegohaz"
        >
          Diego Haz
        </Anchor>
        , and you can unsubscribe at any time. By subscribing, you agree with
        Revue’s{" "}
        <Anchor
          target="_blank"
          rel="noreferrer"
          href="https://www.getrevue.co/terms"
        >
          Terms of Service
        </Anchor>{" "}
        and{" "}
        <Anchor
          target="_blank"
          rel="noreferrer"
          href="https://www.getrevue.co/privacy"
        >
          Privacy Policy
        </Anchor>
        .
      </Paragraph>
    </>
  );
}
