export default function track(event: string, meta?: any) {
  return () => {
    // @ts-ignore
    dataLayer.push({ event, meta });
  };
}
