import * as Ariakit from "@ariakit/react";
import { useCallback, useState } from "react";

const initialProjects = ["Alpha", "Beta", "Charlie", "Delta"];
const refreshedProjects = ["Alpha", "Beta", "Delta", "Charlie"];

interface ProjectItemProps {
  project: string;
  index: number;
}

function ProjectItem({ project, index }: ProjectItemProps) {
  // TODO: Remove this workaround once the fix for
  // https://github.com/ariakit/ariakit/issues/7896 is released. A new getItem
  // callback after a reorder registers the item again, which re-sorts the
  // collection by DOM position.
  const getItem = useCallback<
    NonNullable<Ariakit.ComboboxItemProps["getItem"]>
  >((item) => ({ ...item, index }), [index]);
  return <Ariakit.ComboboxItem value={project} getItem={getItem} />;
}

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
          {results.map((project, index) => (
            <ProjectItem key={project} project={project} index={index} />
          ))}
        </Ariakit.ComboboxPopover>
      </Ariakit.ComboboxProvider>
      <p>
        Selected project: <output>{selected || "None"}</output>
      </p>
    </div>
  );
}
