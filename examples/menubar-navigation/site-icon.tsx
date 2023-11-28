export default function Icon() {
  return (
    <svg viewBox="0 0 128 128" width={128} height={128}>
      <foreignObject width={128} height={128}>
        <div className="flex h-full flex-col items-center gap-3 overflow-hidden p-4">
          <div className="flex gap-4">
            <div className="flex w-8 flex-col gap-0.5">
              <div className="h-3 w-full rounded-sm bg-black/20 dark:bg-white/20" />
            </div>
            <div className="flex w-10 flex-col gap-0.5">
              <div className="h-3 w-full rounded-sm bg-blue-600 dark:bg-blue-500" />
              <div className="h-0.5 w-full bg-blue-600 dark:bg-blue-500" />
            </div>
            <div className="flex w-12 flex-col gap-0.5">
              <div className="h-3 w-full rounded-sm bg-black/20 dark:bg-white/20" />
            </div>
          </div>
          <div className="ml-8 flex w-[128px] flex-col gap-5 rounded-lg border border-black/20 bg-white p-4 shadow dark:border-white/10 dark:bg-white/10 dark:shadow-dark">
            <div className="flex flex-col gap-1">
              <div className="flex w-20 flex-col gap-0.5">
                <div className="h-2 w-full rounded-sm bg-blue-600 dark:bg-blue-500" />
                <div className="h-0.5 w-full bg-blue-600 dark:bg-blue-500" />
              </div>
              <div className="h-2 w-16 rounded-sm bg-black/40 dark:bg-white/40" />
            </div>
            <div className="flex flex-col gap-1">
              <div className="h-2 w-14 rounded-sm bg-black/70 dark:bg-white/70" />
              <div className="h-2 w-20 rounded-sm bg-black/40 dark:bg-white/40" />
            </div>
          </div>
        </div>
      </foreignObject>
    </svg>
  );
}
