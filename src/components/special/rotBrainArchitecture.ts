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
  triple_threat_combo: {
    id: 'triple_threat_combo',
    name: 'Triple Threat (3-Hit Combo)',
    cooldownMaxTicks: 1000,
    cooldownCurrentTicks: 0,
    windupTicks: 6,
    activeTicks: 18,
    recoveryTicks: 10,
    effectiveRange: 4.5,
    rawDamage: 54.0,
    shieldBreak: false,
    shieldBreakDurationTicks: 0,
    shockwaveRadius: 3.0,
    shockwaveImpulse: 0.55,
    description: 'Rapid 3-hit martial punch sequence dealing 18.0 damage per strike (54.0 total) to maintain close-range melee pressure and combo rhythm.',
    counterplay: 'Backstep out of the 4.5-block melee radius or raise shield to absorb the sequence.'
  },
  dropkick_combo: {
    id: 'dropkick_combo',
    name: 'Judgment (Supersonic Dropkick)',
    cooldownMaxTicks: 1000,
    cooldownCurrentTicks: 0,
    windupTicks: 14,
    activeTicks: 12,
    recoveryTicks: 14,
    effectiveRange: 200.0,
    rawDamage: 50.0,
    shieldBreak: true,
    shieldBreakDurationTicks: 100,
    shockwaveRadius: 7.0,
    shockwaveImpulse: 0.85,
    description: 'Accelerates across up to 200 meters into a supersonic dropkick that shatters active player shields (5.0s disable) and propels targets airborne.',
    counterplay: 'Sprint perpendicularly or time an evasive dodge during the final ticks of the incoming dive vector.'
  },
  high_sky_slam_combo: {
    id: 'high_sky_slam_combo',
    name: 'High Sky Slam (Uppercut -> Seismic Slam)',
    cooldownMaxTicks: 120,
    cooldownCurrentTicks: 0,
    windupTicks: 8,
    activeTicks: 16,
    recoveryTicks: 12,
    effectiveRange: 6.0,
    rawDamage: 65.0,
    shieldBreak: true,
    shieldBreakDurationTicks: 100,
    shockwaveRadius: 6.0,
    shockwaveImpulse: 1.15,
    description: 'Heavy rising uppercut (30.0 dmg) launching the victim 12+ blocks high before descending with a crushing seismic ground slam (35.0 dmg; 65.0 cumulative).',
    counterplay: 'Air-strafe or deploy water bucket / slow falling immediately upon airborne launch.'
  },
  die_rider_kick: {
    id: 'die_rider_kick',
    name: 'Heavenly Repentance / Die Rider Kick',
    cooldownMaxTicks: 160,
    cooldownCurrentTicks: 0,
    windupTicks: 10,
    activeTicks: 14,
    recoveryTicks: 14,
    effectiveRange: 30.0,
    rawDamage: 65.0,
    shieldBreak: true,
    shieldBreakDurationTicks: 100,
    shockwaveRadius: 8.0,
    shockwaveImpulse: 1.25,
    description: 'Acoustic-assisted supersonic leap dive punishing airborne, elevated, or fleeing targets with catastrophic kinetic detonation.',
    counterplay: 'Avoid jumping or aerial mobility while within line-of-sight during its pursuit phase.'
  },
  overhead_combo: {
    id: 'overhead_combo',
    name: 'Die! (Overhead Ground Smash)',
    cooldownMaxTicks: 120,
    cooldownCurrentTicks: 0,
    windupTicks: 12,
    activeTicks: 10,
    recoveryTicks: 12,
    effectiveRange: 4.5,
    rawDamage: 40.0,
    shieldBreak: true,
    shieldBreakDurationTicks: 100,
    shockwaveRadius: 6.0,
    shockwaveImpulse: 0.72,
    description: 'High vertical leap smashing both fists down onto the earth, triggering shield shatter (100t disable) and radial ground rupture.',
    counterplay: 'Flee the red target ground reticle before apex touchdown.'
  },
  minos_combo: {
    id: 'minos_combo',
    name: 'Minos Seismic Ground Slam',
    cooldownMaxTicks: 100,
    cooldownCurrentTicks: 0,
    windupTicks: 8,
    activeTicks: 10,
    recoveryTicks: 8,
    effectiveRange: 5.0,
    rawDamage: 35.0,
    shieldBreak: false,
    shieldBreakDurationTicks: 0,
    shockwaveRadius: 5.0,
    shockwaveImpulse: 0.65,
    description: 'Seismic shockwave ripple fracturing ground blocks and applying sustained ground pressure.',
    counterplay: 'Jump before the shockwave pulse touches your coordinates or maintain elevated positioning.'
  },
  sonic_boom: {
    id: 'sonic_boom',
    name: 'Warden Sonic Boom (Directional)',
    cooldownMaxTicks: 324,
    cooldownCurrentTicks: 0,
    windupTicks: 16,
    activeTicks: 10,
    recoveryTicks: 18,
    effectiveRange: 24.0,
    rawDamage: 38.0,
    shieldBreak: true,
    shieldBreakDurationTicks: 100,
    shockwaveRadius: 2.5,
    shockwaveImpulse: 0.90,
    description: 'Focused high-frequency acoustic beam learned from Warden encounters that completely ignores armor and shield mitigation across 24 blocks (deals 65.0 damage in Totem state).',
    counterplay: 'Break line of sight behind thick stone or solid arena walls.'
  },
  omni_sonic_boom: {
    id: 'omni_sonic_boom',
    name: 'Omnidirectional Sonic Shockwave',
    cooldownMaxTicks: 240,
    cooldownCurrentTicks: 0,
    windupTicks: 14,
    activeTicks: 12,
    recoveryTicks: 16,
    effectiveRange: 6.0,
    rawDamage: 10.0,
    shieldBreak: false,
    shieldBreakDurationTicks: 0,
    shockwaveRadius: 6.0,
    shockwaveImpulse: 1.10,
    description: '360-degree acoustic shockwave pulse dealing 10.0 splash damage (22.0 in Totem state), repelling surrounding melee aggressors and disrupting combat spacing.',
    counterplay: 'Maintain spacing greater than 6 blocks during sonic charging windup.'
  },
  solar_beam: {
    id: 'solar_beam',
    name: 'Sweeping Solar Raycast Beam',
    cooldownMaxTicks: 360,
    cooldownCurrentTicks: 0,
    windupTicks: 18,
    activeTicks: 24,
    recoveryTicks: 16,
    effectiveRange: 32.0,
    rawDamage: 8.0,
    shieldBreak: false,
    shieldBreakDurationTicks: 0,
    shockwaveRadius: 0.0,
    shockwaveImpulse: 0.25,
    description: 'Continuous concentrated solar thermal beam sweeping across long-range threats with high DPS (8.0 base, 18.0 boosted) and ignition; grants total immunity to Fire, Lava, Campfire, and Hot Floor damage.',
    counterplay: 'Hold shield facing the focal emitter or break line-of-sight behind arena walls.'
  },
  cryo_beam: {
    id: 'cryo_beam',
    name: 'Cryogenic Freezing Beam',
    cooldownMaxTicks: 360,
    cooldownCurrentTicks: 0,
    windupTicks: 18,
    activeTicks: 24,
    recoveryTicks: 16,
    effectiveRange: 32.0,
    rawDamage: 8.0,
    shieldBreak: false,
    shieldBreakDurationTicks: 0,
    shockwaveRadius: 0.0,
    shockwaveImpulse: 0.25,
    description: 'Freezing cryogenic raycast slowing and freezing targets (8.0 base, 18.0 boosted); grants total immunity to Freeze damage.',
    counterplay: 'Maintain cover and avoid linear corridors during cryo charge frames.'
  },
  wither_skulls: {
    id: 'wither_skulls',
    name: 'Homing Wither Skulls',
    cooldownMaxTicks: 200,
    cooldownCurrentTicks: 0,
    windupTicks: 10,
    activeTicks: 12,
    recoveryTicks: 10,
    effectiveRange: 32.0,
    rawDamage: 12.0,
    shieldBreak: false,
    shieldBreakDurationTicks: 0,
    shockwaveRadius: 2.0,
    shockwaveImpulse: 0.35,
    description: 'Fires homing Wither Skull projectiles inflicting wither decay and explosive harassment across 32 blocks.',
    counterplay: 'Block with shield or shoot incoming skulls out of the air.'
  },
  armor_rip: {
    id: 'armor_rip',
    name: 'Armor Rip & Chokehold',
    cooldownMaxTicks: 600,
    cooldownCurrentTicks: 0,
    windupTicks: 6,
    activeTicks: 30,
    recoveryTicks: 10,
    effectiveRange: 3.5,
    rawDamage: 2.0,
    shieldBreak: true,
    shieldBreakDurationTicks: 120,
    shockwaveRadius: 0.0,
    shockwaveImpulse: 0.0,
    description: 'Latches onto close-range targets, dealing continuous choke damage (2.0 per 15 ticks) and stripping armor defense stacks.',
    counterplay: 'Maintain space and do not allow the Rot within 3.5 blocks while armor rip is primed.'
  },
  block: {
    id: 'block',
    name: 'Defensive Parry & Kinetic Guard',
    cooldownMaxTicks: 90,
    cooldownCurrentTicks: 0,
    windupTicks: 2,
    activeTicks: 30,
    recoveryTicks: 6,
    effectiveRange: 5.5,
    rawDamage: 0.0,
    shieldBreak: false,
    shieldBreakDurationTicks: 0,
    shockwaveRadius: 0.0,
    shockwaveImpulse: 0.0,
    description: 'Raises defensive forearm guard to mitigate 99% of incoming damage (0.01x multiplier) during active parry frames.',
    counterplay: 'Hold attacks during active guard frames or use unblockable heavy strikes.'
  },
  superheat_evaporation: {
    id: 'superheat_evaporation',
    name: 'Superheat Fluid Evaporation',
    cooldownMaxTicks: 700,
    cooldownCurrentTicks: 0,
    windupTicks: 10,
    activeTicks: 15,
    recoveryTicks: 15,
    effectiveRange: 8.0,
    rawDamage: 26.0,
    shieldBreak: false,
    shieldBreakDurationTicks: 0,
    shockwaveRadius: 8.0,
    shockwaveImpulse: 0.75,
    description: 'Instantly flash-evaporates water, lava, and fluid obstacles in an 8-block radius, triggering a 26.0 damage thermal shockwave.',
    counterplay: 'Do not rely on water buckets or lava moats for containment.'
  },
  dodge_and_flank: {
    id: 'dodge_and_flank',
    name: 'Predictive Dodge & Flank Teleportation',
    cooldownMaxTicks: 30,
    cooldownCurrentTicks: 0,
    windupTicks: 1,
    activeTicks: 2,
    recoveryTicks: 3,
    effectiveRange: 16.0,
    rawDamage: 0.0,
    shieldBreak: false,
    shieldBreakDurationTicks: 0,
    shockwaveRadius: 0.0,
    shockwaveImpulse: 0.0,
    description: '85% dodge chance against player melee swings (18-tick dodge cooldown) and instantaneous flank teleportation to target blindspots (30-tick flank cooldown).',
    counterplay: 'Bait teleport with a feint strike and immediately rotate 180 degrees.'
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
    name: 'Consumable & Item Eat Reflex',
    cooldownMaxTicks: 30,
    cooldownCurrentTicks: 0,
    windupTicks: 2,
    activeTicks: 6,
    recoveryTicks: 4,
    effectiveRange: 10.0,
    rawDamage: 50.0,
    shieldBreak: true,
    shieldBreakDurationTicks: 100,
    shockwaveRadius: 4.0,
    shockwaveImpulse: 0.60,
    description: 'Sensory reflex that instantly dashes forward or dropkicks targets caught in item consumption animations (Golden Apples, Potions, Milk).',
    counterplay: 'Only consume healing items behind solid barricades or at extreme range.'
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

// 7. Tactical Neural Network (96 Inputs -> 48 Hidden (ReLU) -> 15 Tactical Outputs = 5,391 Weights)
export interface TacticalNeuralData {
  inputs: number[];
  hidden: number[];
  weightsCount: number;
  outputs: {
    tripleThreatCombo: number;
    dropkickCombo: number;
    highSkySlam: number;
    dieRiderKick: number;
    overheadSlam: number;
    minosSlam: number;
    sonicBoom: number;
    omniSonic: number;
    solarLaser: number;
    cryoBeam: number;
    witherSkulls: number;
    armorRip: number;
    defensiveGuard: number;
    enderPearlIntercept: number;
    consumablePunish: number;
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
    detectedThreat: 'Player Mace Dive / Axe Crit / Shield Guard / Bow Draw',
    counterStrategy: 'Overhead Slam shield break + supersonic dropkick interception'
  },
  {
    name: 'TACZPredictorAdapter',
    modSource: 'Timeless and Classics Zero (TACZ)',
    isActive: true,
    threatEvaluation: 0.92,
    detectedThreat: 'High-RPM Automatic Minigun / Kinetic Firearms Burst',
    counterStrategy: 'Sustained bullet dampening (down to 12% dmg) + flank teleport'
  },
  {
    name: 'CataclysmPredictorAdapter',
    modSource: "L_Ender's Cataclysm",
    isActive: true,
    threatEvaluation: 0.88,
    detectedThreat: 'Netherite Monstrosity Slam / Ignis Fire Whirl',
    counterStrategy: 'Explosion adaptation (+25%/hit to 95%) + aerial dropkick evasion'
  },
  {
    name: 'MowziesPredictorAdapter',
    modSource: "Mowzie's Mobs",
    isActive: true,
    threatEvaluation: 0.74,
    detectedThreat: 'Ferrous Wroughtnaut Overhead Helm Crusher',
    counterStrategy: 'Blindspot teleport to rear armor seam + high sky slam'
  },
  {
    name: 'AlexsCavesPredictorAdapter',
    modSource: "Alex's Caves",
    isActive: true,
    threatEvaluation: 0.82,
    detectedThreat: 'Tremorzilla Atomic Breath / Luxtructosaurus Charge',
    counterStrategy: 'Solar Laser suppression + biological resistance hardening'
  },
  {
    name: 'EpicFightPredictorAdapter',
    modSource: 'Epic Fight Mod',
    isActive: true,
    threatEvaluation: 0.79,
    detectedThreat: 'Posture Gauge Break / Roll I-Frame Execution',
    counterStrategy: 'Triple Threat punch chain to exhaust stamina roll pool'
  },
  {
    name: 'IronSpellsPredictorAdapter',
    modSource: "Iron's Spells 'n Spellbooks",
    isActive: true,
    threatEvaluation: 0.85,
    detectedThreat: 'Eldritch / Lightning Chant Spell Telegraph',
    counterStrategy: 'Magic resistance scaling (+20%/hit to 90%) + warp interrupt'
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
