export default function Icon() {
  return (
    <svg viewBox="0 0 128 128" width={128} height={128}>
      <foreignObject width={128} height={128}>
        <div className="flex h-full flex-col items-start justify-center gap-3 p-5">
          <div className="flex w-full flex-col gap-2">
            <div className="ml-1.5 h-1.5 w-12 rounded-sm bg-black/60 dark:bg-white/70" />
            <div className="h-5 w-full rounded border border-black/30 bg-white px-2 py-1 dark:border-white/30 dark:bg-gray-900" />
          </div>
          <div className="flex w-full flex-col gap-2">
            <div className="ml-1.5 h-1.5 w-8 rounded-sm bg-black/60 dark:bg-white/70" />
            <div className="h-5 w-full rounded border border-black/30 bg-white px-2 py-1 dark:border-white/30 dark:bg-gray-900" />
          </div>
        </div>
      </foreignObject>
    </svg>
  );
}
