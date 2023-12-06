export default function Icon() {
  return (
    <svg viewBox="0 0 128 128" width={128} height={128}>
      <foreignObject width={128} height={128}>
        <div className="flex h-full flex-col items-center gap-[5px] overflow-hidden bg-gradient-to-br from-blue-600/40 to-purple-600/40 px-4 pt-6">
          <div className="h-6 w-full flex-none rounded-md border border-violet-400 bg-white px-[10px] py-[5px] dark:border-white/30 dark:bg-black/80">
            <div className="h-full w-px bg-black/70 dark:bg-white/80" />
          </div>
          <div className="flex w-full flex-none flex-col gap-[10px] rounded-md border border-violet-400 bg-white p-[10px] dark:border-white/20 dark:bg-white/[15%]">
            <div className="h-2 w-14 rounded-sm bg-black/40 dark:bg-white/70" />
            <div className="h-2 w-10 rounded-sm bg-violet-600 dark:bg-blue-400" />
            <div className="h-2 w-12 rounded-sm bg-black/40 dark:bg-white/70" />
            <div className="h-2 w-8 rounded-sm bg-black/40 dark:bg-white/70" />
            <div className="h-2 w-10 rounded-sm bg-black/40 dark:bg-white/70" />
          </div>
        </div>
      </foreignObject>
    </svg>
  );
}
