export default function Icon() {
  return (
    <svg viewBox="0 0 128 128" width={128} height={128}>
      <foreignObject width={128} height={128}>
        <div className="flex items-start gap-2 overflow-hidden">
          <div className="-ml-20 -mt-6 flex w-32 flex-col gap-2 rounded-lg border border-black/20 bg-white p-2 shadow dark:border-white/10 dark:bg-white/10 dark:shadow-dark">
            <div className="mt-4 flex h-9 w-full items-center rounded px-2">
              <div className="h-2 w-20 rounded-sm bg-black/50 dark:bg-white/50" />
            </div>
            <div className="flex h-9 w-full flex-row-reverse items-center rounded bg-black/10 px-2 dark:bg-white/10">
              <svg
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                viewBox="0 0 16 16"
                className="h-5 w-5 fill-none stroke-current"
              >
                <polyline points="6,4 10,8 6,12" />
              </svg>
            </div>
          </div>
          <div className="-mr-14 mt-9 flex w-32 flex-col gap-2 rounded-lg border border-black/20 bg-white p-2 shadow dark:border-white/10 dark:bg-white/10 dark:shadow-dark">
            <div className="flex h-9 w-full items-center rounded bg-blue-600 px-2"></div>
            <div className="flex h-9 w-full items-center rounded px-2">
              <div className="h-2 w-20 rounded-sm bg-black/50 dark:bg-white/50" />
            </div>
            <div className="flex h-9 w-full items-center rounded px-2" />
          </div>
        </div>
      </foreignObject>
    </svg>
  );
}
