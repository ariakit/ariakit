function getItem() {
  return (
    <div className="flex items-center gap-2">
      <div className="h-2.5 w-2.5 rounded-full border-2 border-blue-600 bg-white dark:bg-black" />
      <div className="h-1 w-10 bg-black/70 dark:bg-white/70" />
    </div>
  );
}

export default function Icon() {
  return (
    <svg viewBox="0 0 128 128" width={128} height={128}>
      <foreignObject width={128} height={128}>
        <div className="flex h-full flex-col items-center justify-center gap-3 p-5">
          <div className="h-1.5 w-12 bg-black/70 dark:bg-white/70" />
          <div className="flex flex-col items-start gap-1">
            {getItem()}
            {getItem()}
            {getItem()}
          </div>
          <div className="h-4 w-10 rounded-sm bg-blue-600" />
        </div>
      </foreignObject>
    </svg>
  );
}
