export default function Icon() {
  return (
    <svg viewBox="0 0 128 128" width={128} height={128}>
      <foreignObject width={128} height={128}>
        <div className="h-full overflow-hidden">
          <div className="mx-2 mt-7">
            <div className="flex w-full flex-col overflow-hidden rounded-lg border border-black/40 bg-white shadow-md dark:border-white/20 dark:bg-white/10 dark:shadow-md-dark">
              <div className="flex w-full items-center justify-between border-b border-inherit bg-white p-2 dark:bg-black">
                <div className="flex items-center gap-1">
                  <div className="h-2 w-6 rounded-sm bg-black/60 dark:bg-white/60" />
                  <div className="h-4 w-px bg-black dark:bg-white" />
                </div>
                <svg
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1pt"
                  viewBox="0 0 16 16"
                  className="size-4 fill-none stroke-black/60 dark:stroke-white/60"
                >
                  <line x1="4" y1="4" x2="12" y2="12" />
                  <line x1="4" y1="12" x2="12" y2="4" />
                </svg>
              </div>
              <div className="flex flex-col gap-1 p-1">
                <div className="flex h-4 w-full items-center rounded p-1">
                  <div className="h-2 w-3/4 rounded-sm bg-blue-600 dark:bg-blue-500" />
                </div>
                <div className="flex h-4 w-full items-center rounded p-1">
                  <div className="h-2 w-1/2 rounded-sm bg-black/60 dark:bg-white/60" />
                </div>
                <div className="flex h-4 w-full items-center rounded p-1">
                  <div className="h-2 w-2/3 rounded-sm bg-black/60 dark:bg-white/60" />
                </div>
                <div className="flex h-4 w-full items-center rounded p-1">
                  <div className="h-2 w-1/3 rounded-sm bg-black/60 dark:bg-white/60" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </foreignObject>
    </svg>
  );
}
