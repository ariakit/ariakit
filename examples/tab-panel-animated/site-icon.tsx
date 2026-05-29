export default function Icon() {
  return (
    <svg viewBox="0 0 128 128" width={128} height={128}>
      <foreignObject width={128} height={128}>
        <div className="flex h-full flex-col items-center gap-2 pt-8">
          <div className="flex flex-none items-center justify-center gap-2">
            <div className="h-3 w-6 rounded-full bg-black/20 dark:bg-white/20" />
            <div className="h-3 w-6 rounded-full bg-blue-600 dark:bg-blue-500" />
            <div className="h-3 w-6 rounded-full bg-black/20 dark:bg-white/20" />
          </div>
          <div className="flex w-full flex-1 items-center justify-center gap-1">
            <div className="flex flex-1 flex-col gap-1 *:h-px *:w-full *:bg-black/55 *:dark:bg-white/40">
              <div />
              <div />
              <div />
              <div />
              <div />
              <div />
              <div />
              <div />
              <div />
            </div>
            <div className="flex h-full w-24 flex-col gap-2 rounded-t-lg border-x border-t border-black/40 bg-white p-4 dark:border-white/20 dark:bg-white/20">
              <div className="h-2 w-full rounded-[1px] bg-black/35 dark:bg-white/40" />
              <div className="h-2 w-full rounded-[1px] bg-black/35 dark:bg-white/40" />
              <div className="h-2 w-10 rounded-[1px] bg-black/35 dark:bg-white/40" />
            </div>
            <div className="flex flex-1 flex-col gap-1 *:h-px *:w-full *:bg-black/55 *:dark:bg-white/40">
              <div />
              <div />
              <div />
              <div />
              <div />
              <div />
              <div />
              <div />
              <div />
            </div>
          </div>
        </div>
      </foreignObject>
    </svg>
  );
}
