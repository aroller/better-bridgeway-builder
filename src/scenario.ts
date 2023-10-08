import { Player } from "./player";
import {
  LaneLineStyle,
  LaneLinesStyles,
  Obstacle,
  ObstacleProducer,
  Street,
} from "./street";
import { LaneDirection } from "./street";

const solidWhiteLineStyle = new LaneLineStyle();
const solidYellowLineStyle = new LaneLineStyle("yellow");
const dashedYellowLineStyle = new LaneLineStyle("yellow", true);
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
    speed: number = 5,
  ): Obstacle {
    // Place obstacles at the beginning or end of the lane based on the lane direction.
    const imageScale = 0.1;
    const objectWidth = 706.12 * imageScale;
    const objectHeight = 314.33 * imageScale;
    const image = new Image();
    image.src = "images/obstacles/car-wagon.svg";
    return new Obstacle(
      0, //x is updated to the position in the lane and movemement
      y,
      objectWidth,
      objectHeight,
      speed,
      direction,
      image,
    );
  }

  private vehicleTrafficObstacleProducers(
    y: number,
    direction: LaneDirection,
    maxFrequencyInSeconds: number = 1,
  ): readonly ObstacleProducer[] {
    const vehicleTemplate = this.vehicleWagonObstacle(y, direction);
    return [new ObstacleProducer(vehicleTemplate, maxFrequencyInSeconds)];
  }

  private bridgeway2023(lightTraffic: boolean = false): Street {
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
      this.vehicleTrafficObstacleProducers(y, LaneDirection.RIGHT, frequency),
    );
    return street;
  }

  /** Frog that walks rather than hops. Starts on the sidewalk of the fixed bridgeway scene.
   *
   * @returns
   */
  private frogPlayer(): Player {
    const playerSize = 30;
    const playerImage = new Image();
    playerImage.src = "images/players/frog.svg";
    // place the player on the sidewalk.  the scene must be fixed in size
    const playerX = 395;
    const playerY = 470;
    return new Player(playerX, playerY, playerSize, playerSize, playerImage);
  }

  public morningLightTaffic2023(): Scenario {
    return this.carTraffic20203(true);
  }

  public heavyTraffic2023(): Scenario {
    return this.carTraffic20203(false);
  }

  public carTraffic20203(lightTraffic: boolean): Scenario {
    const title = lightTraffic
      ? "Morning Light Traffic 2023"
      : "Heavy Traffic 2023";
    const description = "";

    const player = this.frogPlayer();
    const street = this.bridgeway2023(lightTraffic);
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

  public getScenarioForLevel(level: number): Scenario {
    switch (level) {
      case 1:
        return this.morningLightTaffic2023();
      case 2:
        return this.heavyTraffic2023();
      default:
        return this.morningLightTaffic2023();
    }
  }
}
