export default function Icon() {
  return (
    <svg viewBox="0 0 128 128" width={128} height={128}>
      <foreignObject width={128} height={128}>
        <div className="flex h-full flex-col items-center gap-1.5 overflow-hidden p-5">
          <div className="-ml-8 flex w-48 gap-1.5">
            <div className="h-6 w-6 rounded bg-black/20 dark:bg-white/20" />
            <div className="h-6 w-6 rounded bg-black/20 dark:bg-white/20" />
            <div className="h-6 w-6 rounded bg-black/20 dark:bg-white/20" />
            <div className="w-0.5 rounded-sm bg-black/20 dark:bg-white/20" />
            <div className="flex flex-1 items-center justify-end rounded bg-blue-600 px-1">
              <svg
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={3}
                viewBox="0 0 16 16"
                className="h-4 w-4 stroke-white/80"
              >
                <polyline points="4,6 8,10 12,6" />
              </svg>
            </div>
            <div className="h-6 w-6 rounded bg-black/20 dark:bg-white/20" />
          </div>
          <div className="ml-10 w-20 rounded-lg border border-black/20 bg-white p-1.5 shadow dark:border-white/10 dark:bg-white/[15%] dark:shadow-dark">
            <div className="flex flex-col gap-1.5 overflow-hidden rounded">
              <div className="h-4 w-full rounded-sm bg-black/30 dark:bg-white/30" />
              <div className="h-4 w-full rounded-sm bg-blue-600 dark:bg-blue-500" />
              <div className="h-4 w-full rounded-sm bg-black/30 dark:bg-white/30" />
              <div className="h-4 w-full rounded-sm bg-black/30 dark:bg-white/30" />
            </div>
          </div>
        </div>
      </foreignObject>
    </svg>
  );
}
