import * as Ariakit from "@ariakit/react";
import { useState } from "react";

const initialProjects = ["Alpha", "Beta", "Charlie", "Delta"];
const refreshedProjects = ["Alpha", "Beta", "Delta", "Charlie"];

export default function Example() {
  const [search, setSearch] = useState("");
  const [projects, setProjects] = useState(initialProjects);
  const [selected, setSelected] = useState("");
  const results = projects.filter((project) =>
    project.toLowerCase().includes(search.toLowerCase()),
  );
  return (
    <div className="flex flex-col gap-4">
      <button
        type="button"
        // Keep the input focused to simulate a background response.
        onMouseDown={(event) => event.preventDefault()}
        onClick={() => setProjects(refreshedProjects)}
      >
        Refresh results
      </button>
      <Ariakit.ComboboxProvider
        inputValue={search}
        setInputValue={setSearch}
        defaultSelectedValue=""
        setSelectedValue={setSelected}
      >
        <Ariakit.ComboboxLabel>Project</Ariakit.ComboboxLabel>
        <Ariakit.Combobox placeholder="Choose a project" />
        <Ariakit.ComboboxPopover
          aria-label="Projects"
          hideOnInteractOutside={false}
          gutter={8}
        >
          {results.map((project) => (
            <Ariakit.ComboboxItem key={project} value={project} />
          ))}
        </Ariakit.ComboboxPopover>
      </Ariakit.ComboboxProvider>
      <p>
        Selected project: <output>{selected || "None"}</output>
      </p>
    </div>
  );
}
