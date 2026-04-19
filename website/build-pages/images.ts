import type { StaticImageData } from "next/image.js";
// @ts-ignore
import * as _images from "../.pages/images.ts";

const images = _images as Record<string, StaticImageData>;

export { images };
