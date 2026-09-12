import { click, q } from "@ariakit/test";
import { expect, test } from "vitest";

test("keeps a decorative default check when the custom icon is false", async () => {
  await click(q.combobox("Notifications"));
  const email = q.option("Email");
  const sms = q.option("SMS");
  expect(email.firstElementChild).toHaveAttribute("aria-hidden", "true");
  expect(sms.firstElementChild).toHaveAttribute("aria-hidden", "true");
  expect(sms.querySelector("svg")).not.toBeInTheDocument();
  await click(sms);
  expect(sms).toHaveAttribute("aria-selected", "true");
  expect(sms.querySelector("svg")).toBeInTheDocument();
  await click(email);
  expect(email).toHaveAttribute("aria-selected", "false");
  expect(email.querySelector("svg")).not.toBeInTheDocument();
  expect(q.combobox("Notifications")).toHaveTextContent("SMS");
});
