import { matchSorter } from "match-sorter";
import { useDeferredValue, useMemo, useState } from "react";
import { Tag, TagInput, TagList, TagOption } from "./tag.tsx";
import { users as defaultUsers, getAvatar } from "./users.ts";
import "./style.css";

export default function Example() {
  const [users, setUsers] = useState(defaultUsers);
  const [invitees, setInvitees] = useState([users[0]!.email]);
  const [value, setValue] = useState("");
  const searchTerm = useDeferredValue(value);

  const addEmails = (emails: typeof invitees) => {
    setUsers((users) => {
      const currentEmails = new Set(users.map((user) => user.email));
      const newUsers = emails
        .filter((email) => !currentEmails.has(email))
        .map((email) => ({ name: email, email }));
      // If no new users, do not mutate the state
      if (!newUsers.length) {
        return users;
      }
      return [...newUsers, ...users];
    });
  };

  const isCustomEmail = (email: string) => {
    if (users.some((user) => user.email === email)) return false;
    return email.match(/^\S+@\S+$/);
  };

  const getUserName = (email: string) => {
    const user = users.find((user) => user.email === email);
    return user?.name ?? email;
  };

  const matches = useMemo(() => {
    const results = matchSorter(users, searchTerm, { keys: ["name", "email"] });
    return results.slice(0, 10);
  }, [users, searchTerm]);

  return (
    <div className="wrapper">
      <TagList
        label="Invitees"
        value={value}
        setValue={setValue}
        values={invitees}
        setValues={(values) => {
          setInvitees(values);
          addEmails(values);
        }}
      >
        {invitees.map((email) => (
          <Tag key={email} value={email}>
            <img src={getAvatar(email)} alt="" className="ak-tag-avatar" />
            <span className="ak-tag-name">{getUserName(email)}</span>
          </Tag>
        ))}
        <TagInput delimiter={null}>
          {isCustomEmail(value) && (
            <TagOption value={value}>
              <img src={getAvatar(value)} alt="" className="ak-tag-avatar" />
              <span className="ak-tag-name">Add &quot;{value}&quot;</span>
            </TagOption>
          )}
          {matches.map((user) => (
            <TagOption key={user.email} value={user.email}>
              <img
                src={getAvatar(user.email)}
                alt=""
                className="ak-tag-avatar"
              />
              <span className="ak-tag-name">{user.name}</span>
              <span className="ak-tag-email">{user.email}</span>
            </TagOption>
          ))}
        </TagInput>
      </TagList>
    </div>
  );
}
