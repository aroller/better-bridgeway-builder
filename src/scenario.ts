import { Player, PlayerSpeed } from "./player";
import { GameObject } from "./game";
import {
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
const solidWhiteLineStyle = new LaneLineStyle();
const solidYellowLineStyle = new LaneLineStyle("yellow");
const dashedYellowLineStyle = new LaneLineStyle(
  solidYellowLineStyle.color,
  true,
);
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
   * @param title The title of the scenario.
   * @param description The description of the scenario.
   * @param street The street where the scenario takes place.
   * @param player The player involved in the scenario.
   * @param finishLineY The y coordinate of the finish line.
   */
  constructor(
    public readonly title: string,
    public readonly description: string,
    public readonly street: Street,
    public readonly player: Player,
    public readonly finishLineY: number,
  ) {}
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
    );
  }

  private vehicleObstacle(
    x: number,
    y: number,
    direction: LaneDirection,
    speed: number = ObstacleSpeeds.MEDIUM,
    obstacleAvoidance: ObstacleAvoidanceType,
  ): Obstacle {
    return this.obstacle(
      x,
      y,
      direction,
      speed,
      obstacleAvoidance,
      "images/obstacles/car-wagon.png",
      720,
      332,
      0.1,
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
      .15,
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
  ): readonly ObstacleProducer[] {
    const vehicleTemplate = this.vehicleObstacle(
      0,
      y,
      direction,
      ObstacleSpeeds.MEDIUM,
      obstacleAvoidance,
    );
    const producers = [
      new ObstacleProducer(vehicleTemplate, maxFrequencyInSeconds),
    ];
    if (bicycles) {
      const bicycleTemplate = this.bicycleObstacle(y,direction);
      producers.push(
        new ObstacleProducer(bicycleTemplate, maxFrequencyInSeconds),
      );
    }
    if (parkingLineOfSightTriggeredVehicles) {
      producers.push(...this.parkingLineOfSightTriggeredProducers(y));
    }
    return producers;
  }

  /**
   * Obstacle producers that trigger cars to appear when the player exits the parking
   * lane close to the parked cars.  This is to simulate the player's view being blocked.
   *
   * @param vehicleLaneY The y-coordinate of the vehicle lane.
   * @returns An array of obstacle producers.
   */
  private parkingLineOfSightTriggeredProducers(
    vehicleLaneY: number,
  ): readonly ObstacleProducer[] {
    const producers: ObstacleProducer[] = [];
    // these x values are hard coded to the scene to match parked cars
    const closeToParkedCarX = PLAYER_START_X;
    const yTriggerPoint = 380;
    const targetWidth = 150;
    const targetHeight = 25;
    const targets = [
      new GameObject(
        closeToParkedCarX,
        yTriggerPoint,
        targetWidth,
        targetHeight,
      ),
    ];
    const maxFrequencyForTargetTrigger = 5;
    const speed = ObstacleSpeeds.MEDIUM;
    // this vehicle appears when the player reaches the lane
    const hiddenVehicleStartingX = PLAYER_START_X - 100;
    const hiddenVehicleTemplate = this.vehicleObstacle(
      hiddenVehicleStartingX,
      vehicleLaneY,
      LaneDirection.RIGHT,
      speed,
      ObstacleAvoidanceType.BRAKE, // this vehicle will stop for the player even though it appears abruptly
    );
    for (const target of targets) {
      producers.push(
        new TargetObstacleProducer(
          hiddenVehicleTemplate,
          maxFrequencyForTargetTrigger,
          false,
          target,
        ),
      );
    }
    return producers;
  }
  private bridgeway2023(
    lightTraffic: boolean = false,
    parkingIncluded: boolean = false,
    obstacleAvoidance: ObstacleAvoidanceType = ObstacleAvoidanceType.NONE,
    bicycles: boolean = false,
  ): Street {
    const frequency = lightTraffic ? 5 : 1;
    //Pixels determined emperically...this should be a percentage of the streetWidth.
    const vehicleLaneWidth = 65;
    const turnLaneWidth = 50;
    let y = this.topOfStreetY + vehicleLaneWidth / 2;
    let street = new Street(this.topOfStreetY, this.streetLength);
    street = street.addLane(
      LaneDirection.LEFT,
      vehicleLaneWidth,
      new LaneLinesStyles(hiddenLineStyle, solidYellowLineStyle),
      this.vehicleTrafficObstacleProducers(
        y,
        LaneDirection.LEFT,
        frequency,
        false,
        obstacleAvoidance,
        bicycles,
      ),
    );
    y = y + turnLaneWidth;
    street = street.addLane(
      LaneDirection.LEFT,
      turnLaneWidth,
      new LaneLinesStyles(dashedYellowLineStyle, dashedYellowLineStyle),
      [],
    );
    y = y + vehicleLaneWidth;
    street = street.addLane(
      LaneDirection.RIGHT,
      vehicleLaneWidth,
      new LaneLinesStyles(solidYellowLineStyle, hiddenLineStyle),
      this.vehicleTrafficObstacleProducers(
        y,
        LaneDirection.RIGHT,
        frequency,
        parkingIncluded,
        obstacleAvoidance,
        bicycles,
      ),
    );
    if (parkingIncluded) {
      const parkingLaneWidth = 60;
      y = y + parkingLaneWidth;
      street = street.addLane(
        LaneDirection.RIGHT,
        parkingLaneWidth,
        new LaneLinesStyles(hiddenLineStyle, hiddenLineStyle),
        this.parkingLaneObstacleProducers(y),
      );
    }
    return street;
  }

  /**
   * Populates the parking lane with parked cars.
   * @param y The y-coordinate of the obstacle producers.
   * @returns An array of obstacle producers.
   */
  private parkingLaneObstacleProducers(y: number): readonly ObstacleProducer[] {
    const frequency = 1;
    const speed = 0;
    const xForEach = [20, 120, 240, 360, 560, 840, 940, 1040, 1150];
    const producers: ObstacleProducer[] = [];
    for (const x of xForEach) {
      const obstacle = this.vehicleObstacle(
        x,
        y,
        LaneDirection.RIGHT,
        speed,
        ObstacleAvoidanceType.NONE,
      );
      const DO_NOT_ASSIGN_X = false;
      const DO_NOT_RANDOMIZE = false;
      producers.push(new ObstacleProducer(obstacle, frequency, DO_NOT_ASSIGN_X, DO_NOT_RANDOMIZE));
    }
    return producers;
  }

  /** Frog that walks rather than hops. Starts on the sidewalk of the fixed bridgeway scene.
   *
   * @returns
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

  public getScenarioForLevel(level: number): Scenario {
    let player = this.frogPlayer();
    let title;
    let description = "";
    let street;
    const LIGHT_TRAFFIC = true;
    const HEAVY_TRAFFIC = false;
    const PARKING_INCLUDED = true;
    const PARKING_NOT_INCLUDED = false;
    const BICYCLES_INCLUDED = true;
    const BICYCLES_NOT_INCLUDED = false;
    switch (level) {
      case 1:
        title = "Light Traffic is Easy to Cross";
        description = "Normal speed person crossing with light traffic.";
        street = this.bridgeway2023(
          LIGHT_TRAFFIC,
          PARKING_NOT_INCLUDED,
          ObstacleAvoidanceType.NONE,
          BICYCLES_NOT_INCLUDED,
        );
        // player.moveUp();
        break;
      case 2:
        title = "Heavy Traffic is Challenging to Cross";
        description = "Normal speed person crossing with heavy traffic.";
        street = this.bridgeway2023();
        break;
      case 3:
        title = "Slow Moving Frogs Can Barely Cross in Heavy Traffic";
        description = "Slow moving person crossing with heavy traffic.";
        street = this.bridgeway2023();
        player = this.frogPlayer(PlayerSpeed.SLOW);
        break;
      case 4:
        title = "Cars Stop for Slow Moving Frogs";
        description = "Cars stop for a person crossing with heavy traffic.";
        street = this.bridgeway2023(
          HEAVY_TRAFFIC,
          PARKING_NOT_INCLUDED,
          ObstacleAvoidanceType.BRAKE,
        );
        player = this.frogPlayer(PlayerSpeed.SLOW);
        break;
      case 5:
        title = "Parked Cars Block the View of Slow Moving Frogs";
        description =
          "Parked cars block the view of a slow moving person crossing with heavy traffic.";
        street = this.bridgeway2023(
          LIGHT_TRAFFIC,
          PARKING_INCLUDED,
          ObstacleAvoidanceType.BRAKE,
        );
        break;
      case 6:
        title = "Bicycles Move Slower than Cars";
        description =
          "Traffic congestion increases when bicycles are present because they share the lane.";
        street = this.bridgeway2023(
          HEAVY_TRAFFIC,
          PARKING_INCLUDED,
          ObstacleAvoidanceType.BRAKE,
          BICYCLES_INCLUDED
        );
        player = this.frogPlayer(PlayerSpeed.SLOW);
        break;
      default:
        title = "Game Over";
        street = this.bridgeway2023();
    }
    return new Scenario(title, description, street, player, this.topOfStreetY);
  }
}
