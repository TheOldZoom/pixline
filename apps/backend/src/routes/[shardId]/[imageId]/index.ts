import Router from "../../../structures/Router";

const router = new Router();

router.get((req, res) => {
  // make it that we get the image's url & info

  res.json({
    message: "Hello World",
  });
});

router.patch((req, res) => {
  // edit the image info, update etc

  res.json({
    message: "Hello World",
  });
});

export default router;
