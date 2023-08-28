import "./style.css";
import { useState } from "react";
import * as Ariakit from "@ariakit/react";
import { SelectProvider } from "@ariakit/react-core/select/select-provider";
import startCase from "lodash-es/startCase.js";

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
      <SelectProvider setValueOnMove value={value} setValue={setValue}>
        <Ariakit.SelectLabel>Account</Ariakit.SelectLabel>
        <Ariakit.Select className="button">
          {renderValue(value)}
          <Ariakit.SelectArrow />
        </Ariakit.Select>
        <Ariakit.SelectPopover gutter={4} sameWidth className="popover">
          {accounts.map((email) => (
            <Ariakit.SelectItem
              key={email}
              value={email}
              className="select-item"
            >
              {renderValue(email)}
            </Ariakit.SelectItem>
          ))}
        </Ariakit.SelectPopover>
      </SelectProvider>
    </div>
  );
}
