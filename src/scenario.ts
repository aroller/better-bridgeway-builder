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
const solidWhiteLineStyle = new LaneLineStyle();
const hiddenLineStyle = new LaneLineStyle(
  solidWhiteLineStyle.color,
  false,
  true,
);

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
}

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
  WHEELCHAIR = "wheelchair",
  BIKE_LANES = "bike-lanes",
  BIKE_LANES_AMBULANCE = "bike-lanes-ambulance",
  GAME_OVER = "game-over",
}

export enum DeliveryType {
  CENTER_LANE = "center-lane",
  CURBSIDE = "curbside",
  NONE = "none",
}

/** Internally used to indicate traffic diversity in a single lane. */
enum ObstacleType {
  PASSING_VEHICLE = "passing-vehicle",
  STOPPING_VEHICLE = "stopping-vehicle",
  DELIVERY_TRUCK = "delivery",
  BICYCLE = "bicycle",
  GHOST = "ghost",
  AMBULANCE = "ambulance",
  AMBULANCE_CRASHING = "ambulance-crashing",
}

export enum Background {
  EXISTING = "images/scene/better-bridgeway-background.png",
  CURBSIDE = "images/scene/better-bridgeway-background-curbside.png",
  CROSSWALK = "images/scene/better-bridgeway-background-crosswalk.png",
  CROSSWALK_DAYLIGHT = "images/scene/better-bridgeway-background-daylight.png",
  ACCESSIBLE = "images/scene/better-bridgeway-background-accessible.png",
  BIKE_LANES = "images/scene/better-bridgeway-background-bike-lanes.png",
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
    const LIGHT_TRAFFIC = true;
    const HEAVY_TRAFFIC = false;
    const PARKING_INCLUDED = true;
    const PARKING_NOT_INCLUDED = false;
    const BICYCLES_INCLUDED = true;
    const BICYCLES_NOT_INCLUDED = false;
    const AMBULANCE_INCLUDED = true;
    const AMBULANCE_NOT_INCLUDED = false;
    switch (key) {
      case ScenarioKey.LIGHT_TRAFFIC:
        title = "Light Traffic is Easy to Cross";
        description = "Normal speed person crossing with light traffic.";
        streetBuilder.withLightTraffic();
        break;
      case ScenarioKey.HEAVY_TRAFFIC:
        title = "Heavy Traffic is Challenging to Cross";
        description = "Normal speed person crossing with heavy traffic.";
        //default street builder...no changes
        break;
      case ScenarioKey.SLOW_MOVING:
        title = "Slow Moving Frogs Can Barely Cross in Heavy Traffic";
        description = "Slow moving person crossing with heavy traffic.";
        //default street builder...no changes
        player = this.frogPlayer(PlayerSpeed.SLOW);
        break;
      case ScenarioKey.CARS_STOP:
        title = "Cars Stop for Slow Moving Frogs";
        description = "Cars stop for a person crossing with heavy traffic.";
        streetBuilder.withObstacleAvoidance(ObstacleAvoidanceType.BRAKE);
        player = this.frogPlayer(PlayerSpeed.SLOW);
        break;
      case ScenarioKey.PARKED_CARS:
        title = "Parked Cars Block the View of Slow Moving Frogs";
        description =
          "Parked cars block the view of a slow moving person crossing with heavy traffic.";
        streetBuilder
          .withObstacleAvoidance(ObstacleAvoidanceType.BRAKE)
          .withLightTraffic()
          .withParkingIncluded();
        player = this.frogPlayer(PlayerSpeed.SLOW);
        break;
      case ScenarioKey.BICYCLES_SHARED_LANE:
        title = "Bicycles Move Slower than Cars";
        description =
          "Traffic congestion increases when bicycles are present because they share the lane.";
        streetBuilder
          .withObstacleAvoidance(ObstacleAvoidanceType.BRAKE)
          .withParkingIncluded()
          .withBicycles();
        player = this.frogPlayer(PlayerSpeed.SLOW);
        break;
      case ScenarioKey.CARS_PASS_BICYCLES:
        title = "Cars Pass Bicycles";
        description = "Cars use the middle lane to pass the slower bicycles.";
        streetBuilder
          .withObstacleAvoidance(ObstacleAvoidanceType.PASS)
          .withParkingIncluded()
          .withBicycles();
        player = this.frogPlayer(PlayerSpeed.SLOW);
        break;
      case ScenarioKey.CENTER_LANE_DELIVERY:
        title = "Commercial Delivery in the Center Turn Lane";
        description =
          "Trucks block the center lane so cars no longer pass bicycles.";
        streetBuilder
          .withObstacleAvoidance(ObstacleAvoidanceType.BRAKE)
          .withParkingIncluded()
          .withBicycles()
          .withDelivery(DeliveryType.CENTER_LANE);
        player = this.frogPlayer(PlayerSpeed.SLOW);
        break;
      case ScenarioKey.CENTER_LANE_AMBULANCE:
        title =
          "First Responders blocked by Delivery Trucks in Center Turn Lane";
        description =
          "The center turn lane can not both be a delivery lane and emergency lane.";
        streetBuilder
          .withObstacleAvoidance(ObstacleAvoidanceType.BRAKE)
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
          .withObstacleAvoidance(ObstacleAvoidanceType.BRAKE)
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
          .withLightTraffic()
          .withObstacleAvoidance(ObstacleAvoidanceType.BRAKE)
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
          .withObstacleAvoidance(ObstacleAvoidanceType.BRAKE)
          .withParkingIncluded()
          .withDelivery(DeliveryType.CURBSIDE)
          .withCrosswalk(CrosswalkType.DAYLIGHT);
        player = this.frogPlayer(PlayerSpeed.SLOW);
        background = Background.CROSSWALK_DAYLIGHT;
        break;
      case ScenarioKey.WHEELCHAIR:
        title = "Wheelchairs Cross Safely with Rapid Flashing Beacons";
        description =
          "Flashing sign alerts drivers to stop for pedestrians in the crosswalk. Accessibile parking for wheelchairs.";
        streetBuilder
          .withObstacleAvoidance(ObstacleAvoidanceType.BRAKE)
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
          .withObstacleAvoidance(ObstacleAvoidanceType.BRAKE)
          .withParkingIncluded()
          .withDelivery(DeliveryType.CURBSIDE)
          .withCrosswalk(CrosswalkType.SIGNAL)
          .withBikeLanes();

        player = this.frogPlayer(PlayerSpeed.SLOW);
        background = Background.BIKE_LANES;
        break;
      case ScenarioKey.BIKE_LANES_AMBULANCE:
        title = "Cars Pull into Bike Lanes to Allow Ambulance to Pass";
        description =
          "Cars and bicycles pull over into the bike lanes leaving the center lane open for emergency vehicles.";
        streetBuilder
          .withObstacleAvoidance(ObstacleAvoidanceType.BRAKE)
          .withParkingIncluded()
          .withDelivery(DeliveryType.CURBSIDE)
          .withCrosswalk(CrosswalkType.SIGNAL)
          .withBikeLanes()
          .withAmbulance();

        player = this.frogPlayer(PlayerSpeed.SLOW);
        background = Background.BIKE_LANES;
        break;
      case ScenarioKey.GAME_OVER:
      default:
        title = "Game Over - Nobody Wins if Bridgeway is Not Improved";
        streetBuilder
          .withObstacleAvoidance(ObstacleAvoidanceType.BRAKE)
          .withBicycles()
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

/** A class that builds a street for a scenario.
 * Use the with methods to set up the scenario.
 * The build method puts it all together and returns a street
 * that can be used to simulate the situation requested.
 *
 */
class StreetBuilder {
  private lightTraffic: boolean;
  private parkingIncluded: boolean;
  private obstacleAvoidance: ObstacleAvoidanceType;
  private bicycles: boolean;
  private delivery: DeliveryType;
  private crosswalk: CrosswalkType;
  private bikeLanes: boolean;
  private ambulance: boolean;

  constructor(
    public readonly streetWidth: number,
    public readonly streetLength: number,
    public readonly topOfStreetY: number,
  ) {
    this.lightTraffic = false;
    this.parkingIncluded = false;
    this.obstacleAvoidance = ObstacleAvoidanceType.NONE;
    this.bicycles = false;
    this.delivery = DeliveryType.NONE;
    this.crosswalk = CrosswalkType.NONE;
    this.bikeLanes = false;
    this.ambulance = false;
  }

  public withLightTraffic(): StreetBuilder {
    this.lightTraffic = true;
    return this;
  }

  public withParkingIncluded(): StreetBuilder {
    this.parkingIncluded = true;
    return this;
  }

  public withObstacleAvoidance(
    obstacleAvoidance: ObstacleAvoidanceType,
  ): StreetBuilder {
    this.obstacleAvoidance = obstacleAvoidance;
    return this;
  }

  public withBicycles(): StreetBuilder {
    this.bicycles = true;
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

  public withAmbulance(): StreetBuilder {
    this.ambulance = true;
    return this;
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
    ({ street, y } = this.northboundBikeLane(street, y));
    ({ street, y } = this.northboundVehicleLane(street, y));
    ({ street, y } = this.centerTurnLane(street, y));
    ({ street, y } = this.southboundVehicleLane(street, y));
    ({ street, y } = this.southboundBikeLane(street, y));
    ({ street, y } = this.southboundParkingLane(street, y));
    return street;
  }

  private southboundParkingLane(
    street: Street,
    y: number,
  ): { street: Street; y: number } {
    if (this.parkingIncluded) {
      const parkingLaneWidth = 50;
      y = y + parkingLaneWidth / 2;
      street = street.addLane(
        LaneDirection.RIGHT,
        parkingLaneWidth,
        new LaneLinesStyles(hiddenLineStyle, hiddenLineStyle),
        this.parkingLaneObstacleProducers(
          y,
          this.delivery == DeliveryType.CURBSIDE,
          this.crosswalk,
        ),
      );
    }
    return { street, y };
  }

  private southboundBikeLane(
    street: Street,
    y: number,
  ): { street: Street; y: number } {
    if (this.bikeLanes) {
      y += this.bikeLaneWidth / 2;
      street = street.addLane(
        LaneDirection.RIGHT,
        this.bikeLaneWidth,
        new LaneLinesStyles(hiddenLineStyle, hiddenLineStyle),
        this.vehicleTrafficObstacleProducers(
          y,
          LaneDirection.RIGHT,
          this.obstacleFrequency,
          this.parkingIncluded,
          this.obstacleAvoidance,
          false,
          false,
          false,
          this.crosswalk,
          [ObstacleType.BICYCLE],
        ),
      );
      y += this.bikeLaneWidth / 2;
    }
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
        y,
        southboundDirection,
        this.obstacleFrequency,
        this.parkingIncluded,
        this.obstacleAvoidance,
        this.bicycles,
        false,
        this.ambulance,
        this.crosswalk,
        this.ambulance && this.delivery == DeliveryType.CENTER_LANE
          ? [ObstacleType.AMBULANCE_CRASHING, ObstacleType.STOPPING_VEHICLE]
          : [ObstacleType.AMBULANCE, ObstacleType.STOPPING_VEHICLE],
      ),
    );
    y = y + this.vehicleLaneWidth / 2;
    return { street, y };
  }

  private centerTurnLane(
    street: Street,
    y: number,
  ): { street: Street; y: number } {
    if (!this.bikeLanes) {
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
    }
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
        y,
        northboundDirection,
        this.obstacleFrequency,
        false,
        this.obstacleAvoidance,
        this.bicycles,
        this.delivery == DeliveryType.CENTER_LANE,
        false,
        this.crosswalk,
      ),
    );
    //jump to the bottom line of the northbound vehicle lane
    y += this.vehicleLaneWidth / 2;
    return { street, y };
  }

  private northboundBikeLane(
    street: Street,
    y: number,
  ): { street: Street; y: number } {
    if (this.bikeLanes) {
      // y is the center of the lane.
      y += this.bikeLaneWidth / 2;
      street = street.addLane(
        LaneDirection.LEFT,
        this.bikeLaneWidth,
        new LaneLinesStyles(hiddenLineStyle, hiddenLineStyle),
        this.vehicleTrafficObstacleProducers(
          y,
          LaneDirection.LEFT,
          this.obstacleFrequency,
          this.parkingIncluded,
          this.obstacleAvoidance,
          false,
          false,
          false,
          this.crosswalk,
          [ObstacleType.BICYCLE],
        ),
      );
      //jump to the bike lane line
      y += this.bikeLaneWidth / 2;
    }
    return { street, y };
  }

  /** Provides the number of seconds between obstacle production */
  private get obstacleFrequency(): number {
    return this.lightTraffic ? 4 : 2;
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

  /** Vehicle lane width changes if bike lanes exist. The lanes get more narrow in modern designs. */
  private get vehicleLaneWidth(): number {
    return this.bikeLanes ? 60 : this.historicVehicleLaneWidth;
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
    y: number,
    direction: LaneDirection,
    maxFrequencyInSeconds: number = 1,
    parkingLineOfSightTriggeredVehicles: boolean = false,
    obstacleAvoidance: ObstacleAvoidanceType,
    bicycles: boolean = false,
    centerLaneDelivery: boolean = false,
    ambulance: boolean = false,
    crosswalk: CrosswalkType = CrosswalkType.NONE,
    traffic: ObstacleType[] = [ObstacleType.PASSING_VEHICLE],
  ): readonly ObstacleProducer[] {
    const producers = [];

    if (
      traffic.includes(ObstacleType.PASSING_VEHICLE) ||
      traffic.includes(ObstacleType.STOPPING_VEHICLE)
    ) {
      const vehicleTemplate = this.vehicleObstacle(
        0,
        y,
        direction,
        ObstacleSpeeds.MEDIUM,
        obstacleAvoidance,
      );
      // always add cars
      producers.push(
        new ObstacleProducer(vehicleTemplate, maxFrequencyInSeconds),
      );
    }
    // add an ambulance first to demonstrate a clear path
    if (ambulance) {
      // detectCollsion if traffic contains ObstacleType.AMBULANCE_CRASHING
      const detectCollision = traffic.includes(ObstacleType.AMBULANCE_CRASHING);
      const ambulance = this.ambulanceObstacle(y, direction, detectCollision);
      const ambulanceFrequency = 10; // multiple productions shows multiple scenarios
      producers.push(new ObstacleProducer(ambulance, ambulanceFrequency));
    }

    // bicycles are optional and move slower than cars
    if (bicycles || traffic.includes(ObstacleType.BICYCLE)) {
      const bicycleTemplate = this.bicycleObstacle(y, direction);
      producers.push(
        new ObstacleProducer(bicycleTemplate, maxFrequencyInSeconds),
      );
    }

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

    // this is the target that will trigger the ghost car when the player reaches the lane
    console.log(`vehicleLaneY: ${vehicleLaneY}`);
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
  private parkingLaneObstacleProducers(
    y: number,
    curbsideLoading: boolean = false,
    crosswalk: CrosswalkType = CrosswalkType.NONE,
  ): readonly ObstacleProducer[] {
    const frequency = 10000; // only produce one obstacle for each parking spot...do not repeat
    const speed = ObstacleSpeeds.STOPPED;
    const xForEach = [
      20,
      PARKED_CAR_2_X,
      PARKED_CAR_3_X,
      PARKED_CAR_4_X,
      PARKED_CAR_5_X,
      840,
      940,
      1040,
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
    if (crosswalk != CrosswalkType.NONE) {
      // remove the second to last parking spot giving delivery some room
      xForEach.splice(7, 1);
      commercialVehicleForEach.splice(7, 1);

      // remove the fourth spot where the crosswalk will be painted
      xForEach.splice(3, 1);
      commercialVehicleForEach.splice(2, 1);

      // remove the third spot to daylight the crosswalk
      if (
        crosswalk == CrosswalkType.DAYLIGHT ||
        crosswalk == CrosswalkType.SIGNAL
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
    obstacleAvoidance: ObstacleAvoidanceType = ObstacleAvoidanceType.BRAKE,
  ): Obstacle {
    return this.obstacle(
      0,
      y,
      direction,
      ObstacleSpeeds.SLOW,
      obstacleAvoidance,
      "images/obstacles/bicycle.png",
      332,
      140,
      0.15,
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
