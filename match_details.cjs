const fs = require('fs');

try {
  const recipes = JSON.parse(fs.readFileSync('all_recipes.json', 'utf8'));
  const results = {};
  
  for (const r of recipes) {
    const filename = r.name;
    const content = r.content;
    const type = content.type;
    
    let outputItem = 'unknown';
    let outputCount = 1;
    if (content.result) {
      if (typeof content.result === 'string') {
        outputItem = content.result;
      } else {
        outputItem = content.result.item || content.result.id || 'unknown';
        outputCount = content.result.count || 1;
      }
    }
    
    // Also parse inputs
    let ingredients = [];
    let pattern = null;
    let keyMap = null;
    
    if (type === 'minecraft:crafting_shaped') {
      pattern = content.pattern;
      keyMap = content.key;
      ingredients = Object.keys(content.key).map(k => {
        const val = content.key[k];
        const itemStr = val.item ? val.item : (val.tag ? `#${val.tag}` : JSON.stringify(val));
        return `${k} = ${itemStr}`;
      });
    } else if (type === 'minecraft:crafting_shapeless') {
      ingredients = (content.ingredients || []).map(ing => {
        if (ing.item) return ing.item;
        if (ing.tag) return `#${ing.tag}`;
        if (Array.isArray(ing)) {
          return ing.map(i => i.item ? i.item : (i.tag ? `#${i.tag}` : JSON.stringify(i))).join(' or ');
        }
        return JSON.stringify(ing);
      });
    } else if (type === 'minecraft:smelting' || type === 'minecraft:blasting' || type === 'minecraft:campfire_cooking' || type === 'minecraft:smoking') {
      const ing = content.ingredient;
      let ingStr = 'unknown';
      if (ing) {
        if (ing.item) ingStr = ing.item;
        else if (ing.tag) ingStr = `#${ing.tag}`;
        else if (Array.isArray(ing)) {
          ingStr = ing.map(i => i.item || (i.tag ? `#${i.tag}` : JSON.stringify(i))).join(' or ');
        } else {
          ingStr = JSON.stringify(ing);
        }
      }
      ingredients = [`Input: ${ingStr}`, `Cooking Time: ${content.cookingtime || content.experience || ''}`];
    }
    
    if (!results[outputItem]) {
      results[outputItem] = [];
    }
    
    results[outputItem].push({
      file: filename,
      type,
      outputCount,
      pattern,
      keyMap,
      ingredients
    });
  }
  
  fs.writeFileSync('recipe_details.json', JSON.stringify(results, null, 2));
  console.log("Wrote full details of recipes to recipe_details.json");
  
  // Let's print out some items' recipes as a preview
  for (const item of Object.keys(results).slice(0, 5)) {
    console.log(`\n=== ${item} ===`);
    console.log(JSON.stringify(results[item], null, 2));
  }
} catch (e) {
  console.error(e);
}
