import Router from "../../../structures/Router";
import Prisma from "../../../utils/db/Prisma";
import getNodeUrl from "../../../utils/helpers/getNodeUrl";

const router = new Router();

router.delete(async (req, res) => {
  try {
    const shardId = req.params.shardId;
    const fileId = req.params.fileId;

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

    const response = await fetch(
      `${getNodeUrl(shard.node)}/${shardId}/${fileId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${shard.node.secret_key}`,
        },
      }
    );

    const responseBody = await response.json().catch(() => null);

    if (!response.ok) {
      return res
        .status(response.status)
        .json(responseBody || { message: "Failed to delete file" });
    }

    res.status(response.status).json(responseBody);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
