import Router from "../../structures/Router";
import multer from "multer";
import path from "path";
import fs from "fs";
import { Request } from "express";

const fileFilter = (req: Request, file: any, cb: any) => {
  const allowedTypes = ["image/jpeg", "image/png", "image/gif"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type"), false);
  }
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const shardId = req.params.shardId as string;
    const uploadPath = path.join(
      __dirname,
      "..",
      "..",
      "..",
      "uploads",
      shardId
    );
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, uniqueSuffix + ext);
  },
});

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
});

const router = new Router();

router.post(upload.array("images", 10), async (req, res) => {
  const shardId = req.params.shardId as string;

  if (!req.files || !(req.files instanceof Array) || req.files.length === 0) {
    return res.status(400).json({ error: "No files uploaded." });
  }

  const uploadedFiles = req.files.map((file) => ({
    filename: file.filename,
    url: `/${shardId}/${file.filename}`,
    size: file.size,
  }));
  console.log({
    message: "Images uploaded successfully.",
    files: uploadedFiles,
  });
  return res.status(201).json({
    message: "Images uploaded successfully.",
    files: uploadedFiles,
  });
});

export default router;
