import fs from 'fs';
import path from 'path';

const wikiPagesDir = path.join(process.cwd(), 'Wiki pages');
const publicWikiDir = path.join(process.cwd(), 'public', 'wiki');

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

try {
  const files = fs.readdirSync(wikiPagesDir);
  const manifest = [];

  for (const file of files) {
    if (file.endsWith('.txt')) {
      const srcPath = path.join(wikiPagesDir, file);
      const destPath = path.join(publicWikiDir, file);
      
      // Copy the file
      fs.copyFileSync(srcPath, destPath);
      
      const slug = file.replace('.txt', '').toLowerCase();
      const meta = articleMeta[file] || {
        title: file.replace('.txt', '').replace(/_/g, ' '),
        category: 'Uncategorized',
        order: 100
      };

      manifest.push({
        slug,
        filename: file,
        title: meta.title,
        category: meta.category,
        order: meta.order
      });
    }
  }

  // Sort manifest by category order, then order, then title
  manifest.sort((a, b) => {
    if (a.category !== b.category) {
      // Keep "Core Guide" first, then "The World", then "Flora & Fauna", then "Uncategorized"
      const catOrder = { 'Core Guide': 1, 'The World': 2, 'Flora & Fauna': 3, 'Uncategorized': 4 };
      return (catOrder[a.category] || 99) - (catOrder[b.category] || 99);
    }
    return a.order - b.order;
  });

  const manifestPath = path.join(publicWikiDir, 'manifest.json');
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  console.log(`Successfully copied wiki pages and generated manifest at ${manifestPath}`);

  // Copy Entity Models and Skins to public directory
  let modelsSrcDir = path.join(process.cwd(), 'Entity models and skins');
  if (!fs.existsSync(modelsSrcDir) || fs.readdirSync(modelsSrcDir).length === 0) {
    const capitalDir = path.join(process.cwd(), 'Entity Models and skins');
    if (fs.existsSync(capitalDir) && fs.readdirSync(capitalDir).length > 0) {
      modelsSrcDir = capitalDir;
    }
  }
  const modelsDestDir = path.join(process.cwd(), 'public', 'models');

  if (fs.existsSync(modelsSrcDir)) {
    if (!fs.existsSync(modelsDestDir)) {
      fs.mkdirSync(modelsDestDir, { recursive: true });
    }
    const modelFiles = fs.readdirSync(modelsSrcDir);
    let copiedCount = 0;
    for (const file of modelFiles) {
      const srcPath = path.join(modelsSrcDir, file);
      const destPath = path.join(modelsDestDir, file);
      
      // Copy files recursively if there are directories, or just normal files
      const stat = fs.statSync(srcPath);
      if (stat.isFile()) {
        fs.copyFileSync(srcPath, destPath);
        copiedCount++;
      }
    }
    console.log(`Successfully copied ${copiedCount} 3D models and textures to ${modelsDestDir}`);
  } else {
    console.warn(`Source models directory not found at: ${modelsSrcDir}`);
  }

  // Copy TerminatedEntities to public directory recursively
  const termSrcDir = path.join(process.cwd(), 'TerminatedEntities');
  const termDestDir = path.join(process.cwd(), 'public', 'TerminatedEntities');

  function copyDirRecursive(src, dest) {
    if (!fs.existsSync(src)) return;
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    const entries = fs.readdirSync(src, { withFileTypes: true });
    for (const entry of entries) {
      const srcPath = path.join(src, entry.name);
      const destPath = path.join(dest, entry.name);
      if (entry.isDirectory()) {
        copyDirRecursive(srcPath, destPath);
      } else {
        fs.copyFileSync(srcPath, destPath);
      }
    }
  }

  if (fs.existsSync(termSrcDir)) {
    copyDirRecursive(termSrcDir, termDestDir);
    console.log(`Successfully copied TerminatedEntities to ${termDestDir}`);
  } else {
    console.warn(`Source TerminatedEntities directory not found at: ${termSrcDir}`);
  }

} catch (err) {
  console.error('Error generating wiki data:', err);
}
