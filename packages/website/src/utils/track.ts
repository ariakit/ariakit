const track = (event: string, meta?: any) => () => {
  // @ts-ignore
  dataLayer.push({ event, meta });
};

export default track;
