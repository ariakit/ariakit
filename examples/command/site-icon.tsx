export default function Icon() {
  return (
    <svg viewBox="0 0 128 128" width={128} height={128}>
      <foreignObject width={128} height={128}>
        <div className="flex h-full w-full items-center justify-center p-4">
          <div className="flex h-10 items-center justify-center rounded bg-black/40 px-4 dark:bg-white/20">
            <div className="h-2 w-10 bg-white dark:bg-white/90" />
          </div>
        </div>
      </foreignObject>
    </svg>
  );
}
