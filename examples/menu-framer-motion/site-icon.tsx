export default function Icon() {
  return (
    <svg viewBox="0 0 128 128" width={128} height={128}>
      <foreignObject width={128} height={128}>
        <div className="h-full overflow-hidden">
          <div className="mt-6 flex flex-col gap-2">
            <div className="ml-11 h-5 w-12 rounded bg-blue-600" />
            <div className="ml-9 h-20 w-24 rounded-md border border-gray-300 bg-gray-200 shadow dark:border-gray-450 dark:bg-white/5 dark:shadow-dark">
              <div className="-ml-px -mt-px h-16 w-20 rounded border border-gray-300 bg-gray-100 shadow dark:border-gray-450 dark:bg-white/5  dark:shadow-dark">
                <div className="-ml-px -mt-px flex h-12 w-16 flex-col gap-2 rounded border border-gray-300 bg-white p-1.5 shadow dark:border-gray-450 dark:bg-white/5 dark:shadow-dark">
                  <div className="h-1.5 w-8 flex-none rounded-[1px] bg-black/70 dark:bg-white/80" />
                  <div className="-ml-2 h-1.5 w-8 flex-none rounded-[1px] bg-black/50 dark:bg-white/60" />
                  <div className="-ml-4 h-1.5 w-10 flex-none rounded-[1px] bg-black/30 dark:bg-white/40" />
                  <div className="-ml-6 h-1.5 w-4 flex-none rounded-l-[1px] bg-black/15 dark:bg-white/20" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </foreignObject>
    </svg>
  );
}
