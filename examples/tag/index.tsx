import "./style.css";
import { startTransition, useMemo, useState } from "react";
import * as Ariakit from "@ariakit/react";
import { Tag } from "@ariakit/react-core/tag/tag";
import { TagInput } from "@ariakit/react-core/tag/tag-input";
import { TagList } from "@ariakit/react-core/tag/tag-list";
import { TagListLabel } from "@ariakit/react-core/tag/tag-list-label";
import { TagProvider } from "@ariakit/react-core/tag/tag-provider";
import { TagRemove } from "@ariakit/react-core/tag/tag-remove";
import { faker } from "@faker-js/faker";
import { matchSorter } from "match-sorter";
import defaultUsers from "./users.js";

const firstUser = defaultUsers.at(0);
const defaultValues = firstUser ? [firstUser.email] : [];

function getUserByEmail(email: string, users = defaultUsers) {
  const user = users.find((user) => user.email === email);
  if (!user) {
    throw new Error(`User not found with email: ${email}`);
  }
  return user;
}

export default function Example() {
  const [users, setUsers] = useState(defaultUsers);
  const [values, setValues] = useState(defaultValues);
  const [value, setValue] = useState("");
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const matches = useMemo(() => {
    const objects = matchSorter(users, searchTerm, {
      keys: ["name", "email"],
    }).slice(0, 10);
    return objects.map((object) => object.email);
  }, [users, searchTerm]);

  return (
    <TagProvider
      values={values}
      setValues={setValues}
      value={value}
      setValue={(value) => {
        setValue(value);
        startTransition(() => {
          setSearchTerm(value);
        });
      }}
    >
      <TagListLabel>Invitees</TagListLabel>
      <TagList className="tag-list">
        {values.map((value) => {
          const user = getUserByEmail(value, users);
          return (
            <Tag key={user.email} value={user.email} className="tag">
              <img src={user.avatar} alt={user.name} className="avatar" />
              <span className="name">{user.name}</span>
              <TagRemove className="tag-remove" />
            </Tag>
          );
        })}
        <Ariakit.ComboboxProvider open={open} setOpen={setOpen}>
          <TagInput
            className="tag-input"
            delimiter={null}
            render={
              <Ariakit.Combobox
                autoSelect
                showOnKeyPress
                onChange={(event) => {
                  if (event.target.value === "") {
                    setOpen(false);
                  }
                }}
              />
            }
          />
          <Ariakit.ComboboxPopover
            className="popover popup elevation-1"
            gutter={12}
            flip={false}
            shift={-4}
          >
            {value.includes("@", 1) && (
              <Ariakit.ComboboxItem
                value={value}
                hideOnClick
                focusOnHover
                blurOnHoverEnd={false}
                className="combobox-item"
                selectValueOnClick={() => {
                  setUsers((users) => {
                    const user = {
                      name: value,
                      email: value,
                      avatar: faker.image.avatarGitHub(),
                    };
                    return [user, ...users];
                  });
                  return true;
                }}
              >
                Add &quot;{value}&quot;
              </Ariakit.ComboboxItem>
            )}
            {matches.map((value) => {
              const user = getUserByEmail(value, users);
              return (
                <Ariakit.ComboboxItem
                  key={user.email}
                  value={user.email}
                  hideOnClick
                  focusOnHover
                  blurOnHoverEnd={false}
                  className="combobox-item"
                >
                  <img src={user.avatar} alt={user.name} className="avatar" />
                  <span className="name">{user.name}</span>
                  <span className="email">{user.email}</span>
                  <Ariakit.ComboboxItemCheck />
                </Ariakit.ComboboxItem>
              );
            })}
          </Ariakit.ComboboxPopover>
        </Ariakit.ComboboxProvider>
      </TagList>
    </TagProvider>
  );
}
