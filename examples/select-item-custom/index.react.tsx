import * as Ariakit from "@ariakit/react";
import startCase from "lodash-es/startCase.js";
import { useState } from "react";
import "./style.css";

function renderValue(email: string) {
  const [username = ""] = email.split("@");
  const name = startCase(username.replace(/[._]/g, " "));
  const image = `https://i.pravatar.cc/120?u=${email}`;
  return (
    <>
      <img key={image} src={image} alt="" aria-hidden className="photo" />
      <div className="value">
        <div className="name">{name}</div>
        <div className="email">{email}</div>
      </div>
    </>
  );
}

const accounts = [
  "harry.poe@example.com",
  "jane.doe@example.com",
  "john.doe@example.com",
  "sonia.poe@example.com",
];

export default function Example() {
  const [value, setValue] = useState("john.doe@example.com");
  return (
    <div className="wrapper">
      <Ariakit.ComboboxProvider
        selectOnMove
        selectedValue={value}
        setSelectedValue={setValue}
      >
        <Ariakit.ComboboxSelectLabel>Account</Ariakit.ComboboxSelectLabel>
        <Ariakit.ComboboxSelect className="button">
          {renderValue(value)}
          <Ariakit.ComboboxSelectArrow />
        </Ariakit.ComboboxSelect>
        <Ariakit.ComboboxPopover gutter={4} sameWidth className="popover">
          {accounts.map((email) => (
            <Ariakit.ComboboxItem
              key={email}
              value={email}
              className="select-item"
            >
              {renderValue(email)}
            </Ariakit.ComboboxItem>
          ))}
        </Ariakit.ComboboxPopover>
      </Ariakit.ComboboxProvider>
    </div>
  );
}
