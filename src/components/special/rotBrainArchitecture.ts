// Rot Neural Mindspace & Combat Architecture Subsystems
// Exact Java / MCreator Class Structure from Backwoods Mod Source

export type TargetIntent = 'AGGRESSIVE' | 'EVASIVE' | 'FLANKING' | 'SIEGE' | 'RETREAT';
export type FightStyle = 'AGGRESSIVE' | 'RELENTLESS' | 'ADAPTIVE' | 'CALCULATED' | 'AMBUSH';
export type ThreatLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' | 'APOCALYPTIC';
export type RotCombatRole = 'PUNISHER' | 'FLANKER' | 'SIEGE_BREAKER' | 'STALKER';

// 1. Ability Info & Cooldown/Timing Registry
export interface AbilityInfo {
  id: string;
  name: string;
  cooldownMaxTicks: number;
  cooldownCurrentTicks: number;
  windupTicks: number;      // Startup / telegraph window
  activeTicks: number;      // Active hitbox window
  recoveryTicks: number;    // Endlag
  effectiveRange: number;   // In meters
  rawDamage: number;        // Base damage
  shieldBreak: boolean;     // Whether it disables shields
  shieldBreakDurationTicks: number; // 100t = 5.0s
  shockwaveRadius: number;  // In meters
  shockwaveImpulse: number; // Base velocity impulse
  description: string;
  counterplay: string;
}

export const ROTS_ABILITY_REGISTRY: Record<string, AbilityInfo> = {
  thy_end_is_now: {
    id: 'thy_end_is_now',
    name: 'Thy End Is Now (4-Hit Combo)',
    cooldownMaxTicks: 80,
    cooldownCurrentTicks: 0,
    windupTicks: 6,
    activeTicks: 18,
    recoveryTicks: 10,
    effectiveRange: 4.5,
    rawDamage: 90.0,
    shieldBreak: true,
    shieldBreakDurationTicks: 100,
    shockwaveRadius: 5.0,
    shockwaveImpulse: 0.62,
    description: 'Rapid 4-hit martial combo concluding with an explosive overhead cross that disables shields and knocks all surrounding entities outward.',
    counterplay: 'Block strikes 1-3, then backdash before the unblockable 4th finisher connects.'
  },
  judgment: {
    id: 'judgment',
    name: 'Judgment (Supersonic Dropkick)',
    cooldownMaxTicks: 140,
    cooldownCurrentTicks: 0,
    windupTicks: 14,
    activeTicks: 12,
    recoveryTicks: 14,
    effectiveRange: 18.0,
    rawDamage: 110.0,
    shieldBreak: true,
    shieldBreakDurationTicks: 100,
    shockwaveRadius: 7.0,
    shockwaveImpulse: 0.85,
    description: 'Ascends to apex altitude (Y=76) before diving at supersonic speeds into the target trajectory, unleashing a massive radial shockwave.',
    counterplay: 'Sprint perpendicularly or time an evasive dodge during the final 3 ticks of the dive.'
  },
  prepare_thyself: {
    id: 'prepare_thyself',
    name: 'Prepare Thyself (Instant Warp Cross)',
    cooldownMaxTicks: 100,
    cooldownCurrentTicks: 0,
    windupTicks: 6,
    activeTicks: 4,
    recoveryTicks: 8,
    effectiveRange: 24.0,
    rawDamage: 36.0,
    shieldBreak: false,
    shieldBreakDurationTicks: 0,
    shockwaveRadius: 4.8,
    shockwaveImpulse: 0.52,
    description: 'Flash teleports directly into the target blindspot and instantly sweeps with twin cross-arm slashes.',
    counterplay: 'Execute an instant 180° snap shield block upon hearing the teleport flash cue.'
  },
  overhead_slam: {
    id: 'overhead_slam',
    name: 'Die! (Overhead Ground Smash)',
    cooldownMaxTicks: 120,
    cooldownCurrentTicks: 0,
    windupTicks: 12,
    activeTicks: 10,
    recoveryTicks: 12,
    effectiveRange: 8.0,
    rawDamage: 52.0,
    shieldBreak: true,
    shieldBreakDurationTicks: 100,
    shockwaveRadius: 6.0,
    shockwaveImpulse: 0.72,
    description: 'High vertical leap smashing both fists down onto the earth, triggering shield shatter and radial ground rupture.',
    counterplay: 'Flee the red target ground reticle before apex touchdown.'
  },
  heavy_strike: {
    id: 'heavy_strike',
    name: 'Heavy Strike (Shield Breaker Uppercut)',
    cooldownMaxTicks: 50,
    cooldownCurrentTicks: 0,
    windupTicks: 8,
    activeTicks: 4,
    recoveryTicks: 6,
    effectiveRange: 3.5,
    rawDamage: 32.0,
    shieldBreak: true,
    shieldBreakDurationTicks: 100,
    shockwaveRadius: 0.0,
    shockwaveImpulse: 0.40,
    description: 'Telegraphed heavy uppercut configured specifically to shatter active player shield guards.',
    counterplay: 'Drop shield momentarily and deliver a fast weapon counter-jab.'
  },
  solar_laser: {
    id: 'solar_laser',
    name: 'Sweeping Solar Raycast Beam',
    cooldownMaxTicks: 160,
    cooldownCurrentTicks: 0,
    windupTicks: 18,
    activeTicks: 24,
    recoveryTicks: 16,
    effectiveRange: 22.0,
    rawDamage: 65.0,
    shieldBreak: false,
    shieldBreakDurationTicks: 0,
    shockwaveRadius: 0.0,
    shockwaveImpulse: 0.25,
    description: 'Continuous concentrated solar thermal beam sweeping across long-range threats with high DPS.',
    counterplay: 'Hold shield facing the focal emitter or break line-of-sight behind arena walls.'
  },
  surge_regeneration: {
    id: 'surge_regeneration',
    name: 'Biological Surge Regeneration',
    cooldownMaxTicks: 6,
    cooldownCurrentTicks: 0,
    windupTicks: 0,
    activeTicks: 1,
    recoveryTicks: 5,
    effectiveRange: 0.0,
    rawDamage: 0.0,
    shieldBreak: false,
    shieldBreakDurationTicks: 0,
    shockwaveRadius: 0.0,
    shockwaveImpulse: 0.0,
    description: 'Autonomous rapid cellular healing pulsing +5 to +28 HP every 6 ticks (3.3x/sec) based on adaptation stacks.',
    counterplay: 'Burst down with continuous DPS before kinetic/swarm adaptation accumulates.'
  },
  defensive_guard: {
    id: 'defensive_guard',
    name: 'Defensive Kinetic Guard',
    cooldownMaxTicks: 90,
    cooldownCurrentTicks: 0,
    windupTicks: 2,
    activeTicks: 30,
    recoveryTicks: 6,
    effectiveRange: 3.0,
    rawDamage: 0.0,
    shieldBreak: false,
    shieldBreakDurationTicks: 0,
    shockwaveRadius: 0.0,
    shockwaveImpulse: 0.0,
    description: 'Crosses forearms to absorb incoming physical and projectile damage, building internal kinetic energy before unleashing a counter-offensive.',
    counterplay: 'Cease physical attacks during guard frames to prevent charging its counter-offensive.'
  },
  launcher_uppercut: {
    id: 'launcher_uppercut',
    name: 'Airborne Launcher Uppercut',
    cooldownMaxTicks: 70,
    cooldownCurrentTicks: 0,
    windupTicks: 6,
    activeTicks: 6,
    recoveryTicks: 8,
    effectiveRange: 3.8,
    rawDamage: 45.0,
    shieldBreak: true,
    shieldBreakDurationTicks: 80,
    shockwaveRadius: 3.5,
    shockwaveImpulse: 1.15,
    description: 'A brutal rising vertical punch launching targets 12+ blocks high into the air, setting up guaranteed aerial or landing dive bomb punishments.',
    counterplay: 'Air-strafe or use Water Bucket / Slow Falling before touching down.'
  },
  aerial_dive_bomb: {
    id: 'aerial_dive_bomb',
    name: 'Aerial Dive Bomb & Slam',
    cooldownMaxTicks: 110,
    cooldownCurrentTicks: 0,
    windupTicks: 8,
    activeTicks: 14,
    recoveryTicks: 12,
    effectiveRange: 16.0,
    rawDamage: 75.0,
    shieldBreak: true,
    shieldBreakDurationTicks: 100,
    shockwaveRadius: 6.5,
    shockwaveImpulse: 0.80,
    description: 'Propels vertically upward and executes an angled downward plunge into elevated or airborne targets with catastrophic impact force.',
    counterplay: 'Dash laterally perpendicular to the descent angle when the downward plunge begins.'
  },
  ender_pearl_intercept: {
    id: 'ender_pearl_intercept',
    name: 'Ender Pearl Trajectory Intercept',
    cooldownMaxTicks: 40,
    cooldownCurrentTicks: 0,
    windupTicks: 2,
    activeTicks: 8,
    recoveryTicks: 4,
    effectiveRange: 48.0,
    rawDamage: 48.0,
    shieldBreak: false,
    shieldBreakDurationTicks: 0,
    shockwaveRadius: 3.0,
    shockwaveImpulse: 0.45,
    description: 'Detects thrown Ender Pearls in flight, extrapolates the parabolic landing coordinate, and pre-teleports to ambush the victim on arrival.',
    counterplay: 'Avoid predictable pearl throws when within 48 blocks of an active Rot entity.'
  },
  consumable_punish: {
    id: 'consumable_punish',
    name: 'Consumable & Item Eat Punish',
    cooldownMaxTicks: 30,
    cooldownCurrentTicks: 0,
    windupTicks: 2,
    activeTicks: 6,
    recoveryTicks: 4,
    effectiveRange: 10.0,
    rawDamage: 55.0,
    shieldBreak: true,
    shieldBreakDurationTicks: 100,
    shockwaveRadius: 4.0,
    shockwaveImpulse: 0.60,
    description: 'Sensory reflex that instantly dashes forward or dropkicks targets caught in item consumption animations (Golden Apples, Potions, Milk).',
    counterplay: 'Only consume healing items behind solid barricades or at extreme range.'
  },
  sonic_scream_directional: {
    id: 'sonic_scream_directional',
    name: 'Armor-Bypassing Sonic Scream',
    cooldownMaxTicks: 180,
    cooldownCurrentTicks: 0,
    windupTicks: 16,
    activeTicks: 10,
    recoveryTicks: 18,
    effectiveRange: 24.0,
    rawDamage: 80.0,
    shieldBreak: true,
    shieldBreakDurationTicks: 120,
    shockwaveRadius: 2.5,
    shockwaveImpulse: 0.90,
    description: 'Focused high-frequency acoustic beam learned from Warden encounters that completely ignores armor and shield mitigation across 24 blocks.',
    counterplay: 'Break line of sight behind thick stone or obsidian walls.'
  },
  sonic_shockwave_radial: {
    id: 'sonic_shockwave_radial',
    name: 'Omnidirectional Sonic Shockwave',
    cooldownMaxTicks: 240,
    cooldownCurrentTicks: 0,
    windupTicks: 20,
    activeTicks: 16,
    recoveryTicks: 24,
    effectiveRange: 24.0,
    rawDamage: 95.0,
    shieldBreak: true,
    shieldBreakDurationTicks: 140,
    shockwaveRadius: 24.0,
    shockwaveImpulse: 1.40,
    description: 'Unleashes an apocalyptic 360-degree acoustic detonation fracturing terrain and knocking all surrounding entities back with extreme violence.',
    counterplay: 'Sprint beyond the 24-block threshold the moment the sonic charging telegraph begins.'
  },
  tactical_stalk: {
    id: 'tactical_stalk',
    name: 'Tactical Stalk & Circle Strafe',
    cooldownMaxTicks: 60,
    cooldownCurrentTicks: 0,
    windupTicks: 0,
    activeTicks: 40,
    recoveryTicks: 0,
    effectiveRange: 14.0,
    rawDamage: 0.0,
    shieldBreak: false,
    shieldBreakDurationTicks: 0,
    shockwaveRadius: 0.0,
    shockwaveImpulse: 0.0,
    description: 'Calculates target blindspots and circle-strafes around shields and barricades, waiting for optimal combo openings.',
    counterplay: 'Keep back to a wall and maintain rotational awareness.'
  }
};

// 2. Combat Context
export interface CombatContext {
  targetIntent: TargetIntent;
  fightStyle: FightStyle;
  threatLevel: ThreatLevel;
  lineOfSight: boolean;
  environmentThreatScore: number;
  surroundingHostileCount: number;
  dominantDamageSource: 'MELEE' | 'PROJECTILE' | 'BLAST' | 'MAGIC' | 'NONE';
  tacticalDistanceMeters: number;
  isTargetAirborne: boolean;
}

// 3. Interception Prediction
export interface InterceptionPrediction {
  leadTicks: number;
  interceptX: number;
  interceptZ: number;
  targetVelocityX: number;
  targetVelocityZ: number;
  confidenceScore: number; // 0.0 to 1.0
  evasionVector: { x: number; z: number };
}

// 4. Personality Vector
export interface PersonalityVector {
  aggression: number;       // 0.92 (Relentless pursuit)
  patience: number;         // 0.35 (Prefers rapid pressure)
  unpredictability: number; // 0.84 (Swaps combo strings)
  adaptability: number;     // 0.96 (Rapid resistance building)
  cooperativeness: number;  // 0.78 (Swarm role arbitration)
}

// 5. Welford Online Statistics Tracker
export interface WelfordStats {
  count: number;
  mean: number;
  M2: number;
  variance: number;
  stdDev: number;
  zScore: number;
}

export function createWelford(): WelfordStats {
  return { count: 0, mean: 0, M2: 0, variance: 0, stdDev: 0, zScore: 0 };
}

export function updateWelford(tracker: WelfordStats, sample: number): WelfordStats {
  const count = tracker.count + 1;
  const delta = sample - tracker.mean;
  const mean = tracker.mean + delta / count;
  const delta2 = sample - mean;
  const M2 = tracker.M2 + delta * delta2;
  const variance = count > 1 ? M2 / (count - 1) : 0;
  const stdDev = Math.sqrt(variance);
  const zScore = stdDev > 0.001 ? (sample - mean) / stdDev : 0;
  return { count, mean, M2, variance, stdDev, zScore };
}

// 6. Player Behavior Tracker
export interface PlayerBehaviorData {
  distanceTracker: WelfordStats;
  attackIntervalTracker: WelfordStats;
  shieldUsageFrequency: number;
  weaponSwitchCount: number;
  lastAttackTick: number;
  estimatedReactionMs: number;
}

// 7. Tactical Neural Network (18 Inputs -> 16 Hidden (ReLU) -> 15 Tactical Outputs)
export interface TacticalNeuralData {
  inputs: number[];
  hidden: number[];
  weightsCount: number;
  outputs: {
    thyEndIsNow: number;
    judgment: number;
    prepareThyself: number;
    overheadSlam: number;
    heavyStrike?: number;
    solarLaser: number;
    tacticalStalk: number;
    defensiveGuard?: number;
    launcherUppercut?: number;
    aerialDiveBomb?: number;
    enderPearlIntercept?: number;
    consumablePunish?: number;
    sonicScream?: number;
    sonicShockwave?: number;
    surgeRegen?: number;
  };
}

// 8. Role Auction (Multi-Agent Swarm Arbiter)
export interface RoleBidData {
  activeRole: RotCombatRole;
  bidUtility: number;
  expireTick: number;
  activeBids: Array<{ role: RotCombatRole; bid: number; ownerId: string }>;
}

// 9. Rot Hivemind Saved Data (Persistent World Threat Matrix)
export interface RotHivemindSavedData {
  globalEncounters: number;
  totalPlayerKills: number;
  cumulativeAdaptationScore: number;
  threatMemoryMap: Record<string, number>;
  swarmDominanceIndex: number;
  lastSeenPlayerGear: string;
}

// 10. Combat Profile
export interface CombatProfile {
  preferredStyle: FightStyle;
  reactionTimeTicks: number;
  shieldDiscipline: number; // 0.0 - 1.0
  comboTolerance: number;
  threatRating: number;
}

// 11. Pending Prediction
export interface PendingPrediction {
  targetTick: number;
  predictedX: number;
  predictedZ: number;
  expectedDamageWindow: number;
  evasionImpulse: { x: number; z: number };
}

// 12. Entity Observation
export interface EntityObservation {
  entityId: string;
  entityType: string;
  lastSeenPos: { x: number; z: number };
  velocityVector: { x: number; z: number };
  threatEvaluation: number;
  distance: number;
  equippedItem: string;
}

// 13. Attack Predictor Adapters (Multi-Mod Integration)
export interface AttackPredictorAdapter {
  name: string;
  modSource: string;
  isActive: boolean;
  threatEvaluation: number;
  detectedThreat: string;
  counterStrategy: string;
}

export const INITIAL_PREDICTOR_ADAPTERS: AttackPredictorAdapter[] = [
  {
    name: 'VanillaPredictorAdapter',
    modSource: 'Minecraft Java Vanilla',
    isActive: true,
    threatEvaluation: 0.65,
    detectedThreat: 'Player Axe Crit / Shield Guard / Bow Draw',
    counterStrategy: 'Heavy Strike guard break + supersonic dropkick kiting'
  },
  {
    name: 'CataclysmPredictorAdapter',
    modSource: "L_Ender's Cataclysm",
    isActive: true,
    threatEvaluation: 0.88,
    detectedThreat: 'Netherite Monstrosity Slam / Ignis Fire Whirl',
    counterStrategy: 'Blast adaptation dampening + aerial dropkick evasion'
  },
  {
    name: 'MowziesPredictorAdapter',
    modSource: "Mowzie's Mobs",
    isActive: true,
    threatEvaluation: 0.74,
    detectedThreat: 'Ferrous Wroughtnaut Overhead Helm Crusher',
    counterStrategy: 'Prepare Thyself blindspot teleport to rear armor seam'
  },
  {
    name: 'AlexsCavesPredictorAdapter',
    modSource: "Alex's Caves",
    isActive: true,
    threatEvaluation: 0.82,
    detectedThreat: 'Tremorzilla Atomic Breath / Luxtructosaurus Charge',
    counterStrategy: 'Solar Laser suppression + flash phase evasion'
  },
  {
    name: 'EpicFightPredictorAdapter',
    modSource: 'Epic Fight Mod',
    isActive: true,
    threatEvaluation: 0.79,
    detectedThreat: 'Posture Gauge Break / Roll I-Frame Execution',
    counterStrategy: 'Thy End Is Now 4-hit chain to exhaust stamina roll pool'
  },
  {
    name: 'IronSpellsPredictorAdapter',
    modSource: "Iron's Spells 'n Spellbooks",
    isActive: true,
    threatEvaluation: 0.85,
    detectedThreat: 'Eldritch / Lightning Chant Spell Telegraph',
    counterStrategy: 'Flash warp interrupt during spell cast startup frames'
  }
];

// 14. Universal Combat Prediction Engine
export interface UniversalEngineData {
  activeAdaptersCount: number;
  compositeThreatScore: number;
  evasionVector: { x: number; z: number };
  predictedIncomingDamage: number;
  recommendedCounterAction: string;
}

// 15. Physics Particle Debris
export interface PhysicsParticle {
  id: string;
  x: number;
  z: number;
  vx: number;
  vz: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
}
