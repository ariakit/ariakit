const track = (event: string, meta?: any) => () => {
  dataLayer.push({ event, meta });
};

export default track;
