function renderLine(checked = false, size = "w-12") {
  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center justify-center rounded bg-blue-600 p-0.5">
        <svg
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={4}
          className="h-3.5 w-3.5 stroke-white dark:stroke-white"
        >
          {checked && <path d="M4.5 12.75l6 6 9-13.5" />}
        </svg>
      </div>
      <div className={`h-1.5 bg-black/50 dark:bg-white/50 ${size}`} />
    </div>
  );
}

export default function Icon() {
  return (
    <svg viewBox="0 0 128 128" width={128} height={128}>
      <foreignObject width={128} height={128}>
        <div className="overflow-hidden">
          <div className="ml-6 mt-6 flex w-40 flex-col gap-4 rounded-md border border-black/20 bg-white p-4 shadow dark:border-white/10 dark:bg-white/10 dark:shadow-dark">
            <div className="h-2 w-12 bg-black/70 dark:bg-white/70" />
            <div className="flex flex-col gap-2">
              {renderLine(true, "w-12")}
              {renderLine(true, "w-8")}
              {renderLine(false, "w-20")}
            </div>
          </div>
        </div>
      </foreignObject>
    </svg>
  );
}
