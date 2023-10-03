export default function Icon() {
  return (
    <svg viewBox="0 0 128 128" width={128} height={128}>
      <foreignObject width={128} height={128}>
        <div className="flex h-full flex-col items-center justify-center p-3">
          <div className="flex w-full gap-1 rounded-md border border-black/20 bg-white p-1 shadow dark:border-white/10 dark:bg-white/10 dark:shadow-dark">
            <div className="h-4 w-4 rounded-sm bg-black/30 dark:bg-white/30" />
            <div className="flex-1 rounded-sm bg-blue-600 dark:bg-blue-500" />
            <div className="w-px bg-black/20 dark:bg-white/20" />
            <div className="h-4 w-4 rounded-sm bg-black/30 dark:bg-white/30" />
            <div className="h-4 w-4 rounded-sm bg-black/30 dark:bg-white/30" />
          </div>
        </div>
      </foreignObject>
    </svg>
  );
}
