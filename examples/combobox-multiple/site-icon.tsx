export default function Icon() {
  return (
    <svg viewBox="0 0 128 128" width={128} height={128}>
      <foreignObject width={128} height={128}>
        <div className="h-full overflow-hidden">
          <div className="ml-6 mt-6 flex w-40 flex-col gap-2">
            <div className="flex h-8 w-full items-center gap-1 rounded-[5px] border border-black/30 bg-white px-3 py-2 dark:border-white/30 dark:bg-black">
              <div className="h-full w-px bg-black dark:bg-white" />
            </div>
            <div className="flex w-full flex-col gap-3 rounded-[5px] border border-black/20 bg-white p-3 pl-2 shadow dark:border-white/10 dark:bg-white/10 dark:shadow-dark">
              <div className="flex w-full items-center gap-2">
                <svg
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={3}
                  className="h-4 w-4 stroke-black/80 dark:stroke-white/80"
                >
                  <path d="M4.5 12.75l6 6 9-13.5" />
                </svg>
                <div className="h-[10px] w-[40%] rounded-sm bg-blue-600 dark:bg-blue-500" />
              </div>
              <div className="flex w-full items-center gap-2">
                <svg
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={3}
                  className="h-4 w-4 stroke-black/80 dark:stroke-white/80"
                >
                  <path d="M4.5 12.75l6 6 9-13.5" />
                </svg>
                <div className="h-[10px] w-[60%] rounded-sm bg-black/50 dark:bg-white/50" />
              </div>
            </div>
          </div>
        </div>
      </foreignObject>
    </svg>
  );
}
