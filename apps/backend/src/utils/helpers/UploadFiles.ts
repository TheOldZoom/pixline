import * as fs from "fs/promises";
import { Node } from "../../prisma/.client";
import getNodeUrl from "./getNodeUrl";

export default async function Uploadfiles(
  files: Express.Multer.File[],
  node: Node,
  shardName: string
) {
  if (!files || files.length === 0) {
    return [];
  }

  const concurrency = process.env.MAX_FILES
    ? parseInt(process.env.MAX_FILES)
    : 10;
  const results: any[] = [];
  const queue = [...files];

  async function worker() {
    while (queue.length > 0) {
      const batch = queue.splice(0, concurrency);
      if (batch.length === 0) break;

      try {
        const formData = new FormData();
        for (const file of batch) {
          const fileBuffer = await fs.readFile(file.path);
          const blob = new Blob([fileBuffer], { type: file.mimetype });
          formData.append("files", blob, file.originalname);
        }

        const url = getNodeUrl(node);
        const res = await fetch(`${url}/${shardName}/upload`, {
          method: "POST",
          body: formData,
          headers: {
            Authorization: `Bearer ${node.secret_key}`,
          },
        });

        for (const file of batch) {
          try {
            await fs.unlink(file.path);
          } catch (deleteError) {
            console.error(
              `Failed to delete local file ${file.path}:`,
              deleteError
            );
          }
        }

        if (!res.ok) {
          console.error(`Failed to upload batch of files:`, await res.text());
          results.push(...batch.map(() => null));
        } else {
          const data = await res.json();
          if (Array.isArray(data)) {
            results.push(...data);
          } else if (data && typeof data === "object") {
            results.push(data);
          } else {
            console.error("Unexpected response format:", data);
            results.push(...batch.map(() => null));
          }
        }
      } catch (error) {
        for (const file of batch) {
          try {
            await fs.unlink(file.path);
          } catch (deleteError) {
            console.error(
              `Failed to delete local file ${file.path}:`,
              deleteError
            );
          }
        }

        console.error(`Error uploading batch:`, error);
        results.push(...batch.map(() => null));
      }
    }
  }

  const workers = Array.from({ length: concurrency }, () => worker());
  await Promise.all(workers);

  return {
    message: "files uploaded successfully.",
    files: results
      .filter((r) => r && Array.isArray(r.files))
      .flatMap((r) => r.files),
  };
}
