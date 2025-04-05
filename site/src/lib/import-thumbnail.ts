export async function importThumbnail(name: string) {
  const example = name.split("/").shift();
  try {
    return await import(`../examples/${example}/thumbnail.react.tsx`);
  } catch (error) {
    console.log(`Missing thumbnail for ${name}`);
  }
}
