export function BoxPatternsRight() {
  const top = (
    <div className="absolute bottom-full flex flex-col gap-2 end-0 mb-4 w-full h-40 mask-t-from-50% mask-t-to-95% ak-layer-pop ak-frame-border ak-frame-2xl/2 [--hole:var(--ak-layer-parent)]">
      <div className="ak-layer-(--hole) ak-frame/2 ring flex-1 flex flex-col">
        <div className="flex-1" />
        <div className="ak-layer-pop ak-frame/1 h-8 w-2/3" />
      </div>
      <div className="ak-layer-(--hole) ak-light:ak-layer ak-frame/1 ring flex">
        <div className="size-8 ak-frame/1 ak-layer-pop ms-auto" />
      </div>
    </div>
  );

  const bottom = (
    <div className="absolute top-full end-0 mt-4 w-[220%] grid grid-cols-[1.2fr_1fr_1.4fr] gap-4 mask-l-from-50% mask-b-from-20%">
      <div className="ak-layer-pop ak-frame-border h-40 ak-frame-2xl/2 flex">
        <div className="ms-auto h-10 aspect-square ak-frame ak-frame-border ak-layer" />
      </div>
      <div className="ak-layer-current ak-frame-border h-40 ak-frame-2xl/2 flex flex-col gap-2">
        <div className="ak-layer-pop ak-frame-border ak-frame/1 h-10">
          <div className="h-full aspect-square ak-frame/1 ring ak-layer-down ak-light:ak-layer" />
        </div>
        <div className="ak-layer-pop ak-frame/1 h-10" />
        <div className="ak-layer-pop ak-frame/1 h-10">
          <div className="h-full aspect-square ak-frame/1 ring ak-layer-down ak-light:ak-layer" />
        </div>
      </div>
      <div className="ak-layer-pop ak-frame-border h-40 ak-frame-2xl/2 flex flex-col gap-2">
        <div className="ak-layer-down ak-light:ak-layer h-10 ak-frame-border ak-frame-cover flex flex-none">
          <div className="h-full aspect-square ak-frame/1 ring ak-layer-pop ms-auto" />
        </div>
        <div className="ak-layer-down ak-frame-border h-10 ak-frame flex-none" />
        <div className="ak-layer-down ak-frame-border h-full ak-frame" />
      </div>
    </div>
  );

  const right = (
    <div className="absolute start-full flex flex-col gap-2 ms-4 -translate-y-[70%] ak-layer-down ak-frame-border h-75 w-70 ak-frame-2xl/2 mask-r-from-50% mask-t-from-50%">
      <div className="ak-layer-pop ak-frame flex-1" />
      <div className="ak-layer-pop ak-frame h-10 ak-frame-border" />
      <div className="ak-layer-pop ak-frame h-10" />
      <div className="ak-layer ak-frame-border ak-frame-cover flex gap-2">
        <div className="ak-layer-pop ak-frame-border h-8 w-14 ak-frame" />
        <div className="ak-layer-pop ak-frame-border h-8 w-10 ak-frame" />
      </div>
    </div>
  );

  const left = (
    <div className="absolute end-full bottom-0 flex flex-col gap-1 me-4 ak-layer-pop ak-frame-border h-40 w-[80%] ak-frame-2xl/2 mask-l-from-50% mask-l-to-95% mask-t-from-50% mask-t-to-95% [--hole:var(--ak-layer-parent)]">
      <div className="flex-1" />
      <div className="flex">
        <div className="h-10 w-20 ak-frame/1 ak-frame-border ak-layer-pop ms-auto" />
      </div>
    </div>
  );

  return (
    <div className="opacity-30 absolute inset-0 ak-light:opacity-40 -z-1 touch-none **:ak-edge/25 [--contrast:0]">
      {top}
      {right}
      {bottom}
      {left}
    </div>
  );
}
