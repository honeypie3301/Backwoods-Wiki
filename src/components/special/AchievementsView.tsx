import React, { useState, useMemo } from 'react';
import { Search, Trophy, Target, CheckCircle, ArrowUpRight, Flame, Sparkles, HelpCircle, RefreshCw, Award } from 'lucide-react';
import UpdatedFrame from '../UpdatedFrame';

interface AchievementItem {
  id: string;
  title: string;
  type: 'Task' | 'Goal' | 'Challenge';
  description: string;
  requirement: string;
  oldXp: number;
  newXp: number;
}

export default function AchievementsView() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'rebalanced' | 'unchanged'>('all');

  const achievements: AchievementItem[] = [
    {
      id: "enter_backwoods",
      title: "Backwoods",
      type: "Task",
      description: "Step into the cold, dense overgrowth of the Backwoods.",
      requirement: "Enter the Backwoods dimension.",
      oldXp: 1,
      newXp: 20
    },
    {
      id: "drink_pale_draught",
      title: "Stagnant Brew",
      type: "Task",
      description: "Refine Seep into a liquid gateway.",
      requirement: "Drink the Pale Draught.",
      oldXp: 1,
      newXp: 15
    },
    {
      id: "enter_familiar",
      title: "Home sweet?",
      type: "Goal",
      description: "Discover the dimension that mirrors your memories.",
      requirement: "Enter the Familiar dimension.",
      oldXp: 3,
      newXp: 30
    },
    {
      id: "punishment",
      title: "The source",
      type: "Goal",
      description: "Get dragged into The Grain for looking where you shouldn't.",
      requirement: "Get teleported into the Grain dimension.",
      oldXp: 3,
      newXp: 25
    },
    {
      id: "enter_rotting_dimension",
      title: "Inner Circle",
      type: "Task",
      description: "Reach the core of the Backwoods infection.",
      requirement: "Enter the Rotting dimension.",
      oldXp: 0,
      newXp: 20
    },
    {
      id: "enter_still",
      title: "Total Stasis",
      type: "Goal",
      description: "Enter the dimension where time forgot to move.",
      requirement: "Enter the Still dimension.",
      oldXp: 0,
      newXp: 20
    },
    {
      id: "enter_loss",
      title: "A Memory Misplaced",
      type: "Task",
      description: "Seek out what was forgotten.",
      requirement: "Enter the Loss dimension.",
      oldXp: 5,
      newXp: 35
    },
    {
      id: "rot_effigy_obtain",
      title: "A Cruel Likeness",
      type: "Goal",
      description: "Fashion a key out of splintered shards and string.",
      requirement: "Craft the Rot Effigy.",
      oldXp: 5,
      newXp: 15
    },
    {
      id: "nest_structure",
      title: "The Hive Walls",
      type: "Task",
      description: "Enter a biome where the structures reach the sky and the silence is loud.",
      requirement: "Step into the Splinter Nest biome in the Grain.",
      oldXp: 7,
      newXp: 25
    },
    {
      id: "enter_weald",
      title: "The Forest That Outlived Time",
      type: "Task",
      description: "Travel beyond the boundaries of temporal decay.",
      requirement: "Enter the Weald dimension.",
      oldXp: 8,
      newXp: 45
    },
    {
      id: "heartwood_sword",
      title: "Pumping Heart",
      type: "Goal",
      description: "Infuse your blade with the core of the Rotting dimension.",
      requirement: "Craft the Heartwood Rotten Sword.",
      oldXp: 8,
      newXp: 30
    },
    {
      id: "get_all_recovered",
      title: "What Was Lost",
      type: "Challenge",
      description: "Reclaim every recovered faded tool.",
      requirement: "Complete the full set of recovered faded armaments.",
      oldXp: 20,
      newXp: 60
    },
    {
      id: "borrowed_time",
      title: "Borrowed Time",
      type: "Task",
      description: "Destroy a Plaque Heart to buy more time in Loss.",
      requirement: "Shatter a pulsing heart in the depths.",
      oldXp: 16,
      newXp: 16
    },
    {
      id: "obtain_first_recovered_tool",
      title: "Edge of Recall",
      type: "Goal",
      description: "Forge your first Recovered Faded tool.",
      requirement: "Forge a tool imbued with past thoughts.",
      oldXp: 11,
      newXp: 11
    },
    {
      id: "obtain_memory_fragment",
      title: "First Splinter of Memory",
      type: "Task",
      description: "Obtain a Memory Fragment from a Plaque Heart.",
      requirement: "Recover a fragment of past awareness.",
      oldXp: 15,
      newXp: 15
    },
    {
      id: "obtain_recovered_fragment",
      title: "Recovered Thought",
      type: "Goal",
      description: "Craft a Recovered Fragment from distorted memory and remedy.",
      requirement: "Synthesize memory and remedy together.",
      oldXp: 15,
      newXp: 15
    },
    {
      id: "use_resin",
      title: "Patchwork Survival",
      type: "Task",
      description: "Use Petrified Resin to repair a Recovered Faded tool.",
      requirement: "Apply resin to mend deteriorating gear.",
      oldXp: 8,
      newXp: 8
    },
    {
      id: "rot_boss",
      title: "Sentinel",
      type: "Challenge",
      description: "Try to kill the Rot.",
      requirement: "Initiate or face the ultimate trial against the Rot.",
      oldXp: 1000,
      newXp: 2077
    }
  ];

  // Stats calculation
  const totalOldXp = useMemo(() => achievements.reduce((acc, curr) => acc + curr.oldXp, 0), []);
  const totalNewXp = useMemo(() => achievements.reduce((acc, curr) => acc + curr.newXp, 0), []);
  const rebalancedCount = useMemo(() => achievements.filter(a => a.oldXp !== a.newXp).length, []);
  const highestIncrease = useMemo(() => {
    return achievements.reduce((max, curr) => {
      const diff = curr.newXp - curr.oldXp;
      const maxDiff = max.newXp - max.oldXp;
      return diff > maxDiff ? curr : max;
    }, achievements[0]);
  }, []);

  const filteredAchievements = useMemo(() => {
    return achievements.filter(a => {
      const matchesSearch = 
        a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.requirement.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesType = selectedType === 'all' || a.type.toLowerCase() === selectedType.toLowerCase();

      const isRebalanced = a.oldXp !== a.newXp;
      const matchesStatus = 
        statusFilter === 'all' ||
        (statusFilter === 'rebalanced' && isRebalanced) ||
        (statusFilter === 'unchanged' && !isRebalanced);

      return matchesSearch && matchesType && matchesStatus;
    });
  }, [searchQuery, selectedType, statusFilter]);

  const getTypeIcon = (type: 'Task' | 'Goal' | 'Challenge') => {
    switch (type) {
      case 'Task':
        return <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />;
      case 'Goal':
        return <Target className="w-4 h-4 text-blue-400 shrink-0" />;
      case 'Challenge':
        return <Trophy className="w-4 h-4 text-purple-400 shrink-0 animate-bounce" />;
    }
  };

  const getTypeStyle = (type: 'Task' | 'Goal' | 'Challenge') => {
    switch (type) {
      case 'Task':
        return 'bg-emerald-950/40 border-emerald-500/30 text-emerald-400';
      case 'Goal':
        return 'bg-blue-950/40 border-blue-500/30 text-blue-400';
      case 'Challenge':
        return 'bg-purple-950/40 border-purple-500/30 text-purple-400';
    }
  };

  return (
    <div className="space-y-6 max-w-[1000px] mx-auto text-[#c9d1c9]">
      
      {/* 1. Header & Rebalance Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-[#0c100d] border border-[#1b251f] rounded-xl flex items-center gap-3">
          <div className="p-2.5 bg-emerald-950/40 border border-emerald-500/30 rounded-lg text-emerald-400">
            <RefreshCw className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] font-mono text-[#5a6b5e] uppercase tracking-wider">Rebalanced</div>
            <div className="text-lg font-bold font-mono text-[#e0e7e0]">{rebalancedCount} / {achievements.length}</div>
          </div>
        </div>

        <div className="p-4 bg-[#0c100d] border border-[#1b251f] rounded-xl flex items-center gap-3">
          <div className="p-2.5 bg-amber-950/40 border border-amber-500/30 rounded-lg text-amber-400">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] font-mono text-[#5a6b5e] uppercase tracking-wider">Total Reward Pool</div>
            <div className="text-lg font-bold font-mono text-[#e0e7e0]">
              {totalNewXp.toLocaleString()} XP
              <span className="text-[10px] text-emerald-400 font-medium ml-1.5 font-sans">
                (+{((totalNewXp - totalOldXp) / totalOldXp * 100).toFixed(0)}%)
              </span>
            </div>
          </div>
        </div>

        <div className="p-4 bg-[#0c100d] border border-[#1b251f] rounded-xl flex items-center gap-3 sm:col-span-2 lg:col-span-2">
          <div className="p-2.5 bg-purple-950/40 border border-purple-500/30 rounded-lg text-purple-400 shrink-0">
            <Flame className="w-5 h-5" />
          </div>
          <div className="overflow-hidden min-w-0">
            <div className="text-[10px] font-mono text-[#5a6b5e] uppercase tracking-wider">Highest Increase</div>
            <div className="text-xs font-serif font-semibold text-[#e0e7e0] truncate">
              {highestIncrease.title}
            </div>
            <div className="text-[10px] font-mono text-purple-400">
              {highestIncrease.oldXp} XP → {highestIncrease.newXp} XP (+{highestIncrease.newXp - highestIncrease.oldXp} XP)
            </div>
          </div>
        </div>
      </div>

      {/* 2. Interactive Search & Filters Panel */}
      <div className="p-4 bg-[#0f1210] border border-[#1d251e] rounded-xl space-y-4 shadow-md select-none">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-[#5a6b5e]" />
            <input
              type="text"
              placeholder="Filter achievements by title, description, or requirements..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#0a0d0b] border border-[#232f26] rounded-lg py-2 pl-9 pr-4 text-xs font-mono text-[#c9d1c9] placeholder-[#5a6b5e] focus:outline-none focus:border-[#415645] transition-all"
            />
          </div>

          {/* Type Filters */}
          <div className="flex gap-1 bg-[#0a0d0b] border border-[#232f26] rounded-lg p-1">
            {['all', 'Task', 'Goal', 'Challenge'].map(type => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`px-3 py-1 text-[11px] font-mono rounded-md uppercase tracking-wider transition-all cursor-pointer ${
                  selectedType.toLowerCase() === type.toLowerCase()
                    ? 'bg-[#18221b] text-[#a9d1b0] font-semibold border border-[#304434]'
                    : 'text-[#6f7e73] hover:text-[#c9d1c9]'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-4 text-[11px] font-mono border-t border-[#1a221c]/60 pt-3">
          <span className="text-[#5a6b5e] uppercase tracking-wider">Update Status:</span>
          <div className="flex gap-4">
            <label className="flex items-center gap-1.5 cursor-pointer text-[#829285] hover:text-[#c9d1c9]">
              <input
                type="radio"
                name="status"
                checked={statusFilter === 'all'}
                onChange={() => setStatusFilter('all')}
                className="accent-emerald-600"
              />
              All
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer text-[#829285] hover:text-[#c9d1c9]">
              <input
                type="radio"
                name="status"
                checked={statusFilter === 'rebalanced'}
                onChange={() => setStatusFilter('rebalanced')}
                className="accent-emerald-600"
              />
              <span className="text-amber-400 font-semibold flex items-center gap-0.5">
                <Sparkles className="w-3 h-3 text-amber-400" />
                XP Rebalanced
              </span>
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer text-[#829285] hover:text-[#c9d1c9]">
              <input
                type="radio"
                name="status"
                checked={statusFilter === 'unchanged'}
                onChange={() => setStatusFilter('unchanged')}
                className="accent-emerald-600"
              />
              Unchanged
            </label>
          </div>
        </div>
      </div>

      {/* 3. Achievements Cards Grid */}
      {filteredAchievements.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredAchievements.map(a => {
            const isRebalanced = a.oldXp !== a.newXp;
            
            const cardContent = (
              <div className="p-5 bg-[#0f1210] border border-[#1a221c] rounded-xl flex flex-col justify-between h-full hover:bg-[#121714] hover:border-[#243127] transition-all group">
                <div className="space-y-3">
                  {/* Card Header (Title & Badge) */}
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-serif text-lg font-bold text-[#e0e7e0] group-hover:text-emerald-300 transition-colors">
                      {a.title}
                    </h3>
                    <div className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full border text-[10px] font-mono font-medium ${getTypeStyle(a.type)}`}>
                      {getTypeIcon(a.type)}
                      <span>{a.type}</span>
                    </div>
                  </div>

                  {/* Descriptions */}
                  <div className="space-y-1.5">
                    <p className="text-xs text-[#829285] leading-relaxed">
                      {a.description}
                    </p>
                    <div className="text-[11px] font-mono text-[#5a6b5e] bg-[#090b0a] p-2 rounded border border-[#141b16] leading-relaxed">
                      <span className="text-emerald-600 font-semibold uppercase text-[9px] block mb-0.5 tracking-wider">In-Game Requirement:</span>
                      {a.requirement}
                    </div>
                  </div>
                </div>

                {/* Card Footer (XP & Change Indicator) */}
                <div className="mt-4 pt-3.5 border-t border-[#1a221c]/60 flex items-center justify-between select-none">
                  <div className="text-[10px] font-mono text-[#5a6b5e] uppercase tracking-wider">
                    Advancement Reward
                  </div>
                  
                  {isRebalanced ? (
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-[#6f7e73] line-through">
                        {a.oldXp} XP
                      </span>
                      <div className="flex items-center gap-1 bg-amber-950/40 border border-amber-500/40 px-2 py-0.5 rounded text-amber-300 font-mono text-xs font-bold shadow-[0_0_8px_rgba(245,158,11,0.1)]">
                        <span>{a.newXp.toLocaleString()} XP</span>
                        <ArrowUpRight className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      </div>
                    </div>
                  ) : (
                    <div className="font-mono text-xs font-bold text-[#829285] bg-[#0a0d0b] px-2 py-0.5 rounded border border-[#1a221c]">
                      {a.newXp.toLocaleString()} XP
                    </div>
                  )}
                </div>
              </div>
            );

            if (isRebalanced) {
              return (
                <UpdatedFrame key={a.id} id={`ach_frame_${a.id}`} isUpdated={true}>
                  {cardContent}
                </UpdatedFrame>
              );
            }

            return <div key={a.id}>{cardContent}</div>;
          })}
        </div>
      ) : (
        <div className="text-center py-12 bg-[#0f1210] border border-[#1a221c] rounded-xl select-none">
          <HelpCircle className="w-10 h-10 text-[#334237] mx-auto mb-3" />
          <p className="text-sm font-serif italic text-[#829285]">No achievements match your filters.</p>
          <p className="text-xs text-[#5a6b5e] mt-1.5 font-mono">Try adjusting your type or update status settings.</p>
        </div>
      )}

      {/* 4. Footnote / Lore block */}
      <div className="p-4 bg-zinc-900/20 border border-zinc-800/40 rounded-xl text-xs text-[#8c8779] leading-relaxed select-none font-mono flex items-start gap-2.5">
        <Sparkles className="w-4 h-4 text-zinc-500 shrink-0 mt-0.5" />
        <div>
          <strong className="text-zinc-400">Rebalancing Note:</strong> The Backwoods advancement network has undergone complete XP audits. Travel, exploration, and biome-specific tasks now yield significantly higher rewards to reflect their severe peril and high temporal resource costs, rewarding true cartographic persistence.
        </div>
      </div>
    </div>
  );
}
