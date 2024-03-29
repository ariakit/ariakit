export default function Icon() {
  return (
    <svg viewBox="0 0 128 128" width={128} height={128}>
      <foreignObject width={128} height={128}>
        <div className="flex h-full flex-col items-center justify-center px-5">
          <div className="flex w-full flex-col gap-2 rounded-md border border-black/20 bg-white p-1 shadow dark:border-white/10 dark:bg-white/10 dark:shadow-dark">
            <div className="grid h-3.5 w-full grid-flow-col gap-1 overflow-hidden rounded-t">
              <div className="rounded-[1px] bg-red-500" />
              <div className="rounded-[1px] bg-green-500" />
              <div className="rounded-[1px] bg-blue-500" />
            </div>
            <div className="flex flex-col gap-1 p-1 pb-2">
              <div className="h-1.5 w-full rounded-[1px] bg-black/35 dark:bg-white/40" />
              <div className="h-1.5 w-full rounded-[1px] bg-black/35 dark:bg-white/40" />
              <div className="h-1.5 w-10 rounded-[1px] bg-black/35 dark:bg-white/40" />
            </div>
          </div>
        </div>
      </foreignObject>
    </svg>
  );
}
