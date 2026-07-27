import * as Ariakit from "@ariakit/react";
import { useState } from "react";

const accounts = [
  ["harry.poe@example.com", "Harry Poe"],
  ["jane.doe@example.com", "Jane Doe"],
  ["john.doe@example.com", "John Doe"],
  ["sonia.poe@example.com", "Sonia Poe"],
] as const;

interface AccountProps {
  email: string;
  name: string;
}

function Account({ email, name }: AccountProps) {
  return (
    <>
      <span>{name}</span>
      <small>{email}</small>
    </>
  );
}

export default function Example() {
  const [value, setValue] = useState("john.doe@example.com");
  const selected = accounts.find(([email]) => email === value) ?? accounts[0];
  return (
    <Ariakit.SelectProvider setValueOnMove value={value} setValue={setValue}>
      <Ariakit.SelectLabel>Account</Ariakit.SelectLabel>
      <Ariakit.Select>
        <Account email={selected[0]} name={selected[1]} />
      </Ariakit.Select>
      <Ariakit.SelectPopover gutter={4} sameWidth>
        {accounts.map(([email, name]) => (
          <Ariakit.SelectItem key={email} value={email}>
            <Account email={email} name={name} />
          </Ariakit.SelectItem>
        ))}
      </Ariakit.SelectPopover>
    </Ariakit.SelectProvider>
  );
}
