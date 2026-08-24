export interface SelectionDocument {
  id: string;
  title: string;
  description: string;
  tag: string;
  disabled?: boolean;
}

export const documents = [
  {
    id: "product-roadmap",
    title: "2027 product roadmap",
    description: "Priorities, milestones, and the bets behind them.",
    tag: "Strategy",
  },
  {
    id: "customer-interviews",
    title: "Customer interviews",
    description: "Highlights from the latest research sessions.",
    tag: "Research",
  },
  {
    id: "legal-review",
    title: "Legal review",
    description: "A mounted item that can opt in without being replaced.",
    tag: "Optional",
  },
  {
    id: "security-audit",
    title: "Security audit",
    description: "Visible and focusable, but unavailable for selection.",
    tag: "Read only",
    disabled: true,
  },
  {
    id: "launch-checklist",
    title: "Launch checklist",
    description: "Owners and final checks for release day.",
    tag: "Delivery",
  },
  {
    id: "research-synthesis",
    title: "Research synthesis",
    description: "Themes, tensions, and open product questions.",
    tag: "Research",
  },
] as const satisfies readonly SelectionDocument[];

export const providerDocuments = [
  {
    id: "collect-field-notes",
    title: "Collect field notes",
    description: "Gather the raw observations from every session.",
    tag: "Discover",
  },
  {
    id: "shape-the-narrative",
    title: "Shape the narrative",
    description: "Turn the strongest signals into a clear point of view.",
    tag: "Synthesize",
  },
  {
    id: "publish-the-brief",
    title: "Publish the brief",
    description: "Share the recommendation and invite feedback.",
    tag: "Deliver",
  },
] as const satisfies readonly SelectionDocument[];
