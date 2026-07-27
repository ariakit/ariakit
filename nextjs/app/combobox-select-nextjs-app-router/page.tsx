import { Suspense } from "react";
import {
  getLabel,
  getLanguage,
  getStatuses,
  languages,
  statuses,
} from "./filters.ts";
import { Select, SelectItem } from "./router-select.tsx";

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

async function Filters({ searchParams }: PageProps) {
  const params = await searchParams;
  const language = getLanguage(params.lang);
  const status = getStatuses(params.status);

  return (
    <main>
      <Select
        name="lang"
        label="Language"
        value={language}
        displayValue={getLabel(languages, language)}
      >
        {Object.entries(languages).map(([value, label]) => (
          <SelectItem key={value} value={value}>
            {label}
          </SelectItem>
        ))}
      </Select>
      <Select
        name="status"
        label="Status"
        value={status}
        displayValue={getLabel(statuses, status, "Any")}
      >
        {Object.entries(statuses).map(([value, label]) => (
          <SelectItem key={value} value={value}>
            {label}
          </SelectItem>
        ))}
      </Select>
    </main>
  );
}

export default function Page({ searchParams }: PageProps) {
  return (
    <Suspense fallback={null}>
      <Filters searchParams={searchParams} />
    </Suspense>
  );
}
