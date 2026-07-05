const fs = require('fs');

try {
  const recipes = JSON.parse(fs.readFileSync('all_recipes.json', 'utf8'));
  console.log(`Total recipes loaded: ${recipes.length}`);
  
  const formatted = recipes.map(r => {
    const content = r.content;
    const type = content.type || 'unknown';
    let outputItem = 'unknown';
    let outputCount = 1;
    
    if (content.result) {
      if (typeof content.result === 'string') {
        outputItem = content.result;
      } else if (content.result.item) {
        outputItem = content.result.item;
        outputCount = content.result.count || 1;
      } else if (content.result.id) {
        outputItem = content.result.id;
        outputCount = content.result.count || 1;
      }
    }
    
    return {
      file: r.name,
      type,
      outputItem,
      outputCount,
      details: content
    };
  });
  
  fs.writeFileSync('recipe_summary.json', JSON.stringify(formatted, null, 2));
  console.log("Wrote recipe summary to recipe_summary.json");
  
  // Let's print out the list of outputs
  const outputs = Array.from(new Set(formatted.map(f => f.outputItem))).sort();
  console.log("Distinct Outputs in Recipes:\n", outputs.join('\n '));
} catch (e) {
  console.error("Error:", e);
}
