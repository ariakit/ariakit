export default function Icon() {
  return (
    <svg viewBox="0 0 128 128" width={128} height={128}>
      <foreignObject width={128} height={128}>
        <div className="flex h-full w-full flex-col justify-center gap-2 p-5">
          <div className="mb-1 h-2 w-14 bg-black dark:bg-white" />
          <div className="h-1.5 w-8 bg-black/70 dark:bg-white/70" />
          <div className="flex flex-col gap-1">
            <div className="h-1 w-20 bg-black/40 dark:bg-white/40" />
          </div>
          <div className="h-1.5 w-12 bg-black/70 dark:bg-white/70" />
          <div className="flex flex-col gap-1">
            <div className="h-1 w-full bg-black/40 dark:bg-white/40" />
            <div className="h-1 w-10 bg-black/40 dark:bg-white/40" />
          </div>
        </div>
      </foreignObject>
    </svg>
  );
}
