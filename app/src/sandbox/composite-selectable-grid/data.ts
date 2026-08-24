export type ProjectStatus = "At risk" | "Done" | "On track" | "Planning";

export interface LaunchProject {
  id: string;
  name: string;
  description: string;
  owner: string;
  status: ProjectStatus;
  updated: string;
}

export const projects = [
  {
    id: "atlas",
    name: "Atlas",
    description: "Unify the account architecture.",
    owner: "Maya Chen",
    status: "On track",
    updated: "Today",
  },
  {
    id: "beacon",
    name: "Beacon",
    description: "Make activation signals actionable.",
    owner: "Noah Williams",
    status: "At risk",
    updated: "Yesterday",
  },
  {
    id: "lumen",
    name: "Lumen",
    description: "Refresh the reporting experience.",
    owner: "Priya Shah",
    status: "Planning",
    updated: "Aug 20",
  },
  {
    id: "nova",
    name: "Nova",
    description: "Launch the partner workspace.",
    owner: "Eli Brooks",
    status: "On track",
    updated: "Aug 18",
  },
  {
    id: "orbit",
    name: "Orbit",
    description: "Consolidate billing operations.",
    owner: "Sam Rivera",
    status: "Done",
    updated: "Aug 15",
  },
  {
    id: "prism",
    name: "Prism",
    description: "Define the next design language.",
    owner: "Avery Kim",
    status: "Planning",
    updated: "Aug 12",
  },
] as const satisfies readonly LaunchProject[];
