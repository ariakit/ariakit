import {
  Select,
  SelectArrow,
  SelectItem,
  SelectItemCheck,
  SelectLabel,
  SelectPopover,
  useSelectState,
} from "ariakit/select";
import startCase from "lodash/startCase";
import "./style.css";

function getImage(email: string) {
  const image = `https://i.pravatar.cc/120?u=${email}`;
  return image;
}

function renderValue(email: string | string[]) {
  if (Array.isArray(email)) {
    if (email.length === 1) {
      email = email[0]!;
    } else {
      return (
        <>
          <div className="photo-stack">
            {email.map((m) => (
              <img key={m} src={getImage(m)} alt="" className="photo" />
            ))}
          </div>
          <div className="value">{email.length} accounts</div>
        </>
      );
    }
  }
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
          <SelectItem key={email} value={email}>
            {renderValue(email)}
            <SelectItemCheck />
          </SelectItem>
        ))}
      </SelectPopover>
    </div>
  );
}
