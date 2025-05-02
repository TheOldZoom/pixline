import * as fs from "fs/promises";
import { Node } from "../../prisma/.client";
import getNodeUrl from "./getNodeUrl";

export default async function UploadImages(
  images: Express.Multer.File[],
  node: Node,
  shardName: string
) {
  if (!images || images.length === 0) {
    return [];
  }

  const concurrency = 5;
  const results: any[] = [];
  const queue = [...images];

  async function worker() {
    while (queue.length > 0) {
      const batch = queue.splice(0, concurrency);
      if (batch.length === 0) break;

      try {
        const formData = new FormData();
        for (const image of batch) {
          const fileBuffer = await fs.readFile(image.path);
          const blob = new Blob([fileBuffer], { type: image.mimetype });
          formData.append("images", blob, image.originalname);
        }

        const url = getNodeUrl(node);
        const res = await fetch(`${url}/${shardName}/upload`, {
          method: "POST",
          body: formData,
          headers: {
            Authorization: `Bearer ${node.secret_key}`,
          },
        });

        // Delete local files after upload attempt, regardless of success
        for (const image of batch) {
          try {
            await fs.unlink(image.path);
          } catch (deleteError) {
            console.error(
              `Failed to delete local file ${image.path}:`,
              deleteError
            );
          }
        }

        if (!res.ok) {
          console.error(`Failed to upload batch of images:`, await res.text());
          results.push(...batch.map(() => null));
        } else {
          const data = await res.json();
          if (Array.isArray(data)) {
            results.push(...data); // Push an array of results
          } else if (data && typeof data === "object") {
            results.push(data); // Push the object if it's not an array
          } else {
            console.error("Unexpected response format:", data);
            results.push(...batch.map(() => null)); // Mark all as failed in this batch
          }
        }
      } catch (error) {
        // Even if the upload fails, try to delete the local files
        for (const image of batch) {
          try {
            await fs.unlink(image.path);
          } catch (deleteError) {
            console.error(
              `Failed to delete local file ${image.path}:`,
              deleteError
            );
          }
        }

        console.error(`Error uploading batch:`, error);
        results.push(...batch.map(() => null)); // Mark all as failed in this batch
      }
    }
  }

  const workers = Array.from({ length: concurrency }, () => worker());
  await Promise.all(workers);

  return {
    message: "Images uploaded successfully.",
    images: results
      .filter((r) => r && Array.isArray(r.files))
      .flatMap((r) => r.files),
  };
}
