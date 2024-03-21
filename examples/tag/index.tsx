import "./style.css";
import { startTransition, useMemo, useState } from "react";
import * as Ariakit from "@ariakit/react";
import { Tag } from "@ariakit/react-core/tag/tag";
import { TagInput } from "@ariakit/react-core/tag/tag-input";
import { TagList } from "@ariakit/react-core/tag/tag-list";
import { TagListLabel } from "@ariakit/react-core/tag/tag-list-label";
import { TagProvider } from "@ariakit/react-core/tag/tag-provider";
import { TagRemove } from "@ariakit/react-core/tag/tag-remove";
import { TagValues } from "@ariakit/react-core/tag/tag-values";
import { faker } from "@faker-js/faker";
import { matchSorter } from "match-sorter";
import defaultUsers from "./users.js";

const firstUser = defaultUsers.at(0);
const defaultValues = firstUser ? [firstUser.email] : [];

function getUserByEmail(email: string, users = defaultUsers) {
  return users.find((user) => user.email === email);
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
    <div>
      <TagProvider>
        <TagListLabel
          style={{ display: "block", marginLeft: "12px", marginBottom: "4px" }}
        >
          Fruits
        </TagListLabel>
        <TagList className="tag-list">
          <TagValues>
            {(values) =>
              values.map((value) => (
                <Tag key={value} value={value} className="tag">
                  {value}
                  <TagRemove className="tag-remove" />
                </Tag>
              ))
            }
          </TagValues>
          <TagInput className="tag-input" />
        </TagList>
      </TagProvider>
      <TagProvider
        values={values}
        setValues={(values) => {
          setValues(values);
          setUsers((users) => {
            for (const value of values) {
              if (users.some((user) => user.email === value)) continue;
              const user = {
                name: value,
                email: value,
                avatar: faker.image.avatarGitHub(),
              };
              users = [user, ...users];
            }
            return users;
          });
        }}
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
          <TagValues>
            {(values) =>
              values.map((value) => {
                const user = getUserByEmail(value, users);
                if (!user) return null;
                return (
                  <Tag
                    key={user.email}
                    value={user.email}
                    className="tag"
                    onClick={() => {
                      setValues((values) =>
                        values.filter((value) => value !== user.email),
                      );
                      setValue(value);
                    }}
                  >
                    <img src={user.avatar} alt={user.name} className="avatar" />
                    <span className="name">{user.name}</span>
                    <TagRemove className="tag-remove" />
                  </Tag>
                );
              })
            }
          </TagValues>
          <Ariakit.ComboboxProvider
            open={open}
            setOpen={setOpen}
            resetValueOnSelect={false}
          >
            <Ariakit.Combobox
              autoSelect
              showMinLength={1}
              showOnKeyPress
              className="tag-input"
              render={<TagInput />}
              // onChange={(event) => {
              //   if (event.target.value === "") {
              //     setOpen(false);
              //   }
              // }}
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
                  selectValueOnClick={() => {
                    setValue("");
                    return true;
                  }}
                  className="combobox-item"
                >
                  Add &quot;{value}&quot;
                </Ariakit.ComboboxItem>
              )}
              {matches.map((value) => {
                const user = getUserByEmail(value, users);
                if (!user) return null;
                return (
                  <Ariakit.ComboboxItem
                    key={user.email}
                    value={user.email}
                    hideOnClick={!values.includes(user.email)}
                    focusOnHover
                    blurOnHoverEnd={false}
                    selectValueOnClick={() => {
                      setValue("");
                      return true;
                    }}
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
    </div>
  );
}
