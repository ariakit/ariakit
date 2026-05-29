export default function Icon() {
  return (
    <svg viewBox="0 0 128 128" width={128} height={128}>
      <foreignObject width={128} height={128}>
        <div className="pl-8 pt-4">
          <div className="flex flex-col items-center justify-center">
            <div className="flex flex-col gap-2">
              <div className="ml-2.5 h-5 w-14 rounded bg-blue-600" />
              <div className="flex w-32 flex-col overflow-hidden rounded-lg border border-black/30 bg-white shadow dark:border-white/[15%] dark:bg-white/10 dark:shadow-dark">
                <div className="flex h-7 w-full items-center gap-0.5 border-b border-black/40 px-2.5 py-1.5 dark:border-0 dark:bg-gray-900">
                  <div className="h-2 w-8 rounded-sm bg-black/40 dark:bg-white/50" />
                  <div className="h-full w-px bg-black dark:bg-white" />
                </div>
                <div className="flex flex-col">
                  <div className="flex h-7 items-center bg-blue-100 px-2.5 dark:bg-blue-800/60">
                    <div className="h-1.5 w-16 rounded-[1px] bg-black/50 dark:bg-white/80" />
                  </div>
                  <div className="flex h-7 items-center px-2.5">
                    <div className="h-1.5 w-12 rounded-[1px] bg-black/40 dark:bg-white/50" />
                  </div>
                  <div className="flex h-7 items-center px-2.5">
                    <div className="h-1.5 w-20 rounded-[1px] bg-black/40 dark:bg-white/50" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </foreignObject>
    </svg>
  );
}
