import fs from 'fs';
import path from 'path';

const wikiPagesDir = path.join(process.cwd(), 'wiki_pages');
const publicWikiDir = path.join(process.cwd(), 'wiki_assets', 'wiki');

// Ensure public/wiki directory exists
if (!fs.existsSync(publicWikiDir)) {
  fs.mkdirSync(publicWikiDir, { recursive: true });
}

// Map files to display names, categories, and custom order
const articleMeta = {
  'Home.txt': { title: 'Home', category: 'Core Guide', order: 1 },
  'Sanity.txt': { title: 'Mental Degradation', category: 'Core Guide', order: 2 },
  'Achievements.txt': { title: 'Achievements', category: 'Core Guide', order: 3 },
  'Versions.txt': { title: 'Version History', category: 'Core Guide', order: 4 },
  
  'Dimensions.txt': { title: 'Dimensions', category: 'The World', order: 5 },
  'Structures.txt': { title: 'Structures', category: 'The World', order: 6 },
  'Blocks.txt': { title: 'Blocks', category: 'The World', order: 7 },
  
  'Entities.txt': { title: 'Hostile & Neutral Entities', category: 'Flora & Fauna', order: 8 },
  'Items.txt': { title: 'Items & Gear', category: 'Flora & Fauna', order: 9 },
  'Commands.txt': { title: 'Commands', category: 'Flora & Fauna', order: 10 },
  'Terminated.txt': { title: 'Terminated Dossier', category: 'Flora & Fauna', order: 11 },
};

const catOrder = {
  'Core Guide': 1,
  'The World': 2,
  'Flora & Fauna': 3
};

function generateWikiManifest() {
  if (!fs.existsSync(wikiPagesDir)) {
    console.error('Wiki pages directory not found:', wikiPagesDir);
    return;
  }

  const files = fs.readdirSync(wikiPagesDir);
  const manifest = [];

  for (const file of files) {
    if (file.endsWith('.txt')) {
      const srcPath = path.join(wikiPagesDir, file);
      const destPath = path.join(publicWikiDir, file);
      
      // Copy the file
      fs.copyFileSync(srcPath, destPath);
      
      const slug = file.replace('.txt', '').toLowerCase();
      const meta = articleMeta[file] || { title: file.replace('.txt', ''), category: 'Other', order: 99 };
      
      manifest.push({
        slug,
        title: meta.title,
        filename: file,
        category: meta.category,
        order: meta.order
      });
    }
  }

  // Sort manifest based on category order, then item order
  manifest.sort((a, b) => {
    if (a.category !== b.category) {
      return (catOrder[a.category] || 99) - (catOrder[b.category] || 99);
    }
    return a.order - b.order;
  });

  const manifestPath = path.join(publicWikiDir, 'manifest.json');
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));

  console.log(`Successfully copied wiki pages and generated manifest at ${manifestPath}`);
}

generateWikiManifest();
