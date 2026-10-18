export interface Post {
  id: string;
  title: string;
  author: string;
  time: string;
  comments: number;
  votes: number;
  tag: string;
}

export const hotPosts: Post[] = [
  {
    id: "what-aria-can-i-use",
    title: "Answering “What ARIA can I use?”",
    author: "Maya Chen",
    time: "5 hours ago",
    comments: 48,
    votes: 312,
    tag: "ARIA",
  },
  {
    id: "privacy-principles",
    title: "Privacy Principles for the Web",
    author: "Jonas Weber",
    time: "8 hours ago",
    comments: 31,
    votes: 247,
    tag: "Privacy",
  },
  {
    id: "wai-management",
    title: "Stepping forward on WAI management",
    author: "Priya Raman",
    time: "1 day ago",
    comments: 19,
    votes: 186,
    tag: "WAI",
  },
  {
    id: "accessibility-maturity-model",
    title: "W3C Accessibility Maturity Model",
    author: "Tomás Silva",
    time: "2 days ago",
    comments: 12,
    votes: 154,
    tag: "Standards",
  },
];

export const newPosts: Post[] = [
  {
    id: "webviews",
    title: "Making WebViews work for the Web",
    author: "Aiko Tanaka",
    time: "12 minutes ago",
    comments: 2,
    votes: 9,
    tag: "Platform",
  },
  {
    id: "remote-meeting-agenda",
    title: "Remote Meeting Agenda in Development",
    author: "Liam O’Connor",
    time: "40 minutes ago",
    comments: 4,
    votes: 14,
    tag: "Community",
  },
  {
    id: "accessibility-maturity-model",
    title: "W3C Accessibility Maturity Model",
    author: "Tomás Silva",
    time: "2 hours ago",
    comments: 12,
    votes: 154,
    tag: "Standards",
  },
  {
    id: "wai-management",
    title: "Stepping forward on WAI management",
    author: "Priya Raman",
    time: "3 hours ago",
    comments: 19,
    votes: 186,
    tag: "WAI",
  },
];
