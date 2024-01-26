import "./style.css";
import { useMemo, useState } from "react";
import { Button } from "@ariakit/react";
import { matchSorter } from "match-sorter";
import {
  CommandMenu,
  CommandMenuGroup,
  CommandMenuInput,
  CommandMenuItem,
  CommandMenuList,
} from "./command-menu.jsx";
import type { Command } from "./commands.jsx";
import { allItems, applications, commands, suggestions } from "./commands.jsx";

function search(value: string): Record<string, Command[]> {
  if (!value) {
    return {
      Suggestions: suggestions,
      Commands: commands.filter((item) => !suggestions.includes(item)),
      Apps: applications.filter((item) => !suggestions.includes(item)),
    };
  }
  const keys = ["name", "title"];
  const results = matchSorter(allItems, value, { keys });
  if (!results.length) return {};
  return { Results: results };
}

export default function Example() {
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const matches = useMemo(() => search(searchValue), [searchValue]);
  const matchEntries = Object.entries(matches);
  return (
    <>
      <Button className="button" onClick={() => setOpen(true)}>
        Open Command Menu
      </Button>

      <CommandMenu
        aria-label="Command Menu"
        open={open}
        onOpenChange={setOpen}
        onSearch={setSearchValue}
      >
        <CommandMenuInput placeholder="Search for apps and commands..." />
        <CommandMenuList>
          {!matchEntries.length && (
            <div className="no-results">No results found</div>
          )}
          {matchEntries.map(([group, items]) => (
            <CommandMenuGroup key={group} label={group}>
              {items.map((item) => (
                <CommandMenuItem key={item.name} id={item.name}>
                  {item.icon && (
                    <span className="item-icon" aria-hidden>
                      {item.icon}
                    </span>
                  )}
                  {item.title}
                  {item.extension?.title && (
                    <span className="item-group" aria-hidden>
                      {item.extension?.title}
                    </span>
                  )}
                  <span className="item-type" aria-hidden>
                    {item.extension ? "Command" : "Application"}
                  </span>
                </CommandMenuItem>
              ))}
            </CommandMenuGroup>
          ))}
        </CommandMenuList>
      </CommandMenu>
    </>
  );
}
