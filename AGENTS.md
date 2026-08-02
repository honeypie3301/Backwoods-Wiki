# AI Assistant Wiki Maintenance Guidelines

When modifying or updating any Wiki pages, components, or mod features in this repository:

## 1. `<UpdatedFrame>` Component Rules
- Wrap any newly added or updated wiki content, cards, or sections in `<UpdatedFrame id="unique_id" isUpdated={true}>`.
- Ensures users see the animated glowing border and `UPDATED (7s)` badge upon viewing.

## 2. Wiki Maintenance & Version Update Note (CRITICAL)
- **Mandatory Update**: Whenever you update any wiki content or implement commit changes, you **MUST** also update the **Wiki Maintenance Note** in:
  - `/src/components/special/HomeView.tsx`
  - `/public/wiki/Home.txt`
- **Underline Rule**: Underline ONLY the exact sentence:
  `<u>The wiki is always updated before a new version releases.</u>`
- **Highlights List**: Update the `Recent Highlights` list inside the notice box with concise bullet points describing the newest entities, procedures, commands, or mechanics added in the latest update.

## 3. Data Integrity & Accuracy
- Always inspect the source code or patch diffs to verify mechanics before updating descriptions.
- Never guess or extrapolate features without checking source implementation.
