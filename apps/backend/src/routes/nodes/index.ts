import Router from "../../structures/Router";
import Prisma from "../../utils/db/Prisma";

const router = new Router();

router.get(async (req, res) => {
  if (req.user?.role !== "ADMIN") {
    return res.status(403).json({ message: "Forbidden" });
  }

  const nodes = await Prisma.node.findMany({
    include: {
      shards: true,
    },
  });

  res.json(nodes);
});

export default router;
