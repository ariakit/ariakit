interface SEOTitleProps {
  value: string;
}

export default function SEOTitle({ value }: SEOTitleProps) {
  return (
    <>
      <title>{value}</title>
      <meta name="og:title" key="og:title" content={value} />
    </>
  );
}
