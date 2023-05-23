function renderLine(checked = false) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center justify-center rounded bg-blue-700 p-0.5">
        <svg
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={4}
          className="h-3.5 w-3.5 stroke-white dark:stroke-white"
        >
          {checked && <path d="M4.5 12.75l6 6 9-13.5" />}
        </svg>
      </div>
      <div className="h-2 w-10 bg-black/50 dark:bg-white/50" />
    </div>
  );
}

export default function Icon() {
  return (
    <svg viewBox="0 0 128 128" width={128} height={128}>
      <foreignObject width={128} height={128}>
        <div className="flex h-full flex-col items-center justify-center gap-2 p-4">
          {renderLine(true)}
          {renderLine()}
          {renderLine(true)}
        </div>
      </foreignObject>
    </svg>
  );
}
