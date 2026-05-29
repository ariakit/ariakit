import { z } from "zod";
import { getLabel, languages, statuses } from "./filters.ts";
import { Select, SelectItem } from "./router-select.tsx";

const searchParamsSchema = z.object({
  lang: z
    .string()
    .optional()
    .default("en")
    // Remove invalid values
    .transform((value) => (value in languages ? value : undefined)),
  status: z
    .union([z.string(), z.array(z.string())])
    .optional()
    // Coerce to array and remove invalid values
    .transform((value) => {
      const values = Array.isArray(value) ? value : value ? [value] : [];
      return values.filter((v) => v in statuses);
    }),
});

interface PageProps {
  searchParams: Record<string, string | string[]>;
}

export default function Page(props: PageProps) {
  const searchParams = searchParamsSchema.parse(props.searchParams);
  return (
    <div className="wrapper">
      <Select
        name="lang"
        label="Language"
        value={searchParams.lang}
        displayValue={getLabel(languages, searchParams.lang)}
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
        value={searchParams.status}
        displayValue={getLabel(statuses, searchParams.status, "Any")}
      >
        {Object.entries(statuses).map(([value, label]) => (
          <SelectItem key={value} value={value}>
            {label}
          </SelectItem>
        ))}
      </Select>
    </div>
  );
}
