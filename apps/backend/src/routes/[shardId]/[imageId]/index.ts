import Router from "../../../structures/Router";

const router = new Router();

router.get((req, res) => {
  // make it that we get the image's url & info

  res.json({
    message: "Hello World",
  });
});

router.delete(async (req, res) => {
  // delete the image
  res.json({
    message: "Hello World",
  });
});

export default router;
