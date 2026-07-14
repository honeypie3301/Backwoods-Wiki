const fs = require('fs');
const recipeDetails = require('./recipe_details.json');

const itemsViewContent = fs.readFileSync('src/components/special/ItemsView.tsx', 'utf8');
const idRegex = /id:\s*"([^"]+)"/g;
let match;
const ids = [];
while ((match = idRegex.exec(itemsViewContent)) !== null) {
  ids.push(match[1]);
}

console.log('Items View ID mapping evaluation:');
for (const id of ids) {
  const norm = 'the_backwoods:' + id;
  const hasRecipe = !!recipeDetails[norm];
  console.log(`- ${id}: ${hasRecipe ? 'HAS RECIPE' : 'no recipe'}`);
}
