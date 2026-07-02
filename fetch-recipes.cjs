const https = require('https');
const fs = require('fs');

function getJSON(url) {
  return new Promise((resolve, reject) => {
    const options = {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3'
      }
    };
    https.get(url, options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(new Error(`Failed to parse JSON from ${url}: ${e.message}. Data: ${data.substring(0, 100)}`));
        }
      });
    }).on('error', reject);
  });
}

function getRaw(url) {
  return new Promise((resolve, reject) => {
    const options = {
      headers: {
        'User-Agent': 'Mozilla/5.0'
      }
    };
    https.get(url, options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

async function main() {
  try {
    console.log("Fetching recipe file list from GitHub...");
    const files = await getJSON('https://api.github.com/repos/honeypie3301/Backwoods-Test/contents/src/main/resources/data/the_backwoods/recipe');
    console.log(`Found ${files.length} files in recipe directory.`);
    
    const recipeData = [];
    for (const file of files) {
      if (file.name.endsWith('.json')) {
        console.log(`Fetching recipe: ${file.name}...`);
        const contentStr = await getRaw(file.download_url);
        try {
          const json = JSON.parse(contentStr);
          recipeData.push({
            name: file.name,
            content: json
          });
        } catch (err) {
          console.error(`Error parsing ${file.name}:`, err.message);
        }
      }
    }
    
    fs.writeFileSync('all_recipes.json', JSON.stringify(recipeData, null, 2));
    console.log("Successfully wrote all recipes to all_recipes.json");
  } catch (error) {
    console.error("Main execution failed:", error);
  }
}

main();
