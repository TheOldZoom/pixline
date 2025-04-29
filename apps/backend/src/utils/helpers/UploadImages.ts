import * as fs from "fs/promises";
import { Node, Prisma } from "../../prisma/.client";
import getNodeUrl from "./getNodeUrl";

export default async function UploadImages(
  images: Express.Multer.File[],
  node: Node,
  shardName: string
) {
  if (!images || images.length === 0) {
    return [];
  }

  const uploads = images.map(async (image) => {
    const fileBuffer = await fs.readFile(image.path);
    const blob = new Blob([fileBuffer], { type: image.mimetype });

    const formData = new FormData();
    formData.append("file", blob, image.originalname);
    const url = getNodeUrl(node);
    const res = await fetch(`${url}/${shardName}/upload`, {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      console.error(
        `Failed to upload ${image.originalname}:`,
        await res.text()
      );
      return null;
    }

    const data = await res.json();
    return data.url;
  });

  const results = await Promise.all(uploads);
  return results.filter((url): url is string => url !== null);
}
