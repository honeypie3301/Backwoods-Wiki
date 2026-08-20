import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Brain, Crosshair, Cpu, Shield, ShieldOff, Zap, ShieldAlert,
  Flame, Snowflake, Target, Activity, Compass, Layers, Swords,
  ArrowRight, Eye, Radio, Sparkles, Terminal, Maximize2, AlertTriangle,
  RotateCcw, Play, Pause, ChevronDown, ChevronRight, Droplets,
  Skull, User, Users, Plus, Trash2, Heart, HeartPulse, RefreshCw,
  Sparkle, ShieldCheck, ArrowUpRight, ZapOff, Sliders, Info, UserX, UserCheck,
  Gauge, Move, HelpCircle, BookOpen, Clock, BarChart3, Database, Workflow, CheckCircle2
} from 'lucide-react';
import {
  TargetIntent, FightStyle, ThreatLevel, RotCombatRole, AbilityInfo,
  ROTS_ABILITY_REGISTRY, CombatContext, InterceptionPrediction, PersonalityVector,
  WelfordStats, createWelford, updateWelford, PlayerBehaviorData, TacticalNeuralData,
  RoleBidData, RotHivemindSavedData, CombatProfile, PendingPrediction, EntityObservation,
  AttackPredictorAdapter, INITIAL_PREDICTOR_ADAPTERS, UniversalEngineData, PhysicsParticle
} from './rotBrainArchitecture';

// Exact Rot Attributes from Minecraft Java Mod Source
export const ROT_SOURCE_ATTRIBUTES = {
  MOVEMENT_SPEED: 0.22,
  MAX_HEALTH: 550.0,
  ARMOR: 15.0,
  ATTACK_DAMAGE: 18.0,
  FOLLOW_RANGE: 128.0,
  STEP_HEIGHT: 1.5,
  KNOCKBACK_RESISTANCE: 0.5,
  ATTACK_KNOCKBACK: 0.3,
  MASS: 1200 // kg
};

// Vanilla Minecraft Mob Stats & Mass Specifications for 2D Newtonian Physics
export const VANILLA_MOB_STATS = {
  zombie: { name: 'Zombie', maxHealth: 20.0, speed: 0.11, damage: 4.5, radius: 0.4, mass: 70 },
  skeleton: { name: 'Skeleton', maxHealth: 20.0, speed: 0.12, damage: 4.0, radius: 0.4, mass: 70 },
  creeper: { name: 'Creeper', maxHealth: 20.0, speed: 0.11, damage: 45.0, radius: 0.4, mass: 65 },
  iron_golem: { name: 'Iron Golem', maxHealth: 100.0, speed: 0.12, damage: 17.5, radius: 0.7, mass: 800 },
  warden: { name: 'Warden', maxHealth: 500.0, speed: 0.15, damage: 30.0, radius: 0.9, mass: 1000 },
  wither_skeleton: { name: 'Wither Skeleton', maxHealth: 20.0, speed: 0.125, damage: 8.0, radius: 0.45, mass: 75 }
};

export type PlayerCombatMode = 'smart_auto' | 'circle_strafe' | 'turtle_shield' | 'flee' | 'manual';

export interface Projectile {
  id: string;
  type: 'arrow' | 'sonic_boom' | 'solar_spark';
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
  type: 'zombie' | 'skeleton' | 'iron_golem' | 'creeper' | 'warden' | 'wither_skeleton';
  name: string;
  x: number;
  z: number;
  health: number;
  maxHealth: number;
  speed: number;
  damage: number;
  radius: number;
  mass: number;
  deltaX: number;
  deltaZ: number;
  attackCooldown: number;
  
  // Specific Mob States
  creeperFuse?: number;
  creeperIsIgnited?: boolean;
  skeletonBowCharge?: number;
  wardenSonicCharge?: number;
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
  playerWeapon: 'sword' | 'axe' | 'crossbow';
  playerAttackCooldown: number;
  playerAbsorption: number;
  playerIsDead: boolean;
  lastPlayerAttackTick: number;

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
  rotX: 12.0,
  rotY: 64.0,
  rotZ: 9.0,
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
  playerX: 12.0,
  playerY: 64.0,
  playerZ: 17.0,
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
    interceptX: 12.0,
    interceptZ: 17.0,
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
    inputs: [8.0, 0.2, 0, 1.0, 1, 0, 0, 0],
    hidden: Array(16).fill(0).map(() => 0.5),
    weightsCount: 224,
    outputs: {
      thyEndIsNow: 0.28,
      judgment: 0.24,
      prepareThyself: 0.18,
      overheadSlam: 0.15,
      solarLaser: 0.10,
      tacticalStalk: 0.05
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

  distanceToTarget: 8.0,
  predictedTargetX: 12.0,
  predictedTargetZ: 17.0,
  activeDecisionNode: 'EVAL_COMBAT_PERCEPTION'
});

export default function RotLabView() {
  const [activeTab, setActiveTab] = useState<'arena' | 'mindspace' | 'abilities' | 'hivemind'>('arena');
  const [state, setState] = useState<RotSimState>(createInitialState);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [simSpeed, setSimSpeed] = useState<number>(50); // 20 TPS
  const [playerMode, setPlayerMode] = useState<PlayerCombatMode>('smart_auto');
  const [selectedSpawnMob, setSelectedSpawnMob] = useState<'zombie' | 'skeleton' | 'iron_golem' | 'creeper' | 'warden' | 'wither_skeleton'>('warden');
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
      rotX: 12.0,
      rotY: 64.0,
      rotZ: 9.0,
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
              // Sustenance logic
              if (next.playerHealth <= 9.0 && next.playerGoldenApples > 0 && next.stateTicks % 40 === 0) {
                next.playerGoldenApples -= 1;
                next.playerAbsorption = 4.0;
                next.playerHealth = Math.min(next.playerMaxHealth, next.playerHealth + 6.0);
                addLog('[PLAYER] Consumed Enchanted Golden Apple (+Absorption & Regen).');
              } else if (next.playerHealth <= 12.0 && next.playerPotions > 0 && next.stateTicks % 35 === 0) {
                next.playerPotions -= 1;
                next.playerHealth = Math.min(next.playerMaxHealth, next.playerHealth + 8.0);
                addLog('[PLAYER] Splashed Potion of Healing II (+8.0 HP).');
              }

              // Detect Rot unblockable charge/freeze states
              const isRotChargingUnblockable = (!next.rotIsDead) && (
                next.dropkickPhase === 1 ||
                next.overheadPhase === 1 ||
                (next.minosComboStep === 4 && next.minosComboTicks > 2) ||
                next.prepareThyselfPhase === 1
              );
              const isRotFiringLaser = next.laserFiringTicks > 0 || next.laserChargingTicks > 0;

              if (isRotChargingUnblockable) {
                // NEVER block unblockable moves - immediately drop shield and execute fast evasive orbit sprint!
                next.playerIsBlocking = false;
                const perp = Math.atan2(next.playerZ - next.rotZ, next.playerX - next.rotX) + (Math.PI / 2);
                const targetVx = Math.cos(perp) * 0.26;
                const targetVz = Math.sin(perp) * 0.26;
                next.playerDeltaX = next.playerDeltaX * 0.25 + targetVx * 0.75;
                next.playerDeltaZ = next.playerDeltaZ * 0.25 + targetVz * 0.75;
              } else if (isRotFiringLaser) {
                next.playerIsBlocking = false;
                const tangent = Math.atan2(next.playerZ - next.rotZ, next.playerX - next.rotX) + (Math.PI / 2);
                const targetVx = Math.cos(tangent) * 0.24;
                const targetVz = Math.sin(tangent) * 0.24;
                next.playerDeltaX = next.playerDeltaX * 0.25 + targetVx * 0.75;
                next.playerDeltaZ = next.playerDeltaZ * 0.25 + targetVz * 0.75;
              } else if (distToRot < 3.2 && !next.rotIsDead) {
                // Close range combat: hold shield against basic punches, strike with Netherite Axe
                if (next.playerShieldCooldown <= 0 && next.rotHealth > 0) {
                  next.playerIsBlocking = true;
                }
                const backAngle = Math.atan2(next.playerZ - next.rotZ, next.playerX - next.rotX);
                const targetVx = Math.cos(backAngle) * 0.16;
                const targetVz = Math.sin(backAngle) * 0.16;
                next.playerDeltaX = next.playerDeltaX * 0.3 + targetVx * 0.7;
                next.playerDeltaZ = next.playerDeltaZ * 0.3 + targetVz * 0.7;

                if (next.playerAttackCooldown <= 0) {
                  next.playerAttackCooldown = 12;
                  next.playerWeapon = 'axe';
                  const rawCrit = 14.0;
                  const armorMitigation = 0.55;
                  const adaptiveMitigation = next.totalAdaptiveResistance;
                  const finalDmg = rawCrit * (1.0 - armorMitigation) * (1.0 - adaptiveMitigation);

                  next.rotHealth = Math.max(0, next.rotHealth - finalDmg);
                  next.totalDamageTakenAccumulator += finalDmg;
                  next.kineticAdaptation = Math.min(1.0, next.kineticAdaptation + 0.08);
                  addLog(`[PLAYER ATTACK] Jump Critical Axe hit Rot for ${finalDmg.toFixed(1)} DMG.`);
                }
              } else if (distToRot > 7.0 && !next.rotIsDead) {
                // Long range combat: Piercing Crossbow
                next.playerIsBlocking = false;
                const towards = Math.atan2(next.rotZ - next.playerZ, next.rotX - next.playerX);
                const targetVx = Math.cos(towards) * 0.18;
                const targetVz = Math.sin(towards) * 0.18;
                next.playerDeltaX = next.playerDeltaX * 0.3 + targetVx * 0.7;
                next.playerDeltaZ = next.playerDeltaZ * 0.3 + targetVz * 0.7;

                if (next.playerAttackCooldown <= 0 && next.stateTicks % 28 === 0) {
                  next.playerAttackCooldown = 20;
                  next.playerWeapon = 'crossbow';
                  const arrowDmg = 8.5 * (1.0 - 0.55) * (1.0 - next.totalAdaptiveResistance);
                  next.rotHealth = Math.max(0, next.rotHealth - arrowDmg);
                  next.projectileAdaptation = Math.min(1.0, next.projectileAdaptation + 0.08);
                  addLog(`[PLAYER ATTACK] Piercing Crossbow bolt hit Rot for ${arrowDmg.toFixed(1)} DMG.`);
                }
              } else {
                // Mid range: Netherite Sword sweeping orbit
                next.playerWeapon = 'sword';
                const orbit = Math.atan2(next.playerZ - next.rotZ, next.playerX - next.rotX) + 0.06;
                const targetOrbitX = next.rotX + Math.cos(orbit) * 4.6;
                const targetOrbitZ = next.rotZ + Math.sin(orbit) * 4.6;
                const odx = targetOrbitX - next.playerX;
                const odz = targetOrbitZ - next.playerZ;
                const olen = Math.max(0.01, Math.hypot(odx, odz));
                const targetVx = (odx / olen) * 0.19;
                const targetVz = (odz / olen) * 0.19;
                next.playerDeltaX = next.playerDeltaX * 0.3 + targetVx * 0.7;
                next.playerDeltaZ = next.playerDeltaZ * 0.3 + targetVz * 0.7;
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

          // CREEPER (30-tick / 1.5s fuse)
          if (mob.type === 'creeper') {
            if (distToRot < 2.8 || mob.creeperIsIgnited) {
              mob.creeperIsIgnited = true;
              mob.creeperFuse = (mob.creeperFuse || 0) + 1;
              mob.deltaX *= GROUND_FRICTION;
              mob.deltaZ *= GROUND_FRICTION;

              if (mob.creeperFuse >= 30) {
                newShockwaves.push({
                  id: `exp_${Date.now()}_${Math.random()}`,
                  x: mob.x,
                  z: mob.z,
                  radius: 0.5,
                  maxRadius: 5.0,
                  color: '#eab308',
                  alpha: 1.0,
                  thickness: 4
                });

                if (distToRot < 5.0) {
                  const rawDmg = 45.0;
                  const dmg = rawDmg * (1.0 - 0.55) * (1.0 - next.totalAdaptiveResistance);
                  next.rotHealth = Math.max(0, next.rotHealth - dmg);
                  next.blastAdaptation = Math.min(1.0, next.blastAdaptation + 0.25);
                  addLog(`[CREEPER DETONATION] Creeper exploded for ${dmg.toFixed(1)} DMG to The Rot!`);
                }
                if (next.playerSpawned && !next.playerIsDead) {
                  const distP = Math.hypot(mob.x - next.playerX, mob.z - next.playerZ);
                  if (distP < 5.0) {
                    const dmgP = next.playerIsBlocking ? 6.0 : 28.0;
                    next.playerHealth = Math.max(0, next.playerHealth - dmgP);
                    addLog(`[CREEPER DETONATION] Creeper explosion hit player for ${dmgP.toFixed(1)} DMG.`);
                  }
                }
                continue;
              }
            } else {
              const targetVx = (toRotX / distToRot) * mob.speed;
              const targetVz = (toRotZ / distToRot) * mob.speed;
              mob.deltaX = mob.deltaX * 0.25 + targetVx * 0.75;
              mob.deltaZ = mob.deltaZ * 0.25 + targetVz * 0.75;
            }
          }

          // SKELETON (Exact 60-tick / 3.0s bow charge)
          else if (mob.type === 'skeleton') {
            if (distToRot < 4.5) {
              const targetVx = -(toRotX / distToRot) * mob.speed;
              const targetVz = -(toRotZ / distToRot) * mob.speed;
              mob.deltaX = mob.deltaX * 0.25 + targetVx * 0.75;
              mob.deltaZ = mob.deltaZ * 0.25 + targetVz * 0.75;
            } else if (distToRot > 10.0) {
              const targetVx = (toRotX / distToRot) * mob.speed;
              const targetVz = (toRotZ / distToRot) * mob.speed;
              mob.deltaX = mob.deltaX * 0.25 + targetVx * 0.75;
              mob.deltaZ = mob.deltaZ * 0.25 + targetVz * 0.75;
            } else {
              const strafeAngle = Math.atan2(toRotZ, toRotX) + Math.PI / 2;
              const strafeSpeed = 0.08; // Strafing speed while aiming bow in Minecraft
              const targetVx = Math.cos(strafeAngle) * strafeSpeed;
              const targetVz = Math.sin(strafeAngle) * strafeSpeed;
              mob.deltaX = mob.deltaX * 0.25 + targetVx * 0.75;
              mob.deltaZ = mob.deltaZ * 0.25 + targetVz * 0.75;
            }

            mob.skeletonBowCharge = (mob.skeletonBowCharge || 0) + 1;
            if (mob.skeletonBowCharge >= 60) {
              mob.skeletonBowCharge = 0;
              const arrowSpeed = 0.45;
              newProjectiles.push({
                id: `arrow_${Date.now()}_${Math.random()}`,
                type: 'arrow',
                x: mob.x,
                z: mob.z,
                deltaX: (toRotX / distToRot) * arrowSpeed,
                deltaZ: (toRotZ / distToRot) * arrowSpeed,
                damage: 4.5,
                source: 'Skeleton Arrow',
                lifeTicks: 45
              });
              addLog('[SKELETON] Skeleton released a bow shot after 3.0s draw.');
            }
          }

          // IRON GOLEM (Exact 20-tick / 1.0s melee)
          else if (mob.type === 'iron_golem') {
            const targetVx = (toRotX / distToRot) * mob.speed;
            const targetVz = (toRotZ / distToRot) * mob.speed;
            mob.deltaX = mob.deltaX * 0.25 + targetVx * 0.75;
            mob.deltaZ = mob.deltaZ * 0.25 + targetVz * 0.75;

            if (distToRot < 2.4 && mob.attackCooldown <= 0) {
              mob.attackCooldown = 20;
              const rawDmg = 17.5;
              const dealt = rawDmg * (1.0 - 0.55) * (1.0 - next.totalAdaptiveResistance);
              next.rotHealth = Math.max(0, next.rotHealth - dealt);
              next.kineticAdaptation = Math.min(1.0, next.kineticAdaptation + 0.06);
              next.rotDeltaY = 0.65;
              addLog(`[IRON GOLEM] Iron Golem swung upwards, dealing ${dealt.toFixed(1)} DMG to The Rot.`);
            }
          }

          // WARDEN (Exact 20-tick / 1.0s melee & 40-tick Sonic Boom)
          else if (mob.type === 'warden') {
            if (distToRot > 5.0) {
              mob.wardenSonicCharge = (mob.wardenSonicCharge || 0) + 1;
              const targetVx = (toRotX / distToRot) * (mob.speed * 0.6);
              const targetVz = (toRotZ / distToRot) * (mob.speed * 0.6);
              mob.deltaX = mob.deltaX * 0.25 + targetVx * 0.75;
              mob.deltaZ = mob.deltaZ * 0.25 + targetVz * 0.75;

              if (mob.wardenSonicCharge >= 40) {
                mob.wardenSonicCharge = 0;
                newProjectiles.push({
                  id: `sonic_${Date.now()}_${Math.random()}`,
                  type: 'sonic_boom',
                  x: mob.x,
                  z: mob.z,
                  originX: mob.x,
                  originZ: mob.z,
                  phase: 0,
                  deltaX: (toRotX / distToRot) * 0.75,
                  deltaZ: (toRotZ / distToRot) * 0.75,
                  damage: 30.0,
                  source: 'Warden Sonic Boom',
                  lifeTicks: 30
                });
                addLog('[WARDEN] Warden charged and fired a Helix Sonic Boom!');
              }
            } else {
              mob.wardenSonicCharge = 0;
              const targetVx = (toRotX / distToRot) * mob.speed;
              const targetVz = (toRotZ / distToRot) * mob.speed;
              mob.deltaX = mob.deltaX * 0.25 + targetVx * 0.75;
              mob.deltaZ = mob.deltaZ * 0.25 + targetVz * 0.75;

              if (distToRot < 2.5 && mob.attackCooldown <= 0) {
                mob.attackCooldown = 20;
                const rawDmg = 30.0;
                const dealt = rawDmg * (1.0 - 0.55) * (1.0 - next.totalAdaptiveResistance);
                next.rotHealth = Math.max(0, next.rotHealth - dealt);
                next.kineticAdaptation = Math.min(1.0, next.kineticAdaptation + 0.12);
                addLog(`[WARDEN] Warden delivered heavy melee strike for ${dealt.toFixed(1)} DMG.`);
              }
            }
          }

          // WITHER SKELETON (Exact 20-tick / 1.0s melee)
          else if (mob.type === 'wither_skeleton') {
            const targetVx = (toRotX / distToRot) * mob.speed;
            const targetVz = (toRotZ / distToRot) * mob.speed;
            mob.deltaX = mob.deltaX * 0.25 + targetVx * 0.75;
            mob.deltaZ = mob.deltaZ * 0.25 + targetVz * 0.75;

            if (distToRot < 2.2 && mob.attackCooldown <= 0) {
              mob.attackCooldown = 20;
              const rawDmg = 8.0;
              const dealt = rawDmg * (1.0 - 0.55) * (1.0 - next.totalAdaptiveResistance);
              next.rotHealth = Math.max(0, next.rotHealth - dealt);
              next.kineticAdaptation = Math.min(1.0, next.kineticAdaptation + 0.04);
              addLog(`[WITHER SKELETON] Struck Rot with Stone Sword for ${dealt.toFixed(1)} DMG.`);
            }
          }

          // ZOMBIE (Exact 20-tick / 1.0s melee)
          else {
            const targetVx = (toRotX / distToRot) * mob.speed;
            const targetVz = (toRotZ / distToRot) * mob.speed;
            mob.deltaX = mob.deltaX * 0.25 + targetVx * 0.75;
            mob.deltaZ = mob.deltaZ * 0.25 + targetVz * 0.75;

            if (distToRot < 2.0 && mob.attackCooldown <= 0) {
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

        // 2-Pass Elastic Collision & Momentum Resolution
        const RESTITUTION = 0.55;
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

                // Position separation proportional to inverse mass
                const totalMass = a.mass + b.mass;
                const pushRatioA = b.mass / totalMass;
                const pushRatioB = a.mass / totalMass;

                a.applyPush(-normalX * overlap * pushRatioA, -normalZ * overlap * pushRatioA);
                b.applyPush(normalX * overlap * pushRatioB, normalZ * overlap * pushRatioB);

                a.x -= normalX * overlap * pushRatioA;
                a.z -= normalZ * overlap * pushRatioA;
                b.x += normalX * overlap * pushRatioB;
                b.z += normalZ * overlap * pushRatioB;

                // Relative velocity along collision normal
                const relVx = a.vx - b.vx;
                const relVz = a.vz - b.vz;
                const velAlongNormal = relVx * normalX + relVz * normalZ;

                // If moving towards each other, exchange impulse
                if (velAlongNormal > 0) {
                  const impulseMagnitude = -(1 + RESTITUTION) * velAlongNormal / ((1 / a.mass) + (1 / b.mass));
                  const impulseX = impulseMagnitude * normalX;
                  const impulseZ = impulseMagnitude * normalZ;

                  a.applyPush(0, 0, (impulseX / a.mass) * 0.4, (impulseZ / a.mass) * 0.4);
                  b.applyPush(0, 0, (-impulseX / b.mass) * 0.4, (-impulseZ / b.mass) * 0.4);
                }
              }
            }
          }
        }

        // BOUNDARY WALL ELASTIC REBOUND & IMPACT SPARKS
        const WALL_MIN = 1.2;
        const WALL_MAX = 22.8;
        const WALL_RESTITUTION = 0.65;
        const newParticles: PhysicsParticle[] = [...next.arenaParticles];

        const checkWallBounce = (x: number, z: number, vx: number, vz: number, radius: number) => {
          let nx = x;
          let nz = z;
          let nvx = vx;
          let nvz = vz;
          let hit = false;

          if (x - radius < WALL_MIN) {
            nx = WALL_MIN + radius;
            nvx = Math.abs(vx) * WALL_RESTITUTION;
            hit = true;
          } else if (x + radius > WALL_MAX) {
            nx = WALL_MAX - radius;
            nvx = -Math.abs(vx) * WALL_RESTITUTION;
            hit = true;
          }

          if (z - radius < WALL_MIN) {
            nz = WALL_MIN + radius;
            nvz = Math.abs(vz) * WALL_RESTITUTION;
            hit = true;
          } else if (z + radius > WALL_MAX) {
            nz = WALL_MAX - radius;
            nvz = -Math.abs(vz) * WALL_RESTITUTION;
            hit = true;
          }

          if (hit && Math.hypot(vx, vz) > 0.15) {
            for (let k = 0; k < 3; k++) {
              newParticles.push({
                id: `p_wall_${Date.now()}_${Math.random()}`,
                x: nx,
                z: nz,
                vx: -nvx * 0.3 + (Math.random() - 0.5) * 0.15,
                vz: -nvz * 0.3 + (Math.random() - 0.5) * 0.15,
                life: 14,
                maxLife: 14,
                color: '#facc15',
                size: 2.5
              });
            }
          }
          return { nx, nz, nvx, nvz };
        };

        // Rot boundary check
        const rotB = checkWallBounce(next.rotX, next.rotZ, next.rotDeltaX, next.rotDeltaZ, next.rotRadius);
        next.rotX = rotB.nx;
        next.rotZ = rotB.nz;
        next.rotDeltaX = rotB.nvx;
        next.rotDeltaZ = rotB.nvz;

        // Player boundary check
        if (next.playerSpawned) {
          const pB = checkWallBounce(next.playerX, next.playerZ, next.playerDeltaX, next.playerDeltaZ, next.playerRadius);
          next.playerX = pB.nx;
          next.playerZ = pB.nz;
          next.playerDeltaX = pB.nvx;
          next.playerDeltaZ = pB.nvz;
        }

        // Mobs boundary check
        updatedMobs.forEach(m => {
          const mB = checkWallBounce(m.x, m.z, m.deltaX, m.deltaZ, m.radius);
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

          if (p.lifeTicks > 0 && p.x >= 1 && p.x <= 23 && p.z >= 1 && p.z <= 23) {
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

        // MINOS MOVE 1: "THY END IS NOW" (4-Hit Rapid Combo with Freeze-Finisher)
        if (next.minosComboStep > 0) {
          next.minosComboTicks -= 1;
          const isFinisher = next.minosComboStep === 4;

          if (isFinisher && next.minosComboTicks > 2) {
            // Freeze frame windup for the finisher!
            next.rotDeltaX = 0;
            next.rotDeltaZ = 0;
            next.combatState = 'THY_END_IS_NOW_FINISHER_CHARGE';
            next.activeDecisionNode = 'EXEC_THY_END_IS_NOW_FINISHER_CHARGE';
          } else {
            next.activeDecisionNode = `EXEC_THY_END_IS_NOW_STEP_${next.minosComboStep}`;
            next.combatState = `THY_END_IS_NOW_PUNCH_${next.minosComboStep}`;
            const stepSpeed = isFinisher ? 0.45 : 0.12;
            next.rotDeltaX += (tX - next.rotX) * stepSpeed;
            next.rotDeltaZ += (tZ - next.rotZ) * stepSpeed;
          }

          if (next.minosComboTicks <= 0) {
            const dmg = isFinisher ? 42.0 : 16.0;

            if (dist < 4.5) {
              if (isFinisher) {
                newShockwaves.push({
                  id: `combo_finisher_${Date.now()}`,
                  x: next.rotX,
                  z: next.rotZ,
                  radius: 0.6,
                  maxRadius: 5.2,
                  color: '#ef4444',
                  alpha: 1.0,
                  thickness: 3.5
                });
                // Broadcast physical knockback to player and all mobs!
                applyRadialKnockbackToAll(next.rotX, next.rotZ, 5.0, 0.58, 42.0, 'Thy End Is Now Finisher');
              }

              if (targetType === 'player') {
                if (next.playerIsBlocking && !isFinisher) {
                  addLog(`[SHIELD BLOCK] Player blocked strike ${next.minosComboStep}.`);
                } else {
                  if (next.playerIsBlocking && isFinisher) {
                    next.playerIsBlocking = false;
                    next.playerShieldCooldown = 100;
                    addLog('[SHIELD BREAK] Thy End Is Now finisher shattered player shield! (100t disable)');
                  }
                  next.playerHealth = Math.max(0, next.playerHealth - dmg * 0.45);
                  addLog(`[MINOS COMBO] Thy End Is Now strike ${next.minosComboStep} dealt ${(dmg * 0.45).toFixed(1)} DMG!`);
                }
              } else if (targetMobId) {
                next.mobs = next.mobs.map(m => m.id === targetMobId ? { ...m, health: Math.max(0, m.health - dmg) } : m);
              }
            }

            if (next.minosComboStep < 4) {
              next.minosComboStep += 1;
              next.minosComboTicks = next.minosComboStep === 4 ? 8 : 5;
            } else {
              next.minosComboStep = 0;
              next.combatState = 'IDLE_STALKING';
            }
          }
        }

        // MINOS MOVE 2: "JUDGMENT" / DROPKICK (Freeze Windup -> Insanely Fast Trajectory & Shockwave Knockback)
        else if (next.dropkickPhase === 1) {
          // PHASE 1: Complete freeze in horizontal plane, rise to apex & lock-on target
          next.activeDecisionNode = 'EXEC_JUDGMENT_DROPKICK_FREEZE_ASCEND';
          next.combatState = 'JUDGMENT_DROPKICK_ASCEND';
          next.rotDeltaX = 0;
          next.rotDeltaZ = 0;
          next.rotY += 1.1;
          next.dropkickTicks -= 1;
          next.dropkickTargetX = next.predictedTargetX;
          next.dropkickTargetZ = next.predictedTargetZ;

          if (next.dropkickTicks <= 0 || next.rotY >= 76.0) {
            next.dropkickPhase = 2;
            next.dropkickTicks = 12;
            addLog('[MINOS MOVE] Judgment: Supersonic divekick launched!');
          }
        } else if (next.dropkickPhase === 2) {
          // PHASE 2: Insanely fast supersonic divekick trajectory
          next.activeDecisionNode = 'EXEC_JUDGMENT_DROPKICK_SUPERSONIC';
          next.combatState = 'JUDGMENT_DROPKICK_DIVE';
          
          // Leave ghost afterimage
          next.rotAfterimages.push({
            x: next.rotX,
            z: next.rotZ,
            alpha: 0.85,
            color: '#38bdf8'
          });

          // Supersonic approach
          const diveDx = next.dropkickTargetX - next.rotX;
          const diveDz = next.dropkickTargetZ - next.rotZ;
          const diveDist = Math.max(0.01, Math.hypot(diveDx, diveDz));
          
          next.rotX += (diveDx / diveDist) * 1.8;
          next.rotZ += (diveDz / diveDist) * 1.8;
          next.rotY -= 1.8;

          if (next.rotY <= 64.0 || diveDist < 1.0) {
            next.rotY = 64.0;
            next.dropkickPhase = 0;
            next.combatState = 'IDLE_STALKING';

            // Huge destructive shockwave with heavy radial knockback
            newShockwaves.push({
              id: `shock_${Date.now()}`,
              x: next.rotX,
              z: next.rotZ,
              radius: 0.8,
              maxRadius: 7.0,
              color: '#38bdf8',
              alpha: 1.0,
              thickness: 5
            });

            // Radial knockback to ALL entities in the arena
            applyRadialKnockbackToAll(next.rotX, next.rotZ, 6.5, 0.82, 110.0, 'Judgment Dropkick');

            // Physical knockback impulse to direct target
            if (targetType === 'player') {
              if (dist < 5.0) {
                if (next.playerIsBlocking) {
                  next.playerIsBlocking = false;
                  next.playerShieldCooldown = 100;
                  addLog('[SHIELD BREAK] Judgment Dropkick crushed player shield! (100t disable applied)');
                }
                const dmg = 85.0 * 0.45;
                next.playerHealth = Math.max(0, next.playerHealth - dmg);
                
                // Blast player backwards
                const kx = (next.playerX - next.rotX) || 1;
                const kz = (next.playerZ - next.rotZ) || 1;
                const klen = Math.max(0.1, Math.hypot(kx, kz));
                next.playerDeltaX += (kx / klen) * 0.75;
                next.playerDeltaZ += (kz / klen) * 0.75;
                addLog(`[IMPACT] Judgment Dropkick hit player for ${dmg.toFixed(1)} DMG with supersonic shockwave knockback!`);
              }
            } else if (targetMobId) {
              addLog('[IMPACT] Judgment Dropkick pulverized target mob with massive shockwave knockback!');
            }
          }
        }

        // MINOS MOVE 3: "PREPARE THYSELF" (Teleport Behind -> Freeze -> Supersonic Cross Slice)
        else if (next.prepareThyselfPhase === 1) {
          next.activeDecisionNode = 'EXEC_PREPARE_THYSELF_TELEPORT_FREEZE';
          next.combatState = 'PREPARE_THYSELF_TELEPORT';
          
          const behindAngle = Math.atan2(next.rotZ - tZ, next.rotX - tX);
          next.rotX = tX + Math.cos(behindAngle) * 2.4;
          next.rotZ = tZ + Math.sin(behindAngle) * 2.4;
          next.rotDeltaX = 0;
          next.rotDeltaZ = 0;
          next.prepareThyselfPhase = 2;
          next.prepareThyselfTicks = 6;
          addLog('[MINOS MOVE] Prepare Thyself: Teleported behind target (Freeze-charging cross strike)!');
        } else if (next.prepareThyselfPhase === 2) {
          next.prepareThyselfTicks -= 1;
          next.activeDecisionNode = 'EXEC_PREPARE_THYSELF_STRIKE';
          next.combatState = 'PREPARE_THYSELF_STRIKE';

          if (next.prepareThyselfTicks <= 0) {
            next.prepareThyselfPhase = 0;
            next.combatState = 'IDLE_STALKING';
            
            newShockwaves.push({
              id: `prepare_shock_${Date.now()}`,
              x: next.rotX,
              z: next.rotZ,
              radius: 0.5,
              maxRadius: 4.8,
              color: '#38bdf8',
              alpha: 1.0,
              thickness: 3
            });

            // Knockback impulse applied to all nearby arena entities
            applyRadialKnockbackToAll(next.rotX, next.rotZ, 4.5, 0.52, 36.0, 'Prepare Thyself Cross');

            const rawDmg = 36.0;
            if (targetType === 'player') {
              next.playerHealth = Math.max(0, next.playerHealth - rawDmg * 0.45);
              const kx = (next.playerX - next.rotX) || 1;
              const kz = (next.playerZ - next.rotZ) || 1;
              const klen = Math.max(0.1, Math.hypot(kx, kz));
              next.playerDeltaX += (kx / klen) * 0.55;
              next.playerDeltaZ += (kz / klen) * 0.55;
              addLog(`[MINOS STRIKE] Prepare Thyself connected for ${(rawDmg * 0.45).toFixed(1)} DMG!`);
            } else if (targetMobId) {
              next.mobs = next.mobs.map(m => m.id === targetMobId ? { ...m, health: Math.max(0, m.health - rawDmg) } : m);
            }
          }
        }

        // OVERHEAD GROUND-IMPACT SLAM (Leap & Apex Freeze -> Plunge & Shockwave Knockback)
        else if (next.overheadPhase === 1) {
          next.overheadTicks -= 1;
          next.activeDecisionNode = 'EXEC_OVERHEAD_LEAP_FREEZE';
          next.combatState = 'OVERHEAD_LEAP';
          next.rotY += 1.0;
          next.rotX += (tX - next.rotX) * 0.18;
          next.rotZ += (tZ - next.rotZ) * 0.18;

          if (next.overheadTicks <= 0 || next.rotY >= 74.0) {
            next.overheadPhase = 2;
            next.overheadTicks = 10;
            addLog('[OVERHEAD SLAM] Rot reached apex (Freeze windup), plunging with two-handed slam!');
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
              maxRadius: 6.0,
              color: '#d946ef',
              alpha: 1.0,
              thickness: 4
            });

            // Blast ALL entities in arena with radial ground slam knockback
            applyRadialKnockbackToAll(next.rotX, next.rotZ, 5.8, 0.70, 52.0, 'Overhead Ground Smash');

            if (dist < 4.8) {
              const rawDmg = 52.0;
              if (targetType === 'player') {
                if (next.playerIsBlocking) {
                  next.playerIsBlocking = false;
                  next.playerShieldCooldown = 100;
                  addLog('[SHIELD BREAK] Overhead Slam shattered player shield!');
                }
                const dmg = rawDmg * 0.45;
                next.playerHealth = Math.max(0, next.playerHealth - dmg);
                const kx = (next.playerX - next.rotX) || 1;
                const kz = (next.playerZ - next.rotZ) || 1;
                const klen = Math.max(0.1, Math.hypot(kx, kz));
                next.playerDeltaX += (kx / klen) * 0.65;
                next.playerDeltaZ += (kz / klen) * 0.65;
                addLog(`[IMPACT] Overhead Ground Slam smashed player for ${dmg.toFixed(1)} DMG with radial knockback!`);
              } else if (targetMobId) {
                next.mobs = next.mobs.map(m => m.id === targetMobId ? { ...m, health: Math.max(0, m.health - rawDmg) } : m);
                addLog(`[IMPACT] Overhead Ground Slam crushed surrounding mobs for ${rawDmg} DMG!`);
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
            if (roll < 0.30) {
              const isLeft = next.leftPunchTicks === 0;
              if (isLeft) next.leftPunchTicks = 14;
              else next.rightPunchTicks = 14;
              next.combatState = isLeft ? 'LEFT_PUNCH' : 'RIGHT_PUNCH';
              next.activeDecisionNode = isLeft ? 'EXEC_LEFT_PUNCH' : 'EXEC_RIGHT_PUNCH';

              const rawDmg = ROT_SOURCE_ATTRIBUTES.ATTACK_DAMAGE;
              if (targetType === 'player') {
                if (next.playerIsBlocking) {
                  addLog('[SHIELD] Player blocked punch.');
                } else {
                  const dmg = rawDmg * 0.45;
                  next.playerHealth = Math.max(0, next.playerHealth - dmg);
                  addLog(`[MELEE] Punch dealt ${dmg.toFixed(1)} DMG.`);
                }
              } else if (targetMobId) {
                next.mobs = next.mobs.map(m => m.id === targetMobId ? { ...m, health: Math.max(0, m.health - rawDmg) } : m);
              }
            } else if (roll < 0.60) {
              next.minosComboStep = 1;
              next.minosComboTicks = 6;
              addLog('[MINOS COMBO] Thy End Is Now combo initiated!');
            } else if (roll < 0.80) {
              next.prepareThyselfPhase = 1;
              addLog('[MINOS MOVE] Prepare Thyself initiated!');
            } else {
              next.overheadPhase = 1;
              next.overheadTicks = 14;
              addLog('[OVERHEAD SLAM] Rot leaped upwards for Overhead Ground Slam!');
            }
          } else if (dist <= 12.0) {
            next.activeDecisionNode = 'EVAL_GOAL_AI_APPROACH';
            next.combatState = 'APPROACH_TARGET';

            // Authentic Minecraft Goal AI Pathing: direct vector navigation towards target
            const directDx = tX - next.rotX;
            const directDz = tZ - next.rotZ;
            const directLen = Math.max(0.01, Math.hypot(directDx, directDz));
            const walkSpeed = 0.24; // Standard Minecraft entity movement speed
            const targetRotVx = (directDx / directLen) * walkSpeed;
            const targetRotVz = (directDz / directLen) * walkSpeed;
            next.rotDeltaX = next.rotDeltaX * 0.25 + targetRotVx * 0.75;
            next.rotDeltaZ = next.rotDeltaZ * 0.25 + targetRotVz * 0.75;

            if (next.stateTicks % 50 === 0) {
              const pick = Math.random();
              if (pick < 0.50) {
                next.dropkickPhase = 1;
                next.dropkickTicks = 16;
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
    const scale = width / 24;

    ctx.fillStyle = '#060a07';
    ctx.fillRect(0, 0, width, height);

    ctx.strokeStyle = '#121a14';
    ctx.lineWidth = 1.5;
    for (let i = 0; i <= 24; i += 2) {
      ctx.beginPath();
      ctx.moveTo(i * scale, 0);
      ctx.lineTo(i * scale, height);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(0, i * scale);
      ctx.lineTo(width, i * scale);
      ctx.stroke();
    }

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

      ctx.beginPath();
      ctx.arc(mx, mz, r, 0, Math.PI * 2);
      
      if (mob.type === 'creeper') {
        ctx.fillStyle = (mob.creeperFuse || 0) % 4 < 2 ? '#22c55e' : '#ffffff';
        ctx.strokeStyle = '#15803d';
      } else if (mob.type === 'iron_golem') {
        ctx.fillStyle = '#cbd5e1';
        ctx.strokeStyle = '#94a3b8';
      } else if (mob.type === 'warden') {
        ctx.fillStyle = '#042f2e';
        ctx.strokeStyle = '#0d9488';
      } else if (mob.type === 'skeleton') {
        ctx.fillStyle = '#e2e8f0';
        ctx.strokeStyle = '#94a3b8';
      } else if (mob.type === 'wither_skeleton') {
        ctx.fillStyle = '#18181b';
        ctx.strokeStyle = '#3f3f46';
      } else {
        ctx.fillStyle = '#15803d';
        ctx.strokeStyle = '#166534';
      }
      
      ctx.lineWidth = 2;
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

    // Render The Rot (Boss Entity)
    const rotPx = state.rotX * scale;
    const rotPz = state.rotZ * scale;
    const rotR = state.rotRadius * scale;

    ctx.beginPath();
    ctx.arc(rotPx, rotPz, rotR, 0, Math.PI * 2);
    ctx.fillStyle = '#1c0b0e';
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 3;
    ctx.fill();
    ctx.stroke();

    const rotYawRad = ((state.rotYaw + 90) * Math.PI) / 180;
    ctx.beginPath();
    ctx.moveTo(rotPx, rotPz);
    ctx.lineTo(rotPx + Math.cos(rotYawRad) * (rotR + 8), rotPz + Math.sin(rotYawRad) * (rotR + 8));
    ctx.strokeStyle = '#f87171';
    ctx.lineWidth = 3;
    ctx.stroke();

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

        ctx.fillStyle = '#6ee7b7';
        ctx.font = '9px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(`${state.playerHealth.toFixed(1)} HP`, playerPx, playerPz - playerR - 12);
      }
    }
  }, [state]);

  const handleSpawnMobs = () => {
    const stats = VANILLA_MOB_STATS[selectedSpawnMob];
    const newMobs: ArenaMob[] = [];

    for (let i = 0; i < spawnCount; i++) {
      const angle = (Math.PI * 2 * i) / spawnCount;
      const spawnX = Math.max(2, Math.min(22, 12 + Math.cos(angle) * 7.5));
      const spawnZ = Math.max(2, Math.min(22, 12 + Math.sin(angle) * 7.5));

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
      playerX: 12.0,
      playerZ: 17.0,
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
      label: 'Tactical Input (8-Dim)',
      lobe: 'TacticalNeuralNetwork',
      x: 275,
      y: 90,
      r: 30,
      color: '#818cf8',
      active: true,
      val: `[8 Inputs Vector]`,
      badge: 'INPUT_SIZE: 8',
      desc: `8-dimensional normalized input vector: [Distance, Lead Speed, Shield State, Target HP %, Threat Ratio, Kinetic Adapt, Blast Adapt, Welford Z-Score].`,
      icon: Cpu
    },
    {
      id: 'nn_hidden',
      label: 'Hidden Layer (16-Tensor)',
      lobe: 'TacticalNeuralNetwork',
      x: 275,
      y: 215,
      r: 30,
      color: '#818cf8',
      active: true,
      val: `16 Neurons (tanh)`,
      badge: 'HIDDEN_SIZE: 16',
      desc: `16 hidden neurons with non-linear hyperbolic tangent activation evaluating tactical trade-offs between Minos martial combos.`,
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
      val: `224 Weights`,
      badge: 'TOTAL_WEIGHTS: 224',
      desc: `Full weight tensor (8x16 + 16x6 = 224 weights) trained via reinforcement delta updates for situational combat adaptability.`,
      icon: Sparkles
    },
    {
      id: 'a_kin',
      label: 'Dynamic Adaptation Core',
      lobe: 'Dynamic Adaptation',
      x: 275,
      y: 465,
      r: 30,
      color: '#4ade80',
      active: state.totalAdaptiveResistance > 0,
      val: `${(state.totalAdaptiveResistance * 100).toFixed(0)}% Stacks`,
      badge: 'ADAPTIVE',
      desc: `Biological adaptation stack: Kinetic (${(state.kineticAdaptation*100).toFixed(0)}%), Blast (${(state.blastAdaptation*100).toFixed(0)}%), Swarm (${(state.swarmAdaptation*100).toFixed(0)}%).`,
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
    <div className="space-y-6 pb-12">
      {/* Top Header - Fully Responsive Flex Wrap with No Overlapping */}
      <div className="p-4 sm:p-6 bg-[#0c0e0c] border border-[#1d251e] rounded-xl relative overflow-hidden flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-red-400">
            <Radio className="w-3.5 h-3.5 text-red-500 animate-pulse shrink-0" />
            <span>Classified Neural Combat Matrix</span>
          </div>
          <h1 className="font-serif text-xl sm:text-2xl md:text-3xl font-extrabold text-[#e0e7e0] mt-1 break-words">
            The Rot: Active Combat Simulation
          </h1>
          <p className="text-xs text-[#8a9a8c] mt-1 max-w-2xl">
            Simulating The Rot's exact MCreator/Java state machine, Minos Prime combat combos, solid collision physics, and dynamic tank adaptation against Minecraft mobs.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {state.rotIsDead ? (
            <button
              onClick={handleRespawnRot}
              className="px-2.5 sm:px-3 py-1.5 rounded-lg border text-[11px] sm:text-xs font-mono font-bold flex items-center gap-1.5 transition bg-red-600 text-white border-red-500 hover:bg-red-500 shadow-lg shadow-red-950 animate-pulse whitespace-nowrap"
            >
              <RefreshCw className="w-3.5 h-3.5 shrink-0" />
              <span>REVIVE ROT</span>
            </button>
          ) : (
            <button
              onClick={handleRespawnRot}
              className="px-2.5 sm:px-3 py-1.5 rounded-lg border text-[11px] sm:text-xs font-mono font-medium flex items-center gap-1.5 transition bg-[#141a15] text-[#8a9a8c] border-[#2a382c] hover:text-red-300 hover:border-red-800 whitespace-nowrap"
            >
              <RefreshCw className="w-3.5 h-3.5 shrink-0" />
              <span>HEAL ROT (550 HP)</span>
            </button>
          )}
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`px-2.5 sm:px-3 py-1.5 rounded-lg border text-[11px] sm:text-xs font-mono font-semibold flex items-center gap-1.5 transition whitespace-nowrap ${
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
            className="px-2.5 sm:px-3 py-1.5 rounded-lg border border-[#2a382c] bg-[#141a15] text-[11px] sm:text-xs font-mono text-[#a1a1aa] hover:text-[#e0e7e0] flex items-center gap-1.5 transition whitespace-nowrap"
          >
            <RotateCcw className="w-3.5 h-3.5 shrink-0" />
            <span>RESET</span>
          </button>
        </div>
      </div>

      {/* Compact Section Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 bg-[#0a0f0b] border border-[#1b271d] rounded-xl font-mono text-xs">
        <button
          onClick={() => setActiveTab('arena')}
          className={`flex-1 min-w-[130px] sm:min-w-[150px] px-3.5 py-2.5 rounded-lg transition flex items-center justify-center gap-2 ${
            activeTab === 'arena'
              ? 'bg-red-950/80 border border-red-700 text-red-200 font-bold shadow-md shadow-red-950/50'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-[#121a14]'
          }`}
        >
          <Swords className="w-4 h-4 text-red-400 shrink-0" />
          <span>1. Arena & Moves</span>
        </button>
        <button
          onClick={() => setActiveTab('mindspace')}
          className={`flex-1 min-w-[130px] sm:min-w-[150px] px-3.5 py-2.5 rounded-lg transition flex items-center justify-center gap-2 ${
            activeTab === 'mindspace'
              ? 'bg-sky-950/80 border border-sky-700 text-sky-200 font-bold shadow-md shadow-sky-950/50'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-[#121a14]'
          }`}
        >
          <Brain className="w-4 h-4 text-sky-400 shrink-0" />
          <span>2. Neural Mindspace</span>
        </button>
        <button
          onClick={() => setActiveTab('abilities')}
          className={`flex-1 min-w-[130px] sm:min-w-[150px] px-3.5 py-2.5 rounded-lg transition flex items-center justify-center gap-2 ${
            activeTab === 'abilities'
              ? 'bg-amber-950/80 border border-amber-700 text-amber-200 font-bold shadow-md shadow-amber-950/50'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-[#121a14]'
          }`}
        >
          <Clock className="w-4 h-4 text-amber-400 shrink-0" />
          <span>3. Ability Frame Data</span>
        </button>
        <button
          onClick={() => setActiveTab('hivemind')}
          className={`flex-1 min-w-[130px] sm:min-w-[150px] px-3.5 py-2.5 rounded-lg transition flex items-center justify-center gap-2 ${
            activeTab === 'hivemind'
              ? 'bg-emerald-950/80 border border-emerald-700 text-emerald-200 font-bold shadow-md shadow-emerald-950/50'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-[#121a14]'
          }`}
        >
          <Database className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>4. Hivemind & Adapt</span>
        </button>
      </div>

      {/* TAB 1: Main Top-Down Arena & Entity Controls */}
      {activeTab === 'arena' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Top-Down 2D Radar Canvas & Quick Stats */}
        <div className="lg:col-span-7 space-y-4">
          <div className="p-4 bg-[#0c0e0c] border border-[#1d251e] rounded-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Crosshair className="w-4 h-4 text-red-400" />
                <span className="font-serif text-sm font-bold text-[#e0e7e0]">Top-Down 2D Physics Arena</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-900 text-zinc-400 border border-zinc-800">
                  24m x 24m Scale
                </span>
              </div>
              <div className="text-[11px] font-mono text-[#8a9a8c]">
                State: <span className="text-red-400 font-bold">{state.combatState}</span>
              </div>
            </div>

            {/* Arena Radar Canvas */}
            <div className="relative rounded-lg overflow-hidden border border-[#1a241b] bg-[#060a07] aspect-square flex items-center justify-center">
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
            <div className="p-3 bg-[#111612] border border-[#1e2b20] rounded-lg grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div>
                <div className="text-[9px] font-mono text-[#6b7280] uppercase">Rot Health</div>
                <div className="text-sm font-mono font-bold text-red-400">
                  {state.rotHealth.toFixed(1)} <span className="text-[10px] text-zinc-500">/ 550</span>
                </div>
              </div>
              <div>
                <div className="text-[9px] font-mono text-[#6b7280] uppercase">Adaptive Mitigation</div>
                <div className="text-sm font-mono font-bold text-sky-400">
                  +{(state.totalAdaptiveResistance * 100).toFixed(0)}% <span className="text-[10px] text-zinc-500">(15 Armor)</span>
                </div>
              </div>
              <div>
                <div className="text-[9px] font-mono text-[#6b7280] uppercase">Combat Surge Regen</div>
                <div className="text-sm font-mono font-bold text-emerald-400">
                  {state.rotHealth < state.rotMaxHealth ? '+5 to +28 HP/6t' : 'IDLE'}
                </div>
              </div>
              <div>
                <div className="text-[9px] font-mono text-[#6b7280] uppercase">Active Targets</div>
                <div className="text-sm font-mono font-bold text-amber-400">
                  {state.mobs.length + (state.playerSpawned && !state.playerIsDead ? 1 : 0)} Units
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Spawner, Loadout, and Manual Move Triggers */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* Entity Spawner Card */}
          <div className="p-4 bg-[#0c0e0c] border border-[#1d251e] rounded-xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#1a241b] pb-2">
              <span className="font-serif text-sm font-bold text-[#e0e7e0]">Entity Spawner</span>
              <span className="text-[10px] font-mono text-[#5a6b5e]">Authentic Minecraft Stats</span>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-mono text-[#8a9a8c] block mb-1.5">Select Mob Type</label>
                <div className="flex items-center gap-2">
                  <select
                    value={selectedSpawnMob}
                    onChange={e => setSelectedSpawnMob(e.target.value as any)}
                    className="flex-1 bg-[#141a15] border border-[#253327] rounded px-3 py-2 text-xs font-mono text-[#e0e7e0] focus:outline-none focus:border-red-600 appearance-none bg-no-repeat bg-[right_0.75rem_center] pr-8"
                    style={{ backgroundImage: `url('data:image/svg+xml;utf8,<svg fill="%23a1a1aa" height="16" viewBox="0 0 24 24" width="16" xmlns="http://www.w3.org/2000/svg"><path d="M7 10l5 5 5-5z"/></svg>')` }}
                  >
                    <option value="warden">Warden (500 HP, Sonic Boom & Melee)</option>
                    <option value="iron_golem">Iron Golem (100 HP, Uppercut Toss)</option>
                    <option value="creeper">Creeper (20 HP, Fuse & TNT Explosion)</option>
                    <option value="skeleton">Skeleton (20 HP, Kiting & Arrows)</option>
                    <option value="wither_skeleton">Wither Skeleton (20 HP, Stone Sword)</option>
                    <option value="zombie">Zombie (20 HP, Swarm Pursuit)</option>
                  </select>
                  <select
                    value={spawnCount}
                    onChange={e => setSpawnCount(Number(e.target.value))}
                    className="w-16 bg-[#141a15] border border-[#253327] rounded px-2 py-2 text-xs font-mono text-[#e0e7e0] focus:outline-none"
                  >
                    <option value={1}>1x</option>
                    <option value={2}>2x</option>
                    <option value={4}>4x</option>
                    <option value={8}>8x</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleSpawnMobs}
                  className="flex-1 px-3 py-2 bg-red-950/40 hover:bg-red-900/60 border border-red-800 text-red-300 text-xs font-mono font-bold rounded transition flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" /> SPAWN MOBS
                </button>
                <button
                  onClick={handleClearMobs}
                  className="px-3 py-2 bg-[#141a15] hover:bg-[#1a221c] border border-[#2a382c] text-zinc-400 hover:text-zinc-200 text-xs font-mono rounded transition flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" /> CLEAR
                </button>
              </div>
            </div>

            {/* Player AI & Loadout Controls */}
            <div className="pt-3 border-t border-[#1a241b] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono text-[#8a9a8c]">Player AI & Loadout</span>
                <div className="flex items-center gap-2">
                  {state.playerIsDead && state.playerSpawned && (
                    <button
                      onClick={handleRespawnPlayer}
                      className="text-[10px] font-mono px-2 py-0.5 rounded border bg-emerald-950/40 text-emerald-300 border-emerald-800 hover:bg-emerald-900/60 transition flex items-center gap-1"
                    >
                      <RefreshCw className="w-3 h-3" /> RESPAWN
                    </button>
                  )}
                  <button
                    onClick={handleTogglePlayerSpawn}
                    className={`text-[10px] font-mono px-2 py-0.5 rounded border transition ${
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
                <div className="space-y-2">
                  <select
                    value={playerMode}
                    onChange={e => setPlayerMode(e.target.value as any)}
                    className="w-full bg-[#141a15] border border-[#253327] rounded px-3 py-2 text-xs font-mono text-[#e0e7e0] focus:outline-none appearance-none bg-no-repeat bg-[right_0.75rem_center] pr-8"
                    style={{ backgroundImage: `url('data:image/svg+xml;utf8,<svg fill="%23a1a1aa" height="16" viewBox="0 0 24 24" width="16" xmlns="http://www.w3.org/2000/svg"><path d="M7 10l5 5 5-5z"/></svg>')` }}
                  >
                    <option value="smart_auto">Smart Auto AI (Spacing, Crits, Totems)</option>
                    <option value="direct_engage">Direct Goal Approach & Spacing</option>
                    <option value="turtle_shield">Turtle Shield Defense</option>
                    <option value="flee">Flee & Disengage</option>
                    <option value="manual">Stationary Dummy</option>
                  </select>

                  <div className="p-2.5 bg-[#141a15] border border-[#253327] rounded space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-mono text-[#8a9a8c] flex items-center gap-1.5">
                        <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                        Totems of Undying:
                      </span>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min="0"
                          max="64"
                          value={state.playerTotems}
                          onChange={e => {
                            const val = Math.max(0, Math.min(64, parseInt(e.target.value, 10) || 0));
                            setState(prev => ({ ...prev, playerTotems: val }));
                          }}
                          className="w-16 bg-[#0a0f0c] border border-[#2a3a2d] focus:border-amber-500 rounded px-2 py-1 text-xs font-mono font-bold text-amber-300 text-center focus:outline-none"
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 pt-1 border-t border-[#1d271f]">
                      <span className="text-[9px] font-mono text-zinc-500 uppercase">Presets:</span>
                      {[0, 1, 3, 5, 10, 64].map(preset => (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => setState(prev => ({ ...prev, playerTotems: preset }))}
                          className={`text-[10px] font-mono px-2 py-0.5 rounded border transition ${
                            state.playerTotems === preset
                              ? 'bg-amber-950/60 text-amber-300 border-amber-700 font-bold'
                              : 'bg-[#101511] text-zinc-400 border-[#223024] hover:text-zinc-200 hover:border-zinc-700'
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
          <div className="p-4 bg-[#0c0e0c] border border-[#1d251e] rounded-xl space-y-3">
            <div className="flex items-center justify-between border-b border-[#1a241b] pb-2">
              <div className="flex items-center gap-2">
                <Swords className="w-4 h-4 text-amber-400" />
                <span className="font-serif text-sm font-bold text-[#e0e7e0]">Manual Minos Moves & Combo Triggers</span>
              </div>
              <span className="text-[10px] font-mono text-zinc-500">Instant Execution</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                onClick={() => triggerMove('thy_end_is_now')}
                disabled={state.cdThyEndIsNow > 0 || state.rotIsDead}
                className={`px-2.5 py-2 border rounded text-[11px] font-mono text-left transition flex items-center justify-between gap-1 min-w-0 ${
                  state.cdThyEndIsNow > 0
                    ? 'bg-zinc-900/60 border-zinc-800 text-zinc-500 cursor-not-allowed'
                    : 'bg-[#141a15] hover:bg-[#1f2b21] border-[#253327] hover:border-amber-700/60 text-amber-300'
                }`}
              >
                <span className="truncate">Thy End Is Now (4-Hit)</span>
                {state.cdThyEndIsNow > 0 ? (
                  <span className="text-[10px] text-zinc-500 font-bold">{state.cdThyEndIsNow}t</span>
                ) : (
                  <ArrowRight className="w-3 h-3 text-amber-400/60 shrink-0" />
                )}
              </button>
              <button
                onClick={() => triggerMove('judgment')}
                disabled={state.cdJudgment > 0 || state.rotIsDead}
                className={`px-2.5 py-2 border rounded text-[11px] font-mono text-left transition flex items-center justify-between gap-1 min-w-0 ${
                  state.cdJudgment > 0
                    ? 'bg-zinc-900/60 border-zinc-800 text-zinc-500 cursor-not-allowed'
                    : 'bg-[#141a15] hover:bg-[#1f2b21] border-[#253327] hover:border-red-700/60 text-red-300'
                }`}
              >
                <span className="truncate">Judgment (Dropkick)</span>
                {state.cdJudgment > 0 ? (
                  <span className="text-[10px] text-zinc-500 font-bold">{state.cdJudgment}t</span>
                ) : (
                  <ArrowRight className="w-3 h-3 text-red-400/60 shrink-0" />
                )}
              </button>
              <button
                onClick={() => triggerMove('prepare_thyself')}
                disabled={state.cdPrepareThyself > 0 || state.rotIsDead}
                className={`px-2.5 py-2 border rounded text-[11px] font-mono text-left transition flex items-center justify-between gap-1 min-w-0 ${
                  state.cdPrepareThyself > 0
                    ? 'bg-zinc-900/60 border-zinc-800 text-zinc-500 cursor-not-allowed'
                    : 'bg-[#141a15] hover:bg-[#1f2b21] border-[#253327] hover:border-purple-700/60 text-purple-300'
                }`}
              >
                <span className="truncate">Prepare Thyself (Dash)</span>
                {state.cdPrepareThyself > 0 ? (
                  <span className="text-[10px] text-zinc-500 font-bold">{state.cdPrepareThyself}t</span>
                ) : (
                  <ArrowRight className="w-3 h-3 text-purple-400/60 shrink-0" />
                )}
              </button>
              <button
                onClick={() => triggerMove('die_overhead')}
                disabled={state.cdOverheadSlam > 0 || state.rotIsDead}
                className={`px-2.5 py-2 border rounded text-[11px] font-mono text-left transition flex items-center justify-between gap-1 min-w-0 ${
                  state.cdOverheadSlam > 0
                    ? 'bg-zinc-900/60 border-zinc-800 text-zinc-500 cursor-not-allowed'
                    : 'bg-[#141a15] hover:bg-[#1f2b21] border-[#253327] hover:border-fuchsia-700/60 text-fuchsia-300'
                }`}
              >
                <span className="truncate">Die! (Overhead Slam)</span>
                {state.cdOverheadSlam > 0 ? (
                  <span className="text-[10px] text-zinc-500 font-bold">{state.cdOverheadSlam}t</span>
                ) : (
                  <ArrowRight className="w-3 h-3 text-fuchsia-400/60 shrink-0" />
                )}
              </button>
              <button
                onClick={() => triggerMove('heavy_punch')}
                disabled={state.cdHeavyStrike > 0 || state.rotIsDead}
                className={`px-2.5 py-2 border rounded text-[11px] font-mono text-left transition flex items-center justify-between gap-1 min-w-0 ${
                  state.cdHeavyStrike > 0
                    ? 'bg-zinc-900/60 border-zinc-800 text-zinc-500 cursor-not-allowed'
                    : 'bg-[#141a15] hover:bg-[#1f2b21] border-[#253327] hover:border-rose-700/60 text-rose-300'
                }`}
              >
                <span className="truncate">Heavy Strike (Shield Breaker)</span>
                {state.cdHeavyStrike > 0 ? (
                  <span className="text-[10px] text-zinc-500 font-bold">{state.cdHeavyStrike}t</span>
                ) : (
                  <ArrowRight className="w-3 h-3 text-rose-400/60 shrink-0" />
                )}
              </button>
              <button
                onClick={() => triggerMove('solar_laser')}
                disabled={state.cdSolarLaser > 0 || state.rotIsDead}
                className={`px-2.5 py-2 border rounded text-[11px] font-mono text-left transition flex items-center justify-between gap-1 min-w-0 ${
                  state.cdSolarLaser > 0
                    ? 'bg-zinc-900/60 border-zinc-800 text-zinc-500 cursor-not-allowed'
                    : 'bg-[#141a15] hover:bg-[#1f2b21] border-[#253327] hover:border-orange-700/60 text-orange-300'
                }`}
              >
                <span className="truncate">Sweeping Solar Raycast</span>
                {state.cdSolarLaser > 0 ? (
                  <span className="text-[10px] text-zinc-500 font-bold">{state.cdSolarLaser}t</span>
                ) : (
                  <ArrowRight className="w-3 h-3 text-orange-400/60 shrink-0" />
                )}
              </button>
            </div>
          </div>

          {/* Combat Telemetry Log */}
          <div className="p-4 bg-[#0c0e0c] border border-[#1d251e] rounded-xl space-y-3">
            <div className="flex items-center justify-between border-b border-[#1a241b] pb-2">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-emerald-400" />
                <span className="font-serif text-sm font-bold text-[#e0e7e0]">Combat Telemetry Log</span>
              </div>
              <button
                onClick={() => setLogs([])}
                className="text-[10px] font-mono text-[#6b7280] hover:text-[#a1a1aa]"
              >
                Clear Log
              </button>
            </div>

            <div className="h-44 overflow-y-auto font-mono text-[10px] space-y-1.5 pr-2 select-text bg-[#060a07] p-3 rounded-lg border border-[#141c16]">
              {logs.length === 0 ? (
                <div className="text-zinc-600 italic">No combat events recorded yet.</div>
              ) : (
                logs.map((log, i) => (
                  <div
                    key={i}
                    className={`leading-relaxed ${
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
            <div className="px-3 py-1.5 bg-[#111612] border border-[#1e2b20] rounded-lg text-xs font-mono flex items-center gap-2">
              <span className="text-zinc-500 uppercase">Active State:</span>
              <span className="text-amber-400 font-bold">{state.combatState}</span>
            </div>
          </div>
        </div>

        {/* Lobe Legend */}
        <div className="flex flex-wrap items-center gap-4 text-xs font-mono px-3 py-2 bg-[#080c09] border border-[#18241b] rounded-lg">
          <span className="text-zinc-500 font-semibold uppercase text-[10px]">Lobes:</span>
          <div className="flex items-center gap-1.5 text-sky-400">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-400 inline-block"></span>
            <span>Sensory Bus</span>
          </div>
          <div className="flex items-center gap-1.5 text-emerald-400">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block"></span>
            <span>Biological Adaptation</span>
          </div>
          <div className="flex items-center gap-1.5 text-purple-400">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-400 inline-block"></span>
            <span>Master Nexus</span>
          </div>
          <div className="flex items-center gap-1.5 text-amber-400">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block"></span>
            <span>Minos Combat FSM</span>
          </div>
          <div className="flex items-center gap-1.5 text-rose-400">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-400 inline-block"></span>
            <span>Physical Actuators</span>
          </div>
        </div>

        {/* Connected Circular Brain SVG Graph */}
        <div className="relative rounded-xl border border-[#1a261c] bg-[#050806] overflow-hidden p-2">
          <svg
            viewBox="0 0 1020 560"
            className="w-full h-auto block select-none"
            style={{ minHeight: '440px' }}
          >
            <defs>
              {/* Glow Filter */}
              <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
              <filter id="superGlow" x="-40%" y="-40%" width="180%" height="180%">
                <feGaussianBlur stdDeviation="8" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Subtle Grid Background */}
            <g opacity="0.08">
              {Array.from({ length: 26 }).map((_, i) => (
                <line key={`gx_${i}`} x1={i * 40} y1="0" x2={i * 40} y2="560" stroke="#4ade80" strokeWidth="1" />
              ))}
              {Array.from({ length: 15 }).map((_, i) => (
                <line key={`gy_${i}`} x1="0" y1={i * 40} x2="1020" y2={i * 40} stroke="#4ade80" strokeWidth="1" />
              ))}
            </g>

            {/* 1. Synaptic Connection Lines (Linking Connected Circles) */}
            {brainSynapses.map(syn => {
              const fromN = brainNodes.find(n => n.id === syn.from);
              const toN = brainNodes.find(n => n.id === syn.to);
              if (!fromN || !toN) return null;

              const c1X = fromN.x + (toN.x - fromN.x) * 0.5;
              const c1Y = fromN.y;
              const c2X = fromN.x + (toN.x - fromN.x) * 0.5;
              const c2Y = toN.y;
              const pathD = `M ${fromN.x} ${fromN.y} C ${c1X} ${c1Y}, ${c2X} ${c2Y}, ${toN.x} ${toN.y}`;

              const isHighlighted = selectedNodeId === syn.from || selectedNodeId === syn.to;

              return (
                <g key={syn.id}>
                  {/* Background Track Line */}
                  <path
                    d={pathD}
                    fill="none"
                    stroke={syn.active ? syn.color : '#27272a'}
                    strokeWidth={isHighlighted ? 3 : syn.active ? 2 : 1}
                    strokeOpacity={isHighlighted ? 0.9 : syn.active ? 0.45 : 0.15}
                    strokeDasharray={syn.active ? undefined : '4 4'}
                  />

                  {/* Pulsing Synaptic Signal Stream */}
                  {syn.active && (
                    <path
                      d={pathD}
                      fill="none"
                      stroke={syn.color}
                      strokeWidth={isHighlighted ? 4 : 2.5}
                      strokeDasharray="8 24"
                      strokeLinecap="round"
                      filter="url(#glow)"
                      className="animate-pulse"
                    />
                  )}
                </g>
              );
            })}

            {/* 2. Circular Brain Nodes */}
            {brainNodes.map(node => {
              const isSelected = selectedNodeId === node.id;
              const IconComp = node.icon;

              return (
                <g
                  key={node.id}
                  transform={`translate(${node.x}, ${node.y})`}
                  className="cursor-pointer transition-transform duration-200 hover:scale-105"
                  onClick={() => setSelectedNodeId(node.id)}
                >
                  {/* Outer Pulsing Halo */}
                  {node.active && (
                    <circle
                      r={node.r + 6}
                      fill="none"
                      stroke={node.color}
                      strokeWidth="1.5"
                      strokeOpacity="0.4"
                      className="animate-ping"
                      style={{ animationDuration: '3s' }}
                    />
                  )}

                  {/* Selection Ring */}
                  {isSelected && (
                    <circle
                      r={node.r + 5}
                      fill="none"
                      stroke="#ffffff"
                      strokeWidth="2"
                      strokeDasharray="4 3"
                      filter="url(#glow)"
                    />
                  )}

                  {/* Main Circle Body */}
                  <circle
                    r={node.r}
                    fill="#0a0f0c"
                    stroke={isSelected ? '#ffffff' : node.active ? node.color : '#3f3f46'}
                    strokeWidth={isSelected ? 3 : 2}
                    filter={node.active ? 'url(#glow)' : undefined}
                  />

                  {/* Inner Core Circle */}
                  <circle
                    r={node.r * 0.72}
                    fill={node.active ? `${node.color}22` : '#18181b'}
                    stroke={node.active ? `${node.color}55` : '#27272a'}
                    strokeWidth="1"
                  />

                  {/* Icon Glyph in Circle Center */}
                  <foreignObject
                    x={-14}
                    y={-14}
                    width={28}
                    height={28}
                    className="pointer-events-none"
                  >
                    <div className="w-full h-full flex items-center justify-center">
                      <IconComp
                        className="w-4 h-4"
                        style={{ color: node.active ? node.color : '#71717a' }}
                      />
                    </div>
                  </foreignObject>

                  {/* Circle Header Label (Top or Bottom) */}
                  <text
                    y={node.y > 400 ? -node.r - 8 : node.r + 15}
                    textAnchor="middle"
                    fill="#e0e7e0"
                    fontSize="11"
                    fontFamily="monospace"
                    fontWeight="bold"
                    className="pointer-events-none drop-shadow"
                  >
                    {node.label}
                  </text>

                  {/* Circle Live Metric Badge */}
                  <text
                    y={node.y > 400 ? -node.r - 22 : node.r + 28}
                    textAnchor="middle"
                    fill={node.active ? node.color : '#71717a'}
                    fontSize="10"
                    fontFamily="monospace"
                    fontWeight="bold"
                    className="pointer-events-none"
                  >
                    {node.val}
                  </text>
                </g>
              );
            })}
          </svg>
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
      <div className="p-6 bg-[#0c0e0c] border border-[#1d251e] rounded-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1a241b] pb-4">
          <div className="flex items-center gap-2.5">
            <Clock className="w-5 h-5 text-amber-400" />
            <div>
              <h2 className="font-serif text-lg font-bold text-[#e0e7e0]">
                The Rot: Ability Timing, Cooldowns & Frame Data Registry
              </h2>
              <p className="text-xs text-[#8a9a8c]">
                Exact per-tick timing, windup frames, active collision windows, recovery duration, and mass knockback impulses from Java source code.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono px-3 py-1.5 rounded-lg bg-[#111612] border border-[#1e2b20] text-zinc-400">
            <span>Tick Standard:</span>
            <span className="text-emerald-400 font-bold">20 TPS (50ms/t)</span>
          </div>
        </div>

        {/* Ability Matrix Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
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
      <div className="p-6 bg-[#0c0e0c] border border-[#1d251e] rounded-xl space-y-6">
        <div className="flex items-center gap-2.5 border-b border-[#1a241b] pb-4">
          <Database className="w-5 h-5 text-indigo-400" />
          <div>
            <h2 className="font-serif text-lg font-bold text-[#e0e7e0]">
              The Rot's Mod Brain Subsystems (Java Source Architecture)
            </h2>
            <p className="text-xs text-[#8a9a8c]">
              Synchronized Java data models including UniversalEngine, AttackPredictorAdapters, CombatProfile, RotHivemindSavedData, and InterceptionPrediction.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
  );
}
