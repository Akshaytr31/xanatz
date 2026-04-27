const fs = require("fs");
const path = require("path");

const srcDir = path.join(__dirname, "src");

function updateFile(filePath) {
  let content = fs.readFileSync(filePath, "utf-8");

  // Replace backgrounds
  content = content.replace(/bg-slate-[a-z0-9]+(?:\/\d+)?/g, "bg-primary");
  content = content.replace(/bg-violet-[a-z0-9]+(?:\/\d+)?/g, "bg-secondary");
  content = content.replace(/bg-blue-[a-z0-9]+(?:\/\d+)?/g, "bg-secondary");
  content = content.replace(/bg-indigo-[a-z0-9]+(?:\/\d+)?/g, "bg-secondary");
  content = content.replace(/bg-red-[a-z0-9]+(?:\/\d+)?/g, "bg-secondary");
  content = content.replace(/bg-green-[a-z0-9]+(?:\/\d+)?/g, "bg-secondary");

  content = content.replace(/bg-slate-950/g, "bg-primary");

  // Replace text
  content = content.replace(/text-slate-[0-9]+/g, "text-secondary");
  // keep some classes? e.g. text-white
  content = content.replace(/text-violet-[0-9]+/g, "text-secondary");
  content = content.replace(/text-indigo-[0-9]+/g, "text-secondary");
  content = content.replace(/text-blue-[0-9]+/g, "text-secondary");

  // Replace gradients
  content = content.replace(/from-[a-z]+-[0-9]+/g, "from-primary");
  content = content.replace(/to-[a-z]+-[0-9]+/g, "to-secondary");

  // Replace borders
  content = content.replace(
    /border-[a-z]+-[0-9]+(?:\/\d+)?/g,
    "border-secondary",
  );

  // Replace rings
  content = content.replace(
    /focus:ring-[a-z]+-[0-9]+/g,
    "focus:ring-secondary",
  );

  // Replace shadows
  content = content.replace(
    /shadow-[a-z]+-[0-9]+(?:\/\d+)?/g,
    "shadow-secondary",
  );

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
console.log("Done mapping classes");
