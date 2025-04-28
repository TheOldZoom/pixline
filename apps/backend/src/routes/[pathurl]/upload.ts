import Router from "../../structures/Router";

const router = new Router();

router.post((req, res) => {
  // upload image

  res.json({
    message: "Hello World",
  });
});

export default router;
