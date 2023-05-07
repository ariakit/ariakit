export default function Icon() {
  return (
    <svg viewBox="0 0 128 128" width={128} height={128}>
      <foreignObject width={128} height={128}>
        <div className="flex h-full flex-col items-center justify-center p-5">
          <div className="flex flex-col gap-1">
            <div className="ml-1 h-3 w-8 rounded-sm bg-blue-600" />
            <div className="h-16 w-16 rounded border border-gray-300 bg-gray-200 shadow dark:border-gray-450 dark:bg-white/5 dark:shadow-dark">
              <div className="-ml-px -mt-px h-14 w-14 rounded border border-gray-300 bg-gray-100 shadow dark:border-gray-450 dark:bg-white/5  dark:shadow-dark">
                <div className="-ml-px -mt-px flex h-12 w-12 flex-col gap-1.5 rounded border border-gray-300 bg-white p-1.5 shadow dark:border-gray-450 dark:bg-white/5 dark:shadow-dark">
                  <div className="h-1 w-6 bg-black/80 dark:bg-white/80" />
                  <div className="-ml-2 h-1 w-6 bg-black/60 dark:bg-white/60" />
                  <div className="-ml-4 h-1 w-8 bg-black/40 dark:bg-white/40" />
                  <div className="-ml-6 h-1 w-4 bg-black/20 dark:bg-white/20" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </foreignObject>
    </svg>
  );
}
