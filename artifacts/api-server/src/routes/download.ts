import { Router } from "express";
import path from "path";
import fs from "fs";

const router = Router();

router.get("/download/project-export.zip", (req, res) => {
  const filePath = path.resolve("/home/runner/workspace/project-export.zip");
  if (!fs.existsSync(filePath)) {
    res.status(404).send("Export file not found.");
    return;
  }
  res.setHeader("Content-Disposition", "attachment; filename=project-export.zip");
  res.setHeader("Content-Type", "application/zip");
  res.sendFile(filePath);
});

export default router;
