export default function Icon() {
  return (
    <svg viewBox="0 0 128 128" width={128} height={128}>
      <foreignObject width={128} height={128}>
        <div className="flex gap-2">
          <div className="-ml-8 mt-8 flex w-32 flex-col rounded-lg border border-black/20 bg-white p-2 pb-4 shadow-md dark:border-white/10 dark:bg-white/10 dark:shadow-md-dark">
            <div className="flex items-center justify-between">
              <div className="h-2 w-16 rounded-sm bg-black/65 dark:bg-white/70" />
              <svg
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                viewBox="0 0 16 16"
                className="size-5 stroke-black/70 dark:stroke-white/70"
              >
                <polyline points="4,10 8,6 12,10" />
              </svg>
            </div>
            <div className="flex flex-col gap-2 p-4 px-2">
              <div className="h-2 w-full rounded-sm bg-black/35 dark:bg-white/40" />
              <div className="h-2 w-full rounded-sm bg-black/35 dark:bg-white/40" />
              <div className="h-2 w-10 rounded-sm bg-black/35 dark:bg-white/40" />
            </div>
          </div>
          <div className="mt-12 flex gap-1.5">
            <div className="mt-2 h-full w-px bg-black/55 dark:bg-white/40" />
            <div className="h-full w-px bg-black/55 dark:bg-white/40" />
          </div>
        </div>
      </foreignObject>
    </svg>
  );
}
