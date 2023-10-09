import { Player } from "./player";
import { GameObject } from "./game";
import {
  LaneLineStyle,
  LaneLinesStyles,
  Obstacle,
  ObstacleProducer,
  ObstacleSpeeds,
  TargetObstacleProducer,
  Street,
} from "./street";
import { LaneDirection } from "./street";

/** Fixed point corresponding to the part of the starting sidewalk where the red curb exists. 
 * Fathest left point putting the frog close to the parked cars. 
 */
const PLAYER_START_X = 395;
const solidWhiteLineStyle = new LaneLineStyle();
const solidYellowLineStyle = new LaneLineStyle("yellow");
const dashedYellowLineStyle = new LaneLineStyle(solidYellowLineStyle.color, true);
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

  private vehicleWagonObstacle(
    y: number,
    direction: LaneDirection,
    speed: number = ObstacleSpeeds.MEDIUM,
    x: number = 0,
  ): Obstacle {
    // Place obstacles at the beginning or end of the lane based on the lane direction.
    const imageScale = 0.1;
    const objectWidth = 706.12 * imageScale;
    const objectHeight = 314.33 * imageScale;
    const image = new Image();
    image.src = "images/obstacles/car-wagon.svg";
    return new Obstacle(
      x,
      y,
      objectWidth,
      objectHeight,
      speed,
      direction,
      image,
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
  ): readonly ObstacleProducer[] {
    const vehicleTemplate = this.vehicleWagonObstacle(y, direction);
    const producers = [new ObstacleProducer(vehicleTemplate, maxFrequencyInSeconds)];
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
  private parkingLineOfSightTriggeredProducers(vehicleLaneY:number): readonly ObstacleProducer[]{
    const producers: ObstacleProducer[] = [];
         // these x values are hard coded to the scene to match parked cars
         const closeToParkedCarX = PLAYER_START_X;
         const yTriggerPoint = 380;
         const targetWidth = 80;
         const targetHeight = 25;
         const targets = [new GameObject(closeToParkedCarX, yTriggerPoint, targetWidth, targetHeight)];
         const maxFrequencyForTargetTrigger = 5;
         const speed = ObstacleSpeeds.MEDIUM;
         // this vehicle appears when the player reaches the lane
         const hiddenVehicleStartingX = 250;
         const hiddenVehicleTemplate = this.vehicleWagonObstacle(vehicleLaneY, LaneDirection.RIGHT, speed, hiddenVehicleStartingX);
         for (const target of targets) {
           producers.push(new TargetObstacleProducer(hiddenVehicleTemplate,maxFrequencyForTargetTrigger,false,target));
         }
         return producers;
  }
  private bridgeway2023(
    lightTraffic: boolean = false,
    parkingIncluded: boolean = false,
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
      this.vehicleTrafficObstacleProducers(y, LaneDirection.LEFT, frequency),
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
      this.vehicleTrafficObstacleProducers(y, LaneDirection.RIGHT, frequency, parkingIncluded),
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
  private parkingLaneObstacleProducers(y:number): readonly ObstacleProducer[] {
    const frequency = 10;
    const speed = 0;
    const xForEach = [-40,80,200,320,520, 800, 900, 1000, 1100];
    const producers: ObstacleProducer[] = [];
    for (const x of xForEach) {
      const obstacle = this.vehicleWagonObstacle(
        y,
        LaneDirection.RIGHT,
        speed,
        x,
      );
      producers.push(new ObstacleProducer(obstacle, frequency, false));
    }
    return producers;
  }


  /** Frog that walks rather than hops. Starts on the sidewalk of the fixed bridgeway scene.
   *
   * @returns
   */
  private frogPlayer(): Player {
    const playerSize = 30;
    const playerImage = new Image();
    playerImage.src = "images/players/frog.svg";
    const pixelsPerMove = 10;
    // place the player on the sidewalk.  the scene must be fixed in size
    const playerX = PLAYER_START_X;
    const playerY = 470;
    return new Player(playerX, playerY, playerSize, playerSize, playerImage,pixelsPerMove);
  }

  public carTraffic20203(lightTraffic: boolean, parking:boolean=false): Scenario {
    const title = lightTraffic
      ? "Morning Light Traffic 2023"
      : "Heavy Traffic 2023";
    const description = "";

    const player = this.frogPlayer();
    const street = this.bridgeway2023(lightTraffic,parking);
    const finishLineY = this.topOfStreetY;
    const scenario = new Scenario(
      title,
      description,
      street,
      player,
      finishLineY,
    );

    return scenario;
  }

  /** Light traffic simplest scenario. No traffic in center lane. */
  public morningLightTaffic2023(): Scenario {
    return this.carTraffic20203(true);
  }

  /** Heavy traffic difficult to cross.  No traffic in center lane.  */
  public heavyTraffic2023(): Scenario {
    return this.carTraffic20203(false);
  }

  public lightTrafficParking2023(): Scenario {
    return this.carTraffic20203(true,true);
  }

  public getScenarioForLevel(level: number): Scenario {
    switch (level) {
      case 1:
        return this.lightTrafficParking2023();
        // return this.morningLightTaffic2023();
      case 2:
        return this.heavyTraffic2023();
      case 3:
        return this.lightTrafficParking2023();
      default:
        return this.morningLightTaffic2023();
    }
  }
}
