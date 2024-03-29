export default function Icon() {
  return (
    <svg viewBox="0 0 128 128" width={128} height={128}>
      <foreignObject width={128} height={104} y={24}>
        <div className="h-full overflow-hidden">
          <div className="-ml-14 flex w-40 flex-col gap-3">
            <div className="flex h-10 w-full flex-row-reverse items-center rounded-md border border-black/30 bg-white px-2 py-1 dark:border-white/30 dark:bg-gray-900">
              <svg
                viewBox="0 0 16 16"
                className="h-7 w-7 fill-none stroke-black dark:stroke-white/80"
              >
                <line x1="5" y1="5" x2="11" y2="11" />
                <line x1="5" y1="11" x2="11" y2="5" />
              </svg>
            </div>
            <div className="flex w-full flex-col gap-4 rounded-md border border-black/20 bg-white p-4 shadow dark:border-white/10 dark:bg-white/10 dark:shadow-dark">
              <div className="h-2.5 w-[75%] rounded-sm bg-black/[45%] dark:bg-white/50" />
              <div className="h-2.5 w-[65%] rounded-sm bg-blue-600 dark:bg-blue-500" />
              <div className="h-2.5 w-[80%] rounded-sm bg-black/[45%] dark:bg-white/50" />
            </div>
          </div>
        </div>
      </foreignObject>
    </svg>
  );
}
