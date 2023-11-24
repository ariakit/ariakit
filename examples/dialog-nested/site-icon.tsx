export default function Icon() {
  return (
    <svg viewBox="0 0 128 128" width={128} height={128}>
      <foreignObject width={128} height={128}>
        <div className="h-full overflow-hidden rounded-[inherit]">
          <div className="-ml-6 -mt-5">
            <div className="flex w-28 flex-col gap-3 rounded-md border border-black/20 bg-white p-3 shadow-md dark:border-white/10 dark:bg-white/10 dark:shadow-md-dark">
              <div className="mt-4 flex flex-col gap-2">
                <div className="h-1.5 w-full rounded-sm bg-black/40 dark:bg-white/40" />
                <div className="h-1.5 w-full rounded-sm bg-black/40 dark:bg-white/40" />
                <div className="h-1.5 w-10 rounded-sm bg-black/40 dark:bg-white/40" />
              </div>
              <div className="h-5 w-full rounded bg-blue-600" />
            </div>
          </div>
        </div>
      </foreignObject>
      <foreignObject width={128} height={128}>
        <div className="h-full overflow-hidden">
          <div className="h-full w-full bg-gray-150/60 pl-8 pt-12 dark:bg-gray-850/60">
            <div className="flex w-32 flex-col gap-3 rounded-lg border border-black/20 bg-white p-3 shadow-md dark:border-white/10 dark:bg-gray-600 dark:shadow-md-dark">
              <div className="h-2 w-16 rounded-sm bg-black/60 dark:bg-white/60" />
              <div className="flex flex-col gap-2">
                <div className="h-1.5 w-full rounded-sm bg-black/40 dark:bg-white/40" />
                <div className="h-1.5 w-10 rounded-sm bg-black/40 dark:bg-white/40" />
              </div>
              <div className="flex gap-2">
                <div className="h-5 w-full rounded bg-blue-600 dark:bg-blue-500" />
                <div className="h-5 w-full rounded bg-black/20 dark:bg-white/20" />
              </div>
            </div>
          </div>
        </div>
      </foreignObject>
    </svg>
  );
}
