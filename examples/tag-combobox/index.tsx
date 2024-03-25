import "./style.css";
import { startTransition, useMemo, useState } from "react";
import { matchSorter } from "match-sorter";
import { ComboboxValue } from "./experimental-ariakit.js";
import { Combobox, ComboboxItem, Tag, TagInput, TagList } from "./tag.jsx";
import { users as defaultUsers, getAvatar } from "./users.js";

export default function Example() {
  const [users, setUsers] = useState(defaultUsers);
  const [invitees, setInvitees] = useState([users[0]!.email]);
  const [searchTerm, setSearchTerm] = useState("");

  const matches = useMemo(() => {
    const results = matchSorter(users, searchTerm, { keys: ["name", "email"] });
    return results.slice(0, 10);
  }, [users, searchTerm]);

  return (
    <div className="wrapper">
      <TagList
        label="Invitees"
        values={invitees}
        setValues={(values) => {
          setInvitees(values);
          setUsers((users) => {
            for (const value of values) {
              if (users.some((user) => user.email === value)) continue;
              const user = { name: value, email: value };
              users = [user, ...users];
            }
            return users;
          });
        }}
        setValue={(value) => {
          startTransition(() => {
            setSearchTerm(value);
          });
        }}
      >
        {invitees.map((email) => {
          const user = users.find((u) => u.email === email);
          const name = user?.name ?? email;
          return (
            <Tag key={email} value={email}>
              <img alt="" src={getAvatar(email)} className="tag-avatar" />
              <span className="tag-name">{name}</span>
            </Tag>
          );
        })}
        <Combobox render={<TagInput />}>
          <ComboboxValue>
            {(value) => {
              if (!value.includes("@", 1)) return null;
              return (
                <ComboboxItem value={value}>
                  <img alt="" src={getAvatar(value)} className="tag-avatar" />
                  <span className="tag-name">Add &quot;{value}&quot;</span>
                </ComboboxItem>
              );
            }}
          </ComboboxValue>
          {matches.map((user) => {
            return (
              <ComboboxItem key={user.email} value={user.email}>
                <img
                  alt=""
                  src={getAvatar(user.email)}
                  className="tag-avatar"
                />
                <span className="tag-name">{user.name}</span>
                <span className="tag-email">{user.email}</span>
              </ComboboxItem>
            );
          })}
        </Combobox>
      </TagList>
    </div>
  );
}
