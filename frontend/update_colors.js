const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

function updateFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf-8');
  
  // Replace backgrounds
  content = content.replace(/bg-slate-950/g, 'bg-primary');
  content = content.replace(/bg-slate-800(?:\/50|\/30)?/g, 'bg-primary');
  content = content.replace(/bg-slate-700/g, 'bg-secondary');
  content = content.replace(/bg-violet-600(?:\/20|\/30)?/g, 'bg-secondary');
  content = content.replace(/bg-blue-600(?:\/10|\/20)?/g, 'bg-secondary');
  content = content.replace(/bg-indigo-600(?:\/30)?/g, 'bg-secondary');
  content = content.replace(/bg-red-[a-z0-9/]+/g, 'bg-secondary');
  content = content.replace(/bg-green-[a-z0-9/]+/g, 'bg-secondary');
  
  // Replace text
  content = content.replace(/text-slate-[0-9]+/g, 'text-secondary');
  content = content.replace(/text-violet-[0-9]+/g, 'text-secondary');
  content = content.replace(/text-indigo-[0-9]+/g, 'text-secondary');
  content = content.replace(/text-blue-[0-9]+/g, 'text-secondary');
  content = content.replace(/text-red-[0-9]+/g, 'text-secondary');
  content = content.replace(/text-green-[0-9]+/g, 'text-secondary');
  content = content.replace(/text-white/g, 'text-secondary');
  
  // Replace gradients
  content = content.replace(/from-violet-[0-9]+/g, 'from-primary');
  content = content.replace(/to-blue-[0-9]+/g, 'to-secondary');
  content = content.replace(/to-indigo-[0-9]+/g, 'to-secondary');
  content = content.replace(/from-transparent/g, 'from-primary');
  
  // Replace borders
  content = content.replace(/border-slate-[0-9]+(?:\/50)?/g, 'border-secondary');
  content = content.replace(/border-violet-[0-9]+(?:\/20)?/g, 'border-secondary');
  content = content.replace(/border-red-[0-9]+(?:\/50)?/g, 'border-secondary');
  
  // Replace rings
  content = content.replace(/focus:ring-violet-[0-9]+/g, 'focus:ring-secondary');
  
  // Replace shadows
  content = content.replace(/shadow-violet-[0-9]+(?:\/25)?/g, 'shadow-secondary');
  
  fs.writeFileSync(filePath, content);
}

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walkDir(fullPath);
    } else if (fullPath.endsWith('.jsx')) {
      updateFile(fullPath);
    }
  }
}

walkDir(srcDir);
console.log('Done mapping classes');
