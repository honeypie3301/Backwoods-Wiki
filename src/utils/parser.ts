/**
 * Utility functions for parsing MediaWiki and Wikitext syntax to standard HTML
 */

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export function parseWikiSyntax(content: string): string {
  if (!content) return '';

  let html = content;

  // --- THEME ALIGNMENT NORMALIZATION ---
  // Strip font-family overrides to guarantee we always use San Francisco (font-sans) or Playfair Display (font-serif)
  html = html.replace(/font-family:[^;"]+;?/gi, '');

  // Strip fixed outer backwoods-wiki-container styling to let the applet theme govern layout & background
  html = html.replace(/<div class="backwoods-wiki-container"[^>]*>/gi, '<div class="backwoods-wiki-container">');

  // Map red/orange accents and borders to cohesive, elegant sage and forest-green tones
  html = html.replace(/#ff7043/gi, '#a9d1b0'); // Orange accent -> Light mint green
  html = html.replace(/#d84315/gi, '#709978'); // Rust orange -> Sage green
  html = html.replace(/#7c1c1c/gi, '#709978'); // Crimson red -> Sage green
  html = html.replace(/#9e2a2a/gi, '#709978'); // Bright red -> Sage green
  html = html.replace(/#cf2a2a/gi, '#709978'); // Crimson -> Sage green
  html = html.replace(/#5c1414/gi, '#2e3e31'); // Blood red -> Forest green
  html = html.replace(/#401414/gi, '#1c241e'); // Dark red -> Deep forest green
  html = html.replace(/#301414/gi, '#1c241e'); // Dark red -> Deep forest green
  html = html.replace(/#201414/gi, '#151b16'); // Dark red -> Dark green-gray
  html = html.replace(/#1c1414/gi, '#151b16'); // Dark red -> Dark green-gray
  html = html.replace(/#1a1414/gi, '#151b16'); // Dark red -> Dark green-gray
  html = html.replace(/#321616/gi, '#1c241e'); // Deep red border -> Green-gray border
  html = html.replace(/#3c1414/gi, '#1c241e'); // Deep red border -> Green-gray border
  html = html.replace(/#1a1515/gi, '#151b16'); // Deep red border -> Green-gray border
  html = html.replace(/#1f1a1a/gi, '#151b16'); // Deep red border -> Green-gray border
  html = html.replace(/#222/gi, '#1a221c');    // Slate border -> Green-gray border

  // Purple accent mappings (The Still & dimension themes)
  html = html.replace(/#7e57c2/gi, '#8cd99d'); // Purple adaptive -> Muted mint green
  html = html.replace(/#ba68c8/gi, '#a9d1b0'); // Pink/Purple -> Light mint
  html = html.replace(/#4a2e80/gi, '#223226'); // Dark purple -> Dark green-gray

  // Convert reddish/brown backgrounds to beautiful deep forest/charcoal greens
  html = html.replace(/#120c0c/gi, '#0f1210'); // Dark red bg -> Forest slate bg
  html = html.replace(/#0d0909/gi, '#0f1210'); // Dark red bg -> Forest slate bg
  html = html.replace(/#0c0c0c/gi, '#0c0f0d'); // Card bg -> Solid dark slate bg
  html = html.replace(/#0b0b0b/gi, '#0c0f0d'); // Container bg -> Solid dark slate bg
  html = html.replace(/#080808/gi, '#080a08'); // Main bg -> Our deep dark background
  html = html.replace(/#111111/gi, '#0f1210'); // Soft black -> Forest slate
  html = html.replace(/#111/gi, '#0f1210');    // Soft black -> Forest slate
  html = html.replace(/#0f0f0f/gi, '#0c0f0d'); // Muted black -> Card bg

  // RGBA translucent overlays
  html = html.replace(/rgba\(25,\s*20,\s*20,\s*0\.8\)/gi, 'rgba(15, 20, 16, 0.95)');
  html = html.replace(/rgba\(40,\s*25,\s*20,\s*0\.6\)/gi, 'rgba(12, 17, 13, 0.9)');
  html = html.replace(/rgba\(30,\s*25,\s*45,\s*0\.5\)/gi, 'rgba(15, 25, 18, 0.7)');
  html = html.replace(/rgba\(26,\s*21,\s*37,\s*0\.5\)/gi, 'rgba(15, 25, 18, 0.7)');

  // Normalize text body and secondary label colors
  html = html.replace(/#c4bfa5/gi, '#c9d1c9'); // Muted beige -> Sleek light sage-gray
  html = html.replace(/#e0dcd3/gi, '#c9d1c9'); // Ivory -> Sleek light sage-gray
  html = html.replace(/#dcd6cd/gi, '#e0e7e0'); // Warm white -> Elegant slate off-white
  html = html.replace(/#cfbfa8/gi, '#c9d1c9'); // Wheat -> Sleek light sage-gray
  html = html.replace(/#8e8375/gi, '#829285'); // Brownish text -> Soft sage-gray
  html = html.replace(/#8a8274/gi, '#829285'); // Brownish text -> Soft sage-gray
  html = html.replace(/#9c9788/gi, '#829285'); // Brownish text -> Soft sage-gray
  html = html.replace(/#a4a090/gi, '#829285'); // Brownish text -> Soft sage-gray
  html = html.replace(/#70685c/gi, '#5a6b5e'); // Muted brown -> Deep sage-gray
  html = html.replace(/#6a6254/gi, '#5a6b5e'); // Muted brown -> Deep sage-gray
  html = html.replace(/#b2a89a/gi, '#a3ada3'); // Gray-brown -> Slate gray-green

  // 1. Remove __FORCETOC__ or other MediaWiki metadata flags
  html = html.replace(/__FORCETOC__/g, '');
  html = html.replace(/__NOTOC__/g, '');

  // 2. Parse Custom MediaWiki Files / Images to gorgeous SVG/styled UI blocks
  // e.g. [[File:Backwoods logo.png|center|800px|link=]]
  html = html.replace(/\[\[File:Backwoods logo\.png.*?\]\]/gi, () => {
    return `
      <div class="wiki-logo-container flex flex-col items-center justify-center p-8 bg-[#111612] border border-[#1e241f] rounded-lg my-6 select-none relative overflow-hidden">
        <div class="absolute inset-0 bg-radial-gradient from-emerald-950/20 to-transparent pointer-events-none"></div>
        <div class="font-serif text-5xl tracking-widest text-[#e0e7e0] font-bold select-none drop-shadow-[0_0_15px_rgba(141,166,145,0.2)]">
          BACKWOODS
        </div>
        <div class="text-[10px] uppercase tracking-[0.3em] text-[#5a6b5e] mt-2 font-mono">
          Official Survival & Horror Guide
        </div>
      </div>
    `;
  });

  // e.g. [[File:Backwoods flow.png|center|thumb|1101x1101px|Flowchat for navigation]]
  html = html.replace(/\[\[File:Backwoods flow\.png.*?\]\]/gi, () => {
    return `
      <div class="wiki-flow-container p-6 bg-[#111612] border border-[#1e241f] rounded-lg my-6">
        <h4 class="font-serif text-[#e0e7e0] mb-4 text-center border-b border-[#1e241f] pb-2 text-sm uppercase tracking-wider">
          Dimensional Navigation Flowchart
        </h4>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-mono select-none">
          <div class="p-3 bg-[#161d17] border border-[#2a362d] rounded flex flex-col justify-between">
            <span class="text-[#a9d1b0] font-bold">1. OVERWORLD</span>
            <span class="text-[10px] text-[#5a6b5e] mt-2">Activate Portal with Steel and Charcoal</span>
          </div>
          <div class="p-3 bg-[#1e2a20] border border-[#3d543e] rounded flex flex-col justify-between">
            <span class="text-[#a9d1b0] font-bold">2. THE BACKWOODS</span>
            <span class="text-[10px] text-[#5a6b5e] mt-2">Deteriorating sanity leading to Stage 4</span>
          </div>
          <div class="p-3 bg-[#122416] border border-[#203f27] rounded flex flex-col justify-between col-span-1">
            <span class="text-[#8cd99d] font-bold">3. THE LOSS / THE GRAIN</span>
            <span class="text-[10px] text-[#719277] mt-2">Pulled involuntarily at Stage 4 Sanity</span>
          </div>
          <div class="p-3 bg-[#10201d] border border-[#1b3d36] rounded flex flex-col justify-between">
            <span class="text-[#7cd5c4] font-bold">4. THE STILL / SUB-STRATA</span>
            <span class="text-[10px] text-[#507d72] mt-2">Dying in Grain or using Rot Effigy</span>
          </div>
        </div>
        <p class="text-[10px] text-center text-[#5a6b5e] mt-4 font-serif italic">
          * Refer to individual articles for traversal guidelines and safety instructions.
        </p>
      </div>
    `;
  });

  // Catch-all for any other File tags to display a nice placeholder
  html = html.replace(/\[\[File:([^|\]]+).*?\]\]/gi, (match, filename) => {
    return `
      <div class="p-4 bg-[#111612] border border-[#1e241f] rounded-md text-center text-xs text-[#5a6b5e] my-4 font-mono">
        📄 Asset: ${filename} (Fandom Reference Block)
      </div>
    `;
  });

  // 3. MediaWiki Headings (convert to standard HTML anchors with IDs)
  // ==== Level 4 Heading ====
  html = html.replace(/^====\s*([^=]*?)\s*====\s*$/gm, (match, headingText) => {
    const id = slugify(headingText);
    return `<h4 id="${id}" class="text-lg font-serif text-[#a9d1b0] mt-6 mb-3 scroll-mt-20 font-semibold">${headingText}</h4>`;
  });

  // === Level 3 Heading ===
  html = html.replace(/^===\s*([^=]*?)\s*===\s*$/gm, (match, headingText) => {
    const id = slugify(headingText);
    return `<h3 id="${id}" class="text-xl font-serif text-[#e0e7e0] mt-8 mb-4 pb-1 border-b border-[#1e241f]/50 scroll-mt-20">${headingText}</h3>`;
  });

  // == Level 2 Heading ==
  html = html.replace(/^==\s*([^=]*?)\s*==\s*$/gm, (match, headingText) => {
    const id = slugify(headingText);
    return `<h2 id="${id}" class="text-2xl font-serif text-[#e0e7e0] mt-10 mb-6 pb-2 border-b border-[#1e241f] scroll-mt-20">${headingText}</h2>`;
  });

  // 3.5. HTML Headings (convert raw <h2...>, <h3...>, <h4...> tags in text files to include IDs so that Table of Contents is clickable)
  html = html.replace(/<(h2|h3|h4)(\s+[^>]*?)?>(.*?)<\/\1>/gi, (match, tag, attrs, content) => {
    if (attrs && /id=/i.test(attrs)) {
      return match;
    }
    const cleanText = content.replace(/<[^>]*>/g, '').trim();
    const id = slugify(cleanText);
    
    let updatedAttrs = attrs || '';
    if (updatedAttrs.includes('style="')) {
      updatedAttrs = updatedAttrs.replace('style="', 'style="scroll-margin-top: 80px; ');
    } else {
      updatedAttrs += ' style="scroll-margin-top: 80px;"';
    }
    
    return `<${tag} id="${id}"${updatedAttrs}>${content}</${tag}>`;
  });

  // 4. MediaWiki Bold / Italics
  html = html.replace(/'''(.*?)'''/g, '<strong>$1</strong>');
  html = html.replace(/''(.*?)''/g, '<em>$1</em>');

  // 5. MediaWiki bullet lists (lines starting with *)
  // Split into lines, process, and join
  const lines = html.split('\n');
  let inList = false;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.startsWith('*')) {
      // Find level of indentation
      const listContent = line.replace(/^\*+\s*/, '');
      let lineHtml = '';
      if (!inList) {
        lineHtml += '<ul class="list-disc list-inside space-y-2 my-3 pl-4 text-[#a3ada3]">';
        inList = true;
      }
      lineHtml += `<li>${listContent}</li>`;
      lines[i] = lineHtml;
    } else {
      if (inList) {
        lines[i] = '</ul>' + lines[i];
        inList = false;
      }
    }
  }
  if (inList) {
    lines.push('</ul>');
  }
  html = lines.join('\n');

  // 6. MediaWiki Links
  // [[PageName#SectionName|Label]]
  html = html.replace(/\[\[([^|\]#\n]+)#([^|\]\n]+)\|([^\]\n]+)\]\]/g, (match, page, section, label) => {
    const pageSlug = page.trim().toLowerCase();
    const sectionSlug = slugify(section);
    return `<a href="#/wiki/${pageSlug}?section=${sectionSlug}" class="text-[#709978] hover:text-[#a9d1b0] underline underline-offset-4 decoration-[#3d543e] transition-colors">${label}</a>`;
  });

  // [[PageName|Label]]
  html = html.replace(/\[\[([^|\]\n]+)\|([^\]\n]+)\]\]/g, (match, page, label) => {
    const pageSlug = page.trim().toLowerCase();
    return `<a href="#/wiki/${pageSlug}" class="text-[#709978] hover:text-[#a9d1b0] underline underline-offset-4 decoration-[#3d543e] transition-colors">${label}</a>`;
  });

  // [[PageName#SectionName]]
  html = html.replace(/\[\[([^|\]#\n]+)#([^\]\n]+)\]\]/g, (match, page, section) => {
    const pageSlug = page.trim().toLowerCase();
    const sectionSlug = slugify(section);
    return `<a href="#/wiki/${pageSlug}?section=${sectionSlug}" class="text-[#709978] hover:text-[#a9d1b0] underline underline-offset-4 decoration-[#3d543e] transition-colors">${page} - ${section}</a>`;
  });

  // [[PageName]]
  html = html.replace(/\[\[([^|\]\n]+)\]\]/g, (match, page) => {
    const pageSlug = page.trim().toLowerCase();
    return `<a href="#/wiki/${pageSlug}" class="text-[#709978] hover:text-[#a9d1b0] underline underline-offset-4 decoration-[#3d543e] transition-colors">${page}</a>`;
  });

  // 7. Single-bracket External Links: [http://url Label]
  html = html.replace(/\[(https?:\/\/[^\s\]]+)\s+([^\]]+)\]/g, (match, url, label) => {
    return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="text-[#709978] hover:text-[#a9d1b0] underline underline-offset-4 decoration-[#3d543e] transition-colors">${label}</a>`;
  });

  return html;
}
