function getItem(filled = false) {
  return (
    <div className="flex items-center gap-2">
      <div className="h-4 w-4 rounded-full border-2 border-blue-600 bg-white p-0.5 dark:border-blue-600 dark:bg-black">
        {filled && (
          <div className="h-full w-full rounded-full bg-blue-600 dark:bg-blue-500" />
        )}
      </div>
      <div className="h-1.5 w-10 bg-black/70 dark:bg-white/70" />
    </div>
  );
}

export default function Icon() {
  return (
    <svg viewBox="0 0 128 128" width={128} height={128}>
      <foreignObject width={128} height={128}>
        <div className="flex h-full flex-col items-center justify-center p-5">
          <div className="flex flex-col items-start gap-2">
            {getItem()}
            {getItem(true)}
            {getItem()}
          </div>
        </div>
      </foreignObject>
    </svg>
  );
}
