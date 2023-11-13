import { Player, PlayerSpeed } from "./player";
import { GameObject } from "./game";
import {
  CrosswalkSign,
  CrosswalkObstacleProducer,
  LaneLineStyle,
  LaneLinesStyles,
  Obstacle,
  ObstacleProducer,
  ObstacleSpeeds,
  ParkingCarObstacle,
  TargetObstacleProducer,
  Street,
  ObstacleAvoidanceType,
} from "./street";
import { LaneDirection } from "./street";


/** Fixed point corresponding to the part of the starting sidewalk where the red curb exists.
 * Fathest left point putting the frog close to the parked cars.
 */
const PLAYER_START_X = 440;
const PARKED_CAR_2_X = 120;
const PARKED_CAR_3_X = 240;
const PARKED_CAR_4_X = 360;
const PARKED_CAR_5_X = 560;
const PARKED_CAR_7_X = 940;
const PARKED_CAR_8_X = 1040;
const solidWhiteLineStyle = new LaneLineStyle();
const hiddenLineStyle = new LaneLineStyle(
  solidWhiteLineStyle.color,
  false,
  true,
);
const HEAVY_TRAFFIC_FREQUENCY = 2;
const LIGHT_TRAFFIC_FREQUENCY = 4;
/**
 * A class representing a scenario that educates the player about infrastructure challenges.
 */
export class Scenario {
  /**
   * Creates an instance of Scenario.
   * @param key The readable identifier for this scenario. Used with http parameters, etc.
   * @param title The title of the scenario.
   * @param description The description of the scenario.
   * @param street The street where the scenario takes place.
   * @param player The player involved in the scenario.
   * @param finishLineY The y coordinate of the finish line.
   * @param background The path to the background image used for the scene.
   */
  constructor(
    public readonly key: ScenarioKey,
    public readonly title: string,
    public readonly description: string,
    public readonly street: Street,
    public readonly player: Player,
    public readonly finishLineY: number,
    public readonly background: string,
  ) {}

  /**
   * @returns The next scenario key after this.key or the same if at the end.
   */
  public get nextScenarioKey(): ScenarioKey {
    const keys = Object.values(ScenarioKey);
    const index = keys.indexOf(this.key);
    if (index < 0) {
      return keys[0];
    }
    return keys[index + 1];
  }

  /** Previous key before this.key or the same if at the beginning. */
  public get previousScenarioKey(): ScenarioKey {
    const keys = Object.values(ScenarioKey);
    const index = keys.indexOf(this.key);
    if (index < 0) {
      return keys[0];
    }
    return keys[index - 1];
  }
}

/** String representing a level used in URL. */
export enum ScenarioKey {
  LIGHT_TRAFFIC = "light-traffic",
  HEAVY_TRAFFIC = "heavy-traffic",
  SLOW_MOVING = "slow-moving",
  CARS_STOP = "cars-stop",
  PARKED_CARS = "parked-cars",
  BICYCLES_SHARED_LANE = "bicycles-shared-lane",
  CARS_PASS_BICYCLES = "cars-pass-bicycles",
  CENTER_LANE_DELIVERY = "center-lane-delivery",
  CENTER_LANE_AMBULANCE = "center-lane-ambulance",
  CURBSIDE_DELIVERY = "curbside-delivery",
  CROSSWALK = "crosswalk",
  CROSSWALK_DAYLIGHT = "crosswalk-daylight",
  CROSSWALK_RFB = "crosswalk-rfb",
  BIKE_LANES = "bike-lanes",
  BIKE_LANES_AMBULANCE = "bike-lanes-ambulance",
  BIKE_LANES_PARKING = "bike-lanes-parking",
  CYCLE_TRACK = "cycle-track",
  CYCLE_TRACK_AMBULANCE = "cycle-track-ambulance",
  GAME_OVER = "game-over",
}



export enum DeliveryType {
  CENTER_LANE = "center-lane",
  CURBSIDE = "curbside",
  NONE = "none",
}

/** Internally used to indicate traffic diversity in a single lane. */
enum ObstacleType {
  CAR = "vehicle", // Obstacle Avoidance: None
  PARKING_CAR = "parking-vehicle",
  DELIVERY_TRUCK = "delivery",
  BICYCLE = "bicycle",
  GHOST = "ghost",
  AMBULANCE = "ambulance",
}

enum Lane {
  NORTHBOUND_BIKE = "northbound-bike",
  NORTHBOUND_VEHICLE = "northbound-vehicle",
  CENTER_TURN = "center-turn",
  SOUTHBOUND_VEHICLE = "southbound-vehicle",
  SOUTHBOUND_BIKE = "southbound-bike",
  SOUTHBOUND_PARKING = "southbound-parking",
}

export enum Background {
  EXISTING = "images/scene/better-bridgeway-background.png",
  CURBSIDE = "images/scene/better-bridgeway-background-curbside.png",
  CROSSWALK = "images/scene/better-bridgeway-background-crosswalk.png",
  CROSSWALK_DAYLIGHT = "images/scene/better-bridgeway-background-daylight.png",
  ACCESSIBLE = "images/scene/better-bridgeway-background-accessible.png",
  BIKE_LANES = "images/scene/better-bridgeway-background-bike-lanes.png",
  CYCLETRACK = "images/scene/better-bridgeway-background-cycletrack.png",
}

/** Indicates the type of crosswalk to be implemented on the roadway. */
export enum CrosswalkType {
  NONE = "none",
  BASIC = "basic", // minimal paint
  DAYLIGHT = "daylight", // removed parking to improve visibility
  SIGNAL = "signal", // Rapid Flashing Beacon
}

/**
 * Creates specific scenarios to be executed in the game.
 */
export class ScenarioProducer {
  constructor(
    public readonly streetWidth: number,
    public readonly streetLength: number,
    public readonly topOfStreetY: number,
  ) {}

  /**
   * Returns the scenario key that matches the provided level.
   * @param level The level to match.
   * @returns The matching scenario key.
   */
  public static getScenarioKeyForLevel(level: number): ScenarioKey {
    const keys = Object.values(ScenarioKey);
    const minLevel = 1;
    const maxLevel = keys.length;
    if (level < minLevel || level > maxLevel) {
      return keys[0];
    }
    return keys[level - 1];
  }

  /** Given the key, this returns the number based on the index related to other levels declared in the enumeration.
   *
   */
  static getLevelForScenarioKey(scenarioKey: ScenarioKey | string): number {
    const keys = Object.values(ScenarioKey);
    const index = keys.indexOf(scenarioKey as ScenarioKey);
    if (index < 0) {
      return 1;
    }
    return index + 1;
  }

  /**
   * Returns a scenario for the specified level.
   * @param key The key that matches the scenario to be prepared.
   * @returns The scenario.
   */
  public getScenario(key: string | ScenarioKey): Scenario {
    let player = this.frogPlayer();
    let title;
    let description = "";
    const streetBuilder = new StreetBuilder(
      this.streetWidth,
      this.streetLength,
      this.topOfStreetY,
    );

    let background: Background = Background.EXISTING;
    switch (key) {
      case ScenarioKey.LIGHT_TRAFFIC:
        title = "Light Traffic is Easy to Cross";
        description = "Normal speed person crossing with light traffic.";
        streetBuilder
          .withTraffic(
            TrafficRequest.of(Lane.NORTHBOUND_VEHICLE, ObstacleType.CAR)
              .withAvoidance(ObstacleAvoidanceType.NONE)
              .withSpeed(ObstacleSpeeds.MEDIUM)
              .withFrequency(LIGHT_TRAFFIC_FREQUENCY),
          )
          .withTraffic(
            TrafficRequest.of(Lane.SOUTHBOUND_VEHICLE, ObstacleType.CAR)
              .withAvoidance(ObstacleAvoidanceType.NONE)
              .withSpeed(ObstacleSpeeds.MEDIUM)
              .withFrequency(LIGHT_TRAFFIC_FREQUENCY),
          );
        break;
      case ScenarioKey.HEAVY_TRAFFIC:
        title = "Heavy Traffic is Challenging to Cross";
        description = "Normal speed person crossing with heavy traffic.";
        streetBuilder
          .withTraffic(
            TrafficRequest.of(Lane.NORTHBOUND_VEHICLE, ObstacleType.CAR),
          )
          .withTraffic(
            TrafficRequest.of(Lane.SOUTHBOUND_VEHICLE, ObstacleType.CAR),
          );
        break;
      case ScenarioKey.SLOW_MOVING:
        title = "Slow Moving Frogs Can Barely Cross in Heavy Traffic";
        description = "Slow moving person crossing with heavy traffic.";
        streetBuilder.withDefaultCars([
          Lane.NORTHBOUND_VEHICLE,
          Lane.SOUTHBOUND_VEHICLE,
        ]);
        player = this.frogPlayer(PlayerSpeed.SLOW);
        break;
      case ScenarioKey.CARS_STOP:
        title = "Cars Stop for Slow Moving Frogs";
        description = "Cars stop for a person crossing with heavy traffic.";
        streetBuilder.withBrakingCars([
          Lane.NORTHBOUND_VEHICLE,
          Lane.SOUTHBOUND_VEHICLE,
        ]);
        player = this.frogPlayer(PlayerSpeed.SLOW);
        break;
      case ScenarioKey.PARKED_CARS:
        title = "Parked Cars Block the View of Slow Moving Frogs";
        description =
          "Parked cars block the view of a slow moving person crossing with heavy traffic.";
        streetBuilder
          .withTraffic(
            TrafficRequest.of(Lane.NORTHBOUND_VEHICLE, ObstacleType.CAR)
              .withFrequency(LIGHT_TRAFFIC_FREQUENCY)
              .withAvoidance(ObstacleAvoidanceType.BRAKE),
          )
          .withTraffic(
            TrafficRequest.of(Lane.SOUTHBOUND_VEHICLE, ObstacleType.CAR)
              .withFrequency(LIGHT_TRAFFIC_FREQUENCY)
              .withAvoidance(ObstacleAvoidanceType.BRAKE),
          )
          .withParkingIncluded();
        player = this.frogPlayer(PlayerSpeed.SLOW);
        break;
      case ScenarioKey.BICYCLES_SHARED_LANE:
        title = "Bicycles Move Slower than Cars";
        description =
          "Traffic congestion increases when bicycles are present because they share the lane.";
        streetBuilder
          .withBrakingCars([Lane.NORTHBOUND_VEHICLE, Lane.SOUTHBOUND_VEHICLE])
          .withParkingIncluded()
          .withBicycles([Lane.NORTHBOUND_VEHICLE, Lane.SOUTHBOUND_VEHICLE]);
        player = this.frogPlayer(PlayerSpeed.SLOW);
        break;
      case ScenarioKey.CARS_PASS_BICYCLES:
        title = "Cars Pass Bicycles";
        description = "Cars use the middle lane to pass the slower bicycles.";
        streetBuilder
          .withPassingVehicles([
            Lane.NORTHBOUND_VEHICLE,
            Lane.SOUTHBOUND_VEHICLE,
          ])
          .withParkingIncluded()
          .withBicycles([Lane.NORTHBOUND_VEHICLE, Lane.SOUTHBOUND_VEHICLE]);
        player = this.frogPlayer(PlayerSpeed.SLOW);
        break;
      case ScenarioKey.CENTER_LANE_DELIVERY:
        title = "Center Lane Trucks Block the View of Pedestrians";
        description =
          "The pedestrian crossing the street is not seen by oncoming cars.";
        streetBuilder
          .withParkingIncluded()
          .withBrakingCars([Lane.NORTHBOUND_VEHICLE, Lane.SOUTHBOUND_VEHICLE],LIGHT_TRAFFIC_FREQUENCY)
          .withDelivery(DeliveryType.CENTER_LANE);
        player = this.frogPlayer(PlayerSpeed.SLOW);
        break;
      case ScenarioKey.CENTER_LANE_AMBULANCE:
        title =
          "First Responders blocked by Delivery Trucks in Center Turn Lane";
        description =
          "The center turn lane can not both be a delivery lane and emergency lane.";
        streetBuilder
          .withBrakingCars([Lane.NORTHBOUND_VEHICLE, Lane.SOUTHBOUND_VEHICLE])
          .withParkingIncluded()
          .withDelivery(DeliveryType.CENTER_LANE)
          .withAmbulance();
        player = this.frogPlayer(PlayerSpeed.SLOW);
        break;
      case ScenarioKey.CURBSIDE_DELIVERY:
        title = "Curbside Commercial Delivery Zones Improve Safety";
        description =
          "Leaves center lane for Ambulance, improves safety for pedestrians, and reduces congestion.";
        streetBuilder
          .withBrakingCars([Lane.NORTHBOUND_VEHICLE, Lane.SOUTHBOUND_VEHICLE])
          .withParkingIncluded()
          .withDelivery(DeliveryType.CURBSIDE)
          .withAmbulance();
        player = this.curbsideDeliveryPlayer();
        background = Background.CURBSIDE;
        break;
      case ScenarioKey.CROSSWALK:
        title = "A Crosswalk is a Safer Place to Cross";
        description = "Crosswalks show drivers where to expect pedestrians.";
        streetBuilder
          .withTraffic(
            TrafficRequest.of(Lane.NORTHBOUND_VEHICLE, ObstacleType.CAR)
              .withAvoidance(ObstacleAvoidanceType.BRAKE)
              .withFrequency(LIGHT_TRAFFIC_FREQUENCY),
          )
          .withTraffic(
            TrafficRequest.of(Lane.SOUTHBOUND_VEHICLE, ObstacleType.CAR)
              .withAvoidance(ObstacleAvoidanceType.BRAKE)
              .withFrequency(LIGHT_TRAFFIC_FREQUENCY),
          )
          .withParkingIncluded()
          .withDelivery(DeliveryType.CURBSIDE)
          .withCrosswalk(CrosswalkType.BASIC);
        player = this.curbsideDeliveryPlayer();
        background = Background.CROSSWALK;
        break;
      case ScenarioKey.CROSSWALK_DAYLIGHT:
        title = "Open Space Before Crosswalks Improves Visibility";
        description =
          "Ghost vehicles no longer a problem since pedestrians and drivers are not blocked by parked cars.";
        streetBuilder
          .withBrakingCars([Lane.NORTHBOUND_VEHICLE, Lane.SOUTHBOUND_VEHICLE])
          .withParkingIncluded()
          .withDelivery(DeliveryType.CURBSIDE)
          .withCrosswalk(CrosswalkType.DAYLIGHT);
        player = this.frogPlayer(PlayerSpeed.SLOW);
        background = Background.CROSSWALK_DAYLIGHT;
        break;
      case ScenarioKey.CROSSWALK_RFB:
        title = "Wheelchairs Cross Safely with Rapid Flashing Beacons";
        description =
          "Flashing sign alerts drivers to stop for pedestrians in the crosswalk. Accessibile parking for wheelchairs.";
        streetBuilder
          .withBrakingCars([Lane.NORTHBOUND_VEHICLE, Lane.SOUTHBOUND_VEHICLE])
          .withParkingIncluded()
          .withDelivery(DeliveryType.CURBSIDE)
          .withCrosswalk(CrosswalkType.SIGNAL);

        player = this.wheelchairPlayer();
        background = Background.ACCESSIBLE;
        break;
      case ScenarioKey.BIKE_LANES:
        title = "Bike Lanes Separate Traffic for Improved Efficiency & Safety";
        description =
          "Cars and bicycles travel at different speeds.  Separate them and reduce frustration, fear and chaos.";
        streetBuilder
          .withBrakingCars([Lane.NORTHBOUND_VEHICLE, Lane.SOUTHBOUND_VEHICLE])
          .withParkingIncluded()
          .withDelivery(DeliveryType.CURBSIDE)
          .withCrosswalk(CrosswalkType.SIGNAL)
          .withBicycles([Lane.NORTHBOUND_BIKE, Lane.SOUTHBOUND_BIKE])
          .withBrakingCars([Lane.NORTHBOUND_VEHICLE, Lane.SOUTHBOUND_VEHICLE])
          .withBikeLanes();

        player = this.frogPlayer(PlayerSpeed.SLOW);
        background = Background.BIKE_LANES;
        break;
      case ScenarioKey.BIKE_LANES_AMBULANCE:
        title = "Cars Pull into Bike Lanes to Allow Ambulance to Pass";
        description =
          "Cars and bicycles pull over into the bike lanes leaving the center lane open for emergency vehicles.";
        streetBuilder
          .withBrakingCars([Lane.NORTHBOUND_VEHICLE, Lane.SOUTHBOUND_VEHICLE])
          .withParkingIncluded()
          .withDelivery(DeliveryType.CURBSIDE)
          .withCrosswalk(CrosswalkType.SIGNAL)
          .withBikeLanes()
          .withBicycles([Lane.NORTHBOUND_BIKE, Lane.SOUTHBOUND_BIKE])
          .withAmbulance(false);

        player = this.frogPlayer(PlayerSpeed.SLOW);
        background = Background.BIKE_LANES;
        break;
      case ScenarioKey.BIKE_LANES_PARKING:
        title = "The Parking Lane can be Dangerous for Bicycle Riders";
        description =
          "Drivers entering and exiting the parking spots can be dangerous for bicycle riders.  Opening doors can be tragic for a passing cyclist.";
        streetBuilder
          .withParkingIncluded()
          .withDelivery(DeliveryType.CURBSIDE)
          .withCrosswalk(CrosswalkType.SIGNAL)
          .withBrakingCars([Lane.NORTHBOUND_VEHICLE, Lane.SOUTHBOUND_VEHICLE])
          .withBikeLanes()
          .withBicycles([Lane.NORTHBOUND_BIKE])
          .withParkingCars()
          .withTraffic(
            // bicycles that crash
            TrafficRequest.of(Lane.SOUTHBOUND_BIKE, ObstacleType.BICYCLE)
              .withAvoidance(ObstacleAvoidanceType.BRAKE)
              .withSpeed(ObstacleSpeeds.SLOW)
              .withCrash()
              .withFrequency(HEAVY_TRAFFIC_FREQUENCY),
          );

        player = this.curbsideDeliveryPlayer(PlayerSpeed.SLOW);
        background = Background.BIKE_LANES;
        break;
      case ScenarioKey.CYCLE_TRACK:
        title = "Separating Cyclists is Best for Safety and Efficiency";
        description =
          "A Class IV Separated Bikeway is the safest and most efficient way to move people on bicycles.";
        streetBuilder
          .withCycletrack()
          .withParkingIncluded()
          .withDelivery(DeliveryType.CURBSIDE)
          .withCrosswalk(CrosswalkType.SIGNAL)
          .withBrakingCars([Lane.NORTHBOUND_VEHICLE, Lane.SOUTHBOUND_VEHICLE])
          .withBicycles([Lane.NORTHBOUND_BIKE, Lane.SOUTHBOUND_BIKE]);

        player = this.frogPlayer(PlayerSpeed.SLOW);
        background = Background.CYCLETRACK;
        break;
      case ScenarioKey.CYCLE_TRACK_AMBULANCE:
        title = "Cycletrack allows Ambulance to Pass";
        description =
          "The protected bikeway can allow for vehicles to pull into it for emergency access.";
        streetBuilder
          .withCycletrack()
          .withParkingIncluded()
          .withDelivery(DeliveryType.CURBSIDE)
          .withAmbulance(false)
          .withCrosswalk(CrosswalkType.SIGNAL)
          .withBrakingCars([Lane.NORTHBOUND_VEHICLE, Lane.SOUTHBOUND_VEHICLE])
          .withBicycles([Lane.NORTHBOUND_BIKE, Lane.SOUTHBOUND_BIKE]);

        player = this.frogPlayer(PlayerSpeed.SLOW);
        background = Background.CYCLETRACK;
        break;
      case ScenarioKey.GAME_OVER:
      default:
        title = "Game Over - Nobody Wins if Bridgeway is Not Improved";
        streetBuilder
          .withBrakingCars([Lane.NORTHBOUND_VEHICLE, Lane.SOUTHBOUND_VEHICLE])
          .withBicycles([Lane.NORTHBOUND_VEHICLE, Lane.SOUTHBOUND_VEHICLE])
          .withParkingIncluded()
          .withDelivery(DeliveryType.CENTER_LANE)
          .withAmbulance();
        break;
    }
    const street = streetBuilder.build();
    return new Scenario(
      key as ScenarioKey,
      title,
      description,
      street,
      player,
      this.topOfStreetY,
      background,
    );
  }

  /**
   * Creates a new frog player with the specified speed.
   * @param speed - The speed of the player, defaults to PlayerSpeed.NORMAL.
   * @returns A new Player object representing the frog player.
   */
  private frogPlayer(speed: PlayerSpeed = PlayerSpeed.NORMAL): Player {
    const playerSize = 30;
    const playerImage = new Image();
    playerImage.src = "images/players/frog.svg";
    const pixelsPerMove = 10;
    // place the player on the sidewalk.  the scene must be fixed in size
    const playerX = PLAYER_START_X;
    const playerY = 470;

    return new Player(
      playerX,
      playerY,
      playerSize,
      playerSize,
      playerImage,
      pixelsPerMove,
      false,
      speed,
    );
  }
  /** A commercial delivery truck that parks curbside has a delivery person instead of a frog.
   *
   * @param speed Adjust the speeds of the player moving
   * @returns
   */
  private curbsideDeliveryPlayer(
    speed: PlayerSpeed = PlayerSpeed.NORMAL,
  ): Player {
    const imageScale = 0.07;
    const imageWidth = 386 * imageScale;
    const imageHeight = 739 * imageScale;
    const playerImage = new Image();
    playerImage.src = "images/players/delivery.png";
    const pixelsPerMove = 10;
    // place the player on the sidewalk.  the scene must be fixed in size
    const playerX = 1080;
    const playerY = 470;

    return new Player(
      playerX,
      playerY,
      imageWidth,
      imageHeight,
      playerImage,
      pixelsPerMove,
      false,
      speed,
    );
  }
  private wheelchairPlayer(speed: PlayerSpeed = PlayerSpeed.SLOW): Player {
    const imageScale = 0.2;
    const imageWidth = 131 * imageScale;
    const imageHeight = 209 * imageScale;
    const playerImage = new Image();
    playerImage.src = "images/players/wheelchair.png";
    const pixelsPerMove = 10;
    // place the player on the sidewalk.  the scene must be fixed in size
    const playerX = PARKED_CAR_5_X - 75;
    const playerY = 470;

    return new Player(
      playerX,
      playerY,
      imageWidth,
      imageHeight,
      playerImage,
      pixelsPerMove,
      false,
      speed,
    );
  }
}

/**
 * An individual request for an obstacle to be produced with specfic properties.
 *
 */
class TrafficRequest {
  /**
   * Creates an instance of TrafficRequest.
   * @param lane The lane where the obstacle should be produced.
   * @param type The type of vehicle.
   * @param frequency Number of seconds between obstacles of this type.
   * @param avoidance How to avoid traffic ahead of the obstacle.
   * @param crash True will finalize obstacle if collision detected with another.
   */
  constructor(
    public readonly lane: Lane,
    public readonly type: ObstacleType,
    public readonly speed: ObstacleSpeeds = ObstacleSpeeds.MEDIUM,
    public readonly frequency: number = HEAVY_TRAFFIC_FREQUENCY,
    public readonly avoidance: ObstacleAvoidanceType = ObstacleAvoidanceType.NONE,
    public readonly crash: boolean = false,
  ) {}

  public static of(lane: Lane, type: ObstacleType): TrafficRequest {
    if (!lane || !type) throw new Error("Lane and type are required");
    return new TrafficRequest(lane, type);
  }
  withFrequency(frequency: number): TrafficRequest {
    return new TrafficRequest(
      this.lane,
      this.type,
      this.speed,
      frequency,
      this.avoidance,
      this.crash,
    );
  }
  withAvoidance(avoidance: ObstacleAvoidanceType): TrafficRequest {
    return new TrafficRequest(
      this.lane,
      this.type,
      this.speed,
      this.frequency,
      avoidance,
      this.crash,
    );
  }
  withCrash(crash: boolean = true): TrafficRequest {
    return new TrafficRequest(
      this.lane,
      this.type,
      this.speed,
      this.frequency,
      this.avoidance,
      crash,
    );
  }
  withSpeed(speed: ObstacleSpeeds): TrafficRequest {
    return new TrafficRequest(
      this.lane,
      this.type,
      speed,
      this.frequency,
      this.avoidance,
      this.crash,
    );
  }
}

/** A class that builds a street for a scenario.
 * Use the with methods to set up the scenario.
 * The build method puts it all together and returns a street
 * that can be used to simulate the situation requested.
 *
 */
class StreetBuilder {
  private parkingIncluded: boolean;
  private delivery: DeliveryType;
  private crosswalk: CrosswalkType;
  private bikeLanes: boolean;
  private cycletrack: boolean;
  private traffic: TrafficRequest[];

  constructor(
    public readonly streetWidth: number,
    public readonly streetLength: number,
    public readonly topOfStreetY: number,
  ) {
    this.parkingIncluded = false;
    this.delivery = DeliveryType.NONE;
    this.crosswalk = CrosswalkType.NONE;
    this.bikeLanes = false;
    this.cycletrack = false;
    this.traffic = [];
  }

  public withParkingIncluded(): StreetBuilder {
    this.parkingIncluded = true;
    return this;
  }

  public withTraffic(traffic: TrafficRequest): StreetBuilder {
    this.traffic.push(traffic);
    return this;
  }

  public withParkingCars(): StreetBuilder {
    this.withTraffic(
      //parking cars settings are fixed for now
      TrafficRequest.of(
        Lane.SOUTHBOUND_VEHICLE,
        ObstacleType.PARKING_CAR,
      ).withFrequency(20),
    );
    return this;
  }
  public withPassingVehicles(lanes: Lane[]): StreetBuilder {
    for (const lane of lanes) {
      this.traffic.push(
        new TrafficRequest(lane, ObstacleType.CAR).withAvoidance(
          ObstacleAvoidanceType.PASS,
        ),
      );
    }
    return this;
  }
  public withBrakingCars(lanes: Lane[],frequency:number=HEAVY_TRAFFIC_FREQUENCY): StreetBuilder {
    for (const lane of lanes) {
      this.traffic.push(
        new TrafficRequest(lane, ObstacleType.CAR)
          .withAvoidance(ObstacleAvoidanceType.BRAKE)
          .withFrequency(frequency)
      );
    }
    return this;
  }
  public withDefaultCars(
    lanes: Lane[],
    frequency: number = HEAVY_TRAFFIC_FREQUENCY,
  ): StreetBuilder {
    for (const lane of lanes) {
      this.traffic.push(
        new TrafficRequest(lane, ObstacleType.CAR).withFrequency(frequency),
      );
    }
    return this;
  }

  public withBicycles(
    lanes: Lane[],
    frequency: number = HEAVY_TRAFFIC_FREQUENCY,
  ): StreetBuilder {
    for (const lane of lanes) {
      this.traffic.push(
        TrafficRequest.of(lane, ObstacleType.BICYCLE)
          .withAvoidance(ObstacleAvoidanceType.BRAKE)
          .withFrequency(frequency),
      );
    }
    return this;
  }

  public withDelivery(delivery: DeliveryType): StreetBuilder {
    this.delivery = delivery;
    return this;
  }

  public withCrosswalk(crosswalk: CrosswalkType): StreetBuilder {
    this.crosswalk = crosswalk;
    return this;
  }

  public withBikeLanes(): StreetBuilder {
    this.bikeLanes = true;
    return this;
  }

  public withCycletrack(): StreetBuilder {
    this.cycletrack = true;
    return this;
  }

  public withAmbulance(crash: boolean = true): StreetBuilder {
    const ambulance = TrafficRequest.of(
      Lane.SOUTHBOUND_VEHICLE,
      ObstacleType.AMBULANCE,
    )
      .withAvoidance(ObstacleAvoidanceType.PASS)
      .withFrequency(20)
      .withCrash(crash);
    return this.withTraffic(ambulance);
  }

  /** Based on the properties given, this prouces the street that will produce
   * the obstacles and scene objects for the scenario.
   *
   *
   * @returns
   */
  public build(): Street {
    //Pixels determined emperically...this should be a percentage of the streetWidth.

    let y = this.topOfStreetY;
    let street = new Street(this.topOfStreetY, this.streetLength);
    // setup the lanes from top to bottom. each contribute to the y coordinate of the next lane.
    if (this.bikeLanes) {
      ({ street, y } = this.northboundBikeLane(street, y));
      ({ street, y } = this.northboundVehicleLane(street, y));
      ({ street, y } = this.southboundVehicleLane(street, y));
      ({ street, y } = this.southboundBikeLane(street, y));
    } else if (this.cycletrack) {
      ({ street, y } = this.northboundBikeLane(street, y));
      ({ street, y } = this.southboundBikeLane(street, y));
      ({ street, y } = this.northboundVehicleLane(street, y));
      ({ street, y } = this.southboundVehicleLane(street, y));
    } else {
      ({ street, y } = this.northboundVehicleLane(street, y));
      ({ street, y } = this.centerTurnLane(street, y));
      ({ street, y } = this.southboundVehicleLane(street, y));
    }
    ({ street, y } = this.southboundParkingLane(street, y));
    return street;
  }

  private northboundBikeLane(
    street: Street,
    y: number,
  ): { street: Street; y: number } {
    // y is the center of the lane.
    y += this.bikeLaneWidth / 2;
    street = street.addLane(
      LaneDirection.LEFT,
      this.bikeLaneWidth,
      new LaneLinesStyles(hiddenLineStyle, hiddenLineStyle),
      this.vehicleTrafficObstacleProducers(
        Lane.NORTHBOUND_BIKE,
        y,
        LaneDirection.LEFT,
        HEAVY_TRAFFIC_FREQUENCY,
        this.parkingIncluded,
        ObstacleAvoidanceType.NONE,
        false,
        false,
        false,
        this.crosswalk,
      ),
    );
    //jump to the bike lane line
    y += this.bikeLaneWidth / 2;

    return { street, y };
  }

  private northboundVehicleLane(
    street: Street,
    y: number,
  ): { street: Street; y: number } {
    const northboundDirection = LaneDirection.LEFT;
    if (this.crosswalk == CrosswalkType.SIGNAL) {
      street = street.addSceneObject(this.crosswalkSign(northboundDirection));
    }
    // Jump to the middle of the next lane
    y += this.vehicleLaneWidth / 2;
    street = street.addLane(
      northboundDirection,
      this.vehicleLaneWidth,
      new LaneLinesStyles(hiddenLineStyle, hiddenLineStyle),
      this.vehicleTrafficObstacleProducers(
        Lane.NORTHBOUND_VEHICLE,
        y,
        northboundDirection,
        HEAVY_TRAFFIC_FREQUENCY,
        false,
        ObstacleAvoidanceType.NONE,
        false,
        this.delivery == DeliveryType.CENTER_LANE,
        false,
        this.crosswalk,
      ),
    );
    //jump to the bottom line of the northbound vehicle lane
    y += this.vehicleLaneWidth / 2;
    return { street, y };
  }

  private centerTurnLane(
    street: Street,
    y: number,
  ): { street: Street; y: number } {
    y += this.turnLaneWidth / 2;
    const turnLaneProducers: ObstacleProducer[] = [];
    if (this.delivery == DeliveryType.CENTER_LANE) {
      turnLaneProducers.push(...this.centerlaneDeliveryObstacleProducers(y));
    }
    street = street.addLane(
      LaneDirection.LEFT,
      this.turnLaneWidth,
      new LaneLinesStyles(hiddenLineStyle, hiddenLineStyle),
      turnLaneProducers,
    );
    y = y + this.turnLaneWidth / 2;

    return { street, y };
  }

  private southboundVehicleLane(
    street: Street,
    y: number,
  ): { street: Street; y: number } {
    const southboundDirection = LaneDirection.RIGHT;
    if (this.crosswalk == CrosswalkType.SIGNAL) {
      street = street.addSceneObject(this.crosswalkSign(southboundDirection));
    }
    y = y + this.vehicleLaneWidth / 2;
    street = street.addLane(
      southboundDirection,
      this.vehicleLaneWidth,
      new LaneLinesStyles(hiddenLineStyle, hiddenLineStyle),
      this.vehicleTrafficObstacleProducers(
        Lane.SOUTHBOUND_VEHICLE,
        y,
        southboundDirection,
        HEAVY_TRAFFIC_FREQUENCY,
        this.parkingIncluded,
        ObstacleAvoidanceType.NONE,
        false,
        false,
        false,
        this.crosswalk,
      ),
    );
    y = y + this.vehicleLaneWidth / 2;
    return { street, y };
  }

  private southboundBikeLane(
    street: Street,
    y: number,
  ): { street: Street; y: number } {
    y += this.bikeLaneWidth / 2;
    street = street.addLane(
      LaneDirection.RIGHT,
      this.bikeLaneWidth,
      new LaneLinesStyles(hiddenLineStyle, hiddenLineStyle),
      this.vehicleTrafficObstacleProducers(
        Lane.SOUTHBOUND_BIKE,
        y,
        LaneDirection.RIGHT,
        HEAVY_TRAFFIC_FREQUENCY,
        this.parkingIncluded,
        ObstacleAvoidanceType.NONE,
        false, //bicycles
        false,
        false,
        this.crosswalk,
      ),
    );
    y += this.bikeLaneWidth / 2;

    return { street, y };
  }

  private southboundParkingLane(
    street: Street,
    y: number,
  ): { street: Street; y: number } {
    if (this.parkingIncluded) {
      y = y + this.parkingLaneWidth / 2;
      street = street.addLane(
        LaneDirection.RIGHT,
        this.parkingLaneWidth,
        new LaneLinesStyles(hiddenLineStyle, hiddenLineStyle),
        this.parkingLaneObstacleProducers(y),
      );
    }
    return { street, y };
  }



  private get bikeLaneWidth(): number {
    return 30;
  }

  private get historicVehicleLaneWidth(): number {
    return 65;
  }

  private get turnLaneWidth(): number {
    return 50;
  }

  private get parkingLaneWidth(): number {
    return 50;
  }

  /** Vehicle lane width changes if bike lanes exist. The lanes get more narrow in modern designs. */
  private get vehicleLaneWidth(): number {
    return this.bikeLanes || this.cycletrack ? 60 : this.historicVehicleLaneWidth;
  }

  /** Given the lane, this returns all of the obstacleTypes declared for the lane that match
   * a vehicle type.  This is used to determine which vehicle types to produce for the lane.
   */
  private getTrafficRequestsForLane(
    lane: Lane,
    type: ObstacleType,
  ): TrafficRequest[] {
    return this.traffic.filter(
      (trafficRequest) =>
        trafficRequest.lane == lane && trafficRequest.type == type,
    );
  }

  /**
   * Returns an array of obstacle producers that produce vehicle obstacles.
   * If parkingLineOfSightTriggeredVehicles is true, vehicles will be produced
   * conditionally on the player's location at spots where the players view was blocked
   * by a parked car.
   *
   * @param y The y-coordinate of the obstacles.
   * @param direction The direction of the lane.
   * @param maxFrequencyInSeconds The maximum frequency of obstacle production in seconds.
   * @param parkingLineOfSightTriggeredVehicles If true, vehicles will appear abruptly depending on crossing spot
   * @returns An array of obstacle producers.
   */
  private vehicleTrafficObstacleProducers(
    lane: Lane,
    y: number,
    direction: LaneDirection,
    maxFrequencyInSeconds: number = 1,
    parkingLineOfSightTriggeredVehicles: boolean = false,
    obstacleAvoidance: ObstacleAvoidanceType,
    bicycles: boolean = false,
    centerLaneDelivery: boolean = false,
    ambulance: boolean = false,
    crosswalk: CrosswalkType = CrosswalkType.NONE,
  ): readonly ObstacleProducer[] {
    const producers = [];

    // add vehicles for the lane
    const requests = this.getTrafficRequestsForLane(lane, ObstacleType.CAR);
    for (const request of requests) {
      const vehicleTemplate = this.vehicleObstacle(
        0,
        y,
        direction,
        request.speed,
        request.avoidance,
      );
      // always add cars
      producers.push(new ObstacleProducer(vehicleTemplate, request.frequency));
    }

    //parking cars are special and different than other cars
    this.getTrafficRequestsForLane(lane, ObstacleType.PARKING_CAR).forEach(
      (request) => {
        const parkingCarTemplate = this.parkingCarObstacle(y);
        producers.push(
          new ObstacleProducer(parkingCarTemplate, request.frequency),
        );
      },
    );

    // add an ambulance first to demonstrate a clear path
    this.getTrafficRequestsForLane(lane, ObstacleType.AMBULANCE).forEach(
      (request) => {
        const ambulanceTemplate = this.ambulanceObstacle(
          y,
          direction,
          request.crash,
        );
        producers.push(
          new ObstacleProducer(ambulanceTemplate, request.frequency),
        );
      },
    );

    this.getTrafficRequestsForLane(lane, ObstacleType.BICYCLE).forEach(
      (request) => {
        const bicycleTemplate = this.bicycleObstacle(y, direction, request);
        producers.push(
          new ObstacleProducer(bicycleTemplate, request.frequency),
        );
      },
    );

    // ghost vehicles appear when the player reaches the lane hidden by parked cars
    if (
      parkingLineOfSightTriggeredVehicles &&
      crosswalk != CrosswalkType.DAYLIGHT &&
      crosswalk != CrosswalkType.SIGNAL
    ) {
      producers.push(
        ...this.ghostVehicleTargetTriggeredProducers(y, LaneDirection.RIGHT),
      );
    }
    // ghost vehicles appear when the player reaches the lane hidden by delivery vehicle
    if (centerLaneDelivery) {
      producers.push(
        ...this.ghostVehicleTargetTriggeredProducers(y, LaneDirection.LEFT),
      );
    }
    // produce stop line obstacles when the crosswalk is flashing
    if (crosswalk == CrosswalkType.SIGNAL) {
      const stopLineTemplate = this.crosswalkStoplineObstacle(y, direction);
      const stopLineObstacleProducer = new CrosswalkObstacleProducer(
        stopLineTemplate,
      );
      producers.push(stopLineObstacleProducer);
    }
    return producers;
  }

  /**
   * Obstacle producers that trigger cars to appear when the player exits the parking
   * lane close to the parked cars.  This is to simulate the player's view being blocked.
   * This is also used for the delivery truck in the center lane.
   *
   * @param vehicleLaneY The y-coordinate of the vehicle lane.
   * @returns An array of obstacle producers.
   */
  private ghostVehicleTargetTriggeredProducers(
    vehicleLaneY: number,
    direction: LaneDirection,
  ): readonly ObstacleProducer[] {
    // this vehicle appears when the player reaches the lane
    const hiddenVehicleStartingX = PLAYER_START_X - 400 * direction;
    const hiddenVehicleTemplate = this.ghostVehicleObstacle(
      hiddenVehicleStartingX,
      vehicleLaneY,
      direction,
    );

    // trigger point is the bottom of the vehicle lane
    const yTriggerPoint = vehicleLaneY + hiddenVehicleTemplate.height;
    const targetX = PARKED_CAR_3_X;
    // leave a small gap near the 5th parked car by the red curb
    const targetWidth = 400; // emperically determined through observation
    const targetHeight = 5;
    const target = new GameObject(
      targetX,
      yTriggerPoint,
      targetWidth,
      targetHeight,
    );

    const maxFrequencyForTargetTrigger = 3;

    //special producer that triggers the ghost car given the target
    const producers: ObstacleProducer[] = [];
    producers.push(
      new TargetObstacleProducer(
        hiddenVehicleTemplate,
        maxFrequencyForTargetTrigger,
        false,
        target,
      ),
    );
    return producers;
  }

  /**
   * Populates the parking lane with parked cars.
   * @param y The y-coordinate of the obstacle producers.
   * @param curbsideLoading if true, trucks are parked in the designated curbside loading zone
   * @param crosswalk indicates the type of crosswalk to be implemented on the roadway
   * @returns An array of obstacle producers.
   */
  private parkingLaneObstacleProducers(y: number): readonly ObstacleProducer[] {
    const frequency = 10000; // only produce one obstacle for each parking spot...do not repeat
    const speed = ObstacleSpeeds.STOPPED;
    const xForEach = [
      20,
      PARKED_CAR_2_X,
      PARKED_CAR_3_X,
      PARKED_CAR_4_X,
      PARKED_CAR_5_X,
      840,
      PARKED_CAR_7_X,
      PARKED_CAR_8_X,
      1150,
    ];
    // array matches the x array, but indicates if the vehicle is a commercial vehicle
    const commercialVehicleForEach = [
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      true,
    ];
    const curbsideLoading = this.delivery == DeliveryType.CURBSIDE;
    if (this.crosswalk != CrosswalkType.NONE) {
      // remove the second to last parking spot giving delivery some room
      xForEach.splice(7, 1);
      commercialVehicleForEach.splice(7, 1);

      // remove the fourth spot where the crosswalk will be painted
      xForEach.splice(3, 1);
      commercialVehicleForEach.splice(2, 1);

      // remove the third spot to daylight the crosswalk
      if (
        this.crosswalk == CrosswalkType.DAYLIGHT ||
        this.crosswalk == CrosswalkType.SIGNAL
      ) {
        xForEach.splice(2, 1);
        commercialVehicleForEach.splice(2, 1);
      }
    }
    // remove the second to last parking spot to give delivery person space to move
    if (curbsideLoading) {
      xForEach.splice(7, 1);
      commercialVehicleForEach.splice(7, 1);
    }

    const producers: ObstacleProducer[] = [];
    for (let i = 0; i < xForEach.length; i++) {
      const x: number = xForEach[i];
      const comercialVehicle: boolean =
        curbsideLoading && commercialVehicleForEach[i];
      const obstacle = comercialVehicle
        ? this.deliveryVehicleObstacle(x, y, LaneDirection.RIGHT)
        : this.vehicleObstacle(
            x,
            y,
            LaneDirection.RIGHT,
            speed,
            ObstacleAvoidanceType.NONE,
          );
      const DO_NOT_ASSIGN_X = false;
      const DO_NOT_RANDOMIZE = false;
      producers.push(
        new ObstacleProducer(
          obstacle,
          frequency,
          DO_NOT_ASSIGN_X,
          DO_NOT_RANDOMIZE,
        ),
      );
    }
    return producers;
  }

  /** parks delivery trucks in the center lane.
   *
   * @param y the middle of the center lane
   * @returns the producers for the delivery trucks
   */
  private centerlaneDeliveryObstacleProducers(
    y: number,
    ambulance: boolean = false,
  ): readonly ObstacleProducer[] {
    const producers: ObstacleProducer[] = [];

    // produce a delivery truck in the center lane
    const deliveryTruckSB = this.deliveryVehicleObstacle(
      500, // specifically located blocking the safe path for the pedestrian.
      y,
      LaneDirection.RIGHT,
    );
    producers.push(new ObstacleProducer(deliveryTruckSB, 10000, false, false));

    if (ambulance) {
      const ambulance = this.ambulanceObstacle(y, LaneDirection.RIGHT);
      producers.push(new ObstacleProducer(ambulance, 10000, false, false));
    }
    return producers;
  }

  private obstacle(
    x: number,
    y: number,
    direction: LaneDirection,
    speed: number,
    obstacleAvoidance: ObstacleAvoidanceType,
    imageSrc: string,
    imageWidth: number,
    imageHeight: number,
    imageScale: number,
    detectCollision: boolean = false,
    emergencyVehicle: boolean = false,
  ): Obstacle {
    // Place obstacles at the beginning or end of the lane based on the lane direction.
    const objectWidth = imageWidth * imageScale;
    const objectHeight = imageHeight * imageScale;
    const image = new Image();
    image.src = imageSrc;
    return new Obstacle(
      x,
      y,
      objectWidth,
      objectHeight,
      speed,
      direction,
      image,
      obstacleAvoidance,
      detectCollision,
      emergencyVehicle,
    );
  }

  /** Hidden from line of sight of the player.
   * Appears abruptly when the player reaches the lane.
   * Doesn't brake for the player simulating a driver not seeing the pedestrian.
   *
   * @param x
   * @param y
   * @param direction
   * @returns
   */
  private ghostVehicleObstacle(
    x: number,
    y: number,
    direction: LaneDirection,
  ): Obstacle {
    return this.obstacle(
      x,
      y,
      direction,
      ObstacleSpeeds.FAST,
      ObstacleAvoidanceType.NONE,
      "images/obstacles/car-ghost.png",
      509,
      266,
      0.15,
    );
  }

  /** parked delivery vehicle blocks pedestrian crossing, bicycle passing,
   * emergency vehicles and line of sight ghost vehicles.
   */
  private deliveryVehicleObstacle(
    x: number,
    y: number,
    direction: LaneDirection,
  ): Obstacle {
    return this.obstacle(
      x,
      y,
      direction,
      ObstacleSpeeds.STOPPED,
      ObstacleAvoidanceType.NONE,
      "images/obstacles/truck-delivery.png",
      426,
      249,
      0.21,
    );
  }

  private ambulanceObstacle(
    y: number,
    direction: LaneDirection,
    detectCollision: boolean = false,
  ): Obstacle {
    return this.obstacle(
      0,
      y,
      direction,
      ObstacleSpeeds.MEDIUM,
      ObstacleAvoidanceType.PASS,
      "images/obstacles/truck-ambulance.png",
      426,
      249,
      0.21,
      detectCollision, // detect collision
      true, // emergency vehicle
    );
  }

  /** Regular cars that populate the lanes.
   * The car is a red racer if obstacleAvoidance will not stop for the player.
   * The car is a blue wagon if obstacleAvoidance will stop for the player.
   *
   * @param x
   * @param y
   * @param direction
   * @param speed
   * @param obstacleAvoidance
   * @returns
   */
  private vehicleObstacle(
    x: number,
    y: number,
    direction: LaneDirection,
    speed: number = ObstacleSpeeds.MEDIUM,
    obstacleAvoidance: ObstacleAvoidanceType,
  ): Obstacle {
    const racer =
      (speed != ObstacleSpeeds.STOPPED &&
        obstacleAvoidance === ObstacleAvoidanceType.NONE) ||
      obstacleAvoidance === ObstacleAvoidanceType.PASS;
    const imageSrc = racer
      ? "images/obstacles/car-racer.png"
      : "images/obstacles/car-wagon.png";
    const imageWidth = racer ? 512 : 720;
    const imageHeight = racer ? 285 : 332;
    const imageScale = racer ? 0.13 : 0.1;
    return this.obstacle(
      x,
      y,
      direction,
      speed,
      obstacleAvoidance,
      imageSrc,
      imageWidth,
      imageHeight,
      imageScale,
    );
  }

  private bicycleObstacle(
    y: number,
    direction: LaneDirection,
    request: TrafficRequest,
  ): Obstacle {
    return this.obstacle(
      0,
      y,
      direction,
      ObstacleSpeeds.SLOW,
      request.avoidance,
      "images/obstacles/bicycle.png",
      332,
      140,
      0.15,
      request.crash,
    );
  }

  private parkingCarObstacle(y: number): ParkingCarObstacle {
    return new ParkingCarObstacle(
      y,
      PARKED_CAR_8_X,
      y + this.bikeLaneWidth + this.parkingLaneWidth, //only works with the bike lanes street design
    );
  }
  /** An invisible obstacle that stops other vehicles at the crosswalk stop line
   *  when the crosswalk signal is flashing.
   *
   * @param y
   * @param direction
   * @returns
   */
  private crosswalkStoplineObstacle(
    y: number,
    direction: LaneDirection,
  ): Obstacle {
    // values emperically determined based on stopping near stopline without obstacle in crosswalk
    const x = direction == LaneDirection.RIGHT ? 300 : 425;
    return new Obstacle(x, y, 5, 10, ObstacleSpeeds.STOPPED, direction);
  }

  /** Produces the crosswalk sign, scene object used to notify vehicles when player is in the crosswalk. */
  private crosswalkSign(direction: LaneDirection): CrosswalkSign {
    // invisible area that represents the boundary of the crosswalk
    const crosswalk = new GameObject(PARKED_CAR_4_X, 220, 120, 400);
    // signs are empirically placed to be in the correct location corresponding to daylighted crosswalk
    const x = direction == LaneDirection.RIGHT ? 285 : 435;
    const y = direction == LaneDirection.RIGHT ? 410 : 220;
    return new CrosswalkSign(x, y, direction, crosswalk);
  }
}
