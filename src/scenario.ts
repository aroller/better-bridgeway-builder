import { Player } from "./player";
import { Obstacle, ObstacleProducer, Street } from "./street";
import { LaneDirection } from "./street";
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
   */
  constructor(
    public readonly title: string,
    public readonly description: string,
    public readonly street: Street,
    public readonly player: Player,
  ) {}
}

export class ScenarioProducer {
  constructor(
    public readonly streetWidth: number,
    public readonly streetLength: number,
    public readonly topOfStreetY: number,
  ) {}

  private vehicleWagonObstacle(direction: LaneDirection): Obstacle {
    // Place obstacles at the beginning or end of the lane based on the lane direction.
    const imageScale = 0.1;
    const objectWidth = 706.12 * imageScale;
    const objectHeight = 314.33 * imageScale;
    const offsetOffCanvas = 3 * objectWidth;
    const speed = 5; //pixels per meter...this will need to be adjusted
    const image = new Image();
    image.src = "images/obstacles/car-wagon.svg";
    return new Obstacle(
      0,
      0,
      objectWidth,
      objectHeight,
      speed,
      direction,
      image,
    );
  }

  private mixedTrafficObstacleProducers(
    direction: LaneDirection,
  ): readonly ObstacleProducer[] {
    const vehicleTemplate = this.vehicleWagonObstacle(direction);
    return [new ObstacleProducer(vehicleTemplate)];
  }

  private bridgeway2023(
    obstacleProducers: readonly ObstacleProducer[],
  ): Street {
    //Pixels determined emperically...this should be a percentage of the streetWidth.
    const vehicleLaneWidth = 60;
    const turnLaneWidth = 50;
    return new Street(this.topOfStreetY, this.streetLength)
      .addLane(
        LaneDirection.LEFT,
        vehicleLaneWidth,
        this.mixedTrafficObstacleProducers(LaneDirection.LEFT),
      )
      .addLane(LaneDirection.LEFT, turnLaneWidth, [])
      .addLane(
        LaneDirection.RIGHT,
        vehicleLaneWidth,
        this.mixedTrafficObstacleProducers(LaneDirection.RIGHT),
      );
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
    const playerY = 450;
    return new Player(playerX, playerY, playerSize, playerSize, playerImage);
  }

  public morningLightTaffic2023(): Scenario {
    const title = "Morning Light Traffic 2023";
    const description =
      "Bridgeway Blvd. early morning has little traffic. Cross the street to walk along the waterfront and enjoy the morning sunrise.";

    const player = this.frogPlayer();
    const street = this.bridgeway2023([]);
    const scenario = new Scenario(title, description, street, player);

    return scenario;
  }
}
