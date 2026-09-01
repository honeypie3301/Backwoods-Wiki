import { WikiArticle } from '../types';

export const WIKI_ARTICLES: WikiArticle[] = [
  { slug: 'home', title: 'Home', category: 'Core Guide', filename: 'Home.tsx', order: 1 },
  { slug: 'sanity', title: 'Mental Degradation', category: 'Core Guide', filename: 'Sanity.tsx', order: 2 },
  { slug: 'achievements', title: 'Achievements', category: 'Core Guide', filename: 'Achievements.tsx', order: 3 },
  { slug: 'versions', title: 'Version History', category: 'Core Guide', filename: 'Versions.tsx', order: 4 },
  { slug: 'dimensions', title: 'Dimensions', category: 'The World', filename: 'Dimensions.tsx', order: 5 },
  { slug: 'structures', title: 'Structures', category: 'The World', filename: 'Structures.tsx', order: 6 },
  { slug: 'blocks', title: 'Blocks', category: 'The World', filename: 'Blocks.tsx', order: 7 },
  { slug: 'entities', title: 'Hostile & Neutral Entities', category: 'Flora & Fauna', filename: 'Entities.tsx', order: 8 },
  { slug: 'items', title: 'Items & Gear', category: 'Flora & Fauna', filename: 'Items.tsx', order: 9 },
  { slug: 'commands', title: 'Commands', category: 'Flora & Fauna', filename: 'Commands.tsx', order: 10 },
  { slug: 'terminated', title: 'Terminated Dossier', category: 'Flora & Fauna', filename: 'Terminated.tsx', order: 11 }
];

export function getWikiArticles(): WikiArticle[] {
  return WIKI_ARTICLES;
}

export function getArticleBySlug(slug: string): WikiArticle | undefined {
  return WIKI_ARTICLES.find(a => a.slug === slug);
}

/**
 * Static full-text search database across all articles for instantaneous,
 * offline, 100% independent deep search across items, entities, blocks,
 * biomes, dimensions, and mechanics.
 */
export const WIKI_SEARCH_DATABASE: Record<string, string> = {
  home: `
    Backwoods Minecraft Horror Mod Official Field Guide
    Getting Started Portal Oak Planks Steel and Charcoal
    Mental Degradation Survival System
    Hostile Entities Behavior Woodbound
    Custom Blocks Items Gear Dimensions The Still The Backwoods The Grain The Loss The Rotting The Familiar The Petrified Weald The Sub-Strata
    Title Dial Picker Super Bonemeal Darwinism
    Recent Highlights Woodweaver Boss Tetherless Resonant Pearl Potion Brewing Atrophy Cellular Collapse
  `,
  sanity: `
    Mental Degradation Core Survival Mechanic Internal Timer Exposure
    Reality Adaptation 20 minutes 24000 ticks 15% stage extension
    Stage One 6 minutes 30 seconds 7800 ticks faint whispers hallucinations
    Stage Two 10 minutes 24 seconds 12480 ticks music stops Darkness effect 3 seconds cave sounds louder whispers
    Stage Three 18 minutes 12 seconds 21840 ticks deep distorted sound degradation_o1 camera jolt disorientation fake sounds wood chest bell hallucinations
    Stage Four 26 minutes 31200 ticks master silence spontaneous Oak Planks rotting decay forced portal pulls The Loss The Grain failure state
    Recovery Leaving Dimension resets timer Pale Remedy Recovered Pale Remedy delay exposure
  `,
  achievements: `
    Achievements Advancements Progression Root The Backwoods Step into Planks
    Mental Fortitude Survive Exposure Rotbane Slay The Rot
    Splinter Shatter Slay Splinter Lost Memory Nullstone Dead Memory Shard
    Silent Canopy Enter The Still
  `,
  versions: `
    Version History Changelog Updates Patch Notes
    Title Dial Picker Woodweaver Boss Potion Brewing
    Dimensions Biomes Recipes
  `,
  dimensions: `
    The Backwoods Primary Dimension Wood Plains The Thicket Deep Backwoods Spore Threat The Rot sentinels
    The Loss The Forgotten Sub-Realm Confusion biome Nullstone Dead Memory Shard Existential Phase-Shifting Fade Level Intangibility
    The Rotting Suffocating Forest Rotting Deep Perpetual Midnight Rotten Flora
    The Grain The Labyrinth of Planks Uniform Grain The Stillwood Splinter Nest Pillar Thicket Labyrinthine Grids Fractured Barrens Splinter Needle
    The Still The Silent Canopy Still biome Pale Draught Bottle Attuned Resonant Rot Effigy Seep harvest still_music still_ambient
    The Familiar The Simulated Overworld Mirrored Plains Uncanny mob staring transient entities
    The Petrified Weald The Fossilized Remains Calcified Plains Weald Outskirts Petrified Thickwoods Fossilized Core Ashen Barrens Heavy Lungs
    The Sub-Strata Terminal Underworld Dead Grain Scaffolding descent Blindspot Splinters
    Portal Catalysts Steel and Charcoal Dead Memory Shard Splinter Needle Steel and Shard success rates
  `,
  structures: `
    A Staircase loot chest Farlands Oak Planks physics decay anti-gravity Oak Stalactites Lignum Caro Menger Sponge Small
    Void Basement Cavern Grid Sky Grid The Nest Grids Wood Buildings Buried Rooms Sub-Grain Atria Labyrinthine Grids
    Right Side Up City Upside Down City The Underside Void Bedrock Planks Scaffolding Tower Menger Sponge Catwalk Sub-Cavern
    Calcified Spikes Large Calcified Spikes Familiar Farlands
  `,
  blocks: `
    Oak Planks Splintered Oak Planks Rotten Oak Wood Rotten Oak Planks Lignum Caro
    Nullstone Dead Memory Shard Plaque Faded Blocks Memory Quartz Amber Grit Cobbled Amber Grit
    Petrified Rotten Oak Wood Ash Roses Deepslate Windcap Mushroom Plant
  `,
  entities: `
    The Rot Sentinel Spore Slayer Woodweaver Boss Hypnotic Beam
    Splinter Blindspot Splinter Giant Vermis Gigas Hewn Splinter Wood Plains Thicket
    Pale Stalker Mimic Woodbound Entities Paralyzed Block-Form Splinter
  `,
  items: `
    Steel and Charcoal Dead Memory Shard Splinter Needle Steel and Shard
    Pale Remedy Recovered Pale Remedy Pale Draught Bottle
    Resonant Rot Effigy Rot Effigy Tetherless Pearl Resonant Pearl
    Atrophy Potion Cellular Collapse Potion Cellular Collapse II Potion
    Seep Lignum Caro Fragment Sharpened Splinter Shard
    Petrified Rotten Dagger Dagger Reach Penalty Petrified Oak Gall Amber Grit Projectile
    Windcap Mushroom Light Lungs Movement Efficiency Ash Berries
  `,
  commands: `
    /backwoods sanity /backwoods threat /backwoods debug
  `,
  terminated: `
    Terminated Dossier Redacted Entities Experimental Prototypes
  `,
  'rot-lab': `
    Rot Neural Lab Mindspace Architecture Core Processor Cognitive Simulator
  `
};
