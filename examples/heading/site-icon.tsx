export default function Icon() {
  return (
    <svg viewBox="0 0 128 128" width={128} height={128}>
      <foreignObject width={128} height={128}>
        <div className="flex h-full w-full flex-col justify-center gap-2 p-5">
          <div className="mb-1 h-2 w-14 rounded-[1px] bg-black/80 dark:bg-white" />
          <div className="h-1.5 w-8 rounded-[1px] bg-black/60 dark:bg-white/70" />
          <div className="flex flex-col gap-1">
            <div className="h-1 w-20 rounded-[1px] bg-black/35 dark:bg-white/40" />
          </div>
          <div className="h-1.5 w-12 rounded-[1px] bg-black/60 dark:bg-white/70" />
          <div className="flex flex-col gap-1">
            <div className="h-1 w-full rounded-[1px] bg-black/35 dark:bg-white/40" />
            <div className="h-1 w-10 rounded-[1px] bg-black/35 dark:bg-white/40" />
          </div>
        </div>
      </foreignObject>
    </svg>
  );
}
