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
    } else if (type === 'minecraft:smithing_transform') {
      const baseItem = content.base?.item || content.base?.tag || '';
      const templateItem = content.template?.item || content.template?.tag || '';
      const additionItem = content.addition?.item || content.addition?.tag || '';
      
      let base = baseItem;
      let upgrade = additionItem;
      let template = templateItem;
      
      const isToolOrWeapon = (itemStr) => {
        if (!itemStr) return false;
        const lower = itemStr.toLowerCase();
        return lower.includes('sword') || lower.includes('axe') || lower.includes('tool') || 
               lower.includes('pickaxe') || lower.includes('shovel') || lower.includes('hoe');
      };
      
      if (isToolOrWeapon(templateItem)) {
        base = templateItem;
        upgrade = baseItem;
        template = additionItem;
      } else if (isToolOrWeapon(additionItem)) {
        base = additionItem;
        upgrade = baseItem;
        template = templateItem;
      }
      
      ingredients = [base, upgrade, template].filter(Boolean);
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
  
  // Inject custom brewing recipes
  if (!results['the_backwoods:potion_of_inoculation']) {
    results['the_backwoods:potion_of_inoculation'] = [
      {
        file: "Brewing Stand Registration",
        type: "minecraft:brewing",
        outputCount: 1,
        pattern: null,
        keyMap: null,
        ingredients: [
          "the_backwoods:lignum_caro_ash",
          "minecraft:water_bottle"
        ]
      }
    ];
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
