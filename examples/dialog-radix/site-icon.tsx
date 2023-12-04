export default function Icon() {
  return (
    <svg viewBox="0 0 128 128" width={128} height={128}>
      <foreignObject width={128} height={128}>
        <div className="h-full overflow-hidden bg-gradient-to-br from-blue-600/40 to-purple-600/40 p-6">
          <div className="flex w-40 flex-none flex-col gap-3 rounded-lg border border-violet-400 bg-white p-4 dark:border-white/20 dark:bg-white/20">
            <div className="h-3 w-14 rounded-sm bg-black/60 dark:bg-white/90" />
            <div className="flex flex-col gap-2">
              <div className="h-2 w-full rounded-sm bg-black/30 dark:bg-white/60" />
              <div className="h-2 w-14 rounded-sm bg-black/30 dark:bg-white/60" />
            </div>
            <div className="h-5 w-20 flex-none rounded border border-violet-400 bg-white dark:border-white/30 dark:bg-black/60" />
          </div>
        </div>
      </foreignObject>
    </svg>
  );
}
