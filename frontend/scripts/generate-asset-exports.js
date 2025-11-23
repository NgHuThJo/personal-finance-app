import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

async function generateExports(dir, relativeDir = ".") {
  try {
    const files = await fs.readdir(dir);

    const exportLines = await Promise.all(
      files.map(async (file) => {
        if (file === "index.ts") {
          return "";
        }

        const filePath = path.join(dir, file);
        const relativePath = path.join(relativeDir, file);
        const stat = await fs.stat(filePath);

        if (stat.isDirectory()) {
          return await generateExports(filePath, relativePath);
        }

        const exportName = path.basename(file, path.extname(file));

        return `export { default as ${exportName.replace(/-/g, "_")} } from "./${relativePath.replace(/\\/g, "/")}";\n`;
      }),
    );

    return exportLines.join("");
  } catch (error) {
    console.error(`Error generating exports for ${dir}: ${error.message}`);
    throw error;
  }
}

async function generateAssetExports() {
  try {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const assetDir = path.join(__dirname, "../src/assets/images");

    const outputFilePath = path.join(assetDir, "index.ts");
    const exports = await generateExports(assetDir);

    if (exports.trim()) {
      await fs.writeFile(outputFilePath, exports);
      console.log("Index generated successfully.");
    } else {
      console.log("No exports found, skipping index.ts generation.");
    }
  } catch (error) {
    console.error(`Error generating asset index file: ${error.message}`);
  }
}

generateAssetExports();
