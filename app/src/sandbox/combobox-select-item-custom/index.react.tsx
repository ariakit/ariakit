import * as Ariakit from "@ariakit/react";
import startCase from "lodash-es/startCase.js";
import { useState } from "react";

const accounts = [
  "harry.poe@example.com",
  "jane.doe@example.com",
  "john.doe@example.com",
  "sonia.poe@example.com",
];

function renderValue(email: string) {
  const [username = ""] = email.split("@");
  const name = startCase(username.replace(/[._]/g, " "));
  const image = `https://i.pravatar.cc/120?u=${email}`;
  return (
    <>
      <img key={image} src={image} alt="" aria-hidden />
      <div>
        <div>{name}</div>
        <div>{email}</div>
      </div>
    </>
  );
}

export default function Example() {
  const [value, setValue] = useState("john.doe@example.com");
  return (
    <Ariakit.ComboboxProvider
      selectOnMove
      selectedValue={value}
      setSelectedValue={setValue}
    >
      <Ariakit.ComboboxSelectLabel>Account</Ariakit.ComboboxSelectLabel>
      <Ariakit.ComboboxSelect tabIndex={0}>
        {renderValue(value)}
        <Ariakit.ComboboxSelectArrow />
      </Ariakit.ComboboxSelect>
      <Ariakit.ComboboxPopover gutter={4} sameWidth>
        {accounts.map((email) => (
          <Ariakit.ComboboxItem key={email} value={email}>
            {renderValue(email)}
          </Ariakit.ComboboxItem>
        ))}
      </Ariakit.ComboboxPopover>
    </Ariakit.ComboboxProvider>
  );
}
