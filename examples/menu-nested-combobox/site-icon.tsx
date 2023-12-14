export default function Icon() {
  return (
    <svg viewBox="0 0 128 128" width={128} height={128}>
      <foreignObject width={128} height={128}>
        <div className="flex items-start gap-2 overflow-hidden">
          <div className="-ml-20 mt-12 flex w-32 flex-col overflow-hidden rounded-lg border border-black/30 bg-white pb-20 shadow dark:border-white/20 dark:bg-white/10 dark:shadow-dark">
            <div className="flex h-7 w-full items-center gap-0.5 border-b border-black/40 px-2.5 py-1.5 dark:border-0 dark:bg-black/80" />
            <div className="flex flex-col p-1">
              <div className="flex h-7 items-center justify-end rounded bg-black/10 px-1 dark:bg-white/10">
                <svg
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  viewBox="0 0 16 16"
                  className="h-5 w-5 fill-none stroke-black/80 dark:stroke-white/80"
                >
                  <polyline points="6,4 10,8 6,12" />
                </svg>
              </div>
            </div>
          </div>
          <div className="-mr-14 mt-6 flex w-32 flex-col overflow-hidden rounded-lg border border-black/30 bg-white pb-20 shadow dark:border-white/20 dark:bg-white/10 dark:shadow-dark">
            <div className="flex h-7 w-full items-center gap-0.5 border-b border-black/40 px-2.5 py-1.5 dark:border-0 dark:bg-black/80">
              <div className="h-2 w-8 rounded-sm bg-blue-600 dark:bg-blue-500" />
              <div className="h-full w-px bg-black dark:bg-white" />
            </div>
            <div className="flex flex-col px-1">
              <div className="h-7 rounded" />
              <div className="h-7 rounded bg-blue-600" />
            </div>
          </div>
        </div>
      </foreignObject>
    </svg>
  );
}
