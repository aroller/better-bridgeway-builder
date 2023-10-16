import { Player, PlayerSpeed } from "./player";
import { GameObject } from "./game";
import {
  CrosswalkSign,
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
  GAME_OVER = "game-over",
}

export enum DeliveryType {
  CENTER_LANE = "center-lane",
  CURBSIDE = "curbside",
  NONE = "none",
}

export enum Background {
  EXISTING = "images/scene/better-bridgeway-background.png",
  CURBSIDE = "images/scene/better-bridgeway-background-curbside.png",
  CROSSWALK = "images/scene/better-bridgeway-background-crosswalk.png",
  CROSSWALK_DAYLIGHT = "images/scene/better-bridgeway-background-daylight.png",
  HANDICAP = "images/scene/better-bridgeway-background-handicap.png",
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
    let street;
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
        street = this.bridgeway2023(
          LIGHT_TRAFFIC,
          PARKING_NOT_INCLUDED,
          ObstacleAvoidanceType.NONE,
          BICYCLES_NOT_INCLUDED,
        );
        break;
      case ScenarioKey.HEAVY_TRAFFIC:
        title = "Heavy Traffic is Challenging to Cross";
        description = "Normal speed person crossing with heavy traffic.";
        street = this.bridgeway2023();
        break;
      case ScenarioKey.SLOW_MOVING:
        title = "Slow Moving Frogs Can Barely Cross in Heavy Traffic";
        description = "Slow moving person crossing with heavy traffic.";
        street = this.bridgeway2023();
        player = this.frogPlayer(PlayerSpeed.SLOW);
        break;
      case ScenarioKey.CARS_STOP:
        title = "Cars Stop for Slow Moving Frogs";
        description = "Cars stop for a person crossing with heavy traffic.";
        street = this.bridgeway2023(
          HEAVY_TRAFFIC,
          PARKING_NOT_INCLUDED,
          ObstacleAvoidanceType.BRAKE,
        );
        player = this.frogPlayer(PlayerSpeed.SLOW);
        break;
      case ScenarioKey.PARKED_CARS:
        title = "Parked Cars Block the View of Slow Moving Frogs";
        description =
          "Parked cars block the view of a slow moving person crossing with heavy traffic.";
        street = this.bridgeway2023(
          LIGHT_TRAFFIC,
          PARKING_INCLUDED,
          ObstacleAvoidanceType.BRAKE,
        );
        player = this.frogPlayer(PlayerSpeed.SLOW);
        break;
      case ScenarioKey.BICYCLES_SHARED_LANE:
        title = "Bicycles Move Slower than Cars";
        description =
          "Traffic congestion increases when bicycles are present because they share the lane.";
        street = this.bridgeway2023(
          HEAVY_TRAFFIC,
          PARKING_INCLUDED,
          ObstacleAvoidanceType.BRAKE,
          BICYCLES_INCLUDED,
        );
        player = this.frogPlayer(PlayerSpeed.SLOW);
        break;
      case ScenarioKey.CARS_PASS_BICYCLES:
        title = "Cars Pass Bicycles";
        description = "Cars use the middle lane to pass the slower bicycles.";
        street = this.bridgeway2023(
          HEAVY_TRAFFIC,
          PARKING_INCLUDED,
          ObstacleAvoidanceType.PASS,
          BICYCLES_INCLUDED,
        );
        player = this.frogPlayer(PlayerSpeed.SLOW);
        break;
      case ScenarioKey.CENTER_LANE_DELIVERY:
        title = "Commercial Delivery in the Center Turn Lane";
        description =
          "Trucks block the center lane so cars no longer pass bicycles.";
        street = this.bridgeway2023(
          HEAVY_TRAFFIC,
          PARKING_INCLUDED,
          ObstacleAvoidanceType.BRAKE,
          BICYCLES_INCLUDED,
          DeliveryType.CENTER_LANE,
        );
        player = this.frogPlayer(PlayerSpeed.SLOW);
        break;
      case ScenarioKey.CENTER_LANE_AMBULANCE:
        title =
          "First Responders blocked by Delivery Trucks in Center Turn Lane";
        description =
          "The center turn lane can not both be a delivery lane and emergency lane.";
        street = this.bridgeway2023(
          HEAVY_TRAFFIC,
          PARKING_INCLUDED,
          ObstacleAvoidanceType.BRAKE,
          BICYCLES_NOT_INCLUDED,
          DeliveryType.CENTER_LANE,
          AMBULANCE_INCLUDED,
        );
        player = this.frogPlayer(PlayerSpeed.SLOW);
        break;
      case ScenarioKey.CURBSIDE_DELIVERY:
        title = "Curbside Commercial Delivery Zones Improve Safety";
        description =
          "Leaves center lane for Ambulance, improves safety for pedestrians, and reduces congestion.";
        street = this.bridgeway2023(
          HEAVY_TRAFFIC,
          PARKING_INCLUDED,
          ObstacleAvoidanceType.BRAKE,
          BICYCLES_NOT_INCLUDED,
          DeliveryType.CURBSIDE,
          AMBULANCE_INCLUDED,
        );
        player = this.curbsideDeliveryPlayer();
        background = Background.CURBSIDE;
        break;
      case ScenarioKey.CROSSWALK:
        title = "A Crosswalk is a Safer Place to Cross";
        description =
          "Crosswalks show drivers where to expect pedestrians.";
        street = this.bridgeway2023(
          LIGHT_TRAFFIC,
          PARKING_INCLUDED,
          ObstacleAvoidanceType.BRAKE,
          BICYCLES_NOT_INCLUDED,
          DeliveryType.CURBSIDE,
          AMBULANCE_NOT_INCLUDED,
          CrosswalkType.BASIC,
        );
        player = this.curbsideDeliveryPlayer();
        background = Background.CROSSWALK;
        break;
      case ScenarioKey.CROSSWALK_DAYLIGHT:
        title = "Open Space Before Crosswalks Improves Visibility";
        description =
          "Ghost vehicles no longer a problem since pedestrians and drivers are not blocked by parked cars.";
        street = this.bridgeway2023(
          LIGHT_TRAFFIC,
          PARKING_INCLUDED,
          ObstacleAvoidanceType.BRAKE,
          BICYCLES_NOT_INCLUDED,
          DeliveryType.CURBSIDE,
          AMBULANCE_NOT_INCLUDED,
          CrosswalkType.DAYLIGHT,
        );
        player = this.curbsideDeliveryPlayer();
        background = Background.CROSSWALK_DAYLIGHT;
        break;
      case ScenarioKey.WHEELCHAIR:
        title = "Wheelchairs Cross Safely with Rapid Flashing Beacons";
        description =
          "Flashing sign alerts drivers to stop for pedestrians in the crosswalk. Accessibile parking for wheelchairs.";
        street = this.bridgeway2023(
          LIGHT_TRAFFIC,
          PARKING_INCLUDED,
          ObstacleAvoidanceType.BRAKE,
          BICYCLES_NOT_INCLUDED,
          DeliveryType.CURBSIDE,
          AMBULANCE_NOT_INCLUDED,
          CrosswalkType.DAYLIGHT,
        );

        street = this.withCrosswalkSigns(street);
        player = this.wheelchairPlayer();
        background = Background.HANDICAP;
        break;
      case ScenarioKey.GAME_OVER:
      default:
        title = "Game Over";
        street = this.bridgeway2023();
    }
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
      0.22,
    );
  }

  private ambulanceObstacle(y: number, direction: LaneDirection): Obstacle {
    return this.obstacle(
      0,
      y,
      direction,
      ObstacleSpeeds.MEDIUM,
      ObstacleAvoidanceType.PASS,
      "images/obstacles/truck-ambulance.png",
      426,
      249,
      0.22,
      true, // detect collision
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
  ): readonly ObstacleProducer[] {
    const vehicleTemplate = this.vehicleObstacle(
      0,
      y,
      direction,
      ObstacleSpeeds.MEDIUM,
      obstacleAvoidance,
    );
    const producers = [];
    // always add cars
    producers.push(
      new ObstacleProducer(vehicleTemplate, maxFrequencyInSeconds),
    );

    // add an ambulance first to demonstrate a clear path
    if (ambulance) {
      const ambulance = this.ambulanceObstacle(y, direction);
      const ambulanceFrequency = 10; // multiple productions shows multiple scenarios
      producers.push(new ObstacleProducer(ambulance, ambulanceFrequency));
    }

    // bicycles are optional and move slower than cars
    if (bicycles) {
      const bicycleTemplate = this.bicycleObstacle(y, direction);
      producers.push(
        new ObstacleProducer(bicycleTemplate, maxFrequencyInSeconds),
      );
    }

    // ghost vehicles appear when the player reaches the lane hidden by parked cars
    if (parkingLineOfSightTriggeredVehicles && crosswalk != CrosswalkType.DAYLIGHT) {
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
  private bridgeway2023(
    lightTraffic: boolean = false,
    parkingIncluded: boolean = false,
    obstacleAvoidance: ObstacleAvoidanceType = ObstacleAvoidanceType.NONE,
    bicycles: boolean = false,
    delivery: DeliveryType = DeliveryType.NONE,
    ambulance: boolean = false,
    crosswalk: CrosswalkType = CrosswalkType.NONE,
  ): Street {
    const frequency = lightTraffic ? 4 : 2;
    //Pixels determined emperically...this should be a percentage of the streetWidth.
    const vehicleLaneWidth = 65;
    const turnLaneWidth = 50;
    let y = this.topOfStreetY + vehicleLaneWidth / 2;
    let street = new Street(this.topOfStreetY, this.streetLength);

    // northbound vehicle lane
    street = street.addLane(
      LaneDirection.LEFT,
      vehicleLaneWidth,
      new LaneLinesStyles(hiddenLineStyle, hiddenLineStyle),
      this.vehicleTrafficObstacleProducers(
        y,
        LaneDirection.LEFT,
        frequency,
        false,
        obstacleAvoidance,
        bicycles,
        delivery == DeliveryType.CENTER_LANE, // ghost vehicles appear because of delivery trucks
        //no ambulance - only travels southbound from Fire Station to Old Town
      ),
    );

    // center turn lane
    y = y + turnLaneWidth;
    const turnLaneProducers: ObstacleProducer[] = [];
    if (delivery == DeliveryType.CENTER_LANE) {
      turnLaneProducers.push(...this.centerlaneDeliveryObstacleProducers(y));
    }
    street = street.addLane(
      LaneDirection.LEFT,
      turnLaneWidth,
      new LaneLinesStyles(hiddenLineStyle, hiddenLineStyle),
      turnLaneProducers,
    );

    // southbound vehicle lane
    y = y + vehicleLaneWidth;
    street = street.addLane(
      LaneDirection.RIGHT,
      vehicleLaneWidth,
      new LaneLinesStyles(hiddenLineStyle, hiddenLineStyle),
      this.vehicleTrafficObstacleProducers(
        y,
        LaneDirection.RIGHT,
        frequency,
        parkingIncluded,
        obstacleAvoidance,
        bicycles,
        false, // ghost vehicles do not appear because of delivery trucks in southbound lane
        ambulance,
        crosswalk, // affects if ghost vehicles appear
      ),
    );

    // southbound parking lane
    if (parkingIncluded) {
      const parkingLaneWidth = 60;
      y = y + parkingLaneWidth;
      street = street.addLane(
        LaneDirection.RIGHT,
        parkingLaneWidth,
        new LaneLinesStyles(hiddenLineStyle, hiddenLineStyle),
        this.parkingLaneObstacleProducers(y, delivery == DeliveryType.CURBSIDE, crosswalk),
      );
    }
    return street;
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
    const xForEach = [20, PARKED_CAR_2_X, PARKED_CAR_3_X, PARKED_CAR_4_X, PARKED_CAR_5_X, 840, 940, 1040, 1150];
    // array matches the x array, but indicates if the vehicle is a commercial vehicle
    const commercialVehicleForEach = [
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      true,
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
      if (crosswalk == CrosswalkType.DAYLIGHT) {
        xForEach.splice(2, 1);
        commercialVehicleForEach.splice(2, 1);
      }
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
      y + 10, // it is not clear why the +10, but it is needed to make the truck appear in the correct location
      LaneDirection.RIGHT,
    );
    producers.push(new ObstacleProducer(deliveryTruckSB, 10000, false, false));

    if (ambulance) {
      const ambulance = this.ambulanceObstacle(y, LaneDirection.RIGHT);
      producers.push(new ObstacleProducer(ambulance, 10000, false, false));
    }
    return producers;
  }
  /** Frog that walks rather than hops. Starts on the sidewalk of the fixed bridgeway scene.
   *
   * @returns
   */
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
  private wheelchairPlayer(
    speed: PlayerSpeed = PlayerSpeed.SLOW,
  ): Player {
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

  /** Adds crosswalk signs that are not flashing. 
   * 
   * @param street the street to add the flashing beacons to
   * @returns Street with crosswalk signs
   */
  private withCrosswalkSigns(street:Street): Street {

    const crosswalk = new GameObject(285, 220, 150, 200);
    const southboundSign = new CrosswalkSign(285, 410,LaneDirection.RIGHT,crosswalk);
    const northboundSign = new CrosswalkSign(435, 220,LaneDirection.LEFT,crosswalk);
    return street.addSceneObject(southboundSign).addSceneObject(northboundSign);
  }
}
