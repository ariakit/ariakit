type Props = {
  size?: "md" | "lg";
};

export default function Examples({ size = "md" }: Props) {
  return (
    <svg
      width={size === "md" ? 48 : 72}
      height={size === "md" ? 48 : 72}
      viewBox="0 0 48 48"
      fill="none"
    >
      <rect
        x="4"
        y="2"
        width="24"
        height="8"
        rx="2"
        className="fill-primary-2 dark:fill-primary-2-dark"
      />
      <rect
        x="2"
        y="12"
        width="44"
        height="34"
        rx="2"
        strokeWidth={size === "md" ? 1 : 2 / 3}
        className="fill-canvas-5 stroke-black/10 dark:fill-canvas-5-dark dark:stroke-white/5"
      />
      <rect
        x="6"
        y="17"
        width="20"
        height="2"
        className="fill-black/60 dark:fill-white/50"
      />
      <rect
        x="6"
        y="24"
        width="16"
        height="2"
        className="fill-link dark:fill-link-dark"
      />
      <rect
        x="6"
        y="31"
        width="28"
        height="2"
        className="fill-black/60 dark:fill-white/50"
      />
      <rect
        x="6"
        y="38"
        width="20"
        height="2"
        className="fill-black/60 dark:fill-white/50"
      />
    </svg>
  );
}
