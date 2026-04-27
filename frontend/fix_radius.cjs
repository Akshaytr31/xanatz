const fs = require("fs");
const path = require("path");

const srcDir = path.join(__dirname, "src");

function updateFile(filePath) {
  let content = fs.readFileSync(filePath, "utf-8");

  // Replace rounded classes
  content = content.replace(/rounded-\[2\.5rem\]/g, "rounded-lg");
  content = content.replace(/rounded-3xl/g, "rounded-lg");
  content = content.replace(/rounded-2xl/g, "rounded-lg");
  content = content.replace(/rounded-xl/g, "rounded-lg");

  // Replace GoogleLogin shape="pill" with shape="rectangular"
  content = content.replace(/shape="pill"/g, 'shape="rectangular"');

  fs.writeFileSync(filePath, content);
}

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walkDir(fullPath);
    } else if (fullPath.endsWith(".jsx")) {
      updateFile(fullPath);
    }
  }
}

walkDir(srcDir);
console.log("Done updating border radius");
