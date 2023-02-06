export const dynamicParams = false;

export async function generateStaticParams() {
  return [
    { category: "guide" },
    { category: "components" },
    { category: "examples" },
    { category: "blog" },
  ];
}

export default function Page({ params }: { params: { category: string } }) {
  console.log(params);
  return <div>{params.category}</div>;
}
