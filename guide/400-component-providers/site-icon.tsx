export default function Icon() {
  return (
    <svg
      stroke="currentColor"
      fill="none"
      strokeWidth={1.5}
      viewBox="0 0 24 24"
      strokeLinecap="round"
      strokeLinejoin="round"
      xmlns="http://www.w3.org/2000/svg"
      className="h-8 w-8 stroke-green-700 dark:stroke-green-400"
    >
      <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
      <path d="M12 3l8 4.5l0 9l-8 4.5l-8 -4.5l0 -9l8 -4.5"></path>
      <path d="M12 12l8 -4.5"></path>
      <path d="M12 12l0 9"></path>
      <path d="M12 12l-8 -4.5"></path>
    </svg>
  );
}
