import Router from "../../structures/Router";
import fs from "fs";
import path from "path";

const router = new Router();

router.get((req, res) => {
  const shardId = req.params.shardId;
  const folderPath = path.join(process.cwd(), "uploads", shardId);
  try {
    if (!fs.existsSync(folderPath)) {
      return res.status(404).json({ error: "Folder not found" });
    }

    const localFiles = fs.readdirSync(folderPath);
    const files = localFiles
      .filter((file) => {
        const ext = path.extname(file).toLowerCase();
        return [".png", ".jpg", ".jpeg", ".gif", ".webp", ".bmp"].includes(ext);
      })
      .map((file) => {
        const filePath = path.join(folderPath, file);
        const stats = fs.statSync(filePath);
        return {
          filename: file,
          url: `/coolAid/${file}`,
          size: stats.size,
        };
      });

    res.json({
      message: "Files fetched successfully.",
      files: files,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
