import {
  Select,
  SelectArrow,
  SelectItem,
  SelectLabel,
  SelectPopover,
  useSelectState,
} from "ariakit/select";
import startCase from "lodash/startCase";
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
  const select = useSelectState({
    defaultValue: "john.doe@example.com",
    setValueOnMove: true,
    gutter: 4,
  });
  return (
    <div className="wrapper">
      <SelectLabel state={select}>Account</SelectLabel>
      <Select state={select} className="select">
        {renderValue(select.value)}
        <SelectArrow />
      </Select>
      <SelectPopover state={select} className="popover">
        {accounts.map((email) => (
          <SelectItem key={email} value={email} className="item">
            {renderValue(email)}
          </SelectItem>
        ))}
      </SelectPopover>
    </div>
  );
}
