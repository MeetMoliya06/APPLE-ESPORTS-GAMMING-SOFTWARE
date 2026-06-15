const fs = require('fs');
const path = require('path');

const ROOT_DIR = __dirname;
const IGNORE_DIRS = ['.git', '.vs', 'node_modules', 'bin', 'obj', 'dist', '.gemini', '.idea'];

// Replacements (case-sensitive)
const replacements = [
  { from: /AppleEsportsErp/g, to: 'AppleEsportsErp' },
  { from: /AppleEsports/g, to: 'AppleEsports' },
  { from: /Apple Esports/g, to: 'Apple Esports' },
  { from: /appleesports/g, to: 'appleesports' },
];

function isTextFile(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const binaryExts = ['.dll', '.exe', '.pdb', '.png', '.jpg', '.jpeg', '.gif', '.ico', '.lock', '.pdf', '.zip', '.tar', '.gz'];
  return !binaryExts.includes(ext);
}

function processDirectory(dir) {
  let filesToRename = [];
  let dirsToRename = [];

  const items = fs.readdirSync(dir);

  for (const item of items) {
    if (IGNORE_DIRS.includes(item)) continue;

    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      const subResults = processDirectory(fullPath);
      filesToRename = filesToRename.concat(subResults.files);
      dirsToRename = dirsToRename.concat(subResults.dirs);
      
      // Check if this dir needs renaming
      if (item.toLowerCase().includes('appleesports')) {
        dirsToRename.push({ oldPath: fullPath, dir: dir, name: item });
      }
    } else {
      // Process file contents
      if (isTextFile(fullPath)) {
        let content = fs.readFileSync(fullPath, 'utf8');
        let originalContent = content;
        
        for (const repl of replacements) {
          content = content.replace(repl.from, repl.to);
        }

        // Special handling to protect DB names in specific contexts if needed
        // The user said "if change the name resets the database then we cannot take risk here database name can be a compro from our side"
        // Let's revert neonarena_db back to neonarena_db just in case it got replaced.
        // Also revert neonarenadb back to neonarenadb
        content = content.replace(/neonarenadb/g, 'neonarenadb');
        content = content.replace(/neonarena_db/g, 'neonarena_db');
        content = content.replace(/neonarenav2_db/g, 'neonarenav2_db');
        content = content.replace(/neonarenav2-db/g, 'neonarenav2-db');
        content = content.replace(/neonarena-db/g, 'neonarena-db');
        content = content.replace(/neonarena-postgres/g, 'neonarena-postgres');
        content = content.replace(/neonarenav2-postgres/g, 'neonarenav2-postgres');

        if (content !== originalContent) {
          fs.writeFileSync(fullPath, content, 'utf8');
          console.log(`Updated content: ${fullPath}`);
        }
      }

      // Check if this file needs renaming
      if (item.toLowerCase().includes('appleesports')) {
        filesToRename.push({ oldPath: fullPath, dir: dir, name: item });
      }
    }
  }

  return { files: filesToRename, dirs: dirsToRename };
}

console.log("Scanning files for content replacement...");
const { files, dirs } = processDirectory(ROOT_DIR);

console.log(`Found ${files.length} files to rename.`);
for (const fileObj of files) {
  let newName = fileObj.name;
  for (const repl of replacements) {
    // we use split and join for string replace because regex in replace string without global flag only replaces first occurrence
    newName = newName.replace(repl.from, repl.to);
  }
  const newPath = path.join(fileObj.dir, newName);
  fs.renameSync(fileObj.oldPath, newPath);
  console.log(`Renamed file: ${fileObj.oldPath} -> ${newPath}`);
}

console.log(`Found ${dirs.length} directories to rename.`);
// Sort directories by length descending to rename deepest first
dirs.sort((a, b) => b.oldPath.length - a.oldPath.length);

for (const dirObj of dirs) {
  let newName = dirObj.name;
  for (const repl of replacements) {
    newName = newName.replace(repl.from, repl.to);
  }
  
  // Since we are renaming deepest first, the dirObj.dir (parent directory path) might have been renamed already!
  // To be safe, we must recalculate the current path or rely on the fact that since we rename from bottom up,
  // the parent path in dirObj.oldPath is still valid at the moment of renaming this node.
  // Actually, bottom-up means children are renamed BEFORE parents. So the parent's path is intact!
  
  const newPath = path.join(dirObj.dir, newName);
  fs.renameSync(dirObj.oldPath, newPath);
  console.log(`Renamed directory: ${dirObj.oldPath} -> ${newPath}`);
}

console.log("Done.");
