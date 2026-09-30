import React, { useState, useEffect, useRef, useMemo } from 'react';
import CustomSelect from '../CustomSelect';
import {
  Brain, Crosshair, Cpu, Shield, ShieldOff, Zap, ShieldAlert,
  Flame, Snowflake, Target, Activity, Compass, Layers, Swords,
  ArrowRight, Eye, Radio, Sparkles, Terminal, Maximize2, AlertTriangle,
  RotateCcw, Play, Pause, ChevronDown, ChevronRight, Droplets,
  Skull, User, Users, Plus, Trash2, Heart, HeartPulse, RefreshCw,
  Sparkle, ShieldCheck, ArrowUpRight, ZapOff, Sliders, Info, UserX, UserCheck,
  Gauge, Move, HelpCircle, BookOpen, Clock, BarChart3, Database, Workflow, CheckCircle2
} from 'lucide-react';
import UpdatedFrame from '../UpdatedFrame';
import {
  TargetIntent, FightStyle, ThreatLevel, RotCombatRole, AbilityInfo,
  ROTS_ABILITY_REGISTRY, CombatContext, InterceptionPrediction, PersonalityVector,
  WelfordStats, createWelford, updateWelford, PlayerBehaviorData, TacticalNeuralData,
  RoleBidData, RotHivemindSavedData, CombatProfile, PendingPrediction, EntityObservation,
  AttackPredictorAdapter, INITIAL_PREDICTOR_ADAPTERS, UniversalEngineData, PhysicsParticle
} from './rotBrainArchitecture';

// Exact Rot Attributes from Minecraft Java Mod Source
export const ROT_SOURCE_ATTRIBUTES = {
  MOVEMENT_SPEED: 0.3,
  MAX_HEALTH: 550.0,
  ARMOR: 15.0,
  ATTACK_DAMAGE: 18.0,
  FOLLOW_RANGE: 128.0,
  STEP_HEIGHT: 1.5,
  KNOCKBACK_RESISTANCE: 0.8,
  ATTACK_KNOCKBACK: 0.7,
  SCALE: 1.25,
  XP_REWARD: 7777,
  MASS: 1200 // kg
};

// Vanilla Minecraft Java Edition 1.21.x Mob Specifications for 2D Physics Arena
export type ArenaMobType =
  | 'warden'
  | 'iron_golem'
  | 'vindicator'
  | 'enderman'
  | 'blaze'
  | 'creeper'
  | 'skeleton'
  | 'wither_skeleton'
  | 'zombie';

export interface ArenaMobStatSpec {
  name: string;
  maxHealth: number;
  armor: number;
  speed: number;
  damage: number;
  radius: number;
  mass: number;
  knockbackResistance: number;
  color: string;
  stroke: string;
  desc: string;
}

export const ARENA_MOB_STATS: Record<ArenaMobType, ArenaMobStatSpec> = {
  warden: {
    name: 'Warden',
    maxHealth: 500.0,
    armor: 0.0,
    speed: 0.30,
    damage: 30.0,
    radius: 0.95,
    mass: 1200,
    knockbackResistance: 1.0,
    color: '#022c22',
    stroke: '#14b8a6',
    desc: 'Deep Dark apex predator (500 HP). 30 Unblockable Sonic Boom and complete poise knockback immunity.'
  },
  iron_golem: {
    name: 'Iron Golem',
    maxHealth: 100.0,
    armor: 0.0,
    speed: 0.22,
    damage: 18.0,
    radius: 0.75,
    mass: 900,
    knockbackResistance: 1.0,
    color: '#cbd5e1',
    stroke: '#64748b',
    desc: 'Iron construct (100 HP). Sweeping 18 DMG strikes with vertical upward launch velocity.'
  },
  vindicator: {
    name: 'Vindicator',
    maxHealth: 24.0,
    armor: 0.0,
    speed: 0.32,
    damage: 13.0,
    radius: 0.45,
    mass: 75,
    knockbackResistance: 0.0,
    color: '#1e293b',
    stroke: '#94a3b8',
    desc: 'Illager berserker (24 HP). Fast Iron Axe sprint dealing 13 DMG and disabling shields.'
  },
  enderman: {
    name: 'Enderman',
    maxHealth: 40.0,
    armor: 0.0,
    speed: 0.30,
    damage: 10.5,
    radius: 0.5,
    mass: 80,
    knockbackResistance: 0.0,
    color: '#030712',
    stroke: '#a855f7',
    desc: 'Void stalker (40 HP). Teleports instantly to evade incoming projectiles and ambush targets.'
  },
  blaze: {
    name: 'Blaze',
    maxHealth: 20.0,
    armor: 0.0,
    speed: 0.22,
    damage: 6.0,
    radius: 0.45,
    mass: 50,
    knockbackResistance: 0.0,
    color: '#ea580c',
    stroke: '#facc15',
    desc: 'Nether elemental (20 HP). Ranged hover combat firing 3-fireball volleys.'
  },
  creeper: {
    name: 'Creeper',
    maxHealth: 20.0,
    armor: 0.0,
    speed: 0.22,
    damage: 49.0,
    radius: 0.45,
    mass: 65,
    knockbackResistance: 0.0,
    color: '#22c55e',
    stroke: '#15803d',
    desc: 'Explosive stalker (20 HP). 30-tick fuse with 7m defusal range and 49 max TNT blast.'
  },
  skeleton: {
    name: 'Skeleton',
    maxHealth: 20.0,
    armor: 0.0,
    speed: 0.22,
    damage: 4.5,
    radius: 0.45,
    mass: 70,
    knockbackResistance: 0.0,
    color: '#f1f5f9',
    stroke: '#94a3b8',
    desc: 'Undead archer (20 HP). Dynamic kiting between 5-15m with 20-tick bow charge.'
  },
  wither_skeleton: {
    name: 'Wither Skeleton',
    maxHealth: 20.0,
    armor: 0.0,
    speed: 0.24,
    damage: 8.0,
    radius: 0.5,
    mass: 75,
    knockbackResistance: 0.0,
    color: '#09090b',
    stroke: '#27272a',
    desc: 'Nether fortress guard (20 HP, 2.4m height). Stone Sword melee inflicting Wither I.'
  },
  zombie: {
    name: 'Zombie',
    maxHealth: 20.0,
    armor: 2.0,
    speed: 0.20,
    damage: 4.5,
    radius: 0.45,
    mass: 70,
    knockbackResistance: 0.05,
    color: '#15803d',
    stroke: '#166534',
    desc: 'Undead brawler (20 HP, 2 Armor). Relentless pursuit with reinforcement call alert.'
  }
};

export const VANILLA_MOB_STATS = ARENA_MOB_STATS;

export type PlayerCombatMode = 'smart_auto' | 'circle_strafe' | 'turtle_shield' | 'flee' | 'manual';

export interface Projectile {
  id: string;
  type: 'arrow' | 'sonic_boom' | 'solar_spark' | 'fireball';
  x: number;
  z: number;
  originX?: number;
  originZ?: number;
  phase?: number;
  deltaX: number;
  deltaZ: number;
  damage: number;
  source: string;
  lifeTicks: number;
}

export interface Shockwave {
  id: string;
  x: number;
  z: number;
  radius: number;
  maxRadius: number;
  color: string;
  alpha: number;
  thickness: number;
}

export interface ArenaMob {
  id: string;
  type: ArenaMobType;
  name: string;
  x: number;
  z: number;
  health: number;
  maxHealth: number;
  speed: number;
  damage: number;
  radius: number;
  mass: number;
  knockbackResistance?: number;
  deltaX: number;
  deltaZ: number;
  attackCooldown: number;
  
  // Specific Mob States
  creeperFuse?: number;
  creeperIsIgnited?: boolean;
  skeletonBowCharge?: number;
  wardenSonicCharge?: number;
  wardenAngerSprintTicks?: number;
  blazeBurstCharge?: number;
  endermanTeleportCooldown?: number;
  reinforcementTicks?: number;
}

export interface RotSimState {
  // Rot Physics & Attributes
  rotX: number;
  rotY: number;
  rotZ: number;
  rotRadius: number;
  rotMass: number;
  rotYaw: number;
  rotDeltaX: number;
  rotDeltaY: number;
  rotDeltaZ: number;
  rotHealth: number;
  rotMaxHealth: number;
  rotArmor: number;
  rotDamage: number;
  rotIsDead: boolean;
  rotAfterimages: Array<{ x: number; z: number; alpha: number; color: string }>;

  // 4-Pillar Dynamic Adaptation System
  kineticAdaptation: number;
  projectileAdaptation: number;
  blastAdaptation: number;
  swarmAdaptation: number;
  
  totalAdaptiveResistance: number;
  totalDamageTakenAccumulator: number;
  combatIntensity: number;

  // Player Physics & State
  playerSpawned: boolean;
  playerX: number;
  playerY: number;
  playerZ: number;
  playerRadius: number;
  playerMass: number;
  playerDeltaX: number;
  playerDeltaZ: number;
  playerHealth: number;
  playerMaxHealth: number;
  playerTotems: number;
  totemPoppedAnimationTicks: number;
  playerIsBlocking: boolean;
  playerShieldCooldown: number;
  playerGoldenApples: number;
  playerPotions: number;
  playerWeapon: 'sword' | 'axe' | 'mace' | 'crossbow';
  playerAttackCooldown: number;
  playerAbsorption: number;
  playerIsDead: boolean;
  lastPlayerAttackTick: number;
  playerActionLabel?: string;
  playerJumpPhase?: number;
  playerStrafeDir?: number;
  playerWTapTicks?: number;
  playerShieldFlickTicks?: number;
  playerEatingTicks?: number;
  playerComboHits?: number;
  cobwebs: { id: string; x: number; z: number; ticksRemaining: number }[];

  // Mobs, Projectiles, Shockwaves & Particles
  mobs: ArenaMob[];
  projectiles: Projectile[];
  shockwaves: Shockwave[];
  arenaParticles: PhysicsParticle[];

  // Ability Cooldown Timers (in Ticks)
  cdThyEndIsNow: number;
  cdJudgment: number;
  cdPrepareThyself: number;
  cdOverheadSlam: number;
  cdHeavyStrike: number;
  cdSolarLaser: number;
  cdSurgeRegen: number;

  // Mod AI Architecture Subsystems from Java Source
  combatContext: CombatContext;
  interception: InterceptionPrediction;
  personality: PersonalityVector;
  welfordDistance: WelfordStats;
  welfordAttackInterval: WelfordStats;
  playerBehavior: PlayerBehaviorData;
  tacticalNeural: TacticalNeuralData;
  roleAuction: RoleBidData;
  hivemindData: RotHivemindSavedData;
  combatProfile: CombatProfile;
  pendingPredictions: PendingPrediction[];
  entityObservations: EntityObservation[];
  predictorAdapters: AttackPredictorAdapter[];
  universalEngine: UniversalEngineData;

  // Combat State & Minos Moveset State Machine
  combatState: string;
  stateTicks: number;
  activeTargetType: 'player' | 'mob' | 'none';
  activeTargetMobId: string | null;

  // Minos Prime Combos & Moves FSM
  minosComboStep: number;
  minosComboTicks: number;
  
  dropkickPhase: number;
  dropkickTicks: number;
  dropkickTargetX: number;
  dropkickTargetZ: number;

  overheadPhase: number;
  overheadTicks: number;

  prepareThyselfPhase: number;
  prepareThyselfTicks: number;

  heavyPunchTicks: number;
  leftPunchTicks: number;
  rightPunchTicks: number;

  // Sweeping Lasers
  laserType: 'none' | 'solar' | 'cryo';
  laserChargingTicks: number;
  laserFiringTicks: number;
  laserClosingTicks: number;
  laserAimX: number;
  laserAimY: number;
  laserAimZ: number;
  laserHitPoint: { x: number; y: number; z: number } | null;

  // Sensory Perception & Neural Telemetry
  distanceToTarget: number;
  predictedTargetX: number;
  predictedTargetZ: number;
  activeDecisionNode: string;
}

const createInitialState = (): RotSimState => ({
  rotX: 24.0,
  rotY: 64.0,
  rotZ: 24.0,
  rotRadius: 0.65,
  rotMass: ROT_SOURCE_ATTRIBUTES.MASS,
  rotYaw: 180.0,
  rotDeltaX: 0.0,
  rotDeltaY: 0.0,
  rotDeltaZ: 0.0,
  rotHealth: ROT_SOURCE_ATTRIBUTES.MAX_HEALTH,
  rotMaxHealth: ROT_SOURCE_ATTRIBUTES.MAX_HEALTH,
  rotArmor: ROT_SOURCE_ATTRIBUTES.ARMOR,
  rotDamage: ROT_SOURCE_ATTRIBUTES.ATTACK_DAMAGE,
  rotIsDead: false,
  rotAfterimages: [],

  kineticAdaptation: 0.0,
  projectileAdaptation: 0.0,
  blastAdaptation: 0.0,
  swarmAdaptation: 0.0,
  totalAdaptiveResistance: 0.0,
  totalDamageTakenAccumulator: 0,
  combatIntensity: 0.0,

  playerSpawned: true,
  playerX: 24.0,
  playerY: 64.0,
  playerZ: 38.0,
  playerRadius: 0.4,
  playerMass: 80,
  playerDeltaX: 0.0,
  playerDeltaZ: 0.0,
  playerHealth: 20.0,
  playerMaxHealth: 20.0,
  playerTotems: 5,
  totemPoppedAnimationTicks: 0,
  playerIsBlocking: false,
  playerShieldCooldown: 0,
  playerGoldenApples: 3,
  playerPotions: 2,
  playerWeapon: 'sword',
  playerAttackCooldown: 0,
  playerAbsorption: 0.0,
  playerIsDead: false,
  lastPlayerAttackTick: 0,
  playerActionLabel: 'W-TAP SPACING',
  playerJumpPhase: 0,
  playerStrafeDir: 1,
  playerWTapTicks: 0,
  playerShieldFlickTicks: 0,
  playerEatingTicks: 0,
  playerComboHits: 0,
  cobwebs: [],

  mobs: [],
  projectiles: [],
  shockwaves: [],
  arenaParticles: [],

  cdThyEndIsNow: 0,
  cdJudgment: 0,
  cdPrepareThyself: 0,
  cdOverheadSlam: 0,
  cdHeavyStrike: 0,
  cdSolarLaser: 0,
  cdSurgeRegen: 0,

  combatContext: {
    targetIntent: 'AGGRESSIVE',
    fightStyle: 'ADAPTIVE',
    threatLevel: 'HIGH',
    lineOfSight: true,
    environmentThreatScore: 0.72,
    surroundingHostileCount: 1,
    dominantDamageSource: 'MELEE',
    tacticalDistanceMeters: 8.0,
    isTargetAirborne: false
  },
  interception: {
    leadTicks: 4,
    interceptX: 24.0,
    interceptZ: 34.0,
    targetVelocityX: 0.0,
    targetVelocityZ: 0.0,
    confidenceScore: 0.94,
    evasionVector: { x: 0, z: 0 }
  },
  personality: {
    aggression: 0.92,
    patience: 0.35,
    unpredictability: 0.84,
    adaptability: 0.96,
    cooperativeness: 0.78
  },
  welfordDistance: { count: 12, mean: 8.0, M2: 4.5, variance: 0.41, stdDev: 0.64, zScore: 0.12 },
  welfordAttackInterval: { count: 8, mean: 24.0, M2: 32.0, variance: 4.57, stdDev: 2.14, zScore: -0.25 },
  playerBehavior: {
    distanceTracker: { count: 12, mean: 8.0, M2: 4.5, variance: 0.41, stdDev: 0.64, zScore: 0.12 },
    attackIntervalTracker: { count: 8, mean: 24.0, M2: 32.0, variance: 4.57, stdDev: 2.14, zScore: -0.25 },
    shieldUsageFrequency: 0.45,
    weaponSwitchCount: 3,
    lastAttackTick: 0,
    estimatedReactionMs: 210
  },
  tacticalNeural: {
    inputs: Array(96).fill(0).map((_, i) => (i < 8 ? [8.0, 0.3, 0, 1.0, 1, 0, 0, 0][i] : 0.05)),
    hidden: Array(48).fill(0).map(() => 0.5),
    weightsCount: 5391,
    outputs: {
      tripleThreatCombo: 0.22,
      dropkickCombo: 0.18,
      highSkySlam: 0.15,
      dieRiderKick: 0.12,
      overheadSlam: 0.10,
      minosSlam: 0.08,
      sonicBoom: 0.05,
      omniSonic: 0.03,
      solarLaser: 0.02,
      cryoBeam: 0.02,
      witherSkulls: 0.01,
      armorRip: 0.01,
      defensiveGuard: 0.01,
      enderPearlIntercept: 0.0,
      consumablePunish: 0.0
    }
  },
  roleAuction: {
    activeRole: 'PUNISHER',
    bidUtility: 0.88,
    expireTick: 40,
    activeBids: [
      { role: 'PUNISHER', bid: 0.88, ownerId: 'rot_primary' },
      { role: 'FLANKER', bid: 0.64, ownerId: 'rot_clone_1' }
    ]
  },
  hivemindData: {
    globalEncounters: 42,
    totalPlayerKills: 19,
    cumulativeAdaptationScore: 0.82,
    threatMemoryMap: { player_sword_crits: 14, player_shield_turtle: 22, creeper_blasts: 5 },
    swarmDominanceIndex: 0.91,
    lastSeenPlayerGear: 'Full Netherite + Totem'
  },
  combatProfile: {
    preferredStyle: 'ADAPTIVE',
    reactionTimeTicks: 4,
    shieldDiscipline: 0.85,
    comboTolerance: 0.90,
    threatRating: 0.88
  },
  pendingPredictions: [
    { targetTick: 6, predictedX: 12.2, predictedZ: 16.8, expectedDamageWindow: 12, evasionImpulse: { x: -0.1, z: 0.2 } }
  ],
  entityObservations: [
    { entityId: 'player_0', entityType: 'player', lastSeenPos: { x: 12, z: 17 }, velocityVector: { x: 0, z: 0 }, threatEvaluation: 0.85, distance: 8.0, equippedItem: 'Netherite Sword' }
  ],
  predictorAdapters: INITIAL_PREDICTOR_ADAPTERS,
  universalEngine: {
    activeAdaptersCount: 6,
    compositeThreatScore: 0.82,
    evasionVector: { x: 0.15, z: -0.1 },
    predictedIncomingDamage: 14.0,
    recommendedCounterAction: 'Execute Heavy Strike shield shatter followed by Thy End Is Now combo'
  },

  combatState: 'IDLE_STALKING',
  stateTicks: 0,
  activeTargetType: 'player',
  activeTargetMobId: null,

  minosComboStep: 0,
  minosComboTicks: 0,
  
  dropkickPhase: 0,
  dropkickTicks: 0,
  dropkickTargetX: 12.0,
  dropkickTargetZ: 17.0,

  overheadPhase: 0,
  overheadTicks: 0,

  prepareThyselfPhase: 0,
  prepareThyselfTicks: 0,

  heavyPunchTicks: 0,
  leftPunchTicks: 0,
  rightPunchTicks: 0,

  laserType: 'none',
  laserChargingTicks: 0,
  laserFiringTicks: 0,
  laserClosingTicks: 0,
  laserAimX: 0.0,
  laserAimY: 0.0,
  laserAimZ: 1.0,
  laserHitPoint: null,

  distanceToTarget: 16.0,
  predictedTargetX: 24.0,
  predictedTargetZ: 34.0,
  activeDecisionNode: 'EVAL_COMBAT_PERCEPTION'
});

export default function RotLabView() {
  const [activeTab, setActiveTab] = useState<'arena' | 'mindspace' | 'abilities' | 'hivemind'>('arena');
  const [state, setState] = useState<RotSimState>(createInitialState);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [simSpeed, setSimSpeed] = useState<number>(50); // 20 TPS
  const [playerMode, setPlayerMode] = useState<PlayerCombatMode>('smart_auto');
  const [selectedSpawnMob, setSelectedSpawnMob] = useState<ArenaMobType>('warden');
  const [spawnCount, setSpawnCount] = useState<number>(2);

  const [neuralPulse, setNeuralPulse] = useState<number>(0);
  const [logs, setLogs] = useState<string[]>([
    '[SYSTEM] Rot Adaptive Neural Core Online (550 Max HP, 15 Armor, 18 Base DMG).',
    '[SYSTEM] Minecraft 2D Top-Down physics engine initialized. Drag friction: 0.91x.',
  ]);

  const addLog = (msg: string) => {
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setLogs(prev => [`[${time}] ${msg}`, ...prev.slice(0, 79)]);
  };

  const arenaCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Manual Move Forcing (For instant testing of every move)
  const triggerMove = (moveName: string) => {
    setState(prev => {
      if (prev.rotIsDead) {
        addLog('[ACTION BLOCKED] The Rot is defeated! Resurrect/Respawn The Rot first.');
        return prev;
      }
      const next = { ...prev };
      if (moveName === 'thy_end_is_now') {
        next.minosComboStep = 1;
        next.minosComboTicks = 5;
        next.combatState = 'THY_END_IS_NOW_1';
        addLog('[MANUAL OVERRIDE] Forced Minos Move: Thy End Is Now (4-Hit Combo)!');
      } else if (moveName === 'judgment') {
        next.dropkickPhase = 1;
        next.dropkickTicks = 14;
        next.dropkickTargetX = next.predictedTargetX;
        next.dropkickTargetZ = next.predictedTargetZ;
        next.rotDeltaX = 0;
        next.rotDeltaZ = 0;
        next.combatState = 'JUDGMENT_DROPKICK_ASCEND';
        addLog('[MANUAL OVERRIDE] Forced Minos Move: Judgment (Freeze & Supersonic Divekick)!');
      } else if (moveName === 'die_overhead') {
        next.overheadPhase = 1;
        next.overheadTicks = 14;
        next.rotDeltaX = 0;
        next.rotDeltaZ = 0;
        next.combatState = 'OVERHEAD_LEAP';
        addLog('[MANUAL OVERRIDE] Forced Minos Move: Die! (Apex Freeze & Ground Slam)!');
      } else if (moveName === 'prepare_thyself') {
        next.prepareThyselfPhase = 1;
        next.prepareThyselfTicks = 6;
        next.combatState = 'PREPARE_THYSELF_TELEPORT';
        addLog('[MANUAL OVERRIDE] Forced Minos Move: Prepare Thyself (Instant Behind Teleport & Slice)!');
      } else if (moveName === 'heavy_punch') {
        next.heavyPunchTicks = 20;
        next.combatState = 'HEAVY_PUNCH_WINDUP';
        addLog('[MANUAL OVERRIDE] Forced Move: Heavy Shield-Breaker Punch!');
      } else if (moveName === 'solar_laser') {
        next.laserType = 'solar';
        next.laserChargingTicks = 30;
        next.combatState = 'LASER_CHARGING';
        addLog('[MANUAL OVERRIDE] Forced Move: Sweeping Solar Raycast Beam!');
      }
      return next;
    });
  };

  const handleRespawnRot = () => {
    setState(prev => ({
      ...prev,
      rotX: 24.0,
      rotY: 64.0,
      rotZ: 18.0,
      rotDeltaX: 0,
      rotDeltaY: 0,
      rotDeltaZ: 0,
      rotHealth: ROT_SOURCE_ATTRIBUTES.MAX_HEALTH,
      rotIsDead: false,
      kineticAdaptation: 0,
      projectileAdaptation: 0,
      blastAdaptation: 0,
      swarmAdaptation: 0,
      totalAdaptiveResistance: 0,
      combatState: 'IDLE_STALKING',
      activeDecisionNode: 'EVAL_COMBAT_PERCEPTION',
      dropkickPhase: 0,
      overheadPhase: 0,
      prepareThyselfPhase: 0,
      minosComboStep: 0,
      laserType: 'none',
      shockwaves: [
        ...prev.shockwaves,
        {
          id: `respawn_rot_${Date.now()}`,
          x: 12.0,
          z: 9.0,
          radius: 0.5,
          maxRadius: 6.0,
          color: '#ef4444',
          alpha: 1.0,
          thickness: 4
        }
      ]
    }));
    addLog('[RESURRECTION] The Rot has been respawned with 550 Max HP and fresh neural registers!');
  };

  // Main 20 TPS Minecraft Physics & Combat Simulation Loop
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setNeuralPulse(p => (p + 1) % 1000);
      setState(prev => {
        const next = { ...prev };
        next.stateTicks += 1;

        if (next.totemPoppedAnimationTicks > 0) next.totemPoppedAnimationTicks -= 1;

        // Clean fading afterimages
        next.rotAfterimages = next.rotAfterimages
          .map(a => ({ ...a, alpha: a.alpha * 0.72 }))
          .filter(a => a.alpha > 0.05);

        // 0. ROT DEATH EVALUATION
        if (next.rotHealth <= 0) {
          next.rotHealth = 0;
          if (!next.rotIsDead) {
            next.rotIsDead = true;
            next.combatState = 'ROT_DEAD';
            next.activeDecisionNode = 'ROT_DEFEATED';
            next.rotDeltaX = 0;
            next.rotDeltaZ = 0;
            next.shockwaves.push({
              id: `rot_death_${Date.now()}`,
              x: next.rotX,
              z: next.rotZ,
              radius: 0.5,
              maxRadius: 8.0,
              color: '#ef4444',
              alpha: 1.0,
              thickness: 5
            });
            addLog('[ROT DEFEATED] The Rot was slain! All adaptive systems deactivated.');
          }
        }

        // 1. DYNAMIC 4-PILLAR ADAPTATION CALCULATION (Only when alive)
        const totalThreats = (next.playerSpawned && !next.playerIsDead ? 1 : 0) + next.mobs.length;
        
        if (!next.rotIsDead) {
          if (totalThreats >= 2) {
            next.swarmAdaptation = Math.min(1.0, next.swarmAdaptation + 0.02);
          } else {
            next.swarmAdaptation = Math.max(0.0, next.swarmAdaptation - 0.005);
          }

          const combinedAdapt = (next.kineticAdaptation * 0.35) + 
                               (next.blastAdaptation * 0.25) + 
                               (next.projectileAdaptation * 0.2) + 
                               (next.swarmAdaptation * 0.2);
          next.totalAdaptiveResistance = Math.min(0.80, combinedAdapt);

          // RAPID COMBAT REGENERATIVE SURGE
          const inActiveCombat = totalThreats > 0;
          if (inActiveCombat && next.rotHealth < next.rotMaxHealth) {
            if (next.stateTicks % 6 === 0) {
              const baseSurge = 5.0;
              const adaptiveSurge = (next.swarmAdaptation * 14.0) + (next.kineticAdaptation * 8.0);
              const healAmount = baseSurge + adaptiveSurge;
              next.rotHealth = Math.min(next.rotMaxHealth, next.rotHealth + healAmount);
            }
          } else if (!inActiveCombat && next.rotHealth < next.rotMaxHealth && next.stateTicks % 12 === 0) {
            next.rotHealth = Math.min(next.rotMaxHealth, next.rotHealth + 6.0);
          }
        }

        // 2. TARGET EVALUATION
        let targetX = next.rotX;
        let targetZ = next.rotZ;
        let targetType: 'player' | 'mob' | 'none' = 'none';
        let targetMobId: string | null = null;

        const playerAvailable = next.playerSpawned && !next.playerIsDead;

        if (playerAvailable && next.mobs.length === 0) {
          targetX = next.playerX;
          targetZ = next.playerZ;
          targetType = 'player';
        } else if (next.mobs.length > 0) {
          let closestDist = Infinity;
          let closestMob: ArenaMob | null = null;
          for (const m of next.mobs) {
            const d = Math.hypot(m.x - next.rotX, m.z - next.rotZ);
            if (d < closestDist) {
              closestDist = d;
              closestMob = m;
            }
          }

          if (playerAvailable) {
            const playerDist = Math.hypot(next.playerX - next.rotX, next.playerZ - next.rotZ);
            if (playerDist <= closestDist) {
              targetX = next.playerX;
              targetZ = next.playerZ;
              targetType = 'player';
            } else if (closestMob) {
              targetX = closestMob.x;
              targetZ = closestMob.z;
              targetType = 'mob';
              targetMobId = closestMob.id;
            }
          } else if (closestMob) {
            targetX = closestMob.x;
            targetZ = closestMob.z;
            targetType = 'mob';
            targetMobId = closestMob.id;
          }
        } else if (playerAvailable) {
          targetX = next.playerX;
          targetZ = next.playerZ;
          targetType = 'player';
        }

        next.activeTargetType = targetType;
        next.activeTargetMobId = targetMobId;

        // 3. SMARTER PLAYER COMBAT AI (With Interactive Totem Count & Unblockable Evasion)
        if (next.playerSpawned) {
          if (next.playerHealth <= 0) {
            if (next.playerTotems > 0) {
              next.playerTotems -= 1;
              next.playerHealth = 1.0;
              next.playerAbsorption = 4.0;
              next.totemPoppedAnimationTicks = 35;
              next.playerIsDead = false;
              
              next.shockwaves.push({
                id: `totem_${Date.now()}`,
                x: next.playerX,
                z: next.playerZ,
                radius: 0.5,
                maxRadius: 5.0,
                color: '#facc15',
                alpha: 1.0,
                thickness: 4
              });
              addLog(`[TOTEM OF UNDYING] Totem popped! Granted 1.0 HP + 4.0 Absorption (${next.playerTotems} remaining).`);
            } else {
              if (!next.playerIsDead) {
                next.playerIsDead = true;
                next.playerHealth = 0.0;
                next.playerIsBlocking = false;
                next.playerDeltaX = 0;
                next.playerDeltaZ = 0;
                addLog('[DEATH] Player was slain by The Rot.');
              }
            }
          } else {
            if (next.playerShieldCooldown > 0) next.playerShieldCooldown -= 1;
            if (next.playerAttackCooldown > 0) next.playerAttackCooldown -= 1;

            const distToRot = Math.hypot(next.rotX - next.playerX, next.rotZ - next.playerZ);
            const GROUND_FRICTION = 0.546;

            if (playerMode === 'smart_auto') {
              // 0. Update Cobwebs & Trap Slow Mechanics
              next.cobwebs = (next.cobwebs || []).map(w => ({ ...w, ticksRemaining: w.ticksRemaining - 1 })).filter(w => w.ticksRemaining > 0);
              const insideWeb = next.cobwebs.some(w => Math.hypot(next.rotX - w.x, next.rotZ - w.z) < 1.3);
              if (insideWeb) {
                next.rotDeltaX *= 0.35; // Minecraft 65% cobweb slowdown
                next.rotDeltaZ *= 0.35;
              }

              // 1. Sustenance & Clutch Healing Logic (Looking down, splashing / eating during retreat)
              if (next.playerHealth <= 9.0 && next.playerGoldenApples > 0 && next.stateTicks % 35 === 0) {
                next.playerGoldenApples -= 1;
                next.playerAbsorption = 4.0;
                next.playerHealth = Math.min(next.playerMaxHealth, next.playerHealth + 6.0);
                next.playerActionLabel = 'G-APPLE CLUTCH';
                addLog('[PLAYER CLUTCH] Ate Enchanted Golden Apple (+Absorption Hearts & Regen).');
              } else if (next.playerHealth <= 13.0 && next.playerPotions > 0 && next.stateTicks % 28 === 0) {
                next.playerPotions -= 1;
                next.playerHealth = Math.min(next.playerMaxHealth, next.playerHealth + 8.0);
                next.playerActionLabel = 'SPLASH POTION';
                for (let k = 0; k < 6; k++) {
                  next.arenaParticles.push({
                    id: `pot_${Date.now()}_${k}`,
                    x: next.playerX,
                    z: next.playerZ,
                    vx: (Math.random() - 0.5) * 0.12,
                    vz: (Math.random() - 0.5) * 0.12,
                    life: 12,
                    maxLife: 12,
                    color: '#f43f5e',
                    size: 3.0
                  });
                }
                addLog('[PLAYER CLUTCH] Splashed Potion of Healing II at feet (+8.0 HP).');
              }

              // 2. Clutch Ender Pearl Repositioning (Throwing to open arena when cornered or low HP)
              const nearWall = next.playerX <= 5.0 || next.playerX >= 43.0 || next.playerZ <= 5.0 || next.playerZ >= 43.0;
              if ((nearWall && distToRot < 6.0 && next.stateTicks % 40 === 0) || (next.playerHealth <= 6.0 && distToRot < 8.0 && next.stateTicks % 30 === 0)) {
                // Teleport to opposite quadrant behind Rot
                const pearlAngle = Math.atan2(next.playerZ - next.rotZ, next.playerX - next.rotX) + Math.PI * 0.8;
                const targetPearlX = Math.max(5.0, Math.min(43.0, next.rotX + Math.cos(pearlAngle) * 12.0));
                const targetPearlZ = Math.max(5.0, Math.min(43.0, next.rotZ + Math.sin(pearlAngle) * 12.0));
                next.playerX = targetPearlX;
                next.playerZ = targetPearlZ;
                next.playerDeltaX = 0;
                next.playerDeltaZ = 0;
                next.playerHealth = Math.max(1.0, next.playerHealth - 1.5); // Ender pearl fall damage
                next.playerActionLabel = 'E-PEARL ESCAPE';
                next.shockwaves.push({
                  id: `pearl_${Date.now()}`,
                  x: targetPearlX,
                  z: targetPearlZ,
                  radius: 0.3,
                  maxRadius: 3.2,
                  color: '#2dd4bf',
                  alpha: 1.0,
                  thickness: 3
                });
                addLog('[PLAYER CLUTCH] Threw Ender Pearl to escape corner trap!');
              }

              // 3. Threat Assessment & Unblockables Evasion (Never block axes / unblockable finishers)
              const isRotChargingUnblockable = (!next.rotIsDead) && (
                next.dropkickPhase === 1 ||
                next.overheadPhase === 1 ||
                (next.minosComboStep === 4 && next.minosComboTicks > 2) ||
                next.prepareThyselfPhase === 1
              );
              const isRotFiringLaser = next.laserFiringTicks > 0 || next.laserChargingTicks > 0;

              if (isRotChargingUnblockable) {
                // Pro PvP rule: NEVER hold shield against unblockable strikes. Drop shield and lateral sprint-dodge!
                next.playerIsBlocking = false;
                next.playerActionLabel = 'LATERAL DODGE';
                const perp = Math.atan2(next.playerZ - next.rotZ, next.playerX - next.rotX) + (Math.PI / 2);
                const targetVx = Math.cos(perp) * 0.32;
                const targetVz = Math.sin(perp) * 0.32;
                next.playerDeltaX = next.playerDeltaX * 0.2 + targetVx * 0.8;
                next.playerDeltaZ = next.playerDeltaZ * 0.2 + targetVz * 0.8;
              } else if (isRotFiringLaser) {
                next.playerIsBlocking = false;
                next.playerActionLabel = 'BEAM STRAFE';
                const tangent = Math.atan2(next.playerZ - next.rotZ, next.playerX - next.rotX) + (Math.PI / 2);
                const targetVx = Math.cos(tangent) * 0.28;
                const targetVz = Math.sin(tangent) * 0.28;
                next.playerDeltaX = next.playerDeltaX * 0.2 + targetVx * 0.8;
                next.playerDeltaZ = next.playerDeltaZ * 0.2 + targetVz * 0.8;
              } else if (distToRot >= 3.6 && distToRot <= 6.0 && (next.laserChargingTicks > 0 || next.laserClosingTicks > 0 || next.minosComboStep === 0) && next.playerAttackCooldown <= 0 && next.stateTicks % 35 === 0) {
                // 4. Pro Mace + Wind Charge Smash (Kinetic burst from air)
                next.playerWeapon = 'mace';
                next.playerAttackCooldown = 24;
                next.playerIsBlocking = false;
                next.playerActionLabel = 'WIND MACE SMASH';
                
                const toRotAngle = Math.atan2(next.rotZ - next.playerZ, next.rotX - next.playerX);
                next.playerDeltaX = Math.cos(toRotAngle) * 0.40;
                next.playerDeltaZ = Math.sin(toRotAngle) * 0.40;
                
                const rawMaceDmg = 30.0;
                const armorMitigation = 0.55;
                const finalDmg = rawMaceDmg * (1.0 - armorMitigation) * (1.0 - next.totalAdaptiveResistance);
                
                next.rotHealth = Math.max(0, next.rotHealth - finalDmg);
                next.totalDamageTakenAccumulator += finalDmg;
                next.kineticAdaptation = Math.min(1.0, next.kineticAdaptation + 0.12);
                
                next.shockwaves.push({
                  id: `mace_burst_${Date.now()}`,
                  x: next.rotX,
                  z: next.rotZ,
                  radius: 0.5,
                  maxRadius: 4.8,
                  color: '#a855f7',
                  alpha: 1.0,
                  thickness: 3.5
                });
                addLog(`[MACE SMASH] Wind Burst Mace Smash dealt ${finalDmg.toFixed(1)} DMG to The Rot!`);
              } else if (distToRot >= 4.0 && distToRot <= 7.0 && next.cobwebs.length < 2 && next.stateTicks % 85 === 0 && !insideWeb) {
                // 5. Tactical Cobweb Trap Placement to break Rot's sprint
                next.cobwebs.push({
                  id: `web_${Date.now()}`,
                  x: next.playerX,
                  z: next.playerZ,
                  ticksRemaining: 140
                });
                next.playerActionLabel = 'COBWEB TRAP';
                addLog('[TACTICAL PVP] Placed Cobweb trap to snare Rot charge!');
              } else if (distToRot < 3.4 && !next.rotIsDead) {
                // 6. Close range Modern PvP: Dynamic 3.0-block Spacing, W-Tapping, and Shield Flicking
                
                // Shield discipline: Flick parry only when normal punch is active, drop immediately to retain sprint!
                const isNormalPunchTelegraphed = (next.leftPunchTicks > 0 || next.rightPunchTicks > 0 || next.heavyPunchTicks > 0) && !isRotChargingUnblockable;
                if (next.playerShieldCooldown <= 0 && isNormalPunchTelegraphed) {
                  next.playerIsBlocking = true;
                  next.playerActionLabel = 'SHIELD FLICK PARRY';
                } else {
                  next.playerIsBlocking = false;
                }

                // W-Tap / S-Tap Sprint Reset Spacing:
                // When attack lands, player immediately steps back 0.4m (S-tap) to bait the enemy's whiff, then re-sprints in!
                if ((next.playerWTapTicks || 0) > 0) {
                  next.playerWTapTicks = (next.playerWTapTicks || 0) - 1;
                  next.playerActionLabel = 'W-TAP SPRINT RESET';
                  // S-Tap pullback vector away from Rot
                  const awayAngle = Math.atan2(next.playerZ - next.rotZ, next.playerX - next.rotX);
                  next.playerDeltaX = Math.cos(awayAngle) * 0.16;
                  next.playerDeltaZ = Math.sin(awayAngle) * 0.16;
                } else {
                  // A/D Jitter strafing (zigzagging) into 2.8m strike range
                  const strafeAngle = Math.atan2(next.playerZ - next.rotZ, next.playerX - next.rotX) + (next.stateTicks % 20 < 10 ? 0.28 : -0.28);
                  const targetCloseX = next.rotX + Math.cos(strafeAngle) * 2.85;
                  const targetCloseZ = next.rotZ + Math.sin(strafeAngle) * 2.85;
                  const cdx = targetCloseX - next.playerX;
                  const cdz = targetCloseZ - next.playerZ;
                  const clen = Math.max(0.01, Math.hypot(cdx, cdz));
                  next.playerDeltaX = next.playerDeltaX * 0.25 + (cdx / clen) * 0.22 * 0.75;
                  next.playerDeltaZ = next.playerDeltaZ * 0.25 + (cdz / clen) * 0.22 * 0.75;
                  next.playerActionLabel = 'EDGE SPACING';
                }

                // Attack registration when in 3.0m reach
                if (next.playerAttackCooldown <= 0 && distToRot <= 3.1) {
                  // Real PvP hit selection: Alternate Axe jump-crits and fast Sword combos
                  const useAxe = (next.playerComboHits || 0) % 3 === 0;
                  next.playerWeapon = useAxe ? 'axe' : 'sword';
                  next.playerAttackCooldown = useAxe ? 13 : 8;
                  next.playerComboHits = (next.playerComboHits || 0) + 1;
                  next.playerWTapTicks = 4; // Initiate 4-tick W-tap / S-tap sprint reset

                  const rawDmg = useAxe ? 18.5 : 12.0; // Axe heavy crit vs sword sweeping
                  const armorMitigation = 0.55;
                  const finalDmg = rawDmg * (1.0 - armorMitigation) * (1.0 - next.totalAdaptiveResistance);

                  next.rotHealth = Math.max(0, next.rotHealth - finalDmg);
                  next.totalDamageTakenAccumulator += finalDmg;
                  next.kineticAdaptation = Math.min(1.0, next.kineticAdaptation + (useAxe ? 0.10 : 0.05));

                  // Spawn critical hit star particles
                  for (let k = 0; k < 4; k++) {
                    next.arenaParticles.push({
                      id: `crit_${Date.now()}_${k}`,
                      x: next.rotX + (Math.random() - 0.5) * 0.6,
                      z: next.rotZ + (Math.random() - 0.5) * 0.6,
                      vx: (Math.random() - 0.5) * 0.16,
                      vz: (Math.random() - 0.5) * 0.16,
                      life: 10,
                      maxLife: 10,
                      color: '#facc15',
                      size: 2.5
                    });
                  }

                  if (useAxe) {
                    next.playerActionLabel = 'JUMP CRIT (AXE)';
                    addLog(`[PVP CRIT] Netherite Axe jump-crit struck Rot for ${finalDmg.toFixed(1)} DMG with sprint-reset.`);
                  } else {
                    next.playerActionLabel = 'SWORD COMBO';
                    addLog(`[PVP COMBO] Netherite Sword hit ${next.playerComboHits} dealt ${finalDmg.toFixed(1)} DMG.`);
                  }
                }
              } else if (distToRot > 6.5 && !next.rotIsDead) {
                // 7. Long range combat: Piercing Crossbow Kiting
                next.playerIsBlocking = false;
                next.playerActionLabel = 'CROSSBOW KITE';
                const towards = Math.atan2(next.rotZ - next.playerZ, next.rotX - next.playerX);
                const targetVx = Math.cos(towards) * 0.18;
                const targetVz = Math.sin(towards) * 0.18;
                next.playerDeltaX = next.playerDeltaX * 0.3 + targetVx * 0.7;
                next.playerDeltaZ = next.playerDeltaZ * 0.3 + targetVz * 0.7;

                if (next.playerAttackCooldown <= 0 && next.stateTicks % 25 === 0) {
                  next.playerAttackCooldown = 18;
                  next.playerWeapon = 'crossbow';
                  next.playerActionLabel = 'CROSSBOW SNIPE';
                  const arrowDmg = 10.0 * (1.0 - 0.55) * (1.0 - next.totalAdaptiveResistance);
                  next.rotHealth = Math.max(0, next.rotHealth - arrowDmg);
                  next.projectileAdaptation = Math.min(1.0, next.projectileAdaptation + 0.08);
                  addLog(`[PLAYER SNIPE] Piercing Crossbow bolt hit Rot for ${arrowDmg.toFixed(1)} DMG.`);
                }
              } else {
                // 8. Mid range: Strategic A/D strafing and spacing adjustment
                next.playerWeapon = 'sword';
                next.playerActionLabel = 'SPACING ADJUST';
                const strafeDir = next.stateTicks % 30 < 15 ? 1 : -1;
                const orbitAngle = Math.atan2(next.playerZ - next.rotZ, next.playerX - next.rotX) + (0.12 * strafeDir);
                const targetOrbitX = next.rotX + Math.cos(orbitAngle) * 3.6;
                const targetOrbitZ = next.rotZ + Math.sin(orbitAngle) * 3.6;
                const odx = targetOrbitX - next.playerX;
                const odz = targetOrbitZ - next.playerZ;
                const olen = Math.max(0.01, Math.hypot(odx, odz));
                const targetVx = (odx / olen) * 0.22;
                const targetVz = (odz / olen) * 0.22;
                next.playerDeltaX = next.playerDeltaX * 0.25 + targetVx * 0.75;
                next.playerDeltaZ = next.playerDeltaZ * 0.25 + targetVz * 0.75;
                next.playerIsBlocking = false;
              }
            } else if (playerMode === 'direct_engage' || playerMode === 'circle_strafe') {
              const pdx = next.rotX - next.playerX;
              const pdz = next.rotZ - next.playerZ;
              const plen = Math.max(0.01, Math.hypot(pdx, pdz));
              const targetVx = (pdx / plen) * 0.18;
              const targetVz = (pdz / plen) * 0.18;
              next.playerDeltaX = next.playerDeltaX * 0.3 + targetVx * 0.7;
              next.playerDeltaZ = next.playerDeltaZ * 0.3 + targetVz * 0.7;
              next.playerIsBlocking = false;
            } else if (playerMode === 'turtle_shield') {
              next.playerIsBlocking = next.playerShieldCooldown <= 0;
              next.playerDeltaX *= GROUND_FRICTION;
              next.playerDeltaZ *= GROUND_FRICTION;
            } else if (playerMode === 'flee') {
              const fdx = next.playerX - next.rotX;
              const fdz = next.playerZ - next.rotZ;
              const flen = Math.max(0.01, Math.hypot(fdx, fdz));
              const targetVx = (fdx / flen) * 0.22;
              const targetVz = (fdz / flen) * 0.22;
              next.playerDeltaX = next.playerDeltaX * 0.3 + targetVx * 0.7;
              next.playerDeltaZ = next.playerDeltaZ * 0.3 + targetVz * 0.7;
              next.playerIsBlocking = false;
            } else {
              next.playerDeltaX *= GROUND_FRICTION;
              next.playerDeltaZ *= GROUND_FRICTION;
            }

            next.playerX += next.playerDeltaX;
            next.playerZ += next.playerDeltaZ;
          }
        }

        // 4. AUTHENTIC VANILLA MOBS (Minecraft Java Walking Velocities & Ground Traction)
        const updatedMobs: ArenaMob[] = [];
        const newProjectiles = [...next.projectiles];
        const newShockwaves = [...next.shockwaves];
        const GROUND_FRICTION = 0.546;

        for (const mob of next.mobs) {
          if (mob.attackCooldown > 0) mob.attackCooldown -= 1;
          const toRotX = next.rotX - mob.x;
          const toRotZ = next.rotZ - mob.z;
          const distToRot = Math.max(0.01, Math.hypot(toRotX, toRotZ));

          // 1. CREEPER (Accurate 30-tick fuse with distance-based defusal abort)
          if (mob.type === 'creeper') {
            if (distToRot < 3.2 || mob.creeperIsIgnited) {
              if (distToRot > 7.0) {
                // Java Edition Defusal: If target escapes > 7m, creeper unswells and defuses!
                mob.creeperIsIgnited = false;
                if ((mob.creeperFuse || 0) > 0) mob.creeperFuse = (mob.creeperFuse || 0) - 1;
                const targetVx = (toRotX / distToRot) * mob.speed;
                const targetVz = (toRotZ / distToRot) * mob.speed;
                mob.deltaX = mob.deltaX * 0.25 + targetVx * 0.75;
                mob.deltaZ = mob.deltaZ * 0.25 + targetVz * 0.75;
              } else {
                mob.creeperIsIgnited = true;
                mob.creeperFuse = (mob.creeperFuse || 0) + 1;
                mob.deltaX *= GROUND_FRICTION;
                mob.deltaZ *= GROUND_FRICTION;

                if (mob.creeperFuse >= 30) {
                  // Detonation (Power 3 TNT)
                  newShockwaves.push({
                    id: `exp_${Date.now()}_${Math.random()}`,
                    x: mob.x,
                    z: mob.z,
                    radius: 0.5,
                    maxRadius: 5.5,
                    color: '#eab308',
                    alpha: 1.0,
                    thickness: 4
                  });

                  if (distToRot < 6.0) {
                    const falloff = Math.max(0.1, 1.0 - (distToRot / 6.0));
                    const rawDmg = 49.0 * falloff;
                    const dmg = rawDmg * (1.0 - 0.55) * (1.0 - next.totalAdaptiveResistance);
                    next.rotHealth = Math.max(0, next.rotHealth - dmg);
                    next.blastAdaptation = Math.min(1.0, next.blastAdaptation + 0.25);
                    addLog(`[CREEPER DETONATION] Creeper exploded for ${dmg.toFixed(1)} DMG to The Rot!`);
                  }
                  if (next.playerSpawned && !next.playerIsDead) {
                    const distP = Math.hypot(mob.x - next.playerX, mob.z - next.playerZ);
                    if (distP < 6.0) {
                      const falloffP = Math.max(0.1, 1.0 - (distP / 6.0));
                      const dmgP = next.playerIsBlocking ? 8.0 : (32.0 * falloffP);
                      next.playerHealth = Math.max(0, next.playerHealth - dmgP);
                      addLog(`[CREEPER DETONATION] Creeper explosion dealt ${dmgP.toFixed(1)} DMG to player.`);
                    }
                  }
                  continue; // Mob destroyed upon detonation
                }
              }
            } else {
              const targetVx = (toRotX / distToRot) * mob.speed;
              const targetVz = (toRotZ / distToRot) * mob.speed;
              mob.deltaX = mob.deltaX * 0.25 + targetVx * 0.75;
              mob.deltaZ = mob.deltaZ * 0.25 + targetVz * 0.75;
            }
          }

          // 2. SKELETON (Java Edition 25-tick bow draw with combat strafe & backpedal)
          else if (mob.type === 'skeleton') {
            if (distToRot < 5.0) {
              // Backpedal to maintain bow distance
              const targetVx = -(toRotX / distToRot) * (mob.speed * 0.9);
              const targetVz = -(toRotZ / distToRot) * (mob.speed * 0.9);
              mob.deltaX = mob.deltaX * 0.25 + targetVx * 0.75;
              mob.deltaZ = mob.deltaZ * 0.25 + targetVz * 0.75;
            } else if (distToRot > 15.0) {
              // Approach into shooting range
              const targetVx = (toRotX / distToRot) * mob.speed;
              const targetVz = (toRotZ / distToRot) * mob.speed;
              mob.deltaX = mob.deltaX * 0.25 + targetVx * 0.75;
              mob.deltaZ = mob.deltaZ * 0.25 + targetVz * 0.75;
            } else {
              // Clockwise/counter-clockwise bow strafing
              const strafeAngle = Math.atan2(toRotZ, toRotX) + Math.PI / 2;
              const targetVx = Math.cos(strafeAngle) * (mob.speed * 0.65);
              const targetVz = Math.sin(strafeAngle) * (mob.speed * 0.65);
              mob.deltaX = mob.deltaX * 0.25 + targetVx * 0.75;
              mob.deltaZ = mob.deltaZ * 0.25 + targetVz * 0.75;
            }

            mob.skeletonBowCharge = (mob.skeletonBowCharge || 0) + 1;
            if (mob.skeletonBowCharge >= 25) { // Authentic Java 25-tick draw
              mob.skeletonBowCharge = 0;
              const arrowSpeed = 0.65;
              newProjectiles.push({
                id: `arrow_${Date.now()}_${Math.random()}`,
                type: 'arrow',
                x: mob.x,
                z: mob.z,
                deltaX: (toRotX / distToRot) * arrowSpeed,
                deltaZ: (toRotZ / distToRot) * arrowSpeed,
                damage: 4.5,
                source: 'Skeleton Arrow',
                lifeTicks: 55
              });
              addLog('[SKELETON] Skeleton released a bow shot after 1.25s draw.');
            }
          }

          // 3. IRON GOLEM (100% Knockback Immune + Upward Uppercut Fling)
          else if (mob.type === 'iron_golem') {
            const targetVx = (toRotX / distToRot) * mob.speed;
            const targetVz = (toRotZ / distToRot) * mob.speed;
            mob.deltaX = mob.deltaX * 0.25 + targetVx * 0.75;
            mob.deltaZ = mob.deltaZ * 0.25 + targetVz * 0.75;

            if (distToRot < 2.6 && mob.attackCooldown <= 0) {
              mob.attackCooldown = 20;
              const rawDmg = 18.0;
              const dealt = rawDmg * (1.0 - 0.55) * (1.0 - next.totalAdaptiveResistance);
              next.rotHealth = Math.max(0, next.rotHealth - dealt);
              next.kineticAdaptation = Math.min(1.0, next.kineticAdaptation + 0.06);
              next.rotDeltaY = 0.85; // Fling target airborne
              addLog(`[IRON GOLEM] Iron Golem swung upwards, dealing ${dealt.toFixed(1)} DMG & flinging target!`);
            }
          }

          // 4. WARDEN (Poise Immunity, Enraged Sprint, Crushing Melee & Piercing Sonic Boom)
          else if (mob.type === 'warden') {
            const isEnraged = distToRot < 14.0;
            const curSpeed = isEnraged ? 0.36 : mob.speed; // Enraged sprint

            if (distToRot > 5.5) {
              // Ranged sonic boom charge
              mob.wardenSonicCharge = (mob.wardenSonicCharge || 0) + 1;
              const targetVx = (toRotX / distToRot) * (curSpeed * 0.65);
              const targetVz = (toRotZ / distToRot) * (curSpeed * 0.65);
              mob.deltaX = mob.deltaX * 0.25 + targetVx * 0.75;
              mob.deltaZ = mob.deltaZ * 0.25 + targetVz * 0.75;

              if (mob.wardenSonicCharge >= 34) { // Authentic 34-tick sonic charge
                mob.wardenSonicCharge = 0;
                newProjectiles.push({
                  id: `sonic_${Date.now()}_${Math.random()}`,
                  type: 'sonic_boom',
                  x: mob.x,
                  z: mob.z,
                  originX: mob.x,
                  originZ: mob.z,
                  phase: 0,
                  deltaX: (toRotX / distToRot) * 0.85,
                  deltaZ: (toRotZ / distToRot) * 0.85,
                  damage: 30.0,
                  source: 'Warden Sonic Boom',
                  lifeTicks: 35
                });
                addLog('[WARDEN] Warden unleashed horizontal piercing Sonic Boom (30.0 Unblockable DMG)!');
              }
            } else {
              mob.wardenSonicCharge = 0;
              const targetVx = (toRotX / distToRot) * curSpeed;
              const targetVz = (toRotZ / distToRot) * curSpeed;
              mob.deltaX = mob.deltaX * 0.25 + targetVx * 0.75;
              mob.deltaZ = mob.deltaZ * 0.25 + targetVz * 0.75;

              if (distToRot < 2.6 && mob.attackCooldown <= 0) {
                mob.attackCooldown = 20;
                const rawDmg = 30.0;
                const dealt = rawDmg * (1.0 - 0.55) * (1.0 - next.totalAdaptiveResistance);
                next.rotHealth = Math.max(0, next.rotHealth - dealt);
                next.kineticAdaptation = Math.min(1.0, next.kineticAdaptation + 0.12);
                addLog(`[WARDEN] Warden delivered crushing melee blow for ${dealt.toFixed(1)} DMG.`);
              }
            }
          }

          // 5. WITHER SKELETON (Height 2.4m, Stone Sword Melee & Wither I Affliction)
          else if (mob.type === 'wither_skeleton') {
            const targetVx = (toRotX / distToRot) * mob.speed;
            const targetVz = (toRotZ / distToRot) * mob.speed;
            mob.deltaX = mob.deltaX * 0.25 + targetVx * 0.75;
            mob.deltaZ = mob.deltaZ * 0.25 + targetVz * 0.75;

            if (distToRot < 2.4 && mob.attackCooldown <= 0) {
              mob.attackCooldown = 20;
              const rawDmg = 8.0;
              const dealt = rawDmg * (1.0 - 0.55) * (1.0 - next.totalAdaptiveResistance);
              next.rotHealth = Math.max(0, next.rotHealth - dealt);
              next.kineticAdaptation = Math.min(1.0, next.kineticAdaptation + 0.04);
              addLog(`[WITHER SKELETON] Struck Rot with Stone Sword for ${dealt.toFixed(1)} DMG & applied Wither I.`);
            }
          }

          // 6. ENDERMAN (Aggressive Sprint & Projectile Evasion Teleport)
          else if (mob.type === 'enderman') {
            mob.endermanTeleportCooldown = Math.max(0, (mob.endermanTeleportCooldown || 0) - 1);
            
            // Check if any projectile is incoming
            const incomingProjectile = newProjectiles.some(p => Math.hypot(p.x - mob.x, p.z - mob.z) < 3.5);
            if (incomingProjectile && mob.endermanTeleportCooldown === 0) {
              mob.endermanTeleportCooldown = 25;
              const tpAngle = Math.random() * Math.PI * 2;
              mob.x = Math.max(5, Math.min(43, mob.x + Math.cos(tpAngle) * 10.0));
              mob.z = Math.max(5, Math.min(43, mob.z + Math.sin(tpAngle) * 10.0));
              mob.deltaX = 0;
              mob.deltaZ = 0;
              addLog('[ENDERMAN] Enderman teleported to evade projectile!');
            } else {
              const targetVx = (toRotX / distToRot) * mob.speed;
              const targetVz = (toRotZ / distToRot) * mob.speed;
              mob.deltaX = mob.deltaX * 0.25 + targetVx * 0.75;
              mob.deltaZ = mob.deltaZ * 0.25 + targetVz * 0.75;

              if (distToRot < 2.4 && mob.attackCooldown <= 0) {
                mob.attackCooldown = 20;
                const rawDmg = 10.5;
                const dealt = rawDmg * (1.0 - 0.55) * (1.0 - next.totalAdaptiveResistance);
                next.rotHealth = Math.max(0, next.rotHealth - dealt);
                next.kineticAdaptation = Math.min(1.0, next.kineticAdaptation + 0.05);
                addLog(`[ENDERMAN] Enderman struck Rot with claw for ${dealt.toFixed(1)} DMG.`);
              }
            }
          }

          // 7. BLAZE (Hovering & 3-Fireball Volley)
          else if (mob.type === 'blaze') {
            if (distToRot < 8.0) {
              // Maintain standoff distance
              const targetVx = -(toRotX / distToRot) * (mob.speed * 0.8);
              const targetVz = -(toRotZ / distToRot) * (mob.speed * 0.8);
              mob.deltaX = mob.deltaX * 0.25 + targetVx * 0.75;
              mob.deltaZ = mob.deltaZ * 0.25 + targetVz * 0.75;
            } else if (distToRot > 18.0) {
              const targetVx = (toRotX / distToRot) * mob.speed;
              const targetVz = (toRotZ / distToRot) * mob.speed;
              mob.deltaX = mob.deltaX * 0.25 + targetVx * 0.75;
              mob.deltaZ = mob.deltaZ * 0.25 + targetVz * 0.75;
            } else {
              mob.deltaX *= 0.85;
              mob.deltaZ *= 0.85;
            }

            mob.blazeBurstCharge = (mob.blazeBurstCharge || 0) + 1;
            if (mob.blazeBurstCharge >= 45) { // 3-fireball burst every 45 ticks
              mob.blazeBurstCharge = 0;
              for (let f = -1; f <= 1; f++) {
                const spreadAngle = Math.atan2(toRotZ, toRotX) + (f * 0.12);
                newProjectiles.push({
                  id: `fireball_${Date.now()}_${f}`,
                  type: 'fireball',
                  x: mob.x,
                  z: mob.z,
                  deltaX: Math.cos(spreadAngle) * 0.45,
                  deltaZ: Math.sin(spreadAngle) * 0.45,
                  damage: 6.0,
                  source: 'Blaze Fireball',
                  lifeTicks: 45
                });
              }
              addLog('[BLAZE] Blaze unleashed a 3-fireball burst!');
            }
          }

          // 8. VINDICATOR (Fast Axe Charge & Shield Disable)
          else if (mob.type === 'vindicator') {
            const targetVx = (toRotX / distToRot) * mob.speed;
            const targetVz = (toRotZ / distToRot) * mob.speed;
            mob.deltaX = mob.deltaX * 0.25 + targetVx * 0.75;
            mob.deltaZ = mob.deltaZ * 0.25 + targetVz * 0.75;

            if (distToRot < 2.3 && mob.attackCooldown <= 0) {
              mob.attackCooldown = 20;
              const rawDmg = 13.0;
              const dealt = rawDmg * (1.0 - 0.55) * (1.0 - next.totalAdaptiveResistance);
              next.rotHealth = Math.max(0, next.rotHealth - dealt);
              next.kineticAdaptation = Math.min(1.0, next.kineticAdaptation + 0.07);
              addLog(`[VINDICATOR] Vindicator struck Rot with Iron Axe for ${dealt.toFixed(1)} DMG.`);
            }
          }

          // 9. ZOMBIE (Swarm Pathing & Reinforcement Alert)
          else {
            const curSpeed = (mob.reinforcementTicks || 0) > 0 ? 0.22 : mob.speed;
            if ((mob.reinforcementTicks || 0) > 0) mob.reinforcementTicks = (mob.reinforcementTicks || 0) - 1;

            const targetVx = (toRotX / distToRot) * curSpeed;
            const targetVz = (toRotZ / distToRot) * curSpeed;
            mob.deltaX = mob.deltaX * 0.25 + targetVx * 0.75;
            mob.deltaZ = mob.deltaZ * 0.25 + targetVz * 0.75;

            if (distToRot < 2.1 && mob.attackCooldown <= 0) {
              mob.attackCooldown = 20;
              const rawDmg = 4.5;
              const dealt = rawDmg * (1.0 - 0.55) * (1.0 - next.totalAdaptiveResistance);
              next.rotHealth = Math.max(0, next.rotHealth - dealt);
              next.kineticAdaptation = Math.min(1.0, next.kineticAdaptation + 0.02);
              addLog(`[ZOMBIE] Zombie attacked The Rot for ${dealt.toFixed(1)} DMG.`);
            }
          }

          mob.x += mob.deltaX;
          mob.z += mob.deltaZ;

          if (mob.health > 0) {
            updatedMobs.push(mob);
          }
        }

        // 5. TRUE 2D RIGID-BODY ELASTIC COLLISION PHYSICS WITH MOMENTUM EXCHANGE
        interface SolidBody {
          id: string;
          x: number;
          z: number;
          radius: number;
          mass: number;
          vx: number;
          vz: number;
          applyPush: (dx: number, dz: number, dvx?: number, dvz?: number) => void;
        }

        const solids: SolidBody[] = [];

        solids.push({
          id: 'rot',
          x: next.rotX,
          z: next.rotZ,
          radius: next.rotRadius,
          mass: next.rotMass,
          vx: next.rotDeltaX,
          vz: next.rotDeltaZ,
          applyPush: (dx, dz, dvx, dvz) => {
            next.rotX += dx;
            next.rotZ += dz;
            if (dvx !== undefined) next.rotDeltaX += dvx;
            if (dvz !== undefined) next.rotDeltaZ += dvz;
          }
        });

        if (next.playerSpawned && !next.playerIsDead) {
          solids.push({
            id: 'player',
            x: next.playerX,
            z: next.playerZ,
            radius: next.playerRadius,
            mass: next.playerMass,
            vx: next.playerDeltaX,
            vz: next.playerDeltaZ,
            applyPush: (dx, dz, dvx, dvz) => {
              next.playerX += dx;
              next.playerZ += dz;
              if (dvx !== undefined) next.playerDeltaX += dvx;
              if (dvz !== undefined) next.playerDeltaZ += dvz;
            }
          });
        }

        updatedMobs.forEach(m => {
          solids.push({
            id: m.id,
            x: m.x,
            z: m.z,
            radius: m.radius,
            mass: m.mass || 70,
            vx: m.deltaX,
            vz: m.deltaZ,
            applyPush: (dx, dz, dvx, dvz) => {
              m.x += dx;
              m.z += dz;
              if (dvx !== undefined) m.deltaX += dvx;
              if (dvz !== undefined) m.deltaZ += dvz;
            }
          });
        });

        // Realistic Inelastic Contact & Soft Volume Displacement (Zero Elastic Bounce)
        for (let pass = 0; pass < 2; pass++) {
          for (let i = 0; i < solids.length; i++) {
            for (let j = i + 1; j < solids.length; j++) {
              const a = solids[i];
              const b = solids[j];
              const cdx = b.x - a.x;
              const cdz = b.z - a.z;
              const dist = Math.hypot(cdx, cdz);
              const minDist = a.radius + b.radius;

              if (dist < minDist && dist > 0.0001) {
                const overlap = minDist - dist;
                const normalX = cdx / dist;
                const normalZ = cdz / dist;

                // Position separation proportional to inverse mass (heavy Rot mass plows through smaller mobs)
                const totalMass = a.mass + b.mass;
                const pushRatioA = b.mass / totalMass;
                const pushRatioB = a.mass / totalMass;

                a.applyPush(-normalX * overlap * pushRatioA * 0.5, -normalZ * overlap * pushRatioA * 0.5);
                b.applyPush(normalX * overlap * pushRatioB * 0.5, normalZ * overlap * pushRatioB * 0.5);

                a.x -= normalX * overlap * pushRatioA;
                a.z -= normalZ * overlap * pushRatioA;
                b.x += normalX * overlap * pushRatioB;
                b.z += normalZ * overlap * pushRatioB;

                // Purely inelastic contact: cancel closing velocity along collision normal (no bouncing)
                const relVx = a.vx - b.vx;
                const relVz = a.vz - b.vz;
                const velAlongNormal = relVx * normalX + relVz * normalZ;

                if (velAlongNormal > 0) {
                  // Inelastic contact damping without elastic impulse
                  a.applyPush(0, 0, (velAlongNormal * normalX * pushRatioA) * 0.35, (velAlongNormal * normalZ * pushRatioA) * 0.35);
                  b.applyPush(0, 0, (-velAlongNormal * normalX * pushRatioB) * 0.35, (-velAlongNormal * normalZ * pushRatioB) * 0.35);
                }
              }
            }
          }
        }

        // BOUNDARY WALL KINEMATIC ARREST & TANGENTIAL FRICTION (NO ELASTIC BALL REBOUND)
        const WALL_MIN = 1.5;
        const WALL_MAX = 46.5;
        const newParticles: PhysicsParticle[] = [...next.arenaParticles];

        const checkWallKinematics = (x: number, z: number, vx: number, vz: number, radius: number) => {
          let nx = x;
          let nz = z;
          let nvx = vx;
          let nvz = vz;
          let hit = false;

          if (x - radius < WALL_MIN) {
            nx = WALL_MIN + radius;
            nvx = 0; // Solid stop against wall: zero bounce!
            nvz *= 0.65; // Wall scrape friction
            hit = true;
          } else if (x + radius > WALL_MAX) {
            nx = WALL_MAX - radius;
            nvx = 0; // Solid stop against wall: zero bounce!
            nvz *= 0.65; // Wall scrape friction
            hit = true;
          }

          if (z - radius < WALL_MIN) {
            nz = WALL_MIN + radius;
            nvz = 0; // Solid stop against wall: zero bounce!
            nvx *= 0.65; // Wall scrape friction
            hit = true;
          } else if (z + radius > WALL_MAX) {
            nz = WALL_MAX - radius;
            nvz = 0; // Solid stop against wall: zero bounce!
            nvx *= 0.65; // Wall scrape friction
            hit = true;
          }

          if (hit && Math.hypot(vx, vz) > 0.25) {
            for (let k = 0; k < 2; k++) {
              newParticles.push({
                id: `p_wall_${Date.now()}_${Math.random()}`,
                x: nx,
                z: nz,
                vx: (Math.random() - 0.5) * 0.08,
                vz: (Math.random() - 0.5) * 0.08,
                life: 8,
                maxLife: 8,
                color: '#71717a',
                size: 2.0
              });
            }
          }
          return { nx, nz, nvx, nvz };
        };

        // Rot boundary check (kinematic arrest)
        const rotB = checkWallKinematics(next.rotX, next.rotZ, next.rotDeltaX, next.rotDeltaZ, next.rotRadius);
        next.rotX = rotB.nx;
        next.rotZ = rotB.nz;
        next.rotDeltaX = rotB.nvx;
        next.rotDeltaZ = rotB.nvz;

        // Player boundary check
        if (next.playerSpawned) {
          const pB = checkWallKinematics(next.playerX, next.playerZ, next.playerDeltaX, next.playerDeltaZ, next.playerRadius);
          next.playerX = pB.nx;
          next.playerZ = pB.nz;
          next.playerDeltaX = pB.nvx;
          next.playerDeltaZ = pB.nvz;
        }

        // Mobs boundary check
        updatedMobs.forEach(m => {
          const mB = checkWallKinematics(m.x, m.z, m.deltaX, m.deltaZ, m.radius);
          m.x = mB.nx;
          m.z = mB.nz;
          m.deltaX = mB.nvx;
          m.deltaZ = mB.nvz;
        });

        // 6. PROJECTILE PROCESSING
        const liveProjectiles: Projectile[] = [];
        for (const p of newProjectiles) {
          p.x += p.deltaX;
          p.z += p.deltaZ;
          p.lifeTicks -= 1;

          if (p.phase !== undefined) {
            p.phase += 1;
          }

          if (!next.rotIsDead) {
            const distRot = Math.hypot(p.x - next.rotX, p.z - next.rotZ);
            if (distRot < (next.rotRadius + 0.3)) {
              const rawDmg = p.damage;
              const dealt = rawDmg * (1.0 - 0.55) * (1.0 - next.totalAdaptiveResistance);
              next.rotHealth = Math.max(0, next.rotHealth - dealt);
              next.projectileAdaptation = Math.min(1.0, next.projectileAdaptation + 0.1);
              addLog(`[PROJECTILE IMPACT] ${p.source} hit The Rot for ${dealt.toFixed(1)} DMG.`);
              continue;
            }
          }

          if (p.lifeTicks > 0 && p.x >= 1 && p.x <= 47 && p.z >= 1 && p.z <= 47) {
            liveProjectiles.push(p);
          }
        }

        // PHYSICAL SHOCKWAVE EXPANSION & REAL RADIAL KNOCKBACK IMPULSES
        const liveShockwaves = newShockwaves.map(s => {
          const nextRadius = s.radius + (s.maxRadius - s.radius) * 0.28;
          
          // Apply outward mass-scaled knockback to player
          if (next.playerSpawned && !next.playerIsDead) {
            const pdx = next.playerX - s.x;
            const pdz = next.playerZ - s.z;
            const pdist = Math.max(0.1, Math.hypot(pdx, pdz));
            if (pdist < nextRadius && pdist > (s.radius - 0.6)) {
              const massFactor = 80 / (next.playerMass || 80);
              const impulse = (1.0 - (pdist / s.maxRadius)) * 0.42 * massFactor;
              next.playerDeltaX += (pdx / pdist) * impulse;
              next.playerDeltaZ += (pdz / pdist) * impulse;
            }
          }

          // Apply outward mass-scaled knockback to mobs
          updatedMobs.forEach(m => {
            const mdx = m.x - s.x;
            const mdz = m.z - s.z;
            const mdist = Math.max(0.1, Math.hypot(mdx, mdz));
            if (mdist < nextRadius && mdist > (s.radius - 0.6)) {
              const massFactor = 70 / (m.mass || 70);
              const impulse = (1.0 - (mdist / s.maxRadius)) * 0.38 * massFactor;
              m.deltaX += (mdx / mdist) * impulse;
              m.deltaZ += (mdz / mdist) * impulse;
            }
          });

          return {
            ...s,
            radius: nextRadius,
            alpha: s.alpha * 0.82
          };
        }).filter(s => s.alpha > 0.05);

        // Update physics particles
        const liveParticles = newParticles.map(pt => ({
          ...pt,
          x: pt.x + pt.vx,
          z: pt.z + pt.vz,
          vx: pt.vx * 0.92,
          vz: pt.vz * 0.92,
          life: pt.life - 1
        })).filter(pt => pt.life > 0);

        next.mobs = updatedMobs;
        next.projectiles = liveProjectiles;
        next.shockwaves = liveShockwaves;
        next.arenaParticles = liveParticles;

        // Decrement ability cooldowns
        if (next.cdThyEndIsNow > 0) next.cdThyEndIsNow -= 1;
        if (next.cdJudgment > 0) next.cdJudgment -= 1;
        if (next.cdPrepareThyself > 0) next.cdPrepareThyself -= 1;
        if (next.cdOverheadSlam > 0) next.cdOverheadSlam -= 1;
        if (next.cdHeavyStrike > 0) next.cdHeavyStrike -= 1;
        if (next.cdSolarLaser > 0) next.cdSolarLaser -= 1;
        if (next.cdSurgeRegen > 0) next.cdSurgeRegen -= 1;

        // 7. ROT COMBAT STATE MACHINE (When Alive)
        if (next.rotIsDead) {
          next.combatState = 'ROT_DEAD';
          next.activeDecisionNode = 'ROT_DEFEATED';
          next.rotDeltaX *= 0.546;
          next.rotDeltaZ *= 0.546;
          next.rotX += next.rotDeltaX;
          next.rotZ += next.rotDeltaZ;
          return next;
        }

        const tX = targetType === 'player' ? next.playerX : targetX;
        const tZ = targetType === 'player' ? next.playerZ : targetZ;
        const tY = targetType === 'player' ? next.playerY : 64.0;

        const dx = tX - next.rotX;
        const dz = tZ - next.rotZ;
        const dist = Math.hypot(dx, dz);
        next.distanceToTarget = dist;

        // Update Welford Tracker for Distance & Attack Intervals (From Mod Java Source)
        if (next.stateTicks % 5 === 0) {
          next.welfordDistance = updateWelford(next.welfordDistance, dist);
        }

        // Tactical Neural Network Feedforward Pass (8 Inputs -> 16 Hidden -> 6 Action Outputs)
        const tDeltaX = targetType === 'player' ? next.playerDeltaX : 0;
        const tDeltaZ = targetType === 'player' ? next.playerDeltaZ : 0;
        const targetLeadSpeed = Math.hypot(tDeltaX, tDeltaZ);
        const playerHpRatio = next.playerHealth / next.playerMaxHealth;
        const threatRatio = Math.min(1.0, (next.mobs.length + (next.playerSpawned ? 1 : 0)) / 5);

        const nnInputs = [
          Math.min(1.0, dist / 20.0),
          Math.min(1.0, targetLeadSpeed * 2.0),
          next.playerIsBlocking ? 1.0 : 0.0,
          playerHpRatio,
          threatRatio,
          next.kineticAdaptation,
          next.blastAdaptation,
          Math.max(-2.0, Math.min(2.0, next.welfordDistance.zScore)) / 2.0
        ];

        // 16 Hidden Neurons tanh activations
        const hiddenActivations = Array(16).fill(0).map((_, hIdx) => {
          let sum = 0;
          for (let i = 0; i < 8; i++) {
            const pseudoWeight = Math.sin((hIdx + 1) * (i + 1) * 0.73);
            sum += nnInputs[i] * pseudoWeight;
          }
          return Math.tanh(sum + 0.1);
        });

        // 6 Action Output Probabilities (Softmax normalized)
        const rawScores = [
          hiddenActivations.slice(0, 3).reduce((a, b) => a + b, 0) + (dist < 4.0 ? 1.2 : 0.2), // Thy End Is Now
          hiddenActivations.slice(3, 6).reduce((a, b) => a + b, 0) + (dist >= 5.0 && dist <= 14.0 ? 1.4 : 0.1), // Judgment
          hiddenActivations.slice(6, 9).reduce((a, b) => a + b, 0) + (next.playerIsBlocking ? 1.5 : 0.3), // Prepare Thyself
          hiddenActivations.slice(9, 12).reduce((a, b) => a + b, 0) + (dist < 6.0 && threatRatio > 0.3 ? 1.3 : 0.1), // Overhead Slam
          hiddenActivations.slice(12, 15).reduce((a, b) => a + b, 0) + (dist > 10.0 ? 1.6 : 0.05), // Solar Laser
          hiddenActivations[15] + 0.2 // Tactical Stalk
        ];
        const expScores = rawScores.map(s => Math.exp(Math.max(-3, Math.min(3, s))));
        const sumExp = expScores.reduce((a, b) => a + b, 0) || 1;
        const normalizedOutputs = {
          thyEndIsNow: expScores[0] / sumExp,
          judgment: expScores[1] / sumExp,
          prepareThyself: expScores[2] / sumExp,
          overheadSlam: expScores[3] / sumExp,
          solarLaser: expScores[4] / sumExp,
          tacticalStalk: expScores[5] / sumExp
        };

        next.tacticalNeural = {
          inputs: nnInputs,
          hidden: hiddenActivations,
          weightsCount: 224,
          outputs: normalizedOutputs
        };

        // Role Auction Arbiter (Determining Swarm Role based on Combat Topology)
        let activeRole: RotCombatRole = 'PUNISHER';
        let bidUtility = 0.75;
        if (next.playerIsBlocking) {
          activeRole = 'SIEGE_BREAKER';
          bidUtility = 0.95;
        } else if (threatRatio > 0.4) {
          activeRole = 'PUNISHER';
          bidUtility = 0.89;
        } else if (dist > 10.0) {
          activeRole = 'STALKER';
          bidUtility = 0.82;
        } else {
          activeRole = 'FLANKER';
          bidUtility = 0.78;
        }
        next.roleAuction = {
          activeRole,
          bidUtility,
          expireTick: 30
        };

        if (targetType !== 'none') {
          next.rotYaw = (Math.atan2(dz, dx) * (180 / Math.PI)) - 90;
        }

        const leadTicks = 6.0;
        next.predictedTargetX = tX + tDeltaX * leadTicks;
        next.predictedTargetZ = tZ + tDeltaZ * leadTicks;

        if (next.leftPunchTicks > 0) next.leftPunchTicks -= 1;
        if (next.rightPunchTicks > 0) next.rightPunchTicks -= 1;
        if (next.heavyPunchTicks > 0) next.heavyPunchTicks -= 1;

        // HELPER: Broadcast Real Physics Knockback & Debris to All Arena Entities within Radius
        const applyRadialKnockbackToAll = (sourceX: number, sourceZ: number, radius: number, impulse: number, damage: number, moveName: string) => {
          // Spawn radial particle debris blast
          for (let pIdx = 0; pIdx < 12; pIdx++) {
            const pAngle = (Math.PI * 2 * pIdx) / 12 + (Math.random() - 0.5) * 0.2;
            const pSpeed = 0.22 + Math.random() * 0.25;
            newParticles.push({
              id: `sw_debris_${Date.now()}_${pIdx}`,
              x: sourceX,
              z: sourceZ,
              vx: Math.cos(pAngle) * pSpeed,
              vz: Math.sin(pAngle) * pSpeed,
              life: 18,
              maxLife: 18,
              color: moveName.includes('Dropkick') ? '#38bdf8' : moveName.includes('Overhead') ? '#d946ef' : '#ef4444',
              size: 3.5
            });
          }

          // Knockback to Player with Mass & Distance Attenuation
          if (next.playerSpawned && !next.playerIsDead) {
            const pkx = next.playerX - sourceX;
            const pkz = next.playerZ - sourceZ;
            const pdist = Math.max(0.1, Math.hypot(pkx, pkz));
            if (pdist <= radius) {
              const massFactor = 80 / (next.playerMass || 80);
              const attenuation = Math.pow(1.0 - (pdist / (radius + 2.0)), 1.5);
              const scaledImpulse = impulse * attenuation * massFactor;
              next.playerDeltaX += (pkx / pdist) * scaledImpulse;
              next.playerDeltaZ += (pkz / pdist) * scaledImpulse;
            }
          }

          // Knockback & Damage to ALL Mobs in Arena with Mass & Distance Attenuation
          next.mobs = next.mobs.map(m => {
            const mkx = m.x - sourceX;
            const mkz = m.z - sourceZ;
            const mdist = Math.max(0.1, Math.hypot(mkx, mkz));
            if (mdist <= radius) {
              const massFactor = 70 / (m.mass || 70);
              const attenuation = Math.pow(1.0 - (mdist / (radius + 2.0)), 1.5);
              const scaledImpulse = impulse * attenuation * massFactor;
              const finalDmg = damage * (1.0 - (mdist / (radius + 3.0)));
              return {
                ...m,
                health: Math.max(0, m.health - finalDmg),
                deltaX: m.deltaX + (mkx / mdist) * scaledImpulse,
                deltaZ: m.deltaZ + (mkz / mdist) * scaledImpulse
              };
            }
            return m;
          });
        };

        // MINOS MOVE 1: "THY END IS NOW" (Biped 4-Hit Combo with Alternating Left/Right Punches)
        if (next.minosComboStep > 0) {
          next.minosComboTicks -= 1;
          const isFinisher = next.minosComboStep === 4;

          if (isFinisher && next.minosComboTicks > 3) {
            // Windup for the heavy combo finisher
            next.rotDeltaX = 0;
            next.rotDeltaZ = 0;
            next.combatState = 'THY_END_IS_NOW_FINISHER_CHARGE';
            next.activeDecisionNode = 'EXEC_THY_END_IS_NOW_FINISHER_CHARGE';
          } else {
            next.activeDecisionNode = `EXEC_THY_END_IS_NOW_STEP_${next.minosComboStep}`;
            next.combatState = `THY_END_IS_NOW_PUNCH_${next.minosComboStep}`;
            // Natural biped walking step towards target
            const stepSpeed = isFinisher ? 0.28 : 0.22;
            const directDx = tX - next.rotX;
            const directDz = tZ - next.rotZ;
            const directLen = Math.max(0.01, Math.hypot(directDx, directDz));
            next.rotDeltaX = (directDx / directLen) * stepSpeed;
            next.rotDeltaZ = (directDz / directLen) * stepSpeed;
          }

          if (next.minosComboTicks <= 0) {
            // Regular biped punch damage (18.0 Base Damage from Java Attributes.ATTACK_DAMAGE)
            const rawDmg = isFinisher ? 24.0 : 18.0;

            if (dist < 3.2) {
              // Alternate punch arm animation
              if (next.minosComboStep % 2 === 1) next.leftPunchTicks = 12;
              else next.rightPunchTicks = 12;

              if (isFinisher) {
                newShockwaves.push({
                  id: `combo_finisher_${Date.now()}`,
                  x: next.rotX,
                  z: next.rotZ,
                  radius: 0.4,
                  maxRadius: 3.5,
                  color: '#ef4444',
                  alpha: 1.0,
                  thickness: 3.0
                });
                applyRadialKnockbackToAll(next.rotX, next.rotZ, 3.8, 0.35, 14.0, 'Thy End Is Now Finisher');
              }

              if (targetType === 'player') {
                if (next.playerIsBlocking && !isFinisher) {
                  addLog(`[SHIELD BLOCK] Player blocked punch ${next.minosComboStep}.`);
                } else {
                  if (next.playerIsBlocking && isFinisher) {
                    next.playerIsBlocking = false;
                    next.playerShieldCooldown = 100;
                    addLog('[SHIELD BREAK] Heavy finisher broke player shield! (5s disable)');
                  }
                  // Net damage against armored player (18 * 0.35 = 6.3 DMG)
                  const dealt = rawDmg * 0.35;
                  next.playerHealth = Math.max(0, next.playerHealth - dealt);
                  addLog(`[BIPED COMBO] Rot punch ${next.minosComboStep} connected for ${dealt.toFixed(1)} DMG.`);
                }
              } else if (targetMobId) {
                // Calibrated damage against mobs so combat plays out at authentic Minecraft pacing
                const targetMob = next.mobs.find(m => m.id === targetMobId);
                const mobArmor = targetMob?.type === 'zombie' ? 2 : 0;
                const dealt = rawDmg * (1.0 - mobArmor * 0.04);
                next.mobs = next.mobs.map(m => m.id === targetMobId ? { ...m, health: Math.max(0, m.health - dealt) } : m);
                addLog(`[BIPED COMBO] Rot punched ${targetMob?.name || 'mob'} for ${dealt.toFixed(1)} DMG.`);
              }
            }

            if (next.minosComboStep < 4) {
              next.minosComboStep += 1;
              next.minosComboTicks = next.minosComboStep === 4 ? 10 : 7;
            } else {
              next.minosComboStep = 0;
              next.combatState = 'IDLE_STALKING';
            }
          }
        }

        // MINOS MOVE 2: "JUDGMENT" / DROPKICK (Apex Windup -> Instant Dive Strike with Zero Mid-Air Slide)
        else if (next.dropkickPhase === 1) {
          // PHASE 1: Ascend to apex & lock-on target
          next.activeDecisionNode = 'EXEC_JUDGMENT_DROPKICK_FREEZE_ASCEND';
          next.combatState = 'JUDGMENT_DROPKICK_ASCEND';
          next.rotDeltaX = 0;
          next.rotDeltaZ = 0;
          next.rotY += 1.0;
          next.dropkickTicks -= 1;
          next.dropkickTargetX = next.predictedTargetX;
          next.dropkickTargetZ = next.predictedTargetZ;

          if (next.dropkickTicks <= 0 || next.rotY >= 74.0) {
            next.dropkickPhase = 2;
            next.dropkickTicks = 6;
            addLog('[MINOS MOVE] Judgment: Dropkick plunge initiated!');
          }
        } else if (next.dropkickPhase === 2) {
          // PHASE 2: Instant Snappy Plunge to Target
          next.activeDecisionNode = 'EXEC_JUDGMENT_DROPKICK_SUPERSONIC';
          next.combatState = 'JUDGMENT_DROPKICK_DIVE';
          next.dropkickTicks -= 1;

          if (next.dropkickTicks <= 0) {
            // Instant snap to impact point without continuous sliding drag
            const origX = next.rotX;
            const origZ = next.rotZ;
            next.rotX = Math.max(2.5, Math.min(45.5, next.dropkickTargetX));
            next.rotZ = Math.max(2.5, Math.min(45.5, next.dropkickTargetZ));
            next.rotDeltaX = 0;
            next.rotDeltaZ = 0;
            next.rotY = 64.0;
            next.dropkickPhase = 0;
            next.combatState = 'IDLE_STALKING';

            // Teleport / Dive origin and impact particle bursts
            newShockwaves.push({
              id: `shock_${Date.now()}`,
              x: next.rotX,
              z: next.rotZ,
              radius: 0.5,
              maxRadius: 4.8,
              color: '#38bdf8',
              alpha: 1.0,
              thickness: 4
            });

            // Moderate radial knockback
            applyRadialKnockbackToAll(next.rotX, next.rotZ, 5.0, 0.55, 22.0, 'Judgment Dropkick');

            if (targetType === 'player') {
              if (dist < 4.0) {
                if (next.playerIsBlocking) {
                  next.playerIsBlocking = false;
                  next.playerShieldCooldown = 80;
                  addLog('[SHIELD BREAK] Judgment Dropkick staggered player shield!');
                }
                const dealt = 22.0 * 0.40;
                next.playerHealth = Math.max(0, next.playerHealth - dealt);
                next.playerDeltaX += (next.playerX - next.rotX) * 0.35;
                next.playerDeltaZ += (next.playerZ - next.rotZ) * 0.35;
                addLog(`[IMPACT] Judgment Dropkick struck player for ${dealt.toFixed(1)} DMG.`);
              }
            } else if (targetMobId) {
              const targetMob = next.mobs.find(m => m.id === targetMobId);
              next.mobs = next.mobs.map(m => m.id === targetMobId ? { ...m, health: Math.max(0, m.health - 22.0) } : m);
              addLog(`[IMPACT] Judgment Dropkick struck ${targetMob?.name || 'mob'} for 22.0 DMG.`);
            }
          }
        }

        // MINOS MOVE 3: "PREPARE THYSELF" (Seamless Instant Teleport Behind Target -> Cross Strike)
        else if (next.prepareThyselfPhase === 1) {
          next.activeDecisionNode = 'EXEC_PREPARE_THYSELF_TELEPORT_FREEZE';
          next.combatState = 'PREPARE_THYSELF_TELEPORT';
          
          const behindAngle = Math.atan2(next.rotZ - tZ, next.rotX - tX);
          const origX = next.rotX;
          const origZ = next.rotZ;
          const newX = Math.max(3.0, Math.min(45.0, tX + Math.cos(behindAngle) * 2.2));
          const newZ = Math.max(3.0, Math.min(45.0, tZ + Math.sin(behindAngle) * 2.2));

          // 1. Instant coordinate displacement (Zero sliding)
          next.rotX = newX;
          next.rotZ = newZ;
          next.rotDeltaX = 0;
          next.rotDeltaZ = 0;

          // 2. Seamless Teleportation Departure Particle Burst
          newShockwaves.push({
            id: `tp_origin_${Date.now()}`,
            x: origX,
            z: origZ,
            radius: 0.2,
            maxRadius: 2.5,
            color: '#a855f7',
            alpha: 1.0,
            thickness: 2.5
          });

          // 3. Seamless Teleportation Arrival Particle Burst
          newShockwaves.push({
            id: `tp_dest_${Date.now()}`,
            x: newX,
            z: newZ,
            radius: 0.3,
            maxRadius: 3.2,
            color: '#ef4444',
            alpha: 1.0,
            thickness: 3.5
          });

          // 4. Ender / Void Particles at Destination
          for (let k = 0; k < 8; k++) {
            const ang = (Math.PI * 2 * k) / 8;
            const sp = 0.12 + Math.random() * 0.15;
            newParticles.push({
              id: `tp_p_${Date.now()}_${k}`,
              x: newX,
              z: newZ,
              vx: Math.cos(ang) * sp,
              vz: Math.sin(ang) * sp,
              life: 12,
              maxLife: 12,
              color: '#c084fc',
              size: 2.5
            });
          }

          next.prepareThyselfPhase = 2;
          next.prepareThyselfTicks = 8;
          addLog('[TELEPORT] Seamless teleport behind target! (Windup cross strike)');
        } else if (next.prepareThyselfPhase === 2) {
          next.prepareThyselfTicks -= 1;
          next.activeDecisionNode = 'EXEC_PREPARE_THYSELF_STRIKE';
          next.combatState = 'PREPARE_THYSELF_STRIKE';

          if (next.prepareThyselfTicks <= 0) {
            next.prepareThyselfPhase = 0;
            next.combatState = 'IDLE_STALKING';
            next.leftPunchTicks = 10;
            
            newShockwaves.push({
              id: `prepare_shock_${Date.now()}`,
              x: next.rotX,
              z: next.rotZ,
              radius: 0.4,
              maxRadius: 3.6,
              color: '#38bdf8',
              alpha: 1.0,
              thickness: 2.5
            });

            applyRadialKnockbackToAll(next.rotX, next.rotZ, 3.6, 0.4, 18.0, 'Prepare Thyself Cross');

            const rawDmg = 18.0;
            if (targetType === 'player') {
              const dealt = rawDmg * 0.35;
              next.playerHealth = Math.max(0, next.playerHealth - dealt);
              addLog(`[BIPED STRIKE] Prepare Thyself punch dealt ${dealt.toFixed(1)} DMG.`);
            } else if (targetMobId) {
              const targetMob = next.mobs.find(m => m.id === targetMobId);
              next.mobs = next.mobs.map(m => m.id === targetMobId ? { ...m, health: Math.max(0, m.health - rawDmg) } : m);
              addLog(`[BIPED STRIKE] Prepare Thyself struck ${targetMob?.name || 'mob'} for ${rawDmg} DMG.`);
            }
          }
        }

        // OVERHEAD GROUND-IMPACT SLAM (Leap & Apex Freeze -> Plunge & Shockwave Knockback)
        else if (next.overheadPhase === 1) {
          next.overheadTicks -= 1;
          next.activeDecisionNode = 'EXEC_OVERHEAD_LEAP_FREEZE';
          next.combatState = 'OVERHEAD_LEAP';
          next.rotY += 1.0;
          next.rotX += (tX - next.rotX) * 0.12;
          next.rotZ += (tZ - next.rotZ) * 0.12;

          if (next.overheadTicks <= 0 || next.rotY >= 72.0) {
            next.overheadPhase = 2;
            next.overheadTicks = 8;
            addLog('[OVERHEAD SLAM] Rot reached apex windup, plunging with two-handed slam!');
          }
        } else if (next.overheadPhase === 2) {
          next.overheadTicks -= 1;
          next.activeDecisionNode = 'EXEC_OVERHEAD_SMASH';
          next.combatState = 'OVERHEAD_SMASH';
          next.rotY -= 1.8;

          if (next.rotY <= 64.0) {
            next.rotY = 64.0;
            next.overheadPhase = 0;
            next.combatState = 'IDLE_STALKING';

            newShockwaves.push({
              id: `overhead_shock_${Date.now()}`,
              x: next.rotX,
              z: next.rotZ,
              radius: 0.5,
              maxRadius: 4.8,
              color: '#d946ef',
              alpha: 1.0,
              thickness: 3.5
            });

            applyRadialKnockbackToAll(next.rotX, next.rotZ, 4.6, 0.50, 24.0, 'Overhead Ground Smash');

            if (dist < 4.0) {
              const rawDmg = 24.0;
              if (targetType === 'player') {
                if (next.playerIsBlocking) {
                  next.playerIsBlocking = false;
                  next.playerShieldCooldown = 80;
                  addLog('[SHIELD BREAK] Overhead Slam breached player shield!');
                }
                const dealt = rawDmg * 0.35;
                next.playerHealth = Math.max(0, next.playerHealth - dealt);
                addLog(`[IMPACT] Overhead Slam hit player for ${dealt.toFixed(1)} DMG.`);
              } else if (targetMobId) {
                const targetMob = next.mobs.find(m => m.id === targetMobId);
                next.mobs = next.mobs.map(m => m.id === targetMobId ? { ...m, health: Math.max(0, m.health - rawDmg) } : m);
                addLog(`[IMPACT] Overhead Slam struck ${targetMob?.name || 'mob'} for ${rawDmg} DMG.`);
              }
            }
          }
        }

        // SWEEPING LASER RAYCAST
        else if (next.laserChargingTicks > 0) {
          next.laserChargingTicks -= 1;
          next.activeDecisionNode = 'EXEC_LASER_CHARGE';
          next.combatState = 'LASER_CHARGING';

          const dirX = tX - next.rotX;
          const dirY = (tY + 0.8) - (next.rotY + 1.6);
          const dirZ = tZ - next.rotZ;
          const len = Math.max(0.001, Math.hypot(dirX, dirY, dirZ));

          next.laserAimX += ((dirX / len) - next.laserAimX) * 0.095;
          next.laserAimY += ((dirY / len) - next.laserAimY) * 0.095;
          next.laserAimZ += ((dirZ / len) - next.laserAimZ) * 0.095;

          if (next.laserChargingTicks <= 0) {
            next.laserFiringTicks = 55;
            next.combatState = 'LASER_FIRING';
            addLog(`[LASER] Sweeping ${next.laserType.toUpperCase()} Beam fired!`);
          }
        } else if (next.laserFiringTicks > 0) {
          next.laserFiringTicks -= 1;
          next.activeDecisionNode = 'EXEC_LASER_SWEEP';
          next.combatState = 'LASER_FIRING';

          const dirX = tX - next.rotX;
          const dirY = (tY + 0.8) - (next.rotY + 1.6);
          const dirZ = tZ - next.rotZ;
          const len = Math.max(0.001, Math.hypot(dirX, dirY, dirZ));

          next.laserAimX += ((dirX / len) - next.laserAimX) * 0.055;
          next.laserAimY += ((dirY / len) - next.laserAimY) * 0.055;
          next.laserAimZ += ((dirZ / len) - next.laserAimZ) * 0.055;

          const beamLen = 22.0;
          next.laserHitPoint = {
            x: next.rotX + next.laserAimX * beamLen,
            y: next.rotY + 1.6 + next.laserAimY * beamLen,
            z: next.rotZ + next.laserAimZ * beamLen
          };

          const beamToTargetDist = Math.hypot(tX - (next.rotX + next.laserAimX * dist), tZ - (next.rotZ + next.laserAimZ * dist));
          if (beamToTargetDist < 1.4 && next.stateTicks % 6 === 0) {
            const beamDmg = 12.0;
            if (targetType === 'player') {
              if (next.playerIsBlocking) {
                addLog('[SHIELD] Player blocked laser tick.');
              } else {
                next.playerHealth = Math.max(0, next.playerHealth - beamDmg * 0.45);
                addLog(`[BEAM IMPACT] Laser tick hit player for ${(beamDmg * 0.45).toFixed(1)} DMG.`);
              }
            } else if (targetMobId) {
              next.mobs = next.mobs.map(m => m.id === targetMobId ? { ...m, health: Math.max(0, m.health - beamDmg) } : m);
            }
          }

          if (next.laserFiringTicks <= 0) {
            next.laserClosingTicks = 12;
            next.combatState = 'LASER_CLOSING';
          }
        } else if (next.laserClosingTicks > 0) {
          next.laserClosingTicks -= 1;
          next.activeDecisionNode = 'EXEC_LASER_CLOSE';
          next.combatState = 'LASER_CLOSING';
          if (next.laserClosingTicks <= 0) {
            next.laserType = 'none';
            next.combatState = 'IDLE_STALKING';
          }
        }

        // GENERAL COMBAT DECISION LOGIC & AUTO ROTATION
        else if (targetType !== 'none') {
          if (dist <= 3.2) {
            const roll = Math.random();
            if (roll < 0.45) {
              const isLeft = next.leftPunchTicks === 0;
              if (isLeft) next.leftPunchTicks = 14;
              else next.rightPunchTicks = 14;
              next.combatState = isLeft ? 'LEFT_PUNCH' : 'RIGHT_PUNCH';
              next.activeDecisionNode = isLeft ? 'EXEC_LEFT_PUNCH' : 'EXEC_RIGHT_PUNCH';

              const rawDmg = ROT_SOURCE_ATTRIBUTES.ATTACK_DAMAGE; // 18.0 base attack damage
              if (targetType === 'player') {
                if (next.playerIsBlocking) {
                  addLog('[SHIELD] Player blocked punch.');
                } else {
                  const dmg = rawDmg * 0.35; // 6.3 net DMG against armor
                  next.playerHealth = Math.max(0, next.playerHealth - dmg);
                  addLog(`[REGULAR PUNCH] ${isLeft ? 'Left' : 'Right'} punch dealt ${dmg.toFixed(1)} DMG.`);
                }
              } else if (targetMobId) {
                const targetMob = next.mobs.find(m => m.id === targetMobId);
                const mobArmor = targetMob?.type === 'zombie' ? 2 : 0;
                const dealt = rawDmg * (1.0 - mobArmor * 0.04);
                next.mobs = next.mobs.map(m => m.id === targetMobId ? { ...m, health: Math.max(0, m.health - dealt) } : m);
                addLog(`[REGULAR PUNCH] Rot struck ${targetMob?.name || 'mob'} for ${dealt.toFixed(1)} DMG.`);
              }
            } else if (roll < 0.70) {
              next.minosComboStep = 1;
              next.minosComboTicks = 8;
              addLog('[BIPED COMBO] Thy End Is Now combo initiated!');
            } else if (roll < 0.85) {
              next.prepareThyselfPhase = 1;
              addLog('[TELEPORT] Prepare Thyself initiated!');
            } else {
              next.overheadPhase = 1;
              next.overheadTicks = 12;
              addLog('[OVERHEAD SLAM] Rot leaped upwards for Overhead Ground Slam!');
            }
          } else if (dist <= 12.0) {
            next.activeDecisionNode = 'EVAL_GOAL_AI_APPROACH';
            next.combatState = 'APPROACH_TARGET';

            // Authentic Minecraft Goal AI Pathing: direct vector navigation towards target
            const directDx = tX - next.rotX;
            const directDz = tZ - next.rotZ;
            const directLen = Math.max(0.01, Math.hypot(directDx, directDz));
            const walkSpeed = 0.22; // Authentic Minecraft entity movement speed
            const targetRotVx = (directDx / directLen) * walkSpeed;
            const targetRotVz = (directDz / directLen) * walkSpeed;
            next.rotDeltaX = next.rotDeltaX * 0.25 + targetRotVx * 0.75;
            next.rotDeltaZ = next.rotDeltaZ * 0.25 + targetRotVz * 0.75;

            if (next.stateTicks % 60 === 0) {
              const pick = Math.random();
              if (pick < 0.40) {
                next.dropkickPhase = 1;
                next.dropkickTicks = 14;
                addLog('[MINOS MOVE] Judgment Dropkick initiated!');
              }
            }
          } else {
            next.activeDecisionNode = 'EVAL_LONG_RANGE_LASER';
            next.rotDeltaX *= 0.546;
            next.rotDeltaZ *= 0.546;
            if (next.laserChargingTicks === 0 && next.laserFiringTicks === 0 && next.laserClosingTicks === 0) {
              next.laserType = 'solar';
              next.laserChargingTicks = 30;
              next.combatState = 'LASER_CHARGING';
              addLog(`[ROT AI] Target at range (${dist.toFixed(1)}m). Charging Solar Beam.`);
            }
          }
        } else {
          next.combatState = 'IDLE_STALKING';
          next.activeDecisionNode = 'IDLE_PATROL';
          next.rotDeltaX *= 0.546;
          next.rotDeltaZ *= 0.546;
        }

        next.rotX += next.rotDeltaX;
        next.rotZ += next.rotDeltaZ;

        // Firm kinematic wall clamp at end of tick (guarantees zero boundary escape or bounce)
        const FINAL_MIN = 1.5 + next.rotRadius;
        const FINAL_MAX = 46.5 - next.rotRadius;
        if (next.rotX < FINAL_MIN) {
          next.rotX = FINAL_MIN;
          next.rotDeltaX = 0;
        } else if (next.rotX > FINAL_MAX) {
          next.rotX = FINAL_MAX;
          next.rotDeltaX = 0;
        }
        if (next.rotZ < FINAL_MIN) {
          next.rotZ = FINAL_MIN;
          next.rotDeltaZ = 0;
        } else if (next.rotZ > FINAL_MAX) {
          next.rotZ = FINAL_MAX;
          next.rotDeltaZ = 0;
        }

        return next;
      });
    }, simSpeed);

    return () => clearInterval(interval);
  }, [isPlaying, simSpeed, playerMode]);

  // HD Top-Down Arena Canvas (High-DPR Native Canvas)
  useEffect(() => {
    const canvas = arenaCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const scale = width / 48.0;

    ctx.fillStyle = '#060a07';
    ctx.fillRect(0, 0, width, height);

    ctx.strokeStyle = '#121a14';
    ctx.lineWidth = 1.0;
    for (let i = 0; i <= 48; i += 4) {
      ctx.beginPath();
      ctx.moveTo(i * scale, 0);
      ctx.lineTo(i * scale, height);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(0, i * scale);
      ctx.lineTo(width, i * scale);
      ctx.stroke();
    }

    // Outer Arena Boundary Border (48m x 48m Doubled Arena)
    ctx.strokeStyle = '#27382a';
    ctx.lineWidth = 2.5;
    ctx.strokeRect(1.5 * scale, 1.5 * scale, (46.5 - 1.5) * scale, (46.5 - 1.5) * scale);

    if (state.playerSpawned && !state.playerIsDead) {
      ctx.beginPath();
      ctx.setLineDash([4, 4]);
      ctx.strokeStyle = 'rgba(234, 179, 8, 0.5)';
      ctx.lineWidth = 2;
      ctx.moveTo(state.playerX * scale, state.playerZ * scale);
      ctx.lineTo(state.predictedTargetX * scale, state.predictedTargetZ * scale);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.beginPath();
      ctx.arc(state.predictedTargetX * scale, state.predictedTargetZ * scale, 4.5, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(234, 179, 8, 0.85)';
      ctx.fill();
    }

    // Render Afterimages (Ghost trails during Supersonic Dive / Flash Teleport)
    for (const after of state.rotAfterimages) {
      const ax = after.x * scale;
      const az = after.z * scale;
      const ar = state.rotRadius * scale;
      ctx.save();
      ctx.globalAlpha = after.alpha * 0.7;
      ctx.beginPath();
      ctx.arc(ax, az, ar, 0, Math.PI * 2);
      ctx.fillStyle = after.color || '#38bdf8';
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.restore();
    }

    // Minos Move Lock-On Target Beacon (Judgment Dive Reticle)
    if (state.dropkickPhase === 1) {
      const tx = state.dropkickTargetX * scale;
      const tz = state.dropkickTargetZ * scale;
      const pulse = (Math.sin(state.stateTicks * 0.4) + 1) * 0.5;
      
      ctx.save();
      ctx.strokeStyle = `rgba(56, 189, 248, ${0.4 + pulse * 0.6})`;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(tx, tz, 16 + pulse * 8, 0, Math.PI * 2);
      ctx.stroke();

      // Crosshair
      ctx.beginPath();
      ctx.moveTo(tx - 24, tz);
      ctx.lineTo(tx + 24, tz);
      ctx.moveTo(tx, tz - 24);
      ctx.lineTo(tx, tz + 24);
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Connecting lock-on beam
      ctx.setLineDash([4, 4]);
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.6)';
      ctx.beginPath();
      ctx.moveTo(state.rotX * scale, state.rotZ * scale);
      ctx.lineTo(tx, tz);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();
    }

    // Overhead Smash Danger Zone Beacon
    if (state.overheadPhase === 1) {
      const ox = state.rotX * scale;
      const oz = state.rotZ * scale;
      ctx.save();
      ctx.beginPath();
      ctx.arc(ox, oz, 5.5 * scale, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(217, 70, 239, 0.15)';
      ctx.strokeStyle = 'rgba(217, 70, 239, 0.7)';
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 6]);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }

    for (const sw of state.shockwaves) {
      ctx.beginPath();
      ctx.arc(sw.x * scale, sw.z * scale, sw.radius * scale, 0, Math.PI * 2);
      ctx.strokeStyle = sw.color;
      ctx.lineWidth = sw.thickness || 3;
      ctx.globalAlpha = sw.alpha;
      ctx.stroke();
      ctx.globalAlpha = 1.0;
    }

    // Physics & Debris Particles
    for (const pt of state.arenaParticles) {
      const alpha = pt.life / pt.maxLife;
      ctx.beginPath();
      ctx.arc(pt.x * scale, pt.z * scale, pt.size * (0.5 + alpha * 0.5), 0, Math.PI * 2);
      ctx.fillStyle = pt.color;
      ctx.globalAlpha = alpha;
      ctx.fill();
      ctx.globalAlpha = 1.0;
    }

    if (state.laserFiringTicks > 0 && state.laserHitPoint) {
      ctx.beginPath();
      ctx.moveTo(state.rotX * scale, state.rotZ * scale);
      ctx.lineTo(state.laserHitPoint.x * scale, state.laserHitPoint.z * scale);
      ctx.strokeStyle = state.laserType === 'solar' ? 'rgba(249, 115, 22, 0.95)' : 'rgba(14, 165, 233, 0.95)';
      ctx.lineWidth = 7;
      ctx.stroke();

      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2.5;
      ctx.stroke();
    }

    // PROJECTILE RENDERING (With Helix Spiral for Warden Sonic Boom)
    for (const p of state.projectiles) {
      const px = p.x * scale;
      const pz = p.z * scale;

      if (p.type === 'sonic_boom') {
        const angle = Math.atan2(p.deltaZ, p.deltaX);
        const perp = angle + Math.PI / 2;
        const phase = (p.phase || 0) * 0.45;
        const helixRadius = 7.5;
        const segmentCount = 6;

        ctx.save();
        // Expanding sonic shock cones along trajectory
        for (let i = 0; i < 3; i++) {
          const coneDist = i * 9;
          const cx = px - Math.cos(angle) * coneDist;
          const cz = pz - Math.sin(angle) * coneDist;
          const coneRadius = 6 + i * 4;

          ctx.beginPath();
          ctx.arc(cx, cz, coneRadius, angle - Math.PI / 3, angle + Math.PI / 3);
          ctx.strokeStyle = `rgba(56, 189, 248, ${0.8 - i * 0.25})`;
          ctx.lineWidth = 3 - i * 0.6;
          ctx.stroke();
        }

        // Dual Out-of-Phase Helix Spirals (DNA / Vortex wave pattern)
        for (let strand = 0; strand < 2; strand++) {
          const strandPhaseOffset = strand * Math.PI;
          ctx.beginPath();
          for (let s = 0; s <= segmentCount; s++) {
            const t = s / segmentCount;
            const distBack = t * 24;
            const sampleX = px - Math.cos(angle) * distBack;
            const sampleZ = pz - Math.sin(angle) * distBack;
            const waveOffset = Math.sin(phase - (s * 0.9) + strandPhaseOffset) * helixRadius * (1 - t * 0.3);
            const wx = sampleX + Math.cos(perp) * waveOffset;
            const wz = sampleZ + Math.sin(perp) * waveOffset;

            if (s === 0) ctx.moveTo(wx, wz);
            else ctx.lineTo(wx, wz);
          }
          ctx.strokeStyle = strand === 0 ? '#38bdf8' : '#2dd4bf';
          ctx.lineWidth = 3;
          ctx.stroke();
        }

        // Central Sonic Core & Acoustic Halo
        ctx.beginPath();
        ctx.arc(px, pz, 7.5, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(15, 118, 110, 0.6)';
        ctx.fill();

        ctx.beginPath();
        ctx.arc(px, pz, 4, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();
        ctx.restore();
      } else if (p.type === 'fireball') {
        ctx.save();
        ctx.beginPath();
        ctx.arc(px, pz, 5, 0, Math.PI * 2);
        ctx.fillStyle = '#ea580c';
        ctx.fill();
        ctx.strokeStyle = '#facc15';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.restore();
      } else {
        // Arrow / Physical Bolt
        ctx.beginPath();
        ctx.arc(px, pz, 3.5, 0, Math.PI * 2);
        ctx.fillStyle = '#f1f5f9';
        ctx.fill();
      }
    }

    for (const mob of state.mobs) {
      const mx = mob.x * scale;
      const mz = mob.z * scale;
      const r = mob.radius * scale;
      const spec = ARENA_MOB_STATS[mob.type];

      ctx.beginPath();
      ctx.arc(mx, mz, r, 0, Math.PI * 2);
      
      if (mob.type === 'creeper') {
        ctx.fillStyle = (mob.creeperFuse || 0) % 4 < 2 ? '#22c55e' : '#ffffff';
        ctx.strokeStyle = '#15803d';
      } else {
        ctx.fillStyle = spec?.color || '#15803d';
        ctx.strokeStyle = spec?.stroke || '#166534';
      }
      
      ctx.lineWidth = mob.category === 'backwoods' ? 2.5 : 2.0;
      ctx.fill();
      ctx.stroke();

      const barW = Math.max(22, r * 2.2);
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(mx - barW / 2, mz - r - 8, barW, 3.5);
      ctx.fillStyle = '#22c55e';
      ctx.fillRect(mx - barW / 2, mz - r - 8, (mob.health / mob.maxHealth) * barW, 3.5);

      ctx.font = '9px monospace';
      ctx.fillStyle = '#cbd5e1';
      ctx.textAlign = 'center';
      ctx.fillText(mob.name, mx, mz + r + 12);
    }

    // Render Active Tactical Cobwebs (Sticky Ground Snares)
    if (state.cobwebs && state.cobwebs.length > 0) {
      for (const web of state.cobwebs) {
        const wx = web.x * scale;
        const wz = web.z * scale;
        const wr = 1.2 * scale;
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(wx - wr, wz); ctx.lineTo(wx + wr, wz);
        ctx.moveTo(wx, wz - wr); ctx.lineTo(wx, wz + wr);
        ctx.moveTo(wx - wr * 0.7, wz - wr * 0.7); ctx.lineTo(wx + wr * 0.7, wz + wr * 0.7);
        ctx.moveTo(wx - wr * 0.7, wz + wr * 0.7); ctx.lineTo(wx + wr * 0.7, wz - wr * 0.7);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(wx, wz, wr * 0.65, 0, Math.PI * 2);
        ctx.stroke();
      }
    }

    // Render The Rot (Authentic Biped Humanoid Boss Entity)
    const rotPx = state.rotX * scale;
    const rotPz = state.rotZ * scale;
    const rotR = state.rotRadius * scale;
    const rotYawRad = ((state.rotYaw + 90) * Math.PI) / 180;
    const perpYawRad = rotYawRad + Math.PI / 2;

    ctx.save();
    // 1. Torso Base
    ctx.beginPath();
    ctx.arc(rotPx, rotPz, rotR, 0, Math.PI * 2);
    ctx.fillStyle = '#1c0b0e';
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 2.5;
    ctx.fill();
    ctx.stroke();

    // 2. Biped Shoulders and Alternating Punching Arms
    const shoulderOffset = rotR * 0.85;
    const leftPunchExtend = (state.leftPunchTicks || 0) > 0 ? 8.5 : 0;
    const rightPunchExtend = (state.rightPunchTicks || 0) > 0 ? 8.5 : 0;

    // Left Arm / Fist
    const leftShoulderX = rotPx - Math.cos(perpYawRad) * shoulderOffset;
    const leftShoulderZ = rotPz - Math.sin(perpYawRad) * shoulderOffset;
    const leftFistX = leftShoulderX + Math.cos(rotYawRad) * (rotR * 0.7 + leftPunchExtend);
    const leftFistZ = leftShoulderZ + Math.sin(rotYawRad) * (rotR * 0.7 + leftPunchExtend);

    ctx.beginPath();
    ctx.moveTo(leftShoulderX, leftShoulderZ);
    ctx.lineTo(leftFistX, leftFistZ);
    ctx.strokeStyle = (state.leftPunchTicks || 0) > 0 ? '#ef4444' : '#7f1d1d';
    ctx.lineWidth = 3.5;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(leftFistX, leftFistZ, 3.2, 0, Math.PI * 2);
    ctx.fillStyle = (state.leftPunchTicks || 0) > 0 ? '#ef4444' : '#450a0a';
    ctx.fill();

    // Right Arm / Fist
    const rightShoulderX = rotPx + Math.cos(perpYawRad) * shoulderOffset;
    const rightShoulderZ = rotPz + Math.sin(perpYawRad) * shoulderOffset;
    const rightFistX = rightShoulderX + Math.cos(rotYawRad) * (rotR * 0.7 + rightPunchExtend);
    const rightFistZ = rightShoulderZ + Math.sin(rotYawRad) * (rotR * 0.7 + rightPunchExtend);

    ctx.beginPath();
    ctx.moveTo(rightShoulderX, rightShoulderZ);
    ctx.lineTo(rightFistX, rightFistZ);
    ctx.strokeStyle = (state.rightPunchTicks || 0) > 0 ? '#ef4444' : '#7f1d1d';
    ctx.lineWidth = 3.5;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(rightFistX, rightFistZ, 3.2, 0, Math.PI * 2);
    ctx.fillStyle = (state.rightPunchTicks || 0) > 0 ? '#ef4444' : '#450a0a';
    ctx.fill();

    // 3. Head & Crimson Facing Pointer
    ctx.beginPath();
    ctx.arc(rotPx, rotPz, rotR * 0.55, 0, Math.PI * 2);
    ctx.fillStyle = '#2a080c';
    ctx.strokeStyle = '#f87171';
    ctx.lineWidth = 1.8;
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(rotPx, rotPz);
    ctx.lineTo(rotPx + Math.cos(rotYawRad) * (rotR + 6), rotPz + Math.sin(rotYawRad) * (rotR + 6));
    ctx.strokeStyle = '#f87171';
    ctx.lineWidth = 2.5;
    ctx.stroke();
    ctx.restore();

    // Rot Health & Dynamic Adaptation Armor Bar
    ctx.fillStyle = '#18181b';
    ctx.fillRect(rotPx - 32, rotPz - rotR - 16, 64, 6);
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(rotPx - 32, rotPz - rotR - 16, Math.max(0, (state.rotHealth / state.rotMaxHealth) * 64), 6);
    
    if (state.totalAdaptiveResistance > 0) {
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(rotPx - 32, rotPz - rotR - 9, state.totalAdaptiveResistance * 64, 2.5);
    }

    ctx.fillStyle = '#fca5a5';
    ctx.font = 'bold 9.5px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`${state.rotHealth.toFixed(0)} / ${state.rotMaxHealth} HP`, rotPx, rotPz - rotR - 19);

    // Render Player (if spawned)
    if (state.playerSpawned) {
      const playerPx = state.playerX * scale;
      const playerPz = state.playerZ * scale;
      const playerR = state.playerRadius * scale;

      // Render Player Crosshair Targeting Raycast towards The Rot
      if (!state.playerIsDead) {
        ctx.beginPath();
        ctx.setLineDash([2, 4]);
        ctx.moveTo(playerPx, playerPz);
        ctx.lineTo(rotPx, rotPz);
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.22)';
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.setLineDash([]);
      }

      if (state.totemPoppedAnimationTicks > 0) {
        ctx.beginPath();
        ctx.arc(playerPx, playerPz, playerR + 10, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(250, 204, 21, 0.4)';
        ctx.fill();
      }

      ctx.beginPath();
      ctx.arc(playerPx, playerPz, playerR, 0, Math.PI * 2);
      ctx.fillStyle = state.playerIsDead ? '#7f1d1d' : '#047857';
      ctx.strokeStyle = state.playerIsDead ? '#ef4444' : '#10b981';
      ctx.lineWidth = 2.5;
      ctx.fill();
      ctx.stroke();

      if (state.playerIsDead) {
        ctx.beginPath();
        ctx.moveTo(playerPx - 6, playerPz - 6);
        ctx.lineTo(playerPx + 6, playerPz + 6);
        ctx.moveTo(playerPx + 6, playerPz - 6);
        ctx.lineTo(playerPx - 6, playerPz + 6);
        ctx.strokeStyle = '#fee2e2';
        ctx.lineWidth = 2;
        ctx.stroke();
      } else {
        if (state.playerIsBlocking) {
          ctx.beginPath();
          ctx.arc(playerPx, playerPz, playerR + 5, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(59, 130, 246, 0.3)';
          ctx.strokeStyle = '#60a5fa';
          ctx.lineWidth = 2;
          ctx.stroke();
          ctx.fill();
        }

        ctx.fillStyle = '#ef4444';
        ctx.fillRect(playerPx - 16, playerPz - playerR - 9, 32, 4);
        ctx.fillStyle = '#10b981';
        ctx.fillRect(playerPx - 16, playerPz - playerR - 9, (state.playerHealth / state.playerMaxHealth) * 32, 4);

        if (state.playerAbsorption > 0) {
          ctx.fillStyle = '#facc15';
          ctx.fillRect(playerPx - 16, playerPz - playerR - 5, (state.playerAbsorption / 4.0) * 32, 2);
        }

        ctx.fillStyle = '#6ee7b7';
        ctx.font = 'bold 9px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(`${state.playerHealth.toFixed(1)} HP`, playerPx, playerPz - playerR - 12);

        // Render Smart Player Dynamic Tactical Badge & Weapon
        if (state.playerActionLabel) {
          ctx.font = 'bold 8.5px monospace';
          ctx.fillStyle = '#38bdf8';
          ctx.fillText(`[${state.playerActionLabel}]`, playerPx, playerPz + playerR + 13);
          ctx.fillStyle = '#a1a1aa';
          ctx.font = '7.5px monospace';
          ctx.fillText(`⚔ ${state.playerWeapon.toUpperCase()}`, playerPx, playerPz + playerR + 22);
        }
      }
    }
  }, [state]);

  const handleSpawnMobs = () => {
    const stats = VANILLA_MOB_STATS[selectedSpawnMob];
    const newMobs: ArenaMob[] = [];

    for (let i = 0; i < spawnCount; i++) {
      const angle = (Math.PI * 2 * i) / spawnCount;
      const spawnX = Math.max(5.0, Math.min(43.0, 24.0 + Math.cos(angle) * 16.0));
      const spawnZ = Math.max(5.0, Math.min(43.0, 24.0 + Math.sin(angle) * 16.0));

      newMobs.push({
        id: `mob_${selectedSpawnMob}_${Date.now()}_${i}`,
        type: selectedSpawnMob,
        name: stats.name,
        x: spawnX,
        z: spawnZ,
        health: stats.maxHealth,
        maxHealth: stats.maxHealth,
        speed: stats.speed,
        damage: stats.damage,
        radius: stats.radius,
        mass: stats.mass,
        knockbackResistance: stats.knockbackResistance,
        deltaX: 0,
        deltaZ: 0,
        attackCooldown: 0,
        creeperFuse: 0,
        creeperIsIgnited: false,
        skeletonBowCharge: 0,
        wardenSonicCharge: 0
      });
    }

    setState(prev => ({
      ...prev,
      mobs: [...prev.mobs, ...newMobs]
    }));
    addLog(`[SPAWNER] Deployed ${spawnCount}x ${stats.name} (${stats.mass}kg) into the combat matrix.`);
  };

  const handleClearMobs = () => {
    setState(prev => ({ ...prev, mobs: [] }));
    addLog('[SPAWNER] Cleared all mobs from arena.');
  };

  const handleRespawnPlayer = () => {
    setState(prev => ({
      ...prev,
      playerSpawned: true,
      playerHealth: 20.0,
      playerIsDead: false,
      playerX: 24.0,
      playerZ: 38.0,
      playerShieldCooldown: 0,
      playerIsBlocking: false,
      playerGoldenApples: 3,
      playerPotions: 2,
      playerTotems: Math.max(1, prev.playerTotems)
    }));
    addLog('[PLAYER] Respawned player with full Netherite loadout.');
  };

  const handleTogglePlayerSpawn = () => {
    setState(prev => {
      const nextSpawned = !prev.playerSpawned;
      addLog(`[PLAYER] Player state updated: ${nextSpawned ? 'SPAWNED' : 'DESPAWNED'}.`);
      return {
        ...prev,
        playerSpawned: nextSpawned,
        playerIsDead: false,
        playerHealth: 20.0
      };
    });
  };

  // Selected Node in Connected Brain Visuals
  const [selectedNodeId, setSelectedNodeId] = useState<string>('core_nexus');
  const [selectedLobeFilter, setSelectedLobeFilter] = useState<string>('ALL');

  // Neural Graph Circular Nodes (Interconnected Brain Visuals based on Mod AI Architecture)
  const brainNodes = useMemo(() => [
    // 1. Column 1: PlayerBehaviorTracker & Welford Online Statistics
    {
      id: 'w_dist',
      label: 'Welford Distance Tracker',
      lobe: 'PlayerBehaviorTracker',
      x: 85,
      y: 90,
      r: 30,
      color: '#38bdf8',
      active: true,
      val: `μ=${state.welfordDistance.mean.toFixed(1)}m σ=${state.welfordDistance.stdDev.toFixed(2)}`,
      badge: 'WELFORD',
      desc: `Online incremental Welford algorithm tracking target distance distribution. Count: ${state.welfordDistance.count}, Mean: ${state.welfordDistance.mean.toFixed(2)}m, Variance: ${state.welfordDistance.variance.toFixed(2)}, Z-Score: ${state.welfordDistance.zScore.toFixed(2)}.`,
      icon: Target
    },
    {
      id: 'w_interval',
      label: 'Welford Attack Cadence',
      lobe: 'PlayerBehaviorTracker',
      x: 85,
      y: 215,
      r: 30,
      color: '#38bdf8',
      active: true,
      val: `Z=${state.welfordAttackInterval.zScore.toFixed(2)}`,
      badge: 'CADENCE',
      desc: `Statistical tracking of player attack frequency and combo timing variance to predict incoming attacks and trigger counter-evasion.`,
      icon: Activity
    },
    {
      id: 's_pred',
      label: 'Lead Vector (ΔX/ΔZ)',
      lobe: 'PlayerBehaviorTracker',
      x: 85,
      y: 340,
      r: 30,
      color: '#38bdf8',
      active: true,
      val: `(${state.predictedTargetX.toFixed(1)}, ${state.predictedTargetZ.toFixed(1)})`,
      badge: 'LEAD',
      desc: 'Predictive 6-tick linear trajectory model feeding supersonic dropkick and combo strikes.',
      icon: Crosshair
    },
    {
      id: 's_shield',
      label: 'Shield Validator',
      lobe: 'PlayerBehaviorTracker',
      x: 85,
      y: 465,
      r: 30,
      color: '#38bdf8',
      active: state.playerIsBlocking,
      val: state.playerIsBlocking ? 'BLOCKING' : 'OPEN',
      badge: state.playerIsBlocking ? 'ALERT' : 'CLEAR',
      desc: 'Scans target hand state for Active Shield Blocking to trigger 100-tick Shield Crusher moves.',
      icon: Shield
    },

    // 2. Column 2: TacticalNeuralNetwork (Tensor Inputs, Hidden & Weights)
    {
      id: 'nn_input',
      label: 'Tactical Input (96-Dim)',
      lobe: 'TacticalNeuralNetwork',
      x: 275,
      y: 90,
      r: 30,
      color: '#818cf8',
      active: true,
      val: `[96 Inputs Vector]`,
      badge: 'INPUT_SIZE: 96',
      desc: `96-dimensional sensory and behavioral input vector tracking target distance, velocity, weapon loadouts, armor durability, air time, and combat intent.`,
      icon: Cpu
    },
    {
      id: 'nn_hidden',
      label: 'Hidden Layer (48-Tensor)',
      lobe: 'TacticalNeuralNetwork',
      x: 275,
      y: 215,
      r: 30,
      color: '#818cf8',
      active: true,
      val: `48 Neurons (ReLU)`,
      badge: 'HIDDEN_SIZE: 48',
      desc: `48 hidden neurons with non-linear activation evaluating tactical trade-offs between martial combos, zoning lasers, and acoustic shockwaves.`,
      icon: Layers
    },
    {
      id: 'nn_weights',
      label: 'Synaptic Weight Matrix',
      lobe: 'TacticalNeuralNetwork',
      x: 275,
      y: 340,
      r: 30,
      color: '#818cf8',
      active: true,
      val: `5,391 Weights`,
      badge: 'TOTAL_WEIGHTS: 5,391',
      desc: `Full weight tensor ((96 * 48) + 48 + (48 * 15) + 15 = 5,391 weights) trained via reinforcement experience buffers for combat adaptability.`,
      icon: Sparkles
    },
    {
      id: 'a_kin',
      label: '4-Pillar Adaptation Core',
      lobe: 'Dynamic Adaptation',
      x: 275,
      y: 465,
      r: 30,
      color: '#4ade80',
      active: state.totalAdaptiveResistance > 0,
      val: `${(state.totalAdaptiveResistance * 100).toFixed(0)}% Stacks`,
      badge: 'ADAPTIVE',
      desc: `Biological resistance scaling: Projectile (+15%/hit up to 90%), Explosion (+25%/hit up to 95%), Magic (+20%/hit up to 90%), Melee (+5%/hit up to 70%), and High-RPM Bullet Dampening (down to 12%).`,
      icon: ShieldCheck
    },

    // 3. Column 3: RoleAuction & Master Neural Arbiter (Center Hub)
    {
      id: 'role_auction',
      label: 'Role Auction Engine',
      lobe: 'RoleAuction',
      x: 480,
      y: 130,
      r: 36,
      color: '#f43f5e',
      active: true,
      val: `${state.roleAuction.activeRole} (${(state.roleAuction.bidUtility * 100).toFixed(0)}%)`,
      badge: 'AUCTION_BID',
      desc: `Multi-agent role coordination system. Evaluates utility bids across PUNISHER, FLANKER, SIEGE_BREAKER, and STALKER roles with automatic TTL bid pruning.`,
      icon: Users
    },
    {
      id: 'core_nexus',
      label: 'Minos Neural Arbiter',
      lobe: 'Combat State Machine',
      x: 480,
      y: 320,
      r: 42,
      color: '#c084fc',
      active: true,
      val: state.activeDecisionNode,
      badge: 'MASTER HUB',
      desc: 'Central Finite State Machine synchronizing sensory inputs, adaptation stacks, and Minos martial combos.',
      icon: Brain
    },
    {
      id: 'a_regen',
      label: 'Surge Healing (3.3x/s)',
      lobe: 'Biological Adaptation',
      x: 480,
      y: 470,
      r: 28,
      color: '#4ade80',
      active: state.rotHealth < state.rotMaxHealth,
      val: state.rotHealth < state.rotMaxHealth ? '+5-28 HP/6t' : 'MAX HP',
      badge: 'SURGE',
      desc: 'Rapid combat regenerative surge pulsing +5 to +28 HP every 6 ticks (3.3x/sec).',
      icon: HeartPulse
    },

    // 4. Column 4: Minos Prime Combat Action Space (Fourth Column)
    {
      id: 'm_thy',
      label: 'Thy End Is Now (4-Hit)',
      lobe: 'Minos Combat FSM',
      x: 700,
      y: 90,
      r: 30,
      color: '#facc15',
      active: state.minosComboStep > 0,
      val: `${(state.tacticalNeural.outputs.thyEndIsNow * 100).toFixed(0)}% Prob`,
      badge: state.minosComboStep > 0 ? `STEP ${state.minosComboStep}/4` : 'READY',
      desc: '4-hit martial combo concluding with an unblockable shield-breaking explosive finisher with radial knockback.',
      icon: Swords
    },
    {
      id: 'm_judge',
      label: 'Judgment (Dropkick)',
      lobe: 'Minos Combat FSM',
      x: 700,
      y: 215,
      r: 30,
      color: '#facc15',
      active: state.dropkickPhase > 0,
      val: `${(state.tacticalNeural.outputs.judgment * 100).toFixed(0)}% Prob`,
      badge: state.dropkickPhase > 0 ? `PHASE ${state.dropkickPhase}/2` : 'READY',
      desc: 'Supersonic ascending leap and tracking divekick with massive kinetic shockwave knockback to all arena units.',
      icon: Zap
    },
    {
      id: 'm_prep',
      label: 'Prepare Thyself (Dash)',
      lobe: 'Minos Combat FSM',
      x: 700,
      y: 340,
      r: 30,
      color: '#facc15',
      active: state.prepareThyselfPhase > 0,
      val: `${(state.tacticalNeural.outputs.prepareThyself * 100).toFixed(0)}% Prob`,
      badge: state.prepareThyselfPhase > 0 ? 'TELEPORT' : 'READY',
      desc: 'Instant teleportation behind target with immediate double sweeping arm cross slice and radial impulse.',
      icon: Sparkles
    },
    {
      id: 'm_slam',
      label: 'Die! (Overhead Slam)',
      lobe: 'Minos Combat FSM',
      x: 700,
      y: 465,
      r: 30,
      color: '#facc15',
      active: state.overheadPhase > 0,
      val: `${(state.tacticalNeural.outputs.overheadSlam * 100).toFixed(0)}% Prob`,
      badge: state.overheadPhase > 0 ? 'PLUNGING' : 'READY',
      desc: 'High-altitude vertical leap smashing both fists downward to break shields, shatter ground, and blast all mobs outward.',
      icon: Skull
    },

    // 5. Column 5: Motor & Physical Actuators (Right Column)
    {
      id: 'act_drag',
      label: 'Minecraft Ground Drag',
      lobe: 'Physical Actuators',
      x: 900,
      y: 90,
      r: 30,
      color: '#f87171',
      active: true,
      val: '0.546x Drag',
      badge: 'TRACTION',
      desc: 'True Minecraft ground friction (0.6 block friction * 0.91 air drag = 0.546) and firm pathfinding traction.',
      icon: Activity
    },
    {
      id: 'act_knock',
      label: 'Omni Radial Knockback',
      lobe: 'Physical Actuators',
      x: 900,
      y: 215,
      r: 30,
      color: '#f87171',
      active: state.shockwaves.length > 0 || state.minosComboStep === 4 || state.dropkickPhase > 0,
      val: 'ALL MOBS AFFECTED',
      badge: 'IMPULSE',
      desc: 'Broadcasts physical knockback velocity impulses to the player and all surrounding mobs inside the arena for every Minos move.',
      icon: Radio
    },
    {
      id: 'act_shield',
      label: 'Shield Crusher (100t)',
      lobe: 'Physical Actuators',
      x: 900,
      y: 340,
      r: 30,
      color: '#f87171',
      active: state.playerShieldCooldown > 0,
      val: state.playerShieldCooldown > 0 ? `${state.playerShieldCooldown}t CD` : 'STANDBY',
      badge: state.playerShieldCooldown > 0 ? 'CRUSHED' : 'STANDBY',
      desc: 'Applies exact vanilla 100-tick (5.0s) disablePlayerShield cooldown on guard-break.',
      icon: ShieldAlert
    },
    {
      id: 'act_laser',
      label: 'Solar Raycast Beam',
      lobe: 'Physical Actuators',
      x: 900,
      y: 465,
      r: 30,
      color: '#fb923c',
      active: state.laserFiringTicks > 0 || state.laserChargingTicks > 0,
      val: state.laserFiringTicks > 0 ? `${state.laserFiringTicks}t FIRE` : state.laserChargingTicks > 0 ? `${state.laserChargingTicks}t CHRG` : 'STANDBY',
      badge: state.laserFiringTicks > 0 ? 'FIRING' : 'STANDBY',
      desc: 'Sweeping high-intensity solar raycast with continuous block-piercing damage ticks.',
      icon: Flame
    }
  ], [state]);

  // Interconnected Synaptic Pathways (Linking Circle to Circle)
  const brainSynapses = useMemo(() => [
    // Column 1 (Welford/Sensory) -> Column 2 (Neural Inputs & Hidden)
    { id: 'syn_0', from: 'w_dist', to: 'nn_input', color: '#38bdf8', active: true },
    { id: 'syn_1', from: 'w_interval', to: 'nn_input', color: '#38bdf8', active: true },
    { id: 'syn_2', from: 's_pred', to: 'nn_input', color: '#38bdf8', active: true },
    { id: 'syn_3', from: 's_shield', to: 'nn_input', color: '#38bdf8', active: state.playerIsBlocking },
    { id: 'syn_4', from: 'nn_input', to: 'nn_hidden', color: '#818cf8', active: true },
    { id: 'syn_5', from: 'nn_hidden', to: 'nn_weights', color: '#818cf8', active: true },
    { id: 'syn_6', from: 'a_kin', to: 'nn_hidden', color: '#4ade80', active: state.totalAdaptiveResistance > 0 },

    // Column 2 -> Column 3 (Role Auction & Core Nexus)
    { id: 'syn_7', from: 'nn_hidden', to: 'role_auction', color: '#f43f5e', active: true },
    { id: 'syn_8', from: 'nn_hidden', to: 'core_nexus', color: '#c084fc', active: true },
    { id: 'syn_9', from: 'role_auction', to: 'core_nexus', color: '#f43f5e', active: true },
    { id: 'syn_10', from: 'a_regen', to: 'core_nexus', color: '#4ade80', active: state.rotHealth < state.rotMaxHealth },

    // Column 3 -> Column 4 (Minos Combat Moves)
    { id: 'syn_11', from: 'core_nexus', to: 'm_thy', color: '#facc15', active: state.minosComboStep > 0 },
    { id: 'syn_12', from: 'core_nexus', to: 'm_judge', color: '#facc15', active: state.dropkickPhase > 0 },
    { id: 'syn_13', from: 'core_nexus', to: 'm_prep', color: '#facc15', active: state.prepareThyselfPhase > 0 },
    { id: 'syn_14', from: 'core_nexus', to: 'm_slam', color: '#facc15', active: state.overheadPhase > 0 },

    // Column 4 -> Column 5 (Actuators & Knockback)
    { id: 'syn_15', from: 'm_thy', to: 'act_knock', color: '#f87171', active: state.minosComboStep > 0 },
    { id: 'syn_16', from: 'm_judge', to: 'act_knock', color: '#f87171', active: state.dropkickPhase > 0 },
    { id: 'syn_17', from: 'm_slam', to: 'act_knock', color: '#f87171', active: state.overheadPhase > 0 },
    { id: 'syn_18', from: 'm_prep', to: 'act_knock', color: '#f87171', active: state.prepareThyselfPhase > 0 },
    { id: 'syn_19', from: 'm_thy', to: 'act_shield', color: '#ef4444', active: state.minosComboStep === 4 },
    { id: 'syn_20', from: 'm_judge', to: 'act_shield', color: '#ef4444', active: state.dropkickPhase > 0 },
    { id: 'syn_21', from: 'm_slam', to: 'act_shield', color: '#ef4444', active: state.overheadPhase > 0 },
    { id: 'syn_22', from: 'core_nexus', to: 'act_laser', color: '#fb923c', active: state.laserFiringTicks > 0 || state.laserChargingTicks > 0 },
    { id: 'syn_23', from: 'act_knock', to: 'act_drag', color: '#f87171', active: true }
  ], [state]);

  const selectedNodeObj = brainNodes.find(n => n.id === selectedNodeId) || brainNodes[9];

  return (
    <UpdatedFrame id="rot_neural_lab" isUpdated={true}>
      <div className="space-y-4 pb-8">
        {/* Top Header - Compact & Responsive */}
        <div className="p-3 sm:p-4 bg-[#0c0e0c] border border-[#1d251e] rounded-xl relative overflow-hidden flex flex-col xl:flex-row xl:items-center justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-wider text-red-400">
            <Radio className="w-3 h-3 text-red-500 animate-pulse shrink-0" />
            <span>Classified Neural Combat Matrix</span>
          </div>
          <h1 className="font-serif text-lg sm:text-xl md:text-2xl font-extrabold text-[#e0e7e0] mt-0.5 break-words">
            The Rot: Active Combat Simulation
          </h1>
          <p className="text-xs text-[#8a9a8c] mt-0.5 max-w-2xl">
            Simulating The Rot's MCreator/Java state machine, Minos Prime combat combos, physics, and dynamic tank adaptation against Minecraft mobs.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 shrink-0">
          {state.rotIsDead ? (
            <button
              onClick={handleRespawnRot}
              className="px-2.5 py-1.5 rounded-lg border text-[11px] font-mono font-bold flex items-center gap-1.5 transition bg-red-600 text-white border-red-500 hover:bg-red-500 shadow-md shadow-red-950 animate-pulse whitespace-nowrap"
            >
              <RefreshCw className="w-3.5 h-3.5 shrink-0" />
              <span>REVIVE ROT</span>
            </button>
          ) : (
            <button
              onClick={handleRespawnRot}
              className="px-2.5 py-1.5 rounded-lg border text-[11px] font-mono font-medium flex items-center gap-1.5 transition bg-[#141a15] text-[#8a9a8c] border-[#2a382c] hover:text-red-300 hover:border-red-800 whitespace-nowrap"
            >
              <RefreshCw className="w-3.5 h-3.5 shrink-0" />
              <span>HEAL ROT (550 HP)</span>
            </button>
          )}
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`px-2.5 py-1.5 rounded-lg border text-[11px] font-mono font-semibold flex items-center gap-1.5 transition whitespace-nowrap ${
              isPlaying
                ? 'bg-emerald-950/40 text-emerald-300 border-emerald-800 hover:bg-emerald-900/50'
                : 'bg-amber-950/40 text-amber-300 border-amber-800 hover:bg-amber-900/50'
            }`}
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5 shrink-0" /> : <Play className="w-3.5 h-3.5 shrink-0" />}
            <span>{isPlaying ? 'PAUSE' : 'RESUME'}</span>
          </button>
          <button
            onClick={() => {
              setState(createInitialState());
              addLog('[RESET] Re-initialized combat environment to default.');
            }}
            className="px-2.5 py-1.5 rounded-lg border border-[#2a382c] bg-[#141a15] text-[11px] font-mono text-[#a1a1aa] hover:text-[#e0e7e0] flex items-center gap-1.5 transition whitespace-nowrap"
          >
            <RotateCcw className="w-3.5 h-3.5 shrink-0" />
            <span>RESET</span>
          </button>
        </div>
      </div>

      {/* Compact Section Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-1.5 p-1.5 bg-[#0a0f0b] border border-[#1b271d] rounded-xl font-mono text-xs">
        <button
          onClick={() => setActiveTab('arena')}
          className={`flex-1 min-w-[120px] sm:min-w-[140px] px-3 py-2 rounded-lg transition flex items-center justify-center gap-1.5 ${
            activeTab === 'arena'
              ? 'bg-red-950/80 border border-red-700 text-red-200 font-bold shadow-xs'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-[#121a14]'
          }`}
        >
          <Swords className="w-3.5 h-3.5 text-red-400 shrink-0" />
          <span>1. Arena & Moves</span>
        </button>
        <button
          onClick={() => setActiveTab('mindspace')}
          className={`flex-1 min-w-[120px] sm:min-w-[140px] px-3 py-2 rounded-lg transition flex items-center justify-center gap-1.5 ${
            activeTab === 'mindspace'
              ? 'bg-sky-950/80 border border-sky-700 text-sky-200 font-bold shadow-xs'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-[#121a14]'
          }`}
        >
          <Brain className="w-3.5 h-3.5 text-sky-400 shrink-0" />
          <span>2. Neural Mindspace</span>
        </button>
        <button
          onClick={() => setActiveTab('abilities')}
          className={`flex-1 min-w-[120px] sm:min-w-[140px] px-3 py-2 rounded-lg transition flex items-center justify-center gap-1.5 ${
            activeTab === 'abilities'
              ? 'bg-amber-950/80 border border-amber-700 text-amber-200 font-bold shadow-xs'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-[#121a14]'
          }`}
        >
          <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span>3. Ability Frame Data</span>
        </button>
        <button
          onClick={() => setActiveTab('hivemind')}
          className={`flex-1 min-w-[120px] sm:min-w-[140px] px-3 py-2 rounded-lg transition flex items-center justify-center gap-1.5 ${
            activeTab === 'hivemind'
              ? 'bg-emerald-950/80 border border-emerald-700 text-emerald-200 font-bold shadow-xs'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-[#121a14]'
          }`}
        >
          <Database className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span>4. Hivemind & Adapt</span>
        </button>
      </div>

      {/* TAB 1: Main Top-Down Arena & Entity Controls */}
      {activeTab === 'arena' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* Left Column: Top-Down 2D Radar Canvas & Quick Stats */}
        <div className="lg:col-span-7 space-y-3">
          <div className="p-3 sm:p-4 bg-[#0c0e0c] border border-[#1d251e] rounded-xl space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 min-h-[32px]">
              <div className="flex items-center gap-2 min-w-0 shrink">
                <Crosshair className="w-4 h-4 text-red-400 shrink-0" />
                <span className="font-serif text-sm font-bold text-[#e0e7e0] truncate">Top-Down 2D Physics Arena</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-900 text-zinc-300 border border-zinc-700 shrink-0 hidden sm:inline-block">
                  48m x 48m Scale
                </span>
              </div>
              <div className="text-[11px] font-mono text-[#8a9a8c] bg-[#121813] border border-[#1e2a20] px-2.5 py-1 rounded shrink-0 min-w-[190px] sm:min-w-[220px] h-7 flex items-center justify-between gap-2 overflow-hidden shadow-xs">
                <span className="text-zinc-500 uppercase text-[9.5px] font-semibold shrink-0">State:</span>
                <span className="text-red-400 font-bold tracking-tight truncate text-right">{state.combatState}</span>
              </div>
            </div>

            {/* Arena Radar Canvas */}
            <div className="relative rounded-lg overflow-hidden border border-[#1a241b] bg-[#060a07] aspect-square max-w-[520px] mx-auto flex items-center justify-center">
              <canvas
                ref={arenaCanvasRef}
                width={700}
                height={700}
                className="w-full h-full block"
              />

              {state.rotIsDead && (
                <div className="absolute inset-0 bg-black/75 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center z-10 animate-fade-in">
                  <div className="w-12 h-12 rounded-full bg-red-950/80 border-2 border-red-500 flex items-center justify-center text-red-400 mb-3 shadow-lg shadow-red-950">
                    <Skull className="w-6 h-6 animate-pulse" />
                  </div>
                  <h3 className="font-serif text-lg md:text-xl font-extrabold text-red-300">
                    THE ROT HAS BEEN SLAIN
                  </h3>
                  <p className="text-xs text-[#8a9a8c] mt-1 max-w-xs font-mono">
                    All cellular functions ceased. Shockwave pulse triggered.
                  </p>
                  <button
                    onClick={handleRespawnRot}
                    className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-mono font-bold rounded-lg transition shadow-lg shadow-red-950 flex items-center gap-2"
                  >
                    <RefreshCw className="w-4 h-4" />
                    RESPAWN THE ROT (550 HP)
                  </button>
                </div>
              )}
            </div>

            {/* Rot Health & Dynamic Adaptation Telemetry */}
            <div className="p-2.5 bg-[#111612] border border-[#1e2b20] rounded-lg grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
              <div>
                <div className="text-[9px] font-mono text-[#6b7280] uppercase">Rot Health</div>
                <div className="text-xs font-mono font-bold text-red-400">
                  {state.rotHealth.toFixed(1)} <span className="text-[9px] text-zinc-500">/ 550</span>
                </div>
              </div>
              <div>
                <div className="text-[9px] font-mono text-[#6b7280] uppercase">Adaptive Mitigation</div>
                <div className="text-xs font-mono font-bold text-sky-400">
                  +{(state.totalAdaptiveResistance * 100).toFixed(0)}% <span className="text-[9px] text-zinc-500">(15 Armor)</span>
                </div>
              </div>
              <div>
                <div className="text-[9px] font-mono text-[#6b7280] uppercase">Combat Surge Regen</div>
                <div className="text-xs font-mono font-bold text-emerald-400">
                  {state.rotHealth < state.rotMaxHealth ? '+5 to +28 HP/6t' : 'IDLE'}
                </div>
              </div>
              <div>
                <div className="text-[9px] font-mono text-[#6b7280] uppercase">Active Targets</div>
                <div className="text-xs font-mono font-bold text-amber-400">
                  {state.mobs.length + (state.playerSpawned && !state.playerIsDead ? 1 : 0)} Units
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Spawner, Loadout, and Manual Move Triggers */}
        <div className="lg:col-span-5 space-y-3">
          
          {/* Entity Spawner Card */}
          <div className="p-3 bg-[#0c0e0c] border border-[#1d251e] rounded-xl space-y-2.5">
            <div className="flex items-center justify-between border-b border-[#1a241b] pb-1.5">
              <span className="font-serif text-xs font-bold text-[#e0e7e0]">Entity Spawner</span>
              <span className="text-[9px] font-mono text-[#5a6b5e]">Authentic Java & Mod Stats</span>
            </div>

            <div className="space-y-2">
              <div>
                <div className="flex items-center gap-1.5">
                  <CustomSelect<ArenaMobType>
                    value={selectedSpawnMob}
                    onChange={val => setSelectedSpawnMob(val)}
                    widthClass="flex-1"
                    options={[
                      { value: 'warden', label: 'Warden (500 HP, Sonic Boom)' },
                      { value: 'iron_golem', label: 'Iron Golem (100 HP, Uppercut)' },
                      { value: 'vindicator', label: 'Vindicator (24 HP, Axe Sprint)' },
                      { value: 'enderman', label: 'Enderman (40 HP, Evasion TP)' },
                      { value: 'blaze', label: 'Blaze (20 HP, Fireball Volley)' },
                      { value: 'creeper', label: 'Creeper (20 HP, 49 DMG Fuse)' },
                      { value: 'skeleton', label: 'Skeleton (20 HP, Bow Charge)' },
                      { value: 'wither_skeleton', label: 'Wither Skeleton (20 HP, Wither I)' },
                      { value: 'zombie', label: 'Zombie (20 HP, Swarm Pursuit)' }
                    ]}
                  />
                  <CustomSelect<number>
                    value={spawnCount}
                    onChange={val => setSpawnCount(val)}
                    widthClass="w-18"
                    options={[
                      { value: 1, label: '1x' },
                      { value: 2, label: '2x' },
                      { value: 4, label: '4x' },
                      { value: 8, label: '8x' }
                    ]}
                  />
                </div>
              </div>

              <div className="flex gap-1.5">
                <button
                  onClick={handleSpawnMobs}
                  className="flex-1 px-2.5 py-1.5 bg-red-950/40 hover:bg-red-900/60 border border-red-800 text-red-300 text-xs font-mono font-bold rounded transition flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3 h-3" /> SPAWN MOBS
                </button>
                <button
                  onClick={handleClearMobs}
                  className="px-2.5 py-1.5 bg-[#141a15] hover:bg-[#1a221c] border border-[#2a382c] text-zinc-400 hover:text-zinc-200 text-xs font-mono rounded transition flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" /> CLEAR
                </button>
              </div>
            </div>

            {/* Player AI & Loadout Controls */}
            <div className="pt-2 border-t border-[#1a241b] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-[#8a9a8c]">Player AI & Loadout</span>
                <div className="flex items-center gap-1.5">
                  {state.playerIsDead && state.playerSpawned && (
                    <button
                      onClick={handleRespawnPlayer}
                      className="text-[9px] font-mono px-1.5 py-0.5 rounded border bg-emerald-950/40 text-emerald-300 border-emerald-800 hover:bg-emerald-900/60 transition flex items-center gap-1 cursor-pointer"
                    >
                      <RefreshCw className="w-2.5 h-2.5" /> RESPAWN
                    </button>
                  )}
                  <button
                    onClick={handleTogglePlayerSpawn}
                    className={`text-[9px] font-mono px-1.5 py-0.5 rounded border transition cursor-pointer ${
                      state.playerSpawned
                        ? 'bg-emerald-950/40 text-emerald-300 border-emerald-800'
                        : 'bg-zinc-900 text-zinc-500 border-zinc-800'
                    }`}
                  >
                    {state.playerSpawned ? 'PLAYER: SPAWNED' : 'PLAYER: DESPAWNED'}
                  </button>
                </div>
              </div>

              {state.playerSpawned && (
                <div className="space-y-1.5">
                  <CustomSelect<PlayerCombatMode>
                    value={playerMode}
                    onChange={val => setPlayerMode(val)}
                    widthClass="w-full"
                    options={[
                      { value: 'smart_auto', label: 'Smart Auto AI (Spacing, Crits, Totems, Mace)' },
                      { value: 'circle_strafe', label: 'Direct Goal Approach & Spacing' },
                      { value: 'turtle_shield', label: 'Turtle Shield Defense' },
                      { value: 'flee', label: 'Flee & Disengage' },
                      { value: 'manual', label: 'Stationary Dummy' }
                    ]}
                  />

                  <div className="p-2 bg-[#141a15] border border-[#253327] rounded flex items-center justify-between">
                    <span className="text-[10px] font-mono text-[#8a9a8c] flex items-center gap-1">
                      <ShieldAlert className="w-3 h-3 text-amber-400" />
                      Totems:
                    </span>
                    <div className="flex items-center gap-1">
                      {[0, 1, 3, 5, 10].map(preset => (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => setState(prev => ({ ...prev, playerTotems: preset }))}
                          className={`text-[9px] font-mono px-1.5 py-0.5 rounded border transition ${
                            state.playerTotems === preset
                              ? 'bg-amber-950/60 text-amber-300 border-amber-700 font-bold'
                              : 'bg-[#101511] text-zinc-400 border-[#223024] hover:text-zinc-200'
                          }`}
                        >
                          {preset}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Manual Minos Moves & Combo Triggers with Live Cooldowns */}
          <div className="p-3 bg-[#0c0e0c] border border-[#1d251e] rounded-xl space-y-2">
            <div className="flex items-center justify-between border-b border-[#1a241b] pb-1.5">
              <div className="flex items-center gap-1.5">
                <Swords className="w-3.5 h-3.5 text-amber-400" />
                <span className="font-serif text-xs font-bold text-[#e0e7e0]">Manual Minos Moves & Combo Triggers</span>
              </div>
              <span className="text-[9px] font-mono text-zinc-500">Instant</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
              <button
                onClick={() => triggerMove('thy_end_is_now')}
                disabled={state.cdThyEndIsNow > 0 || state.rotIsDead}
                className={`px-2 py-1.5 border rounded text-[10px] font-mono text-left transition flex items-center justify-between gap-1 min-w-0 ${
                  state.cdThyEndIsNow > 0
                    ? 'bg-zinc-900/60 border-zinc-800 text-zinc-500 cursor-not-allowed'
                    : 'bg-[#141a15] hover:bg-[#1f2b21] border-[#253327] hover:border-amber-700/60 text-amber-300'
                }`}
              >
                <span className="truncate">Thy End Is Now</span>
                {state.cdThyEndIsNow > 0 ? (
                  <span className="text-[9px] text-zinc-500 font-bold">{state.cdThyEndIsNow}t</span>
                ) : (
                  <ArrowRight className="w-2.5 h-2.5 text-amber-400/60 shrink-0" />
                )}
              </button>
              <button
                onClick={() => triggerMove('judgment')}
                disabled={state.cdJudgment > 0 || state.rotIsDead}
                className={`px-2 py-1.5 border rounded text-[10px] font-mono text-left transition flex items-center justify-between gap-1 min-w-0 ${
                  state.cdJudgment > 0
                    ? 'bg-zinc-900/60 border-zinc-800 text-zinc-500 cursor-not-allowed'
                    : 'bg-[#141a15] hover:bg-[#1f2b21] border-[#253327] hover:border-red-700/60 text-red-300'
                }`}
              >
                <span className="truncate">Judgment</span>
                {state.cdJudgment > 0 ? (
                  <span className="text-[9px] text-zinc-500 font-bold">{state.cdJudgment}t</span>
                ) : (
                  <ArrowRight className="w-2.5 h-2.5 text-red-400/60 shrink-0" />
                )}
              </button>
              <button
                onClick={() => triggerMove('prepare_thyself')}
                disabled={state.cdPrepareThyself > 0 || state.rotIsDead}
                className={`px-2 py-1.5 border rounded text-[10px] font-mono text-left transition flex items-center justify-between gap-1 min-w-0 ${
                  state.cdPrepareThyself > 0
                    ? 'bg-zinc-900/60 border-zinc-800 text-zinc-500 cursor-not-allowed'
                    : 'bg-[#141a15] hover:bg-[#1f2b21] border-[#253327] hover:border-purple-700/60 text-purple-300'
                }`}
              >
                <span className="truncate">Prepare Thyself</span>
                {state.cdPrepareThyself > 0 ? (
                  <span className="text-[9px] text-zinc-500 font-bold">{state.cdPrepareThyself}t</span>
                ) : (
                  <ArrowRight className="w-2.5 h-2.5 text-purple-400/60 shrink-0" />
                )}
              </button>
              <button
                onClick={() => triggerMove('die_overhead')}
                disabled={state.cdOverheadSlam > 0 || state.rotIsDead}
                className={`px-2 py-1.5 border rounded text-[10px] font-mono text-left transition flex items-center justify-between gap-1 min-w-0 ${
                  state.cdOverheadSlam > 0
                    ? 'bg-zinc-900/60 border-zinc-800 text-zinc-500 cursor-not-allowed'
                    : 'bg-[#141a15] hover:bg-[#1f2b21] border-[#253327] hover:border-fuchsia-700/60 text-fuchsia-300'
                }`}
              >
                <span className="truncate">Die! Slam</span>
                {state.cdOverheadSlam > 0 ? (
                  <span className="text-[9px] text-zinc-500 font-bold">{state.cdOverheadSlam}t</span>
                ) : (
                  <ArrowRight className="w-2.5 h-2.5 text-fuchsia-400/60 shrink-0" />
                )}
              </button>
              <button
                onClick={() => triggerMove('heavy_punch')}
                disabled={state.cdHeavyStrike > 0 || state.rotIsDead}
                className={`px-2 py-1.5 border rounded text-[10px] font-mono text-left transition flex items-center justify-between gap-1 min-w-0 ${
                  state.cdHeavyStrike > 0
                    ? 'bg-zinc-900/60 border-zinc-800 text-zinc-500 cursor-not-allowed'
                    : 'bg-[#141a15] hover:bg-[#1f2b21] border-[#253327] hover:border-rose-700/60 text-rose-300'
                }`}
              >
                <span className="truncate">Heavy Strike</span>
                {state.cdHeavyStrike > 0 ? (
                  <span className="text-[9px] text-zinc-500 font-bold">{state.cdHeavyStrike}t</span>
                ) : (
                  <ArrowRight className="w-2.5 h-2.5 text-rose-400/60 shrink-0" />
                )}
              </button>
              <button
                onClick={() => triggerMove('solar_laser')}
                disabled={state.cdSolarLaser > 0 || state.rotIsDead}
                className={`px-2 py-1.5 border rounded text-[10px] font-mono text-left transition flex items-center justify-between gap-1 min-w-0 ${
                  state.cdSolarLaser > 0
                    ? 'bg-zinc-900/60 border-zinc-800 text-zinc-500 cursor-not-allowed'
                    : 'bg-[#141a15] hover:bg-[#1f2b21] border-[#253327] hover:border-orange-700/60 text-orange-300'
                }`}
              >
                <span className="truncate">Solar Beam</span>
                {state.cdSolarLaser > 0 ? (
                  <span className="text-[9px] text-zinc-500 font-bold">{state.cdSolarLaser}t</span>
                ) : (
                  <ArrowRight className="w-2.5 h-2.5 text-orange-400/60 shrink-0" />
                )}
              </button>
            </div>
          </div>

          {/* Combat Telemetry Log */}
          <div className="p-3 bg-[#0c0e0c] border border-[#1d251e] rounded-xl space-y-2">
            <div className="flex items-center justify-between border-b border-[#1a241b] pb-1.5">
              <div className="flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                <span className="font-serif text-xs font-bold text-[#e0e7e0]">Combat Telemetry Log</span>
              </div>
              <button
                onClick={() => setLogs([])}
                className="text-[9px] font-mono text-[#6b7280] hover:text-[#a1a1aa]"
              >
                Clear Log
              </button>
            </div>

            <div className="h-32 overflow-y-auto font-mono text-[9.5px] space-y-1 pr-1 select-text bg-[#060a07] p-2.5 rounded-lg border border-[#141c16]">
              {logs.length === 0 ? (
                <div className="text-zinc-600 italic">No combat events recorded yet.</div>
              ) : (
                logs.map((log, i) => (
                  <div
                    key={i}
                    className={`leading-tight ${
                      log.includes('[DEATH]') || log.includes('[SHIELD BREAK]') || log.includes('[CREEPER')
                        ? 'text-red-400 font-semibold'
                        : log.includes('[MINOS') || log.includes('[COMBO') || log.includes('[IMPACT')
                        ? 'text-amber-300'
                        : log.includes('[TOTEM')
                        ? 'text-yellow-400 font-bold'
                        : log.includes('[PLAYER')
                        ? 'text-emerald-400'
                        : 'text-[#8a9a8c]'
                    }`}
                  >
                    {log}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
      )}

      {/* TAB 2: Full-Width HD Connected-Circles Neural Mindspace (Interactive Brain Graph) */}
      {activeTab === 'mindspace' && (
      <div className="p-6 bg-[#0c0e0c] border border-[#1d251e] rounded-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1a241b] pb-4">
          <div className="flex items-center gap-2.5">
            <Brain className="w-5 h-5 text-purple-400" />
            <div>
              <h2 className="font-serif text-lg font-bold text-[#e0e7e0]">
                Connected-Circle Neural Mindspace Architecture
              </h2>
              <p className="text-xs text-[#8a9a8c]">
                Fully interconnected neural network with real-time synaptic signal routing, Minos FSM arbiter, and physical actuators.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-3 py-1.5 bg-[#111612] border border-[#1e2b20] rounded-lg text-xs font-mono flex items-center justify-between gap-2.5 min-w-[210px] h-8 shrink-0 shadow-xs">
              <span className="text-zinc-500 uppercase text-[10px] shrink-0 font-semibold">Active State:</span>
              <span className="text-amber-400 font-bold tracking-tight truncate text-right">{state.combatState}</span>
            </div>
          </div>
        </div>

        {/* Interactive Lobe Filter Bar */}
        <div className="flex flex-wrap items-center gap-2 text-xs font-mono p-2 bg-[#080c09] border border-[#18241b] rounded-lg">
          <span className="text-zinc-500 font-semibold uppercase text-[10px] pr-1">Filter Lobe:</span>
          {[
            { id: 'ALL', label: 'All Subsystems', color: '#a1a1aa' },
            { id: 'PlayerBehaviorTracker', label: 'Sensory Bus', color: '#38bdf8' },
            { id: 'TacticalNeuralNetwork', label: '96-Dim Tensor', color: '#818cf8' },
            { id: 'BiologicalAdaptation', label: 'Biological Adaptation', color: '#34d399' },
            { id: 'Nexus', label: 'Master Nexus', color: '#c084fc' },
            { id: 'MinosFSM', label: 'Minos Combat FSM', color: '#fbbf24' },
            { id: 'Actuators', label: 'Physical Actuators', color: '#f43f5e' }
          ].map(lobe => (
            <button
              key={lobe.id}
              onClick={() => setSelectedLobeFilter(lobe.id)}
              className={`px-2.5 py-1 rounded text-[11px] font-mono transition flex items-center gap-1.5 ${
                selectedLobeFilter === lobe.id
                  ? 'bg-zinc-800 text-white font-bold border border-zinc-600 shadow-xs'
                  : 'bg-[#101611] text-zinc-400 hover:text-zinc-200 border border-[#1e2a20]'
              }`}
            >
              <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: lobe.color }}></span>
              <span>{lobe.label}</span>
            </button>
          ))}
        </div>

        {/* Connected Circular Brain SVG Graph */}
        <div className="relative rounded-xl border border-[#1a261c] bg-[#050806] overflow-hidden p-2">
          <svg
            viewBox="0 0 1020 540"
            className="w-full h-auto block select-none"
            style={{ minHeight: '420px' }}
          >
            {/* Subtle Precision Grid Background */}
            <g opacity="0.04">
              {Array.from({ length: 26 }).map((_, i) => (
                <line key={`gx_${i}`} x1={i * 40} y1="0" x2={i * 40} y2="540" stroke="#4ade80" strokeWidth="1" />
              ))}
              {Array.from({ length: 15 }).map((_, i) => (
                <line key={`gy_${i}`} x1="0" y1={i * 40} x2="1020" y2={i * 40} stroke="#4ade80" strokeWidth="1" />
              ))}
            </g>

            {/* SVG Engineering Telemetry Header */}
            <g opacity="0.6">
              <text x="14" y="22" fill="#71717a" fontSize="9" fontFamily="monospace" fontWeight="600">
                CORE CLOCK: 20.0 TPS (50ms) • TOPOLOGY: 8 IN → 16 HIDDEN (tanh) → 6 ACTION OUT (softmax)
              </text>
              <text x="1006" y="22" textAnchor="end" fill="#52525b" fontSize="9" fontFamily="monospace">
                SYNAPTIC WEIGHTS: 224 ACTIVE TENSORS • KINEMATIC RESOLUTION: 0.05m
              </text>
            </g>

            {/* Architectural Lobe Region Boundaries (Subtle Subsystem Enclosures) */}
            <g opacity="0.25">
              {[
                { x: 25, y: 50, w: 165, h: 460, label: 'LOBE 01: SENSORY AFFERENTS', color: '#38bdf8' },
                { x: 200, y: 50, w: 168, h: 460, label: 'LOBE 02: PERCEPTION & ADAPTATION', color: '#34d399' },
                { x: 380, y: 50, w: 175, h: 460, label: 'LOBE 03: REFLEX CORE & KINEMATICS', color: '#818cf8' },
                { x: 570, y: 50, w: 145, h: 460, label: 'LOBE 04: EXECUTIVE NEXUS', color: '#c084fc' },
                { x: 728, y: 50, w: 145, h: 460, label: 'LOBE 05: COMBAT FSM', color: '#fbbf24' },
                { x: 885, y: 50, w: 120, h: 460, label: 'LOBE 06: MOTOR EFFERENTS', color: '#f43f5e' }
              ].map((zone, zIdx) => (
                <g key={`zone_${zIdx}`}>
                  <rect
                    x={zone.x}
                    y={zone.y}
                    width={zone.w}
                    height={zone.h}
                    rx="10"
                    fill="none"
                    stroke={zone.color}
                    strokeWidth="0.8"
                    strokeDasharray="4 6"
                    strokeOpacity="0.4"
                  />
                  <text
                    x={zone.x + 8}
                    y={zone.y + 14}
                    fill={zone.color}
                    fontSize="7.5"
                    fontFamily="monospace"
                    fontWeight="bold"
                    opacity="0.75"
                  >
                    {zone.label}
                  </text>
                </g>
              ))}
            </g>

            {/* 1. Static Clean Synaptic Connection Pathways with Micro Sheath Nodes */}
            {brainSynapses.map((syn, synIndex) => {
              const fromN = brainNodes.find(n => n.id === syn.from);
              const toN = brainNodes.find(n => n.id === syn.to);
              if (!fromN || !toN) return null;

              const isDimmed = selectedLobeFilter !== 'ALL' && fromN.lobe !== selectedLobeFilter && toN.lobe !== selectedLobeFilter;
              const c1X = fromN.x + (toN.x - fromN.x) * 0.5;
              const c1Y = fromN.y;
              const c2X = fromN.x + (toN.x - fromN.x) * 0.5;
              const c2Y = toN.y;
              const pathD = `M ${fromN.x} ${fromN.y} C ${c1X} ${c1Y}, ${c2X} ${c2Y}, ${toN.x} ${toN.y}`;
              const isHighlighted = selectedNodeId === syn.from || selectedNodeId === syn.to;
              const midX = (fromN.x + toN.x) * 0.5;
              const midY = (fromN.y + toN.y) * 0.5;

              return (
                <g key={syn.id} opacity={isDimmed ? 0.12 : 1}>
                  {/* Clean Hairline Axon Path */}
                  <path
                    d={pathD}
                    fill="none"
                    stroke={syn.active ? syn.color : '#1c241e'}
                    strokeWidth={isHighlighted ? 2.0 : 1.0}
                    strokeOpacity={isHighlighted ? 0.95 : syn.active ? 0.55 : 0.20}
                  />

                  {/* Active Synaptic Pathway Static Accent */}
                  {syn.active && (
                    <path
                      d={pathD}
                      fill="none"
                      stroke={syn.color}
                      strokeWidth={isHighlighted ? 2.0 : 1.2}
                      strokeOpacity={isHighlighted ? 0.75 : 0.40}
                      strokeDasharray="4 4"
                    />
                  )}

                  {/* Synaptic Myelin Sheath Accent Node (Midpoint Micro-Notch) */}
                  {syn.active && synIndex % 2 === 0 && (
                    <circle
                      cx={midX}
                      cy={midY}
                      r="1.8"
                      fill={syn.color}
                      opacity={isHighlighted ? 0.9 : 0.6}
                    />
                  )}
                </g>
              );
            })}

            {/* 2. Detailed Connected Circular Biological Neurons (100% Motionless on Hover) */}
            {brainNodes.map(node => {
              const isSelected = selectedNodeId === node.id;
              const isDimmed = selectedLobeFilter !== 'ALL' && node.lobe !== selectedLobeFilter;
              const IconComp = node.icon;
              const isBottomRow = node.y > 400;

              // 5 Authentic Radial Dendrite Filaments radiating from Soma Membrane
              const dendriteAngles = [32, 90, 150, 215, 310];
              // 8 Outer Ion-Channel Micro Ticks
              const ionTicks = [0, 45, 90, 135, 180, 225, 270, 315];

              return (
                <g
                  key={node.id}
                  transform={`translate(${node.x}, ${node.y})`}
                  opacity={isDimmed ? 0.20 : 1}
                  className="cursor-pointer select-none"
                  style={{ pointerEvents: 'auto', transition: 'none' }}
                  onClick={() => setSelectedNodeId(node.id)}
                >
                  {/* Selection Precision Reticle */}
                  {isSelected && (
                    <circle
                      r={node.r + 9}
                      fill="none"
                      stroke="#ffffff"
                      strokeWidth="1.2"
                      strokeDasharray="2 3"
                      strokeOpacity="0.95"
                    />
                  )}

                  {/* Biological Dendritic Micro-Filaments (Neuron Spines) */}
                  {dendriteAngles.map((deg, dIdx) => {
                    const rad = (deg * Math.PI) / 180;
                    const x1 = Math.cos(rad) * node.r;
                    const y1 = Math.sin(rad) * node.r;
                    const spineLen = dIdx % 2 === 0 ? 7.0 : 5.5;
                    const x2 = Math.cos(rad) * (node.r + spineLen);
                    const y2 = Math.sin(rad) * (node.r + spineLen);

                    return (
                      <g key={`dend_${dIdx}`}>
                        <line
                          x1={x1}
                          y1={y1}
                          x2={x2}
                          y2={y2}
                          stroke={node.active ? node.color : '#3f3f46'}
                          strokeWidth="1.2"
                          strokeOpacity={node.active ? 0.85 : 0.35}
                        />
                        {/* Terminal Bouton (Synaptic Bulb) */}
                        <circle
                          cx={x2}
                          cy={y2}
                          r="1.4"
                          fill={node.active ? node.color : '#52525b'}
                        />
                      </g>
                    );
                  })}

                  {/* Outer Ion-Channel Membrane Ticks */}
                  {ionTicks.map((deg, tIdx) => {
                    const rad = (deg * Math.PI) / 180;
                    const tx1 = Math.cos(rad) * (node.r + 2.0);
                    const ty1 = Math.sin(rad) * (node.r + 2.0);
                    const tx2 = Math.cos(rad) * (node.r + 3.8);
                    const ty2 = Math.sin(rad) * (node.r + 3.8);
                    return (
                      <line
                        key={`ion_${tIdx}`}
                        x1={tx1}
                        y1={ty1}
                        x2={tx2}
                        y2={ty2}
                        stroke={node.active ? node.color : '#27272a'}
                        strokeWidth="0.8"
                        strokeOpacity={node.active ? 0.6 : 0.3}
                      />
                    );
                  })}

                  {/* Outer Activation Scalar Arc Meter */}
                  <circle
                    r={node.r + 3.0}
                    fill="none"
                    stroke={node.active ? node.color : '#18201b'}
                    strokeWidth="1.0"
                    strokeDasharray={`${(node.r + 3.0) * Math.PI * 1.2} ${(node.r + 3.0) * Math.PI * 0.8}`}
                    strokeOpacity={node.active ? 0.8 : 0.25}
                  />

                  {/* Primary Cellular Soma (Clean Bio-Glass Membrane) */}
                  <circle
                    r={node.r}
                    fill="#070a08"
                    stroke={isSelected ? '#ffffff' : node.active ? node.color : '#27272a'}
                    strokeWidth={isSelected ? 2 : node.active ? 1.5 : 1}
                  />

                  {/* Concentric Cellular Nucleus with Micro Circuit Ring */}
                  <circle
                    r={node.r * 0.45}
                    fill={node.active ? `${node.color}22` : '#0f1410'}
                    stroke={node.active ? `${node.color}50` : '#18201b'}
                    strokeWidth="1"
                  />

                  {/* Central Core Ion Pip */}
                  <circle
                    r={2.0}
                    fill={node.active ? node.color : '#52525b'}
                  />

                  {/* Centered Minimalist Glyph Icon */}
                  <foreignObject
                    x={-10}
                    y={-10}
                    width={20}
                    height={20}
                    className="pointer-events-none"
                  >
                    <div className="w-full h-full flex items-center justify-center">
                      <IconComp
                        className="w-3 h-3"
                        style={{ color: node.active ? node.color : '#71717a' }}
                      />
                    </div>
                  </foreignObject>

                  {/* Minimalist Scientific Monospace Label */}
                  <text
                    y={isBottomRow ? -node.r - 8 : node.r + 13}
                    textAnchor="middle"
                    fill="#e4e4e7"
                    fontSize="9.5"
                    fontFamily="monospace"
                    fontWeight="600"
                    className="pointer-events-none"
                  >
                    {node.label}
                  </text>

                  {/* Stable Subtitle Badge (Completely Motionless & Non-Jittering) */}
                  <text
                    y={isBottomRow ? -node.r - 19 : node.r + 23}
                    textAnchor="middle"
                    fill={node.active ? node.color : '#71717a'}
                    fontSize="8.5"
                    fontFamily="monospace"
                    fontWeight="500"
                    className="pointer-events-none"
                  >
                    {node.badge}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Informative & Categorized 96-Dimensional Sensory Tensor Vector Bus */}
        <div className="p-3.5 bg-[#070b08] border border-[#18251a] rounded-xl space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-[#141d15] pb-2">
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-indigo-400 shrink-0" />
              <span className="font-serif text-xs font-bold text-[#e0e7e0]">
                Tactical Neural Network: 96-Dimensional Sensory Input Tensor Bus
              </span>
            </div>
            <div className="text-[10px] font-mono text-zinc-400">
              <span className="text-indigo-400 font-bold">96 Normalized Floating Inputs</span> • 48 Hidden Tensor (ReLU) • 15 Action Distributions
            </div>
          </div>

          {/* Categorized 6-Channel Telemetry Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5 text-xs font-mono">
            {/* 1. Kinematics & Spatial Geometry */}
            <div className="p-2.5 bg-[#0b100c] border border-[#1b271d] rounded-lg space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-sky-400 font-bold text-[11px] flex items-center gap-1">
                  <Target className="w-3 h-3" /> [00..15] Kinematics & Space
                </span>
                <span className="text-[9px] px-1.5 py-0.2 rounded bg-sky-950/60 text-sky-300 border border-sky-800">
                  16 Channels
                </span>
              </div>
              <div className="space-y-1 text-[10px] text-zinc-400">
                <div className="flex justify-between">
                  <span>Target Distance:</span>
                  <span className="text-sky-300 font-bold">{state.distanceToTarget.toFixed(1)}m (Norm: {Math.min(1.0, state.distanceToTarget / 15.0).toFixed(2)})</span>
                </div>
                <div className="flex justify-between">
                  <span>Velocity Vector:</span>
                  <span className="text-zinc-300">ΔX:{state.rotDeltaX.toFixed(2)} ΔZ:{state.rotDeltaZ.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Target Lead Position:</span>
                  <span className="text-zinc-300">({state.predictedTargetX.toFixed(1)}, {state.predictedTargetZ.toFixed(1)})</span>
                </div>
              </div>
              <div className="w-full bg-zinc-900 h-1.5 rounded overflow-hidden">
                <div className="bg-sky-400 h-full transition-all duration-300" style={{ width: `${Math.min(100, (state.distanceToTarget / 15.0) * 100)}%` }} />
              </div>
            </div>

            {/* 2. Entity Vitals & Dynamic Mitigation */}
            <div className="p-2.5 bg-[#0b100c] border border-[#1b271d] rounded-lg space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-emerald-400 font-bold text-[11px] flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> [16..31] Vitals & Mitigation
                </span>
                <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-950/60 text-emerald-300 border border-emerald-800">
                  16 Channels
                </span>
              </div>
              <div className="space-y-1 text-[10px] text-zinc-400">
                <div className="flex justify-between">
                  <span>Rot Health Ratio:</span>
                  <span className="text-red-400 font-bold">{state.rotHealth.toFixed(0)}/550 ({(state.rotHealth / state.rotMaxHealth * 100).toFixed(0)}%)</span>
                </div>
                <div className="flex justify-between">
                  <span>Target Health:</span>
                  <span className="text-emerald-300">{state.playerHealth.toFixed(1)} HP {state.playerAbsorption > 0 ? `+${state.playerAbsorption.toFixed(0)} Abs` : ''}</span>
                </div>
                <div className="flex justify-between">
                  <span>Adaptive Resistance:</span>
                  <span className="text-emerald-400 font-bold">+{(state.totalAdaptiveResistance * 100).toFixed(0)}% (15 Armor)</span>
                </div>
              </div>
              <div className="w-full bg-zinc-900 h-1.5 rounded overflow-hidden">
                <div className="bg-emerald-400 h-full transition-all duration-300" style={{ width: `${(state.totalAdaptiveResistance / 0.8) * 100}%` }} />
              </div>
            </div>

            {/* 3. Minos Ability Cooldown Clocks */}
            <div className="p-2.5 bg-[#0b100c] border border-[#1b271d] rounded-lg space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-amber-400 font-bold text-[11px] flex items-center gap-1">
                  <Clock className="w-3 h-3" /> [32..47] Ability Cooldowns
                </span>
                <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-950/60 text-amber-300 border border-amber-800">
                  16 Channels
                </span>
              </div>
              <div className="space-y-1 text-[10px] text-zinc-400">
                <div className="flex justify-between">
                  <span>Thy End Is Now / Judgment:</span>
                  <span className="text-amber-300">{state.cdThyEndIsNow}t / {state.cdJudgment}t</span>
                </div>
                <div className="flex justify-between">
                  <span>Prepare Thyself / Slam:</span>
                  <span className="text-amber-300">{state.cdPrepareThyself}t / {state.cdOverheadSlam}t</span>
                </div>
                <div className="flex justify-between">
                  <span>Solar Raycast Beam:</span>
                  <span className="text-orange-400">{state.cdSolarLaser > 0 ? `${state.cdSolarLaser}t CD` : 'READY (0.0)'}</span>
                </div>
              </div>
              <div className="w-full bg-zinc-900 h-1.5 rounded overflow-hidden">
                <div className="bg-amber-400 h-full transition-all duration-300" style={{ width: `${Math.max(10, Math.min(100, (state.cdThyEndIsNow / 150) * 100))}%` }} />
              </div>
            </div>

            {/* 4. Player Combat Cadence & Welford Stats */}
            <div className="p-2.5 bg-[#0b100c] border border-[#1b271d] rounded-lg space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-purple-400 font-bold text-[11px] flex items-center gap-1">
                  <Activity className="w-3 h-3" /> [48..63] Player Cadence (Welford)
                </span>
                <span className="text-[9px] px-1.5 py-0.2 rounded bg-purple-950/60 text-purple-300 border border-purple-800">
                  16 Channels
                </span>
              </div>
              <div className="space-y-1 text-[10px] text-zinc-400">
                <div className="flex justify-between">
                  <span>Distance Welford:</span>
                  <span className="text-purple-300">μ={state.welfordDistance.mean.toFixed(1)}m σ={state.welfordDistance.stdDev.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Attack Interval Z-Score:</span>
                  <span className="text-purple-300">Z={state.welfordAttackInterval.zScore.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shield Blocking State:</span>
                  <span className={state.playerIsBlocking ? 'text-rose-400 font-bold' : 'text-zinc-500'}>
                    {state.playerIsBlocking ? 'BLOCKING (Shield Crusher Trigger)' : 'OPEN / UNGUARDED'}
                  </span>
                </div>
              </div>
              <div className="w-full bg-zinc-900 h-1.5 rounded overflow-hidden">
                <div className="bg-purple-400 h-full transition-all duration-300" style={{ width: `${Math.min(100, Math.abs(state.welfordAttackInterval.zScore) * 35)}%` }} />
              </div>
            </div>

            {/* 5. Threat Radar & Crowd Geometry */}
            <div className="p-2.5 bg-[#0b100c] border border-[#1b271d] rounded-lg space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-rose-400 font-bold text-[11px] flex items-center gap-1">
                  <Swords className="w-3 h-3" /> [64..79] Threat & Projectile Radar
                </span>
                <span className="text-[9px] px-1.5 py-0.2 rounded bg-rose-950/60 text-rose-300 border border-rose-800">
                  16 Channels
                </span>
              </div>
              <div className="space-y-1 text-[10px] text-zinc-400">
                <div className="flex justify-between">
                  <span>Active Combat Threats:</span>
                  <span className="text-rose-300 font-bold">{state.mobs.length + (state.playerSpawned && !state.playerIsDead ? 1 : 0)} Units</span>
                </div>
                <div className="flex justify-between">
                  <span>Projectiles / Shockwaves:</span>
                  <span className="text-zinc-300">{state.projectiles.length} Arrows / {state.shockwaves.length} Waves</span>
                </div>
                <div className="flex justify-between">
                  <span>Composite Threat Score:</span>
                  <span className="text-rose-400 font-bold">{(state.universalEngine.compositeThreatScore * 100).toFixed(0)}%</span>
                </div>
              </div>
              <div className="w-full bg-zinc-900 h-1.5 rounded overflow-hidden">
                <div className="bg-rose-400 h-full transition-all duration-300" style={{ width: `${state.universalEngine.compositeThreatScore * 100}%` }} />
              </div>
            </div>

            {/* 6. Strategic Hivemind & Role Auction */}
            <div className="p-2.5 bg-[#0b100c] border border-[#1b271d] rounded-lg space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-indigo-400 font-bold text-[11px] flex items-center gap-1">
                  <Database className="w-3 h-3" /> [80..95] Hivemind & Role Auction
                </span>
                <span className="text-[9px] px-1.5 py-0.2 rounded bg-indigo-950/60 text-indigo-300 border border-indigo-800">
                  16 Channels
                </span>
              </div>
              <div className="space-y-1 text-[10px] text-zinc-400">
                <div className="flex justify-between">
                  <span>Active Role Allocation:</span>
                  <span className="text-indigo-300 font-bold">{state.roleAuction.activeRole} ({(state.roleAuction.bidUtility * 100).toFixed(0)}%)</span>
                </div>
                <div className="flex justify-between">
                  <span>Hivemind Global Encounters:</span>
                  <span className="text-zinc-300">{state.hivemindData.globalEncounters} Recorded</span>
                </div>
                <div className="flex justify-between">
                  <span>Swarm Dominance Index:</span>
                  <span className="text-emerald-400">{(state.hivemindData.swarmDominanceIndex * 100).toFixed(0)}%</span>
                </div>
              </div>
              <div className="w-full bg-zinc-900 h-1.5 rounded overflow-hidden">
                <div className="bg-indigo-400 h-full transition-all duration-300" style={{ width: `${state.roleAuction.bidUtility * 100}%` }} />
              </div>
            </div>
          </div>
        </div>

        {/* Selected Neural Node Inspector */}
        {selectedNodeObj && (
          <div className="p-4 bg-[#090d0a] border border-[#1a251b] rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-full border-2 flex items-center justify-center shrink-0"
                style={{
                  borderColor: selectedNodeObj.color,
                  backgroundColor: `${selectedNodeObj.color}15`
                }}
              >
                {React.createElement(selectedNodeObj.icon, {
                  className: 'w-6 h-6',
                  style: { color: selectedNodeObj.color }
                })}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-serif text-sm font-bold text-[#e0e7e0]">
                    {selectedNodeObj.label}
                  </span>
                  <span
                    className="text-[9px] font-mono px-2 py-0.5 rounded font-bold"
                    style={{
                      backgroundColor: `${selectedNodeObj.color}22`,
                      color: selectedNodeObj.color,
                      border: `1px solid ${selectedNodeObj.color}44`
                    }}
                  >
                    {selectedNodeObj.badge}
                  </span>
                  <span className="text-[10px] font-mono text-zinc-500">
                    [{selectedNodeObj.lobe}]
                  </span>
                </div>
                <p className="text-xs text-[#8a9a8c] mt-0.5 max-w-2xl">
                  {selectedNodeObj.desc}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0 self-end md:self-auto">
              <div className="text-right">
                <div className="text-[9px] font-mono text-zinc-500 uppercase">Live Output</div>
                <div
                  className="font-mono text-sm font-bold"
                  style={{ color: selectedNodeObj.color }}
                >
                  {selectedNodeObj.val}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      )}

      {/* TAB 3: The Rot's Ability Timing, Cooldowns & Frame Data Matrix */}
      {activeTab === 'abilities' && (
      <div className="p-4 bg-[#0c0e0c] border border-[#1d251e] rounded-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#1a241b] pb-3">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-400" />
            <div>
              <h2 className="font-serif text-base font-bold text-[#e0e7e0]">
                The Rot: Ability Timing, Cooldowns & Frame Data Registry
              </h2>
              <p className="text-[11px] text-[#8a9a8c]">
                Exact per-tick timing, windup frames, active collision windows, recovery duration, and mass knockback impulses from Java source.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-[11px] font-mono px-2.5 py-1 rounded-lg bg-[#111612] border border-[#1e2b20] text-zinc-400">
            <span>Tick Standard:</span>
            <span className="text-emerald-400 font-bold">20 TPS (50ms/t)</span>
          </div>
        </div>

        {/* Ability Matrix Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {Object.entries(ROTS_ABILITY_REGISTRY).map(([key, ability]) => {
            let currentCd = 0;
            if (key === 'thy_end_is_now') currentCd = state.cdThyEndIsNow;
            else if (key === 'judgment') currentCd = state.cdJudgment;
            else if (key === 'prepare_thyself') currentCd = state.cdPrepareThyself;
            else if (key === 'overhead_slam') currentCd = state.cdOverheadSlam;
            else if (key === 'heavy_strike') currentCd = state.cdHeavyStrike;
            else if (key === 'solar_laser') currentCd = state.cdSolarLaser;
            else if (key === 'surge_regeneration') currentCd = state.cdSurgeRegen;

            // Live cast state computation
            let isCasting = false;
            let livePhaseLabel = '';
            let livePhaseType: 'windup' | 'active' | 'recovery' = 'windup';
            let liveTicksLeft = 0;

            if (key === 'thy_end_is_now' && state.minosComboStep > 0) {
              isCasting = true;
              const isWindup = state.minosComboStep === 4 && state.minosComboTicks > 2;
              livePhaseType = isWindup ? 'windup' : 'active';
              livePhaseLabel = isWindup ? 'WINDUP (APEX FREEZE)' : `COMBO STEP ${state.minosComboStep}/4`;
              liveTicksLeft = state.minosComboTicks;
            } else if (key === 'judgment' && state.dropkickPhase > 0) {
              isCasting = true;
              livePhaseType = state.dropkickPhase === 1 ? 'windup' : 'active';
              livePhaseLabel = state.dropkickPhase === 1 ? 'WINDUP (ASCENT)' : 'SUPERSONIC DIVE';
              liveTicksLeft = state.dropkickTicks;
            } else if (key === 'prepare_thyself' && state.prepareThyselfPhase > 0) {
              isCasting = true;
              livePhaseType = state.prepareThyselfPhase === 1 ? 'windup' : 'active';
              livePhaseLabel = state.prepareThyselfPhase === 1 ? 'BLINDSPOT WARP' : 'TWIN CROSS SLASH';
              liveTicksLeft = state.prepareThyselfTicks;
            } else if (key === 'overhead_slam' && state.overheadPhase > 0) {
              isCasting = true;
              livePhaseType = state.overheadPhase === 1 ? 'windup' : 'active';
              livePhaseLabel = state.overheadPhase === 1 ? 'HIGH LEAP APEX' : 'GROUND SMASH';
              liveTicksLeft = state.overheadTicks;
            } else if (key === 'heavy_strike' && state.heavyPunchTicks > 0) {
              isCasting = true;
              livePhaseType = state.heavyPunchTicks > 6 ? 'windup' : 'active';
              livePhaseLabel = state.heavyPunchTicks > 6 ? 'WINDUP' : 'UPPERCUT HITBOX';
              liveTicksLeft = state.heavyPunchTicks;
            } else if (key === 'solar_laser' && (state.laserChargingTicks > 0 || state.laserFiringTicks > 0 || state.laserClosingTicks > 0)) {
              isCasting = true;
              const isWindup = state.laserChargingTicks > 0;
              const isFiring = state.laserFiringTicks > 0;
              livePhaseType = isWindup ? 'windup' : isFiring ? 'active' : 'recovery';
              livePhaseLabel = isWindup ? 'THERMAL CHARGE' : isFiring ? 'SOLAR BEAM SWEEP' : 'COOLING RECOVERY';
              liveTicksLeft = isWindup ? state.laserChargingTicks : isFiring ? state.laserFiringTicks : state.laserClosingTicks;
            }

            return (
              <div
                key={ability.id}
                className={`p-4 bg-[#0a0f0b] border rounded-xl space-y-3 relative overflow-hidden flex flex-col justify-between transition-all ${
                  isCasting
                    ? 'border-red-500 shadow-lg shadow-red-950/60 ring-1 ring-red-500/50'
                    : currentCd > 0
                    ? 'border-[#1b271d] opacity-90'
                    : 'border-[#1b271d] hover:border-[#2a3c2e]'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="text-[10px] font-mono text-zinc-500 uppercase flex items-center gap-1.5">
                        <span>{ability.id}</span>
                        {isCasting && (
                          <span className="inline-flex items-center gap-1 text-[9px] font-bold text-red-400 bg-red-950/80 px-1.5 py-0.5 rounded border border-red-700 animate-pulse">
                            <Activity className="w-2.5 h-2.5" /> LIVE CASTING
                          </span>
                        )}
                      </div>
                      <h3 className="font-serif text-sm font-bold text-[#e0e7e0] mt-0.5">{ability.name}</h3>
                    </div>
                    <span
                      className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded border ${
                        isCasting
                          ? 'bg-red-950/80 text-red-300 border-red-700'
                          : currentCd > 0
                          ? 'bg-amber-950/40 text-amber-300 border-amber-800'
                          : 'bg-emerald-950/40 text-emerald-300 border-emerald-800'
                      }`}
                    >
                      {isCasting ? `${livePhaseLabel} (${liveTicksLeft}t)` : currentCd > 0 ? `CD: ${currentCd}t` : 'READY'}
                    </span>
                  </div>

                  <p className="text-xs text-[#8a9a8c] mt-2 leading-relaxed">
                    {ability.description}
                  </p>
                </div>

                <div className="space-y-2 pt-3 border-t border-[#162017]">
                  <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono">
                    <div className="p-1.5 bg-[#101712] rounded border border-[#1b271d]">
                      <div className="text-[9px] text-zinc-500">Cooldown</div>
                      <div className="font-bold text-amber-300">{ability.cooldownMaxTicks}t ({(ability.cooldownMaxTicks / 20).toFixed(1)}s)</div>
                    </div>
                    <div className="p-1.5 bg-[#101712] rounded border border-[#1b271d]">
                      <div className="text-[9px] text-zinc-500">Base Damage</div>
                      <div className="font-bold text-red-400">{ability.rawDamage} HP</div>
                    </div>
                    <div className="p-1.5 bg-[#101712] rounded border border-[#1b271d]">
                      <div className="text-[9px] text-zinc-500">Impulse</div>
                      <div className="font-bold text-sky-300">{ability.shockwaveImpulse} N·s</div>
                    </div>
                  </div>

                  {/* Frame Data & Live Execution Bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px] font-mono text-zinc-400">
                      <span className={isCasting && livePhaseType === 'windup' ? 'text-amber-300 font-bold' : ''}>
                        Windup: {ability.windupTicks}t
                      </span>
                      <span className={isCasting && livePhaseType === 'active' ? 'text-red-400 font-bold animate-pulse' : ''}>
                        Active: {ability.activeTicks}t
                      </span>
                      <span className={isCasting && livePhaseType === 'recovery' ? 'text-sky-300 font-bold' : ''}>
                        Recovery: {ability.recoveryTicks}t
                      </span>
                    </div>
                    <div className="w-full h-2 rounded bg-zinc-900 overflow-hidden flex relative">
                      <div
                        className={`h-full ${isCasting && livePhaseType === 'windup' ? 'bg-amber-300 animate-pulse' : 'bg-amber-500'}`}
                        style={{ width: `${(ability.windupTicks / (ability.windupTicks + ability.activeTicks + ability.recoveryTicks)) * 100}%` }}
                        title={`Windup: ${ability.windupTicks} ticks`}
                      />
                      <div
                        className={`h-full ${isCasting && livePhaseType === 'active' ? 'bg-red-400 animate-pulse' : 'bg-red-500'}`}
                        style={{ width: `${(ability.activeTicks / (ability.windupTicks + ability.activeTicks + ability.recoveryTicks)) * 100}%` }}
                        title={`Active: ${ability.activeTicks} ticks`}
                      />
                      <div
                        className={`h-full ${isCasting && livePhaseType === 'recovery' ? 'bg-sky-300 animate-pulse' : 'bg-sky-500'}`}
                        style={{ width: `${(ability.recoveryTicks / (ability.windupTicks + ability.activeTicks + ability.recoveryTicks)) * 100}%` }}
                        title={`Recovery: ${ability.recoveryTicks} ticks`}
                      />
                    </div>
                  </div>

                  {ability.shieldBreak && (
                    <div className="flex items-center gap-1.5 text-[10px] font-mono text-rose-400 pt-1">
                      <ShieldAlert className="w-3 h-3 shrink-0" />
                      <span>Shatters shield: 100t (5.0s) disable</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      )}

      {/* TAB 4: Java Mod AI Core Subsystems Inspector & Hivemind Matrix */}
      {activeTab === 'hivemind' && (
      <div className="p-4 bg-[#0c0e0c] border border-[#1d251e] rounded-xl space-y-4">
        <div className="flex items-center gap-2 border-b border-[#1a241b] pb-3">
          <Database className="w-4 h-4 text-indigo-400" />
          <div>
            <h2 className="font-serif text-base font-bold text-[#e0e7e0]">
              The Rot's Mod Brain Subsystems (Java Source Architecture)
            </h2>
            <p className="text-[11px] text-[#8a9a8c]">
              Synchronized Java data models including UniversalEngine, AttackPredictorAdapters, CombatProfile, RotHivemindSavedData, and InterceptionPrediction.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {/* UniversalEngine & Predictors */}
          <div className="p-4 bg-[#0a0f0b] border border-[#1b271d] rounded-xl space-y-3">
            <div className="flex items-center justify-between border-b border-[#162017] pb-2">
              <span className="font-serif text-xs font-bold text-sky-300">UniversalEngine & Adapters</span>
              <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-sky-950/40 text-sky-300 border border-sky-800">
                {state.predictorAdapters.length} Adapters Active
              </span>
            </div>
            <div className="space-y-2 text-xs font-mono">
              <div className="text-[11px] text-zinc-400">Composite Threat: <span className="text-red-400 font-bold">{(state.universalEngine.compositeThreatScore * 100).toFixed(0)}%</span></div>
              <div className="text-[11px] text-zinc-400">Predicted Incoming: <span className="text-amber-300 font-bold">{state.universalEngine.predictedIncomingDamage.toFixed(1)} HP</span></div>
              <div className="p-2 bg-[#060a07] rounded border border-[#141d15] text-[10px] text-zinc-400 leading-relaxed">
                <span className="text-emerald-400 font-bold">Tactical Counter:</span> {state.universalEngine.recommendedCounterAction}
              </div>
            </div>
          </div>

          {/* Personality Vector & Combat Profile */}
          <div className="p-4 bg-[#0a0f0b] border border-[#1b271d] rounded-xl space-y-3">
            <div className="flex items-center justify-between border-b border-[#162017] pb-2">
              <span className="font-serif text-xs font-bold text-purple-300">PersonalityVector & Profile</span>
              <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-purple-950/40 text-purple-300 border border-purple-800">
                Style: {state.combatProfile.preferredStyle}
              </span>
            </div>
            <div className="space-y-1.5 text-xs font-mono">
              <div className="flex justify-between text-[10px]">
                <span className="text-zinc-400">Aggression:</span>
                <span className="text-red-400 font-bold">{(state.personality.aggression * 100).toFixed(0)}%</span>
              </div>
              <div className="flex justify-between text-[10px]">
                <span className="text-zinc-400">Adaptability:</span>
                <span className="text-sky-400 font-bold">{(state.personality.adaptability * 100).toFixed(0)}%</span>
              </div>
              <div className="flex justify-between text-[10px]">
                <span className="text-zinc-400">Unpredictability:</span>
                <span className="text-amber-400 font-bold">{(state.personality.unpredictability * 100).toFixed(0)}%</span>
              </div>
              <div className="flex justify-between text-[10px]">
                <span className="text-zinc-400">Reaction Time:</span>
                <span className="text-emerald-400 font-bold">{state.combatProfile.reactionTimeTicks} ticks (200ms)</span>
              </div>
            </div>
          </div>

          {/* Hivemind Saved Data */}
          <div className="p-4 bg-[#0a0f0b] border border-[#1b271d] rounded-xl space-y-3">
            <div className="flex items-center justify-between border-b border-[#162017] pb-2">
              <span className="font-serif text-xs font-bold text-emerald-300">RotHivemindSavedData</span>
              <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-emerald-950/40 text-emerald-300 border border-emerald-800">
                Encounters: {state.hivemindData.globalEncounters}
              </span>
            </div>
            <div className="space-y-1.5 text-xs font-mono">
              <div className="flex justify-between text-[10px]">
                <span className="text-zinc-400">Total Kills:</span>
                <span className="text-red-400 font-bold">{state.hivemindData.totalPlayerKills}</span>
              </div>
              <div className="flex justify-between text-[10px]">
                <span className="text-zinc-400">Cumulative Adapt Score:</span>
                <span className="text-sky-400 font-bold">{(state.hivemindData.cumulativeAdaptationScore * 100).toFixed(0)}%</span>
              </div>
              <div className="flex justify-between text-[10px]">
                <span className="text-zinc-400">Swarm Dominance:</span>
                <span className="text-emerald-400 font-bold">{(state.hivemindData.swarmDominanceIndex * 100).toFixed(0)}%</span>
              </div>
              <div className="text-[10px] text-zinc-400 truncate">
                Target Gear: <span className="text-amber-300">{state.hivemindData.lastSeenPlayerGear}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      )}
    </div>
    </UpdatedFrame>
  );
}
