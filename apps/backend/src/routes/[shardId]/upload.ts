import multer from "multer";
import Router from "../../structures/Router";
import * as fs from "fs";
import * as path from "path";

const uploadDir = path.join(process.cwd(), "src", "uploads");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
  destination: (req, res, cb) => {
    cb(null, uploadDir);
  },

  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});

const upload = multer({ storage });

const router = new Router();

router.post(upload.array("images", 10), async (req, res) => {
  const files = req.files as Express.Multer.File[];

  if (!files || files.length === 0) {
    return res.status(400).json({
      message: "No files uploaded",
    });
  }

  // function to upload files

  res.json({
    message: "Files uploaded successfully",
  });
});

export default router;
