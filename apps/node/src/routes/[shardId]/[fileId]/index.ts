import Router from "../../../structures/Router";
import fs from "fs";
import path from "path";

const router = new Router();

router.delete((req, res) => {
  const shardId = req.params.shardId;
  const fileId = req.params.fileId;
  const folderPath = path.join(process.cwd(), "uploads", shardId);
  const filePath = path.join(folderPath, fileId);

  try {
    if (!fs.existsSync(folderPath)) {
      return res.status(404).json({ error: "Folder not found" });
    }

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: "file not found" });
    }

    const ext = path.extname(fileId).toLowerCase();
    if (![".png", ".jpg", ".jpeg", ".gif", ".webp", ".bmp"].includes(ext)) {
      return res.status(400).json({ error: "Invalid file type" });
    }

    fs.unlinkSync(filePath);
    res.json({
      message: "File deleted successfully.",
      file: {
        filename: fileId,
        url: `/coolAid/${fileId}`,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
