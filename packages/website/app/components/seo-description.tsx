interface SEODescriptionProps {
  value: string;
}

export default function SEODescription({ value }: SEODescriptionProps) {
  return (
    <>
      <meta name="description" key="description" content={value} />
      <meta name="og:description" key="og:description" content={value} />
    </>
  );
}
