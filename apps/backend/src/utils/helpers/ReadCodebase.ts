import * as fs from "fs";
import * as path from "path";

interface FileStats {
  filePath: string;
  totalCharacters: number;
  totalLines: number;
  codeLines: number;
  emptyLines: number;
  commentLines: number;
  wordCount: number;
  avgLineLength: number;
}

interface CodebaseStats {
  totalFiles: number;
  totalCharacters: number;
  totalLines: number;
  totalCodeLines: number;
  totalEmptyLines: number;
  totalCommentLines: number;
  totalWordCount: number;
  avgLinesPerFile: number;
  fileStats: FileStats[];
}

function analyzeCodebase(
  directoryPath: string,
  fileExtensions: string[] = [
    ".ts",
    ".js",
    ".tsx",
    ".jsx",
    ".html",
    ".css",
    ".scss",
  ],
  ignorePatterns: string[] = [
    "node_modules",
    "dist",
    "build",
    ".git",
    ".client",
  ]
): CodebaseStats {
  const fileStats: FileStats[] = [];

  function scanDirectory(dirPath: string) {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);

      if (entry.isDirectory()) {
        if (!ignorePatterns.some((pattern) => entry.name.includes(pattern))) {
          scanDirectory(fullPath);
        }
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name);
        if (fileExtensions.includes(ext)) {
          const content = fs.readFileSync(fullPath, "utf8");
          fileStats.push({
            filePath: fullPath,
            ...analyzeFile(content),
          });
        }
      }
    }
  }

  scanDirectory(directoryPath);

  const codebaseStats: CodebaseStats = {
    totalFiles: fileStats.length,
    totalCharacters: fileStats.reduce(
      (sum, file) => sum + file.totalCharacters,
      0
    ),
    totalLines: fileStats.reduce((sum, file) => sum + file.totalLines, 0),
    totalCodeLines: fileStats.reduce((sum, file) => sum + file.codeLines, 0),
    totalEmptyLines: fileStats.reduce((sum, file) => sum + file.emptyLines, 0),
    totalCommentLines: fileStats.reduce(
      (sum, file) => sum + file.commentLines,
      0
    ),
    totalWordCount: fileStats.reduce((sum, file) => sum + file.wordCount, 0),
    avgLinesPerFile:
      fileStats.length > 0
        ? parseFloat(
            (
              fileStats.reduce((sum, file) => sum + file.totalLines, 0) /
              fileStats.length
            ).toFixed(2)
          )
        : 0,
    fileStats,
  };

  return codebaseStats;
}

function analyzeFile(text: string): Omit<FileStats, "filePath"> {
  if (!text) {
    return {
      totalCharacters: 0,
      totalLines: 0,
      codeLines: 0,
      emptyLines: 0,
      commentLines: 0,
      wordCount: 0,
      avgLineLength: 0,
    };
  }

  const lines = text.split(/\r\n|\r|\n/);
  const totalLines = lines.length;
  const totalCharacters = text.length;

  let codeLines = 0;
  let emptyLines = 0;
  let commentLines = 0;
  let wordCount = 0;

  const wordRegex = /\S+/g;
  let inMultilineComment = false;

  for (const line of lines) {
    const trimmedLine = line.trim();

    if (trimmedLine === "") {
      emptyLines++;
    } else if (
      inMultilineComment ||
      trimmedLine.startsWith("//") ||
      trimmedLine.startsWith("/*")
    ) {
      commentLines++;

      if (trimmedLine.includes("/*")) {
        inMultilineComment = true;
      }

      if (trimmedLine.includes("*/")) {
        inMultilineComment = false;
      }
    } else if (trimmedLine.startsWith("*") || trimmedLine.startsWith("*/")) {
      commentLines++;

      if (trimmedLine.includes("*/")) {
        inMultilineComment = false;
      }
    } else {
      codeLines++;
    }

    const wordsInLine = trimmedLine.match(wordRegex);
    if (wordsInLine) {
      wordCount += wordsInLine.length;
    }
  }

  const avgLineLength = totalLines > 0 ? totalCharacters / totalLines : 0;

  return {
    totalCharacters,
    totalLines,
    codeLines,
    emptyLines,
    commentLines,
    wordCount,
    avgLineLength: parseFloat(avgLineLength.toFixed(2)),
  };
}

export default analyzeCodebase;
