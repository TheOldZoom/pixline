import multer from "multer";
import Router from "../../structures/Router";
import * as fs from "fs";
import * as path from "path";
import { NextFunction, Request, Response } from "express";
import Prisma from "../../utils/db/Prisma";
import Uploadfiles from "../../utils/helpers/UploadFiles";
import getNodeUrl from "../../utils/helpers/getNodeUrl";
import { Node } from "../../prisma/.client";

const UPLOAD_DIR = path.join(process.cwd(), "uploads");
const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE || "10") * 1024 * 1024;
const MAX_FILES = parseInt(process.env.MAX_FILES || "10");

try {
  if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  }
} catch (error) {
  console.error("Error creating upload directory:", error);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    try {
      cb(null, UPLOAD_DIR);
    } catch (error) {
      cb(error as Error, "");
    }
  },
  filename: (req, file, cb) => {
    try {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(null, uniqueSuffix + "-" + file.originalname);
    } catch (error) {
      cb(error as Error, "");
    }
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: MAX_FILES,
  },
  fileFilter: (req, file, cb) => {
    try {
      const allowedTypes = (
        process.env.ALLOWED_FILE_TYPES || "image/jpeg,image/png,image/gif"
      )
        .split(",")
        .map((type) => type.trim());

      if (allowedTypes.includes("*") || allowedTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(
          new Error(
            `File type not allowed. Allowed types: ${allowedTypes.join(", ")}`
          )
        );
      }
    } catch (error) {
      cb(error as Error);
    }
  },
});

const router = new Router();

async function checkIfShardExists(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const shardId = req.params.shardId;
    if (!shardId) {
      return res.status(400).json({ message: "Shard ID is required" });
    }

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

    req.shard = shard;
    next();
  } catch (error: any) {
    console.error("Error checking if shard exists:", error);
    return res.status(500).json({
      message: "Server error while checking shard",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
}

const handleMulterError = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      const maxSizeMB = MAX_FILE_SIZE / (1024 * 1024);
      return res.status(400).json({
        message: `File size too large. Maximum size is ${maxSizeMB}MB.`,
      });
    } else if (err.code === "LIMIT_FILE_COUNT") {
      return res
        .status(400)
        .json({ message: `Too many files. Maximum count is ${MAX_FILES}.` });
    }
    console.log(err);
    return res.status(400).json({ message: `Upload error: ${err.message}` });
  } else if (err) {
    return res
      .status(500)
      .json({ message: `Server error during file upload: ${err.message}` });
  }
  next();
};

router.post(
  checkIfShardExists,
  (req, res, next) => {
    upload.array("files", MAX_FILES)(req, res, (err) => {
      if (err) {
        return handleMulterError(err, req, res, next);
      }
      next();
    });
  },
  async (req, res) => {
    try {
      const Files = req.files as Express.Multer.File[];
      if (!Files || Files.length === 0) {
        return res.status(400).json({
          message: "No files uploaded",
        });
      }

      const shardId = req.params.shardId;
      const shard = req.shard;
      if (!shard || !shard.node) {
        return res.status(400).json({
          message: "Invalid shard configuration",
        });
      }

      const files = await Uploadfiles(Files, shard.node, shardId);

      return res
        .status(200)
        .json(formatResponse(files as UploadResponse, shard.node));
    } catch (error: any) {
      console.error("Error uploading files:", error);
      return res.status(500).json({
        message: "Failed to process uploaded files",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  }
);

export default router;

type UploadResponse = {
  message: string;
  files: Array<{ filename: string; url: string; size: number }>;
};

type FormattedResponse = {
  message: string;
  totalFiles?: number;
  totalSize?: number;
  files?: Array<{ name: string; url: string }>;
};

const formatResponse = (
  response: UploadResponse,
  node: Node
): FormattedResponse => {
  return {
    message: response.message,
    totalFiles: response.files.length,
    totalSize: response.files.reduce((sum, file) => sum + file.size, 0),
    files: response.files.map((file) => ({
      name: file.filename,
      url: getNodeUrl(node) + file.url,
      size: file.size,
    })),
  };
};
