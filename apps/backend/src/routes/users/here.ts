import Router from "../../structures/Router";
import Prisma from "../../utils/db/Prisma";

const router = new Router();

let hasUser = false;

router.get(async (req, res) => {
  if (!hasUser) {
    const users = await Prisma.user.findMany({ take: 1 });
    hasUser = users.length > 0;
  }

  res.status(200).json({
    hasUser,
  });
});

export default router;
