import Router from "../../structures/Router";
import Prisma from "../../utils/db/Prisma";

const router = new Router();

router.get(async (req, res) => {
  const user = req.user;

  const shards = await Prisma.shard.findMany({
    where: {
      users: {
        some: {
          id: user?.id,
        },
      },
    },
    include: {
      node: true,
      users: true,
    },
  });

  return res.json(shards);
});

export default router;
