import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

async function getImmediateSubdirectories(dir) {
  const subdirs = [];

  try {
    const files = await fs.readdir(dir);

    await Promise.all(
      files.map(async (file) => {
        const filePath = path.join(dir, file);
        const stat = await fs.stat(filePath);

        if (stat.isDirectory()) {
          subdirs.push(file);
        }
      }),
    );

    return subdirs;
  } catch (error) {
    console.error(`Error reading subdirectories in ${dir}: ${error.message}`);
    throw error;
  }
}

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
        } else {
          const exportName = path.basename(file, path.extname(file));
          return `export { default as ${exportName.replace(/-/g, "_")} } from "./${relativePath.replace(/\\/g, "/")}";\n`;
        }
      }),
    );

    return exportLines.join("");
  } catch (error) {
    console.error(`Error generating exports for ${dir}: ${error.message}`);
    throw error;
  }
}

// NOTE: This does not handle files in the top assets directory
export async function generateAssetExports() {
  try {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const assetsDir = path.join(__dirname, "../src/assets/resources");
    const subdirs = await getImmediateSubdirectories(assetsDir);

    await Promise.all(
      subdirs.map(async (dir) => {
        const dirPath = path.join(assetsDir, dir);
        const outputFilePath = path.join(dirPath, "index.ts");
        const exports = await generateExports(dirPath);

        if (exports.trim()) {
          // Only write if there are exports
          await fs.writeFile(outputFilePath, exports);
          console.log(`Index for ${dir} generated successfully.`);
        } else {
          console.log(
            `No exports found for ${dir}, skipping index.ts generation.`,
          );
        }
      }),
    );
  } catch (error) {
    console.error(`Error generating asset indexes: ${error.message}`);
  }
}

generateAssetExports();
