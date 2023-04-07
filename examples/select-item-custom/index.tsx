import * as Ariakit from "@ariakit/react";
import startCase from "lodash-es/startCase.js";
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
  const select = Ariakit.useSelectStore({
    defaultValue: "john.doe@example.com",
    setValueOnMove: true,
    sameWidth: true,
    gutter: 4,
  });
  const value = select.useState("value");
  return (
    <div className="wrapper">
      <Ariakit.SelectLabel store={select}>Account</Ariakit.SelectLabel>
      <Ariakit.Select store={select} className="select">
        {renderValue(value)}
        <Ariakit.SelectArrow />
      </Ariakit.Select>
      <Ariakit.SelectPopover store={select} className="popover">
        {accounts.map((email) => (
          <Ariakit.SelectItem key={email} value={email} className="select-item">
            {renderValue(email)}
          </Ariakit.SelectItem>
        ))}
      </Ariakit.SelectPopover>
    </div>
  );
}
