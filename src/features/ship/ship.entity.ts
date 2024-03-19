import { Entity, PrimaryKey, Property } from '@mikro-orm/core'
import { v4 as uuidv4 } from 'uuid'

/**
 * The registered role of the ship
 * @export
 * @enum {string}
 */

const ShipRole = {
  Fabricator: 'FABRICATOR',
  Harvester: 'HARVESTER',
  Hauler: 'HAULER',
  Interceptor: 'INTERCEPTOR',
  Excavator: 'EXCAVATOR',
  Transport: 'TRANSPORT',
  Repair: 'REPAIR',
  Surveyor: 'SURVEYOR',
  Command: 'COMMAND',
  Carrier: 'CARRIER',
  Patrol: 'PATROL',
  Satellite: 'SATELLITE',
  Explorer: 'EXPLORER',
  Refinery: 'REFINERY',
} as const
type ShipRole = (typeof ShipRole)[keyof typeof ShipRole]

/**
 * The public registration information of the ship
 * @export
 * @interface ShipRegistration
 */
interface ShipRegistration {
  /**
   * The agent\'s registered name of the ship
   * @type {string}
   * @memberof ShipRegistration
   */
  name: string
  /**
   * The symbol of the faction the ship is registered with
   * @type {string}
   * @memberof ShipRegistration
   */
  factionSymbol: string
  /**
   *
   * @type {ShipRole}
   * @memberof ShipRegistration
   */
  role: ShipRole
}

/**
 * The navigation information of the ship.
 * @export
 * @interface ShipNav
 */
export interface ShipNav {
  /**
   * The symbol of the system.
   * @type {string}
   * @memberof ShipNav
   */
  systemSymbol: string
  /**
   * The symbol of the waypoint.
   * @type {string}
   * @memberof ShipNav
   */
  waypointSymbol: string
  /**
   *
   * @type {ShipNavRoute}
   * @memberof ShipNav
   */
  route: ShipNavRoute
  /**
   *
   * @type {ShipNavStatus}
   * @memberof ShipNav
   */
  status: ShipNavStatus
  /**
   *
   * @type {ShipNavFlightMode}
   * @memberof ShipNav
   */
  flightMode: ShipNavFlightMode
}

/**
 * The ship\'s set speed when traveling between waypoints or systems.
 * @export
 * @enum {string}
 */

export const ShipNavFlightMode = {
  Drift: 'DRIFT',
  Stealth: 'STEALTH',
  Cruise: 'CRUISE',
  Burn: 'BURN',
} as const

export type ShipNavFlightMode = (typeof ShipNavFlightMode)[keyof typeof ShipNavFlightMode]

/**
 * The routing information for the ship\'s most recent transit or current location.
 * @export
 * @interface ShipNavRoute
 */
export interface ShipNavRoute {
  /**
   *
   * @type {ShipNavRouteWaypoint}
   * @memberof ShipNavRoute
   */
  destination: ShipNavRouteWaypoint
  /**
   *
   * @type {ShipNavRouteWaypoint}
   * @memberof ShipNavRoute
   */
  origin: ShipNavRouteWaypoint
  /**
   * The date time of the ship\'s departure.
   * @type {string}
   * @memberof ShipNavRoute
   */
  departureTime: string
  /**
   * The date time of the ship\'s arrival. If the ship is in-transit, this is the expected time of arrival.
   * @type {string}
   * @memberof ShipNavRoute
   */
  arrival: string
}
/**
 * The type of waypoint.
 * @export
 * @enum {string}
 */

export const WaypointType = {
  Planet: 'PLANET',
  GasGiant: 'GAS_GIANT',
  Moon: 'MOON',
  OrbitalStation: 'ORBITAL_STATION',
  JumpGate: 'JUMP_GATE',
  AsteroidField: 'ASTEROID_FIELD',
  Asteroid: 'ASTEROID',
  EngineeredAsteroid: 'ENGINEERED_ASTEROID',
  AsteroidBase: 'ASTEROID_BASE',
  Nebula: 'NEBULA',
  DebrisField: 'DEBRIS_FIELD',
  GravityWell: 'GRAVITY_WELL',
  ArtificialGravityWell: 'ARTIFICIAL_GRAVITY_WELL',
  FuelStation: 'FUEL_STATION',
} as const
type WaypointType = (typeof WaypointType)[keyof typeof WaypointType]
/**
 * The destination or departure of a ships nav route.
 * @export
 * @interface ShipNavRouteWaypoint
 */
export interface ShipNavRouteWaypoint {
  /**
   * The symbol of the waypoint.
   * @type {string}
   * @memberof ShipNavRouteWaypoint
   */
  symbol: string
  /**
   *
   * @type {WaypointType}
   * @memberof ShipNavRouteWaypoint
   */
  type: WaypointType
  /**
   * The symbol of the system.
   * @type {string}
   * @memberof ShipNavRouteWaypoint
   */
  systemSymbol: string
  /**
   * Position in the universe in the x axis.
   * @type {number}
   * @memberof ShipNavRouteWaypoint
   */
  x: number
  /**
   * Position in the universe in the y axis.
   * @type {number}
   * @memberof ShipNavRouteWaypoint
   */
  y: number
}

/**
 * The current status of the ship
 * @export
 * @enum {string}
 */

export const ShipNavStatus = {
  InTransit: 'IN_TRANSIT',
  InOrbit: 'IN_ORBIT',
  Docked: 'DOCKED',
} as const

export type ShipNavStatus = (typeof ShipNavStatus)[keyof typeof ShipNavStatus]
/**
 * The requirements for installation on a ship
 * @export
 * @interface ShipRequirements
 */
export interface ShipRequirements {
  /**
   * The amount of power required from the reactor.
   * @type {number}
   * @memberof ShipRequirements
   */
  power?: number
  /**
   * The number of crew required for operation.
   * @type {number}
   * @memberof ShipRequirements
   */
  crew?: number
  /**
   * The number of module slots required for installation.
   * @type {number}
   * @memberof ShipRequirements
   */
  slots?: number
}
/**
 * The reactor of the ship. The reactor is responsible for powering the ship\'s systems and weapons.
 * @export
 * @interface ShipReactor
 */
export interface ShipReactor {
  /**
   * Symbol of the reactor.
   * @type {string}
   * @memberof ShipReactor
   */
  symbol: ShipReactorSymbolEnum
  /**
   * Name of the reactor.
   * @type {string}
   * @memberof ShipReactor
   */
  name: string
  /**
   * Description of the reactor.
   * @type {string}
   * @memberof ShipReactor
   */
  description: string
  /**
   * Condition is a range of 0 to 100 where 0 is completely worn out and 100 is brand new.
   * @type {number}
   * @memberof ShipReactor
   */
  condition?: number
  /**
   * The amount of power provided by this reactor. The more power a reactor provides to the ship, the lower the cooldown it gets when using a module or mount that taxes the ship\'s power.
   * @type {number}
   * @memberof ShipReactor
   */
  powerOutput: number
  /**
   *
   * @type {ShipRequirements}
   * @memberof ShipReactor
   */
  requirements: ShipRequirements
}

export const ShipReactorSymbolEnum = {
  SolarI: 'REACTOR_SOLAR_I',
  FusionI: 'REACTOR_FUSION_I',
  FissionI: 'REACTOR_FISSION_I',
  ChemicalI: 'REACTOR_CHEMICAL_I',
  AntimatterI: 'REACTOR_ANTIMATTER_I',
} as const

export type ShipReactorSymbolEnum = (typeof ShipReactorSymbolEnum)[keyof typeof ShipReactorSymbolEnum]
/**
 * The ship\'s crew service and maintain the ship\'s systems and equipment.
 * @export
 * @interface ShipCrew
 */
export interface ShipCrew {
  /**
   * The current number of crew members on the ship.
   * @type {number}
   * @memberof ShipCrew
   */
  current: number
  /**
   * The minimum number of crew members required to maintain the ship.
   * @type {number}
   * @memberof ShipCrew
   */
  required: number
  /**
   * The maximum number of crew members the ship can support.
   * @type {number}
   * @memberof ShipCrew
   */
  capacity: number
  /**
   * The rotation of crew shifts. A stricter shift improves the ship\'s performance. A more relaxed shift improves the crew\'s morale.
   * @type {string}
   * @memberof ShipCrew
   */
  rotation: ShipCrewRotationEnum
  /**
   * A rough measure of the crew\'s morale. A higher morale means the crew is happier and more productive. A lower morale means the ship is more prone to accidents.
   * @type {number}
   * @memberof ShipCrew
   */
  morale: number
  /**
   * The amount of credits per crew member paid per hour. Wages are paid when a ship docks at a civilized waypoint.
   * @type {number}
   * @memberof ShipCrew
   */
  wages: number
}

export const ShipCrewRotationEnum = {
  Strict: 'STRICT',
  Relaxed: 'RELAXED',
} as const

export type ShipCrewRotationEnum = (typeof ShipCrewRotationEnum)[keyof typeof ShipCrewRotationEnum]
export const ShipFrameSymbolEnum = {
  Probe: 'FRAME_PROBE',
  Drone: 'FRAME_DRONE',
  Interceptor: 'FRAME_INTERCEPTOR',
  Racer: 'FRAME_RACER',
  Fighter: 'FRAME_FIGHTER',
  Frigate: 'FRAME_FRIGATE',
  Shuttle: 'FRAME_SHUTTLE',
  Explorer: 'FRAME_EXPLORER',
  Miner: 'FRAME_MINER',
  LightFreighter: 'FRAME_LIGHT_FREIGHTER',
  HeavyFreighter: 'FRAME_HEAVY_FREIGHTER',
  Transport: 'FRAME_TRANSPORT',
  Destroyer: 'FRAME_DESTROYER',
  Cruiser: 'FRAME_CRUISER',
  Carrier: 'FRAME_CARRIER',
} as const

export type ShipFrameSymbolEnum = (typeof ShipFrameSymbolEnum)[keyof typeof ShipFrameSymbolEnum]
/**
 * The frame of the ship. The frame determines the number of modules and mounting points of the ship, as well as base fuel capacity. As the condition of the frame takes more wear, the ship will become more sluggish and less maneuverable.
 * @export
 * @interface ShipFrame
 */
export interface ShipFrame {
  /**
   * Symbol of the frame.
   * @type {string}
   * @memberof ShipFrame
   */
  symbol: ShipFrameSymbolEnum
  /**
   * Name of the frame.
   * @type {string}
   * @memberof ShipFrame
   */
  name: string
  /**
   * Description of the frame.
   * @type {string}
   * @memberof ShipFrame
   */
  description: string
  /**
   * Condition is a range of 0 to 100 where 0 is completely worn out and 100 is brand new.
   * @type {number}
   * @memberof ShipFrame
   */
  condition?: number
  /**
   * The amount of slots that can be dedicated to modules installed in the ship. Each installed module take up a number of slots, and once there are no more slots, no new modules can be installed.
   * @type {number}
   * @memberof ShipFrame
   */
  moduleSlots: number
  /**
   * The amount of slots that can be dedicated to mounts installed in the ship. Each installed mount takes up a number of points, and once there are no more points remaining, no new mounts can be installed.
   * @type {number}
   * @memberof ShipFrame
   */
  mountingPoints: number
  /**
   * The maximum amount of fuel that can be stored in this ship. When refueling, the ship will be refueled to this amount.
   * @type {number}
   * @memberof ShipFrame
   */
  fuelCapacity: number
  /**
   *
   * @type {ShipRequirements}
   * @memberof ShipFrame
   */
  requirements: ShipRequirements
}

/**
 * The engine determines how quickly a ship travels between waypoints.
 * @export
 * @interface ShipEngine
 */
export interface ShipEngine {
  /**
   * The symbol of the engine.
   * @type {string}
   * @memberof ShipEngine
   */
  symbol: ShipEngineSymbolEnum
  /**
   * The name of the engine.
   * @type {string}
   * @memberof ShipEngine
   */
  name: string
  /**
   * The description of the engine.
   * @type {string}
   * @memberof ShipEngine
   */
  description: string
  /**
   * Condition is a range of 0 to 100 where 0 is completely worn out and 100 is brand new.
   * @type {number}
   * @memberof ShipEngine
   */
  condition?: number
  /**
   * The speed stat of this engine. The higher the speed, the faster a ship can travel from one point to another. Reduces the time of arrival when navigating the ship.
   * @type {number}
   * @memberof ShipEngine
   */
  speed: number
  /**
   *
   * @type {ShipRequirements}
   * @memberof ShipEngine
   */
  requirements: ShipRequirements
}

export const ShipEngineSymbolEnum = {
  ImpulseDriveI: 'ENGINE_IMPULSE_DRIVE_I',
  IonDriveI: 'ENGINE_ION_DRIVE_I',
  IonDriveIi: 'ENGINE_ION_DRIVE_II',
  HyperDriveI: 'ENGINE_HYPER_DRIVE_I',
} as const

export type ShipEngineSymbolEnum = (typeof ShipEngineSymbolEnum)[keyof typeof ShipEngineSymbolEnum]
/**
 * A cooldown is a period of time in which a ship cannot perform certain actions.
 * @export
 * @interface Cooldown
 */
export interface Cooldown {
  /**
   * The symbol of the ship that is on cooldown
   * @type {string}
   * @memberof Cooldown
   */
  shipSymbol: string
  /**
   * The total duration of the cooldown in seconds
   * @type {number}
   * @memberof Cooldown
   */
  totalSeconds: number
  /**
   * The remaining duration of the cooldown in seconds
   * @type {number}
   * @memberof Cooldown
   */
  remainingSeconds: number
  /**
   * The date and time when the cooldown expires in ISO 8601 format
   * @type {string}
   * @memberof Cooldown
   */
  expiration?: string
}

/**
 * A module can be installed in a ship and provides a set of capabilities such as storage space or quarters for crew. Module installations are permanent.
 * @export
 * @interface ShipModule
 */
export interface ShipModule {
  /**
   * The symbol of the module.
   * @type {string}
   * @memberof ShipModule
   */
  symbol: ShipModuleSymbolEnum
  /**
   * Modules that provide capacity, such as cargo hold or crew quarters will show this value to denote how much of a bonus the module grants.
   * @type {number}
   * @memberof ShipModule
   */
  capacity?: number
  /**
   * Modules that have a range will such as a sensor array show this value to denote how far can the module reach with its capabilities.
   * @type {number}
   * @memberof ShipModule
   */
  range?: number
  /**
   * Name of this module.
   * @type {string}
   * @memberof ShipModule
   */
  name: string
  /**
   * Description of this module.
   * @type {string}
   * @memberof ShipModule
   */
  description: string
  /**
   *
   * @type {ShipRequirements}
   * @memberof ShipModule
   */
  requirements: ShipRequirements
}

export const ShipModuleSymbolEnum = {
  MineralProcessorI: 'MODULE_MINERAL_PROCESSOR_I',
  GasProcessorI: 'MODULE_GAS_PROCESSOR_I',
  CargoHoldI: 'MODULE_CARGO_HOLD_I',
  CargoHoldIi: 'MODULE_CARGO_HOLD_II',
  CargoHoldIii: 'MODULE_CARGO_HOLD_III',
  CrewQuartersI: 'MODULE_CREW_QUARTERS_I',
  EnvoyQuartersI: 'MODULE_ENVOY_QUARTERS_I',
  PassengerCabinI: 'MODULE_PASSENGER_CABIN_I',
  MicroRefineryI: 'MODULE_MICRO_REFINERY_I',
  OreRefineryI: 'MODULE_ORE_REFINERY_I',
  FuelRefineryI: 'MODULE_FUEL_REFINERY_I',
  ScienceLabI: 'MODULE_SCIENCE_LAB_I',
  JumpDriveI: 'MODULE_JUMP_DRIVE_I',
  JumpDriveIi: 'MODULE_JUMP_DRIVE_II',
  JumpDriveIii: 'MODULE_JUMP_DRIVE_III',
  WarpDriveI: 'MODULE_WARP_DRIVE_I',
  WarpDriveIi: 'MODULE_WARP_DRIVE_II',
  WarpDriveIii: 'MODULE_WARP_DRIVE_III',
  ShieldGeneratorI: 'MODULE_SHIELD_GENERATOR_I',
  ShieldGeneratorIi: 'MODULE_SHIELD_GENERATOR_II',
} as const

export type ShipModuleSymbolEnum = (typeof ShipModuleSymbolEnum)[keyof typeof ShipModuleSymbolEnum]

/**
 * A mount is installed on the exterier of a ship.
 * @export
 * @interface ShipMount
 */
export interface ShipMount {
  /**
   * Symbo of this mount.
   * @type {string}
   * @memberof ShipMount
   */
  symbol: ShipMountSymbolEnum
  /**
   * Name of this mount.
   * @type {string}
   * @memberof ShipMount
   */
  name: string
  /**
   * Description of this mount.
   * @type {string}
   * @memberof ShipMount
   */
  description?: string
  /**
   * Mounts that have this value, such as mining lasers, denote how powerful this mount\'s capabilities are.
   * @type {number}
   * @memberof ShipMount
   */
  strength?: number
  /**
   * Mounts that have this value denote what goods can be produced from using the mount.
   * @type {Array<string>}
   * @memberof ShipMount
   */
  deposits?: Array<ShipMountDepositsEnum>
  /**
   *
   * @type {ShipRequirements}
   * @memberof ShipMount
   */
  requirements: ShipRequirements
}

export const ShipMountSymbolEnum = {
  GasSiphonI: 'MOUNT_GAS_SIPHON_I',
  GasSiphonIi: 'MOUNT_GAS_SIPHON_II',
  GasSiphonIii: 'MOUNT_GAS_SIPHON_III',
  SurveyorI: 'MOUNT_SURVEYOR_I',
  SurveyorIi: 'MOUNT_SURVEYOR_II',
  SurveyorIii: 'MOUNT_SURVEYOR_III',
  SensorArrayI: 'MOUNT_SENSOR_ARRAY_I',
  SensorArrayIi: 'MOUNT_SENSOR_ARRAY_II',
  SensorArrayIii: 'MOUNT_SENSOR_ARRAY_III',
  MiningLaserI: 'MOUNT_MINING_LASER_I',
  MiningLaserIi: 'MOUNT_MINING_LASER_II',
  MiningLaserIii: 'MOUNT_MINING_LASER_III',
  LaserCannonI: 'MOUNT_LASER_CANNON_I',
  MissileLauncherI: 'MOUNT_MISSILE_LAUNCHER_I',
  TurretI: 'MOUNT_TURRET_I',
} as const

export type ShipMountSymbolEnum = (typeof ShipMountSymbolEnum)[keyof typeof ShipMountSymbolEnum]
export const ShipMountDepositsEnum = {
  QuartzSand: 'QUARTZ_SAND',
  SiliconCrystals: 'SILICON_CRYSTALS',
  PreciousStones: 'PRECIOUS_STONES',
  IceWater: 'ICE_WATER',
  AmmoniaIce: 'AMMONIA_ICE',
  IronOre: 'IRON_ORE',
  CopperOre: 'COPPER_ORE',
  SilverOre: 'SILVER_ORE',
  AluminumOre: 'ALUMINUM_ORE',
  GoldOre: 'GOLD_ORE',
  PlatinumOre: 'PLATINUM_ORE',
  Diamonds: 'DIAMONDS',
  UraniteOre: 'URANITE_ORE',
  MeritiumOre: 'MERITIUM_ORE',
} as const

export type ShipMountDepositsEnum = (typeof ShipMountDepositsEnum)[keyof typeof ShipMountDepositsEnum]
/**
 * Ship cargo details.
 * @export
 * @interface ShipCargo
 */
export interface ShipCargo {
  /**
   * The max number of items that can be stored in the cargo hold.
   * @type {number}
   * @memberof ShipCargo
   */
  capacity: number
  /**
   * The number of items currently stored in the cargo hold.
   * @type {number}
   * @memberof ShipCargo
   */
  units: number
  /**
   * The items currently in the cargo hold.
   * @type {Array<ShipCargoItem>}
   * @memberof ShipCargo
   */
  inventory: Array<ShipCargoItem>
}
/**
 * The good\'s symbol.
 * @export
 * @enum {string}
 */

export const TradeSymbol = {
  PreciousStones: 'PRECIOUS_STONES',
  QuartzSand: 'QUARTZ_SAND',
  SiliconCrystals: 'SILICON_CRYSTALS',
  AmmoniaIce: 'AMMONIA_ICE',
  LiquidHydrogen: 'LIQUID_HYDROGEN',
  LiquidNitrogen: 'LIQUID_NITROGEN',
  IceWater: 'ICE_WATER',
  ExoticMatter: 'EXOTIC_MATTER',
  AdvancedCircuitry: 'ADVANCED_CIRCUITRY',
  GravitonEmitters: 'GRAVITON_EMITTERS',
  Iron: 'IRON',
  IronOre: 'IRON_ORE',
  Copper: 'COPPER',
  CopperOre: 'COPPER_ORE',
  Aluminum: 'ALUMINUM',
  AluminumOre: 'ALUMINUM_ORE',
  Silver: 'SILVER',
  SilverOre: 'SILVER_ORE',
  Gold: 'GOLD',
  GoldOre: 'GOLD_ORE',
  Platinum: 'PLATINUM',
  PlatinumOre: 'PLATINUM_ORE',
  Diamonds: 'DIAMONDS',
  Uranite: 'URANITE',
  UraniteOre: 'URANITE_ORE',
  Meritium: 'MERITIUM',
  MeritiumOre: 'MERITIUM_ORE',
  Hydrocarbon: 'HYDROCARBON',
  Antimatter: 'ANTIMATTER',
  FabMats: 'FAB_MATS',
  Fertilizers: 'FERTILIZERS',
  Fabrics: 'FABRICS',
  Food: 'FOOD',
  Jewelry: 'JEWELRY',
  Machinery: 'MACHINERY',
  Firearms: 'FIREARMS',
  AssaultRifles: 'ASSAULT_RIFLES',
  MilitaryEquipment: 'MILITARY_EQUIPMENT',
  Explosives: 'EXPLOSIVES',
  LabInstruments: 'LAB_INSTRUMENTS',
  Ammunition: 'AMMUNITION',
  Electronics: 'ELECTRONICS',
  ShipPlating: 'SHIP_PLATING',
  ShipParts: 'SHIP_PARTS',
  Equipment: 'EQUIPMENT',
  Fuel: 'FUEL',
  Medicine: 'MEDICINE',
  Drugs: 'DRUGS',
  Clothing: 'CLOTHING',
  Microprocessors: 'MICROPROCESSORS',
  Plastics: 'PLASTICS',
  Polynucleotides: 'POLYNUCLEOTIDES',
  Biocomposites: 'BIOCOMPOSITES',
  QuantumStabilizers: 'QUANTUM_STABILIZERS',
  Nanobots: 'NANOBOTS',
  AiMainframes: 'AI_MAINFRAMES',
  QuantumDrives: 'QUANTUM_DRIVES',
  RoboticDrones: 'ROBOTIC_DRONES',
  CyberImplants: 'CYBER_IMPLANTS',
  GeneTherapeutics: 'GENE_THERAPEUTICS',
  NeuralChips: 'NEURAL_CHIPS',
  MoodRegulators: 'MOOD_REGULATORS',
  ViralAgents: 'VIRAL_AGENTS',
  MicroFusionGenerators: 'MICRO_FUSION_GENERATORS',
  Supergrains: 'SUPERGRAINS',
  LaserRifles: 'LASER_RIFLES',
  Holographics: 'HOLOGRAPHICS',
  ShipSalvage: 'SHIP_SALVAGE',
  RelicTech: 'RELIC_TECH',
  NovelLifeforms: 'NOVEL_LIFEFORMS',
  BotanicalSpecimens: 'BOTANICAL_SPECIMENS',
  CulturalArtifacts: 'CULTURAL_ARTIFACTS',
  FrameProbe: 'FRAME_PROBE',
  FrameDrone: 'FRAME_DRONE',
  FrameInterceptor: 'FRAME_INTERCEPTOR',
  FrameRacer: 'FRAME_RACER',
  FrameFighter: 'FRAME_FIGHTER',
  FrameFrigate: 'FRAME_FRIGATE',
  FrameShuttle: 'FRAME_SHUTTLE',
  FrameExplorer: 'FRAME_EXPLORER',
  FrameMiner: 'FRAME_MINER',
  FrameLightFreighter: 'FRAME_LIGHT_FREIGHTER',
  FrameHeavyFreighter: 'FRAME_HEAVY_FREIGHTER',
  FrameTransport: 'FRAME_TRANSPORT',
  FrameDestroyer: 'FRAME_DESTROYER',
  FrameCruiser: 'FRAME_CRUISER',
  FrameCarrier: 'FRAME_CARRIER',
  ReactorSolarI: 'REACTOR_SOLAR_I',
  ReactorFusionI: 'REACTOR_FUSION_I',
  ReactorFissionI: 'REACTOR_FISSION_I',
  ReactorChemicalI: 'REACTOR_CHEMICAL_I',
  ReactorAntimatterI: 'REACTOR_ANTIMATTER_I',
  EngineImpulseDriveI: 'ENGINE_IMPULSE_DRIVE_I',
  EngineIonDriveI: 'ENGINE_ION_DRIVE_I',
  EngineIonDriveIi: 'ENGINE_ION_DRIVE_II',
  EngineHyperDriveI: 'ENGINE_HYPER_DRIVE_I',
  ModuleMineralProcessorI: 'MODULE_MINERAL_PROCESSOR_I',
  ModuleGasProcessorI: 'MODULE_GAS_PROCESSOR_I',
  ModuleCargoHoldI: 'MODULE_CARGO_HOLD_I',
  ModuleCargoHoldIi: 'MODULE_CARGO_HOLD_II',
  ModuleCargoHoldIii: 'MODULE_CARGO_HOLD_III',
  ModuleCrewQuartersI: 'MODULE_CREW_QUARTERS_I',
  ModuleEnvoyQuartersI: 'MODULE_ENVOY_QUARTERS_I',
  ModulePassengerCabinI: 'MODULE_PASSENGER_CABIN_I',
  ModuleMicroRefineryI: 'MODULE_MICRO_REFINERY_I',
  ModuleScienceLabI: 'MODULE_SCIENCE_LAB_I',
  ModuleJumpDriveI: 'MODULE_JUMP_DRIVE_I',
  ModuleJumpDriveIi: 'MODULE_JUMP_DRIVE_II',
  ModuleJumpDriveIii: 'MODULE_JUMP_DRIVE_III',
  ModuleWarpDriveI: 'MODULE_WARP_DRIVE_I',
  ModuleWarpDriveIi: 'MODULE_WARP_DRIVE_II',
  ModuleWarpDriveIii: 'MODULE_WARP_DRIVE_III',
  ModuleShieldGeneratorI: 'MODULE_SHIELD_GENERATOR_I',
  ModuleShieldGeneratorIi: 'MODULE_SHIELD_GENERATOR_II',
  ModuleOreRefineryI: 'MODULE_ORE_REFINERY_I',
  ModuleFuelRefineryI: 'MODULE_FUEL_REFINERY_I',
  MountGasSiphonI: 'MOUNT_GAS_SIPHON_I',
  MountGasSiphonIi: 'MOUNT_GAS_SIPHON_II',
  MountGasSiphonIii: 'MOUNT_GAS_SIPHON_III',
  MountSurveyorI: 'MOUNT_SURVEYOR_I',
  MountSurveyorIi: 'MOUNT_SURVEYOR_II',
  MountSurveyorIii: 'MOUNT_SURVEYOR_III',
  MountSensorArrayI: 'MOUNT_SENSOR_ARRAY_I',
  MountSensorArrayIi: 'MOUNT_SENSOR_ARRAY_II',
  MountSensorArrayIii: 'MOUNT_SENSOR_ARRAY_III',
  MountMiningLaserI: 'MOUNT_MINING_LASER_I',
  MountMiningLaserIi: 'MOUNT_MINING_LASER_II',
  MountMiningLaserIii: 'MOUNT_MINING_LASER_III',
  MountLaserCannonI: 'MOUNT_LASER_CANNON_I',
  MountMissileLauncherI: 'MOUNT_MISSILE_LAUNCHER_I',
  MountTurretI: 'MOUNT_TURRET_I',
  ShipProbe: 'SHIP_PROBE',
  ShipMiningDrone: 'SHIP_MINING_DRONE',
  ShipSiphonDrone: 'SHIP_SIPHON_DRONE',
  ShipInterceptor: 'SHIP_INTERCEPTOR',
  ShipLightHauler: 'SHIP_LIGHT_HAULER',
  ShipCommandFrigate: 'SHIP_COMMAND_FRIGATE',
  ShipExplorer: 'SHIP_EXPLORER',
  ShipHeavyFreighter: 'SHIP_HEAVY_FREIGHTER',
  ShipLightShuttle: 'SHIP_LIGHT_SHUTTLE',
  ShipOreHound: 'SHIP_ORE_HOUND',
  ShipRefiningFreighter: 'SHIP_REFINING_FREIGHTER',
  ShipSurveyor: 'SHIP_SURVEYOR',
} as const

export type TradeSymbol = (typeof TradeSymbol)[keyof typeof TradeSymbol]
/**
 * The type of cargo item and the number of units.
 * @export
 * @interface ShipCargoItem
 */
export interface ShipCargoItem {
  /**
   *
   * @type {TradeSymbol}
   * @memberof ShipCargoItem
   */
  symbol: TradeSymbol
  /**
   * The name of the cargo item type.
   * @type {string}
   * @memberof ShipCargoItem
   */
  name: string
  /**
   * The description of the cargo item type.
   * @type {string}
   * @memberof ShipCargoItem
   */
  description: string
  /**
   * The number of units of the cargo item.
   * @type {number}
   * @memberof ShipCargoItem
   */
  units: number
}

/**
 * Details of the ship\'s fuel tanks including how much fuel was consumed during the last transit or action.
 * @export
 * @interface ShipFuel
 */
export interface ShipFuel {
  /**
   * The current amount of fuel in the ship\'s tanks.
   * @type {number}
   * @memberof ShipFuel
   */
  current: number
  /**
   * The maximum amount of fuel the ship\'s tanks can hold.
   * @type {number}
   * @memberof ShipFuel
   */
  capacity: number
  /**
   *
   * @type {ShipFuelConsumed}
   * @memberof ShipFuel
   */
  consumed?: ShipFuelConsumed
}
/**
 * An object that only shows up when an action has consumed fuel in the process. Shows the fuel consumption data.
 * @export
 * @interface ShipFuelConsumed
 */
export interface ShipFuelConsumed {
  /**
   * The amount of fuel consumed by the most recent transit or action.
   * @type {number}
   * @memberof ShipFuelConsumed
   */
  amount: number
  /**
   * The time at which the fuel was consumed.
   * @type {string}
   * @memberof ShipFuelConsumed
   */
  timestamp: string
}
/**
 * Ship details.
 * @export
 * @interface Ship
 */
interface Ship {
  /**
   * The globally unique identifier of the ship in the following format: `[AGENT_SYMBOL]-[HEX_ID]`
   * @type {string}
   * @memberof Ship
   */
  symbol: string
  /**
   *
   * @type {ShipRegistration}
   * @memberof Ship
   */
  registration: ShipRegistration
  /**
   *
   * @type {ShipNav}
   * @memberof Ship
   */
  nav: ShipNav
  /**
   *
   * @type {ShipCrew}
   * @memberof Ship
   */
  crew: ShipCrew
  /**
   *
   * @type {ShipFrame}
   * @memberof Ship
   */
  frame: ShipFrame
  /**
   *
   * @type {ShipReactor}
   * @memberof Ship
   */
  reactor: ShipReactor
  /**
   *
   * @type {ShipEngine}
   * @memberof Ship
   */
  engine: ShipEngine
  /**
   *
   * @type {Cooldown}
   * @memberof Ship
   */
  cooldown: Cooldown
  /**
   * Modules installed in this ship.
   * @type {Array<ShipModule>}
   * @memberof Ship
   */
  modules: Array<ShipModule>
  /**
   * Mounts installed in this ship.
   * @type {Array<ShipMount>}
   * @memberof Ship
   */
  mounts: Array<ShipMount>
  /**
   *
   * @type {ShipCargo}
   * @memberof Ship
   */
  cargo: ShipCargo
  /**
   *
   * @type {ShipFuel}
   * @memberof Ship
   */
  fuel: ShipFuel
}

@Entity({ tableName: 'ship' })
export class ShipEntity {
  @PrimaryKey({ type: 'uuid' })
  id = uuidv4()

  @Property()
  resetDate: string

  @Property()
  createdAt = new Date()

  @Property({ onUpdate: () => new Date() })
  updatedAt = new Date()

  @Property()
  symbol: string

  @Property({ type: 'json' })
  registration: ShipRegistration
  @Property({ type: 'json' })
  nav: ShipNav
  @Property({ type: 'json' })
  crew: ShipCrew
  @Property({ type: 'json' })
  frame: ShipFrame
  @Property({ type: 'json' })
  reactor: ShipReactor
  @Property({ type: 'json' })
  engine: ShipEngine
  @Property({ type: 'json' })
  cooldown: Cooldown
  @Property({ type: 'json' })
  modules: Array<ShipModule>
  @Property({ type: 'json' })
  mounts: Array<ShipMount>
  @Property({ type: 'json' })
  cargo: ShipCargo
  @Property({ type: 'json' })
  fuel: ShipFuel

  constructor(resetDate: string, ship: Ship) {
    this.resetDate = resetDate
    this.symbol = ship.symbol
    this.cargo = ship.cargo
    this.cooldown = ship.cooldown
    this.registration = ship.registration
    this.nav = ship.nav
    this.crew = ship.crew
    this.frame = ship.frame
    this.reactor = ship.reactor
    this.engine = ship.engine
    this.cooldown = ship.cooldown
    this.modules = ship.modules
    this.mounts = ship.mounts
    this.cargo = ship.cargo
    this.fuel = ship.fuel
  }
}
