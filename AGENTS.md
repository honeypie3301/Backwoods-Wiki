# AI Assistant Wiki Maintenance Guidelines

When modifying or updating any Wiki pages, components, or mod features in this repository:

## 1. `<UpdatedFrame>` Component Rules
- Wrap any newly added or updated wiki content, cards, or sections in `<UpdatedFrame id="unique_id" isUpdated={true}>`.
- Ensures users see the animated glowing border and `UPDATED (7s)` badge upon viewing.

## 2. Wiki Maintenance & Version Update Note (CRITICAL)
- **Mandatory Update**: Whenever you update any wiki content or implement commit changes, you **MUST** also update the **Wiki Maintenance Note** in:
  - `/src/components/special/HomeView.tsx`
  - `/wiki_assets/wiki/Home.txt`
- **Underline Rule**: Underline ONLY the exact sentence:
  `<u>The wiki is always updated before a new version releases.</u>`
- **Highlights List**: Update the `Recent Highlights` list inside the notice box with concise bullet points describing the newest entities, procedures, commands, or mechanics added in the latest update.

## 3. Data Integrity & Accuracy
- Always inspect the source code or patch diffs to verify mechanics before updating descriptions.
- Never guess or extrapolate features without checking source implementation.
- When adding new items, blocks, etc., always check if it has a recipe. If it does, always use the crafting table grid design (`FancyRecipeView.tsx`). If none, then leave it.

## 4. Recipe Grid Implementation (FancyRecipeView.tsx)
- **NO MANUAL RECIPE TABLES**: You are strictly forbidden from writing manual HTML tables, bullet points, or text descriptions to display crafting recipes.
- **Automated Rendering**: `ItemsView.tsx` and `BlocksView.tsx` automatically render the `<FancyRecipeView>` grid if the item's `id` has a matching recipe in `recipe_details.json`.
- **How to add a new recipe**:
  1. Add the raw JSON recipe data (exactly as it appears in the mod's source code) into the `recipe_details.json` file.
  2. Ensure the item ID in the view (e.g., `id: "splinter_needle"`) precisely matches the suffix of the recipe result (e.g., `the_backwoods:splinter_needle`).
  3. If the recipe contains new items/ingredients not yet visually mapped, add their shortcodes, colors, and visual specs to `getItemVisualSpec` in `/src/components/special/FancyRecipeView.tsx`.

## 5. Tone & Communication Guidelines (CRITICAL)
- **Tone Profile**: Always use a highly **clinical, detached, and analytical** tone when describing items, blocks, mechanisms, or writing summaries. Avoid conversational filler or flowery self-praise. Focus purely on technical, mechanistic, and empirical details.

## 6. Threat Badge Visual Protocols
- **Extermination Class Glow**: The 'Extermination Class' threat badge must always emit a persistent crimson visual glow using `animate-pulse` combined with `shadow-[0_0_12px_rgba(239,68,68,0.7)]` and a saturated border.
- **Increasing Sinister Glow**: For threat tiers under Extermination Class, the badges should get an increasingly intimidating sinister red glow depending on the severity level:
  - **Extermination Class**: Deep dark background, saturated red text, persistent red glow `shadow-[0_0_12px_rgba(239,68,68,0.75)]` + red border.
  - **Extreme**: Muted red background and text, moderate red glow `shadow-[0_0_8px_rgba(239,68,68,0.45)]` + soft red border.
  - **High**: Charcoal/purple background, subtle red tint glow `shadow-[0_0_4px_rgba(239,68,68,0.25)]` + faint purple-red border.
  - **Medium**: Soft desaturated background, minimal border glow.
  - **Low/Passive**: Neutral dark background, no active glow.
