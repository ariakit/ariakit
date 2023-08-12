export default function Icon() {
  return (
    <svg viewBox="0 0 128 128" width={128} height={128}>
      <foreignObject width={128} height={128}>
        <div className="h-full overflow-hidden">
          <div className="ml-6 mt-6 flex w-40 flex-col gap-2">
            <div className="flex h-40 w-full flex-col gap-1 rounded-lg border border-black/30 bg-gray-100 p-4 py-3 dark:border-white/30 dark:bg-black">
              <div className="flex items-center gap-1">
                <div className="h-3 w-6 rounded-sm bg-black/60 dark:bg-white/60" />
                <div className="h-6 w-px bg-black dark:bg-white" />
              </div>
              <div className="ml-4 flex w-full flex-col gap-3 rounded-md border border-black/20 bg-white p-3 shadow dark:border-white/10 dark:bg-white/10 dark:shadow-dark">
                <div className="h-2 w-[60%] bg-blue-600 dark:bg-blue-500" />
                <div className="h-2 w-[40%] bg-black/50 dark:bg-white/50" />
                <div className="h-2 w-[75%] bg-black/50 dark:bg-white/50" />
              </div>
            </div>
          </div>
        </div>
      </foreignObject>
    </svg>
  );
}
