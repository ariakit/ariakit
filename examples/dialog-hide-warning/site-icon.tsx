export default function Icon() {
  return (
    <svg viewBox="0 0 128 128" width={128} height={128}>
      <foreignObject width={128} height={128}>
        <div className="h-full overflow-hidden">
          <div className="-mx-1 -mt-5">
            <div className="flex w-full flex-col gap-2 rounded-md border border-black/20 bg-white p-2 shadow-md dark:border-white/10 dark:bg-white/10 dark:shadow-md-dark">
              <div className="ml-2 h-2 w-10 rounded-sm bg-black/70 dark:bg-white/70" />
              <div className="h-10 w-full rounded border border-black/30 bg-white px-2 py-1 dark:border-white/30 dark:bg-black">
                <div className="flex items-center gap-1">
                  <div className="h-2 w-6 rounded-sm bg-black/60 dark:bg-white/60" />
                  <div className="h-4 w-px bg-black dark:bg-white" />
                </div>
              </div>
              <div className="h-4 w-full rounded bg-blue-600" />
            </div>
          </div>
        </div>
      </foreignObject>
      <foreignObject width={128} height={128}>
        <div className="h-full overflow-hidden">
          <div className="h-full w-full bg-gray-150/70 p-5 pt-14 dark:bg-gray-850/70">
            <div className="flex w-full flex-col gap-3 rounded-md border border-black/20 bg-white p-2 shadow-md dark:border-white/10 dark:bg-gray-600 dark:shadow-md-dark">
              <div className="flex flex-col gap-1.5">
                <div className="h-1.5 w-full rounded-sm bg-black/40 dark:bg-white/40" />
                <div className="h-1.5 w-10 rounded-sm bg-black/40 dark:bg-white/40" />
              </div>
              <div className="h-3 w-full rounded-sm bg-blue-600 dark:bg-blue-500" />
            </div>
          </div>
        </div>
      </foreignObject>
    </svg>
  );
}
