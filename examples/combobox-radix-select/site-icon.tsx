export default function Icon() {
  return (
    <svg viewBox="0 0 128 128" width={128} height={128}>
      <foreignObject width={128} height={128}>
        <div className="h-full overflow-hidden bg-gradient-to-br from-blue-600/40 to-purple-600/40">
          <div className="ml-3 mt-6 flex w-40 flex-col gap-2">
            <div className="rounded-mg ml-3 flex h-6 w-20 items-center justify-end rounded border border-violet-400 bg-white px-1 dark:border-white/50 dark:bg-white/20">
              <svg
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                viewBox="0 0 16 16"
                className="h-4 w-4 stroke-black dark:stroke-white"
              >
                <polyline points="4,6 8,10 12,6" />
              </svg>
            </div>
            <div className="flex w-36 flex-col overflow-hidden rounded-xl border border-violet-400 bg-white shadow dark:border-white/20 dark:bg-white/[15%] dark:shadow-dark">
              <div className="flex h-8 w-full items-center gap-0.5 border-b border-black/40 px-3 py-1.5 dark:border-white/50 dark:bg-black/60">
                <div className="h-2 w-12 rounded-sm bg-blue-600 dark:bg-blue-400" />
                <div className="h-full w-px bg-black dark:bg-white" />
              </div>
              <div className="flex flex-col gap-4 p-3 py-4">
                <div className="h-2 w-20 rounded-sm bg-black/40 dark:bg-white/70" />
                <div className="h-2 w-10 rounded-sm bg-black/40 dark:bg-white/70" />
              </div>
            </div>
          </div>
        </div>
      </foreignObject>
    </svg>
  );
}
