/**
 * ========================================================================================
 * AI ASSISTANT MAINTENANCE NOTICE & PROTOCOL RULES:
 * ========================================================================================
 * 1. MANDATORY REMINDER - MOD CONTENT UPDATES ONLY:
 *    The "Recent Version Highlights" list in the Wiki Maintenance Note below is STRICTLY
 *    and EXCLUSIVELY for in-game Backwoods mod content updates (e.g., entities, biomes,
 *    dimensions, structures, mechanics, blocks, items, commands, balance calibrations).
 *    DO NOT EVER include wiki web app features, UI/styling changes, theme calibrations,
 *    terminal tweaks, or website bug fixes in the highlights list.
 *
 * 2. Whenever you update any wiki content or implement commit changes:
 *    - Update the "Recent Highlights" list in the Wiki Maintenance Note below with in-game mod updates.
 *    - Keep the underline strictly on: "The wiki is always updated before a new version releases."
 *    - Wrap newly added/changed components across the wiki in `<UpdatedFrame id="..." isUpdated={true}>`.
 * ========================================================================================
 */
import React from 'react';
import { 
  ShieldAlert, 
  Compass, 
  Terminal, 
  BookOpen, 
  Skull, 
  Layers, 
  ArrowRight,
  Info,
  Clock,
  Sparkles
} from 'lucide-react';
import UpdatedFrame from '../UpdatedFrame';
import TitleDialPicker from '../TitleDialPicker';
import { useTheme } from '../../context/ThemeContext';

export default function HomeView() {
  const { theme } = useTheme();
  const isStarlight = theme === 'starlight';

  return (
    <div className="space-y-8 max-w-[1000px] mx-auto text-[#c9d1c9]">
      
      {/* 1. LOGO HERO BANNER WITH SECRET INTERACTIVE DIAL PICKER */}
      <UpdatedFrame id="home_hero_dial_picker" isUpdated={true}>
        <div className="relative overflow-hidden rounded-xl bg-[#0c0f0d] border border-[#1e2720] p-8 text-center shadow-lg space-y-2">
          <TitleDialPicker />
          <p className="text-xs sm:text-sm font-mono tracking-[0.2em] text-[#709978] uppercase">
            Official Survival & Horror Field Guide
          </p>
        </div>
      </UpdatedFrame>

      {/* 
        ========================================================================================
        CONSTANT REMINDER: MOD CONTENT UPDATES ONLY
        ----------------------------------------------------------------------------------------
        The Wiki Maintenance Note below is STRICTLY for in-game Backwoods mod content updates
        (entities, structures, dimensions, mechanics, blocks, items, commands, balance tweaks).
        NEVER include wiki web app features, UI changes, terminal tweaks, or website bug fixes.
        ----------------------------------------------------------------------------------------
        Mandatory Underline: <u>The wiki is always updated before a new version releases.</u>
        ========================================================================================
      */}
      {/* 2. WIKI MAINTENANCE NOTE (UPDATED FRAME) */}
      <UpdatedFrame id="home_maintenance_notice" isUpdated={true}>
        <div
          className={`p-5 rounded-xl space-y-3 shadow-lg transition-all duration-300 ${
            isStarlight
              ? 'bg-gradient-to-r from-[#18181b]/95 via-[#111114]/95 to-[#09090b]/95 border-2 border-zinc-300 shadow-[0_0_24px_rgba(228,228,231,0.5),inset_0_0_12px_rgba(255,255,255,0.08)]'
              : 'bg-gradient-to-r from-[#17140b] via-[#0f110d] to-[#0c0e0c] border border-amber-500/40'
          }`}
        >
          <div
            className={`flex items-center gap-2 font-mono text-xs uppercase font-bold tracking-wider ${
              isStarlight ? 'text-zinc-200' : 'text-amber-400'
            }`}
          >
            <Info
              className={`w-4 h-4 animate-pulse ${
                isStarlight ? 'text-zinc-100' : 'text-amber-400'
              }`}
            />
            <span>Wiki Maintenance Note</span>
          </div>
          
          <div
            className={`p-4 sm:p-5 rounded-lg text-base sm:text-lg md:text-xl font-semibold leading-relaxed text-center flex items-center justify-center transition-all ${
              isStarlight
                ? 'bg-zinc-900/90 border border-zinc-300/80 text-zinc-100 shadow-[0_0_18px_rgba(255,255,255,0.15)]'
                : 'bg-amber-950/30 border border-amber-500/30 text-amber-200'
            }`}
          >
            <u>The wiki is always updated before a new version releases.</u>
          </div>

          <div className="text-xs text-[#9eb0a1] space-y-1.5 font-mono pt-1">
            <div
              className={`font-semibold uppercase text-[11px] tracking-wider ${
                isStarlight ? 'text-zinc-300' : 'text-[#a9d1b0]'
              }`}
            >
              Recent Version Highlights:
            </div>
            <ul className="list-disc list-inside space-y-1.5 text-[#829285] pl-1">
              <li>
                <strong className={isStarlight ? 'text-zinc-100 font-bold' : 'text-amber-300'}>
                  The Crossworks Dimension & Dustbound Galleries:
                </strong>{' '}
                Added documentation for The Crossworks (Y=-64 to Y=767, 832m build height) and its solitary biome Dustbound Galleries with active WIP banner and void fall / lethal fall anchor loop protection.
              </li>
              <li>
                <strong className={isStarlight ? 'text-zinc-100 font-bold' : 'text-amber-300'}>
                  Suspended Ward Architectural Lattice:
                </strong>{' '}
                Documented 48×48 cell grid structure generation, including oak log corner pillars, suspended plank catwalks, 40% building / 20% floor Blindspot Splinter spawner rates, 10% false plank pitfall traps, and 0.001% portal generation anomalies.
              </li>
              <li>
                <strong className={isStarlight ? 'text-zinc-100 font-bold' : 'text-amber-300'}>
                  Hewn Splinter Effigy Mechanics & Deflection:
                </strong>{' '}
                Snapped cardinal rotation (90° yaw / 0° pitch) with zero mobility (0.0 movement speed); complete projectile deflection immunity, fluid push and falling anvil invulnerability, and guaranteed Oak Planks drop (100% chance, 1x).
              </li>
              <li>
                <strong className={isStarlight ? 'text-zinc-100 font-bold' : 'text-amber-300'}>
                  The Rot Black Hole Detonation & Loot Dissolution:
                </strong>{' '}
                Physical remains completely dissolve upon defeat via terminal black hole singularity detonation, yielding 7,777 XP with 0 physical item drops.
              </li>
              <li>
                <strong className={isStarlight ? 'text-zinc-100 font-bold' : 'text-amber-300'}>
                  Verdant Engine Defeat Yield:
                </strong>{' '}
                Calibrated Verdant Engine death experience yield to 70,000 XP following core fracture detonation.
              </li>
              <li>
                <strong className={isStarlight ? 'text-zinc-100 font-bold' : 'text-amber-300'}>
                  Entity Experience Rebalancing:
                </strong>{' '}
                Calibrated death experience values for Stilt Walker (30 XP), Fractus (25 XP), and Hewn Splinter (3 XP).
              </li>
            </ul>
          </div>
        </div>
      </UpdatedFrame>

      {/* 3. WELCOME & OVERVIEW */}
      <div className="p-6 bg-[#0f1210] border border-[#1d251e] rounded-xl space-y-4 shadow-md">
        <p className="text-sm sm:text-base leading-relaxed text-[#d1dad1]">
          <strong className="text-[#e0e7e0]">Backwoods</strong> is a Minecraft horror mod that introduces terrifying dimensions, hostile entities with complex behavior profiles, custom combat mechanics, atmospheric blocks, and a psychological <strong className="text-amber-400">Mental Degradation</strong> survival system.
        </p>
        <p className="text-xs sm:text-sm leading-relaxed text-[#829285] italic border-l-2 border-[#709978] pl-4">
          The mod aims to diversify and intensify survival through oppressive exploration, limited safety, and enemies that require awareness and timing rather than simple combat. With Backwoods, you will once again feel fear while traveling, looting, and descending into dark places — because danger is no longer just around you; it is watching you.
        </p>
      </div>

      {/* 4. NAVIGATION CARDS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        {/* CARD 1: GETTING STARTED */}
        <div className="p-5 bg-[#0c0e0c] border border-[#1a221c] border-t-2 border-t-[#709978] rounded-xl space-y-3 flex flex-col justify-between hover:border-[#2a382d] transition-all">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-[#e0e7e0] font-serif text-base font-semibold">
              <Compass className="w-4 h-4 text-[#709978]" />
              <span>Getting Started</span>
            </div>
            <p className="text-xs text-[#829285] leading-relaxed">
              Build a portal frame out of <strong className="text-[#c9d1c9]">Oak Planks</strong> and ignite it using <strong className="text-[#c9d1c9]">Steel and Charcoal</strong>.
            </p>
            <p className="text-xs text-[#5a6b5e] italic">
              Step into a vast, yellow-fogged dimension constructed of decaying planks and logs.
            </p>
          </div>
          <a href="#/wiki/dimensions" className="inline-flex items-center gap-1.5 text-xs font-mono text-[#709978] hover:text-[#a9d1b0] uppercase tracking-wider font-semibold pt-2">
            <span>Explore Realms</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* CARD 2: MENTAL DEGRADATION */}
        <div className="p-5 bg-[#0c0e0c] border border-[#1a221c] border-t-2 border-t-[#709978] rounded-xl space-y-3 flex flex-col justify-between hover:border-[#2a382d] transition-all">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-[#e0e7e0] font-serif text-base font-semibold">
              <Skull className="w-4 h-4 text-[#709978]" />
              <span>Mental Degradation</span>
            </div>
            <p className="text-xs text-[#829285] leading-relaxed">
              The longer you linger in complete darkness, the more your sanity deteriorates. Learn how fear mechanics warp audio, vision, and survival.
            </p>
          </div>
          <a href="#/wiki/sanity" className="inline-flex items-center gap-1.5 text-xs font-mono text-[#709978] hover:text-[#a9d1b0] uppercase tracking-wider font-semibold pt-2">
            <span>Sanity Guide</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* CARD 3: HOSTILE ENTITIES */}
        <div className="p-5 bg-[#0c0e0c] border border-[#1a221c] border-t-2 border-t-[#709978] rounded-xl space-y-3 flex flex-col justify-between hover:border-[#2a382d] transition-all">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-[#e0e7e0] font-serif text-base font-semibold">
              <ShieldAlert className="w-4 h-4 text-[#709978]" />
              <span>Hostile Entities</span>
            </div>
            <p className="text-xs text-[#829285] leading-relaxed">
              They are watching. Inspect full 3D models, armor ratings, drop rates, and combat counters for every creature in the Backwoods.
            </p>
          </div>
          <a href="#/wiki/entities" className="inline-flex items-center gap-1.5 text-xs font-mono text-[#709978] hover:text-[#a9d1b0] uppercase tracking-wider font-semibold pt-2">
            <span>View Bestiary</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>

      </div>

      {/* 5. QUICK DIRECTORY LINKS */}
      <div className="p-6 bg-[#090b09] border border-[#161d17] rounded-xl space-y-4">
        <div className="text-xs font-mono text-[#5a6b5e] uppercase tracking-widest font-semibold">
          Wiki Quick Reference
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 text-center">
          {[
            { label: 'Entities', href: '#/wiki/entities', icon: ShieldAlert },
            { label: 'Commands', href: '#/wiki/commands', icon: Terminal },
            { label: 'Dimensions', href: '#/wiki/dimensions', icon: Compass },
            { label: 'Blocks', href: '#/wiki/blocks', icon: Layers },
            { label: 'Items', href: '#/wiki/items', icon: BookOpen },
            { label: 'Versions', href: '#/wiki/versions', icon: Clock }
          ].map(item => (
            <a
              key={item.label}
              href={item.href}
              className="p-3 bg-[#0d100e] border border-[#1a221c] hover:border-[#709978]/50 hover:bg-[#121714] rounded-lg transition-all flex flex-col items-center gap-2 group"
            >
              <item.icon className="w-4 h-4 text-[#709978] group-hover:scale-110 transition-transform" />
              <span className="text-xs font-mono text-[#c9d1c9] group-hover:text-[#a9d1b0]">{item.label}</span>
            </a>
          ))}
        </div>
      </div>

      {/* FOOTER */}
      <div className="text-center pt-6 border-t border-[#1a221c] text-[11px] font-mono text-[#5a6b5e] uppercase tracking-widest">
        Created by honeypie_3301 using MCreator
      </div>

    </div>
  );
}
