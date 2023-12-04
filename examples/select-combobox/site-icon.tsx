export default function Icon() {
  return (
    <svg viewBox="0 0 128 128" width={128} height={128}>
      <foreignObject width={128} height={128}>
        <div className="pl-8 pt-4">
          <div className="flex flex-col items-center justify-center">
            <div className="flex flex-col gap-2">
              <div className="ml-2.5 flex h-6 w-20 items-center justify-end rounded bg-blue-600 px-1">
                <svg
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  viewBox="0 0 16 16"
                  className="h-4 w-4 stroke-white"
                >
                  <polyline points="4,6 8,10 12,6" />
                </svg>
              </div>
              <div className="flex w-32 flex-col overflow-hidden rounded-lg border border-black/30 bg-white shadow dark:border-white/[15%] dark:bg-white/10 dark:shadow-dark">
                <div className="flex h-7 w-full items-center gap-0.5 border-b border-black/40 px-2.5 py-1.5 dark:border-0 dark:bg-black/80">
                  <div className="h-2 w-12 bg-black/50 dark:bg-white/50" />
                  <div className="h-full w-px bg-black dark:bg-white" />
                </div>
                <div className="flex flex-col gap-1.5 p-1.5">
                  <div className="h-6 rounded-[3px] bg-blue-600 dark:bg-blue-500" />
                  <div className="h-6 rounded-[3px] bg-black/30 dark:bg-white/30" />
                  <div className="h-6 rounded-[3px] bg-black/30 dark:bg-white/30" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </foreignObject>
    </svg>
  );
}
