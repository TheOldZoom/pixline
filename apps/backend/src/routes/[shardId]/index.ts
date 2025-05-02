import { Node } from "../../prisma/.client";
import Router from "../../structures/Router";
import Prisma from "../../utils/db/Prisma";
import getNodeUrl from "../../utils/helpers/getNodeUrl";

const router = new Router();

router.get(async (req, res) => {
  try {
    const shardId = req.params.shardId;

    const shard = await Prisma.shard.findFirst({
      where: {
        name: shardId,
      },
      include: {
        node: true,
        users: true,
      },
    });

    if (!shard) {
      return res.status(404).json({ message: "Shard not found" });
    }

    if (req.user && !shard.users.some((user) => user.id === req?.user?.id)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const response = await fetch(getNodeUrl(shard.node) + "/" + shardId, {
      headers: {
        Authorization: `Bearer ${shard.node.secret_key}`,
      },
    });

    if (!response.ok) {
      return res.status(response.status).json(await response.json());
    }

    const data = await response.json();
    console.log(data);
    res.json(formatResponse(data, shard.node));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

type UploadResponse = {
  message: string;
  files: Array<{ filename: string; url: string; size: number }>;
};

type FormattedResponse = {
  message: string;
  totalFiles?: number;
  totalSize?: number;
  files?: Array<{ name: string; url: string }>;
};

const formatResponse = (
  response: UploadResponse,
  node: Node
): FormattedResponse => {
  return {
    message: response.message,
    totalFiles: response.files.length,
    totalSize: response.files.reduce((sum, file) => sum + file.size, 0),
    files: response.files.map((file) => ({
      name: file.filename,
      url: getNodeUrl(node) + file.url,
      size: file.size,
    })),
  };
};

export default router;
