const fs = require('fs');
const path = require('path');

function scanFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const headings = [];
  const lines = content.split('\n');
  for (const line of lines) {
    const match = line.match(/<h3[^>]*>([^<]+)<\/h3>/i);
    if (match) {
      headings.push(match[1].trim());
    }
  }
  return headings;
}

const blocks = scanFile('Wiki pages/Blocks.txt');
const items = scanFile('Wiki pages/Items.txt');

console.log("Blocks in Wiki:", blocks);
console.log("Items in Wiki:", items);
