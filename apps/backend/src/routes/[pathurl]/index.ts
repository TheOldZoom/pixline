import Router from "../../structures/Router";

const router = new Router();

router.get((req, res) => {
  // Get all imageIds including their urls & info

  res.json({
    message: "Hello World",
  });
});

export default router;
