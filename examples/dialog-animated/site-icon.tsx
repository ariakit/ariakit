export default function Icon() {
  return (
    <svg viewBox="0 0 128 128" width={128} height={128}>
      <foreignObject width={128} height={128}>
        <div className="flex h-full flex-col items-center justify-center p-5">
          <div className="w-full rounded-md border border-black/10 bg-gray-100 p-2 shadow-md dark:border-white/5 dark:bg-white/5 dark:shadow-md-dark">
            <div className="w-full rounded border border-black/10 bg-gray-50 p-2 shadow-md dark:border-white/5 dark:bg-white/5 dark:shadow-md-dark">
              <div className="flex w-full flex-col gap-2 rounded-sm border border-black/10 bg-white p-2 shadow-md dark:border-white/5 dark:bg-white/5 dark:shadow-md-dark">
                <div className="h-1 w-8 bg-black/70 dark:bg-white/70" />
                <div className="h-2 w-6 rounded-sm bg-blue-600 dark:bg-blue-500" />
              </div>
            </div>
          </div>
        </div>
      </foreignObject>
    </svg>
  );
}
