import * as React from "react";
import fetchJsonp from "fetch-jsonp";
import { object, string } from "yup";
import toPath from "lodash/toPath";
import { stringify } from "qs";
import {
  unstable_useFormState as useFormState,
  unstable_Form as Form,
  unstable_FormMessage as FormMessage,
  unstable_FormLabel as FormLabel,
  unstable_FormInput as FormInput,
  unstable_FormSubmitButton as FormSubmitButton
} from "reakit";
import { unstable_setIn } from "reakit/Form/utils/setIn";
import { css } from "emotion";
import Paragraph from "./Paragraph";
import Anchor from "./Anchor";

const schema = object({
  EMAIL: string()
    .email("Please, provide a valid email address")
    .required("Email is required"),
  FNAME: string()
});

export default function NewsletterForm() {
  const form = useFormState({
    resetOnSubmitSucceed: false,
    resetOnUnmount: false,
    values: {
      _: "",
      EMAIL: "",
      FNAME: ""
    },
    onValidate: async values => {
      try {
        await schema.validate(values, { abortEarly: false });
      } catch (e) {
        if (e.inner.length) {
          throw e.inner.reduce(
            (acc: any, curr: any) =>
              unstable_setIn(acc, toPath(curr.path), curr.message),
            {}
          );
        }
      }
    },
    onSubmit: async ({ EMAIL, FNAME }) => {
      const res = await fetchJsonp(
        `https://reakit.us18.list-manage.com/subscribe/post-json?u=cf382e48d5d8ed7178cb22060&amp;id=941e41af27&${stringify(
          { EMAIL, FNAME }
        )}`,
        {
          jsonpCallback: "c"
        }
      );
      const json = await res.json();
      const result = {
        _: json.msg.replace(/^\d - /, "").replace(/ <a.+$/, "")
      };
      if (json.result === "error") {
        throw result;
      }
      return result;
    }
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
            <div>
              <FormLabel {...form} name="FNAME">
                First name
              </FormLabel>
              <FormInput {...form} name="FNAME" />
              <FormMessage {...form} name="FNAME" />
            </div>
            <div>
              <FormLabel {...form} name="EMAIL">
                Email
              </FormLabel>
              <FormInput {...form} name="EMAIL" type="email" />
              <FormMessage {...form} name="EMAIL" />
            </div>
            <FormSubmitButton {...form}>Subscribe</FormSubmitButton>
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
        <Anchor href="https://twitter.com/diegohaz">Diego Haz</Anchor>, and you
        can unsubscribe at any time.
      </Paragraph>
    </>
  );
}
