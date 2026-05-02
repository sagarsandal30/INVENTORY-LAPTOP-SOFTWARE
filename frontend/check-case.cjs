const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(function(file) {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else if (file.endsWith('.jsx') || file.endsWith('.js') || file.endsWith('.css')) {
      results.push(file);
    }
  });
  return results;
}

const files = walk('./src');
let errors = 0;

files.forEach(file => {
  if(file.endsWith('.css')) return;
  const content = fs.readFileSync(file, 'utf8');
  // Simple regex for imports
  const importRegex = /import\s+(?:.*?\s+from\s+)?['"](.*?)['"]/g;
  
  let match;
  
  const checkImport = (importPath) => {
    if (importPath.startsWith('.')) {
      // First, try resolving as exact string.
      const resolvedPath = path.resolve(path.dirname(file), importPath);
      const dir = path.dirname(resolvedPath);
      const base = path.basename(resolvedPath);
      
      try {
        const actualFiles = fs.readdirSync(dir);
        let foundExact = false;
        let foundCaseMismatch = false;
        let actualFileName = "";

        for (const actualFile of actualFiles) {
          // Check if exact match or exact match + extension (e.g., .js, .jsx, .css)
          if (actualFile === base || actualFile === base + '.js' || actualFile === base + '.jsx' || actualFile === base + '.css') {
             foundExact = true;
             break;
          }
          if (actualFile.toLowerCase() === base.toLowerCase() || 
              actualFile.toLowerCase() === base.toLowerCase() + '.js' || 
              actualFile.toLowerCase() === base.toLowerCase() + '.jsx' || 
              actualFile.toLowerCase() === base.toLowerCase() + '.css') {
            foundCaseMismatch = true;
            actualFileName = actualFile;
          }
        }
        
        if (!foundExact) {
            if (foundCaseMismatch) {
                console.log('Case mismatch in ' + file + ': imported "' + importPath + '" but actual file is "' + actualFileName + '"');
                errors++;
            } else {
                // If it's a directory, check for index.js or index.jsx
                if (fs.existsSync(resolvedPath) && fs.statSync(resolvedPath).isDirectory()) {
                    const indexFiles = fs.readdirSync(resolvedPath);
                    let foundIndex = false;
                    for (const idxFile of indexFiles) {
                        if (idxFile.toLowerCase() === 'index.js' || idxFile.toLowerCase() === 'index.jsx') {
                            foundIndex = true;
                            if (idxFile !== 'index.js' && idxFile !== 'index.jsx') {
                                console.log('Case mismatch in directory index: ' + resolvedPath + ' -> ' + idxFile);
                                errors++;
                            }
                        }
                    }
                }
            }
        }
      } catch(e) {
         // directory doesn't exist?
      }
    }
  };

  while ((match = importRegex.exec(content)) !== null) {
    checkImport(match[1]);
  }
});
console.log('Done. Errors: ' + errors);
