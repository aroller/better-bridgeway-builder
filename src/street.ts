import { string } from "mathjs";
import { GameObject } from "./game";
import { Player, PlayerSpeed } from "./player";

export const enum LaneDirection {
  LEFT = -1,
  RIGHT = 1,
}

export const enum ObstacleSpeeds {
  STOPPED = 0,
  SLOW = 4,
  MEDIUM = 10,
  FAST = 14,
}

/**
 * Indicate how to avoid obstacles
 */
export enum ObstacleAvoidanceType {
  NONE,
  BRAKE,
  PASS,
}

/** Draws lines for lanes. Could be hidden or dashed.  */
export class LaneLineStyle {
  constructor(
    public readonly color: string = "white",
    public readonly dashed: boolean = false,
    public readonly hidden: boolean = false,
    public readonly lineWidth: number = 2,
    public readonly dashLength: number = 40,
    public readonly dashOffLength: number = 80,
  ) {}
}

/** styles for both lines of a lane.  Top and bottom as oriented in the scene.  */
export class LaneLinesStyles {
  constructor(
    public readonly top: LaneLineStyle = new LaneLineStyle(),
    public readonly bottom: LaneLineStyle = new LaneLineStyle(),
  ) {}
}

export class Obstacle extends GameObject {
  constructor(
    x: number,
    y: number,
    width: number,
    height: number,
    public readonly speed: number,
    public readonly direction: LaneDirection,
    image?: HTMLImageElement,
    public readonly avoidance: ObstacleAvoidanceType = ObstacleAvoidanceType.BRAKE,
  ) {
    if (!image) {
      throw new Error("Image is required, but missing");
    }
    super(x, y, width, height, image, direction === LaneDirection.LEFT);
    this.speed = speed;
    this.direction = direction;
  }

  public moveObstacle(player: Player, obstacles:readonly Obstacle[]): Obstacle {
    const adjustedSpeed = this.calculateSpeed(player,obstacles);
    const newX = this.x + adjustedSpeed * this.direction;

    return new Obstacle(
      newX,
      this.y,
      this.width,
      this.height,
      adjustedSpeed,
      this.direction,
      this.image,
    );
  }

  private calculateSpeed(player: Player, obstacles: readonly Obstacle[]): number {
    if (this.avoidance === ObstacleAvoidanceType.BRAKE) {
      let newSpeed = this.speed;

      // Check if the player is in front of the obstacle
      const gameObjects: GameObject[] = [...obstacles, player];
      const isAnyObjectInFront = gameObjects.some((gameObject) => {
        const isObjectInLane =
          gameObject.y >= this.y - this.height && gameObject.y <= this.y + this.height;
        const isObjectInFront =
          isObjectInLane &&
          ((this.direction === LaneDirection.RIGHT && this.x < gameObject.x) ||
            (this.direction === LaneDirection.LEFT && this.x > gameObject.x));
        return isObjectInFront;
      });

      if (isAnyObjectInFront) {
        const distanceToClosestObject = Math.min(
          ...gameObjects
            .filter((gameObject) => {
              const isObjectInLane =
                gameObject.y >= this.y - this.height && gameObject.y <= this.y + this.height;
              const isObjectInFront =
                isObjectInLane &&
                ((this.direction === LaneDirection.RIGHT && this.x < gameObject.x) ||
                  (this.direction === LaneDirection.LEFT && this.x > gameObject.x));
              return isObjectInFront;
            })
            .map((gameObject) => Math.abs(this.x - gameObject.x))
        );
        const speedInPixelsPerSecond = this.speed * 10; //multiply since speed is per refresh...50ms
        const timeToCollision = distanceToClosestObject / speedInPixelsPerSecond;

        // If time to collision is less than a certain threshold, slow down
        if (timeToCollision < 3) {
          // 3 seconds following distance as a rule
          newSpeed *= 0.9; // Reduce speed by 10%
        }
        //just stop when going slow enough to avoid crushing the player
        if (newSpeed < 3) {
          newSpeed = 0;
        }
      } else {
        if (newSpeed <= 0) {
          newSpeed = 1; // start moving again
        }
        // no longer blocked.  speed up if necessary
        // We didn't save what speed we were going before so just proceed at min
        if (newSpeed < ObstacleSpeeds.SLOW) {
          newSpeed *= 1.1; // Increase speed by 10%
        }
      }

      return Math.max(newSpeed, 0); // Ensure the speed is never negative
    }
    return this.speed;
  }
}

/**
 * Produces obstacles in a lane based on the given template.
 */
export class ObstacleProducer {
  private lastObstacleTime: number = 0;

  /**
   * Creates an instance of ObstacleProducer.
   * @param template The obstacle template to produce others.
   * @param maxFrequencyInSeconds The maximum frequency in seconds at which obstacles can be produced. It helps throttle the level of traffic.
   * @param assignX If true, the x value will be assigned in the next method.  False keeps the x value of the template.
   */
  constructor(
    public readonly template: Obstacle,
    public readonly maxFrequencyInSeconds: number = 1,
    public readonly assignX: boolean = true,
  ) {}

  /**
   * @param player The player's position may be used to determine if the producer is ready to produce another obstacle.
   * @returns True if the producer is ready to produce another obstacle, false otherwise.
   */
  public readyForNext(player: Player): boolean {
    const currentTime = Date.now();
    const timeSinceLastObstacle = (currentTime - this.lastObstacleTime) / 1000;
    return timeSinceLastObstacle > this.maxFrequencyInSeconds;
  }

  public next(x: number): Obstacle {
    //override x unless told not to
    if (!this.assignX) {
      x = this.template.x;
    }
    const obstacle = new Obstacle(
      x,
      this.template.y,
      this.template.width,
      this.template.height,
      this.template.speed,
      this.template.direction,
      this.template.image,
    );
    this.lastObstacleTime = Date.now();
    return obstacle;
  }
}

/**
 * A class that produces obstacles at a certain frequency,
 * but only when the player intersects with a target object.
 * @extends ObstacleProducer
 */
export class TargetObstacleProducer extends ObstacleProducer {
  /**
   * Creates a new instance of TargetObstacleProducer.
   * @param template - The obstacle template to use.
   * @param maxFrequencyInSeconds - The maximum frequency at which to produce obstacles.
   * @param assignX - Whether to assign the obstacle's X position randomly.
   * @param target - The target object that the player must intersect with in order for obstacles to be produced.
   */
  constructor(
    template: Obstacle,
    maxFrequencyInSeconds: number,
    assignX: boolean,
    public readonly target: GameObject,
  ) {
    super(template, maxFrequencyInSeconds, assignX);
  }

  /**
   * Determines whether the producer is ready to produce the next obstacle.
   * @param player - The player object to check for intersection with the target object.
   * @returns True if the producer is ready and the player intersects with the target object, false otherwise.
   */
  public readyForNext(player: Player): boolean {
    const ready = super.readyForNext(player);
    if (ready) {
      const intersects = player.intersects(this.target);
      return intersects;
    }
    return false;
  }
}

/**
 * Represents a lane in a street with lane lines and obstacles.
 */
export class Lane {
  /**
   * Creates a new instance of Lane.
   * @param direction - The direction of the lane.
   * @param laneWidth - The width of the lane.
   * @param streetLength - The length of the street.
   * @param centerY - The y-coordinate of the center of the lane.
   * @param lineStyle - The style of the lane lines.
   * @param obstacleProducers - The obstacle producers for the lane.
   * @param obstacles - The obstacles in the lane.
   */
  constructor(
    public readonly direction: LaneDirection,
    public readonly laneWidth: number,
    public readonly streetLength: number,
    public readonly centerY: number,
    public readonly lineStyle: LaneLinesStyles = new LaneLinesStyles(),
    public readonly obstacleProducers: readonly ObstacleProducer[] = [],
    public readonly obstacles: readonly Obstacle[] = [],
  ) {}

  /**
   * Adds an obstacle to the lane.
   * @param obstacle - The obstacle to add.
   * @returns A new instance of Lane with the added obstacle.
   */
  public addObstacle(obstacle: Obstacle): Lane {
    const newObstacles = [...this.obstacles, obstacle];
    return new Lane(
      this.direction,
      this.laneWidth,
      this.streetLength,
      this.centerY,
      this.lineStyle,
      this.obstacleProducers,
      newObstacles,
    );
  }

  /**
   * Updates the obstacles in the lane.
   * @returns A new instance of Lane with the updated obstacles.
   */
  public updateObstacles(player: Player, obstacles:readonly Obstacle[]): Lane {
    const newObstacles = this.obstacles
      .map((obstacle) => obstacle.moveObstacle(player,obstacles))
      .filter((obstacle) => {
        if (this.direction === LaneDirection.LEFT) {
          return obstacle.x + obstacle.width > 0;
        } else {
          return obstacle.x < this.streetLength;
        }
      });

    return new Lane(
      this.direction,
      this.laneWidth,
      this.streetLength,
      this.centerY,
      this.lineStyle,
      this.obstacleProducers,
      newObstacles,
    );
  }

  /**
   * Draws the lane on the canvas with lane lines and obstacles.
   * @param ctx - The canvas rendering context to draw on.
   */
  public draw(ctx: CanvasRenderingContext2D): void {
    // Calculate the top position of the lane
    const positionY = this.centerY - this.laneWidth / 2;

    this.drawLaneLine(ctx, positionY, this.lineStyle.top, 5);
    this.drawLaneLine(ctx, positionY + this.laneWidth, this.lineStyle.bottom);

    // Draw obstacles
    for (const obstacle of this.obstacles) {
      obstacle.draw(ctx);
    }
  }

  /**
   * Draws a lane line on the canvas context.
   * @param ctx - The canvas rendering context to draw on.
   * @param positionY - The y-coordinate of the lane line.
   * @param lineStyle - The style of the lane line.
   * @param offset - The optional offset to avoid line overlapping.
   */
  private drawLaneLine(
    ctx: CanvasRenderingContext2D,
    positionY: number,
    lineStyle: LaneLineStyle,
    offset: number = 0,
  ) {
    if (!lineStyle.hidden) {
      ctx.strokeStyle = lineStyle.color;
      ctx.lineWidth = lineStyle.lineWidth;

      if (lineStyle.dashed) {
        ctx.setLineDash([lineStyle.dashLength, lineStyle.dashOffLength]);
      } else {
        ctx.setLineDash([]);
      }

      ctx.beginPath();
      const y = positionY + offset;
      ctx.moveTo(0, y);
      ctx.lineTo(this.streetLength, y);
      ctx.stroke();
    }
  }

  /**
   * Detects collision between the player and the obstacles in the lane.
   * @param playerX - The x coordinate of the player.
   * @param playerY - The y coordinate of the player.
   * @returns True if there is a collision, false otherwise.
   */
  public detectCollision(player: Player): boolean {
    // Calculate the top position of the lane
    const positionY = this.centerY - this.laneWidth / 2;

    for (const obstacle of this.obstacles) {
      if (player.intersects(obstacle)) {
        return true;
      }
    }
    return false;
  }
}

/**
 * A street consists of lanes that travel horizontally across the canvas.
 * The lanes may have obstacles that travel in the same direction as the lane.
 * The obstacles may conflict with the player.
 * @class
 */
export class Street {
  private lanes: Lane[];

  constructor(
    public readonly topOfStreetY: number = 0,
    public readonly streetLength: number = 600,
    lanes: Lane[] = [],
  ) {
    this.lanes = lanes;
  }

  public addLane(
    direction: LaneDirection,
    laneWidth: number,
    style: LaneLinesStyles,
    obstacleProducers: readonly ObstacleProducer[] = [],
  ): Street {
    const newLanes = [
      ...this.lanes,
      new Lane(
        direction,
        laneWidth,
        this.streetLength,
        this.getCenterY(laneWidth),
        style,
        obstacleProducers,
      ),
    ];
    return new Street(this.topOfStreetY, this.streetLength, newLanes);
  }

  private getCenterY(laneWidth: number): number {
    const streetWidth = this.getStreetWidth();
    return this.topOfStreetY + streetWidth + laneWidth / 2;
  }

  /** Called periodically, this iterates each lane's ObstacleProducer which
   * will generate an obstacle at the appropriate moment in the scenario
   * and be added to the list of obstacles for the lane.
   * @param player The player's position may be used to determine if the producer is ready to produce another obstacle.
   */
  public generateObstacles(player: Player): Street {
    const maxPerLane = 5;
    const randomLaneIndex = Math.floor(Math.random() * this.lanes.length);
    const newLanes = this.lanes.map((lane, index) => {
      if (index === randomLaneIndex) {
        if (lane.obstacles.length < maxPerLane) {
          const offsetOffCanvas = 50;
          const x =
            lane.direction === LaneDirection.LEFT
              ? lane.streetLength + offsetOffCanvas
              : 0 - offsetOffCanvas;
          for (const obstacleProducer of lane.obstacleProducers) {
            if (obstacleProducer.readyForNext(player)) {
              lane = lane.addObstacle(obstacleProducer.next(x));
            }
          }
        }
      }
      return lane;
    });
    return new Street(this.topOfStreetY, this.streetLength, newLanes);
  }

  public updateObstacles(player: Player, obstacles:readonly Obstacle[]): Street {
    const newLanes = this.lanes.map((lane) => lane.updateObstacles(player,obstacles));
    return new Street(this.topOfStreetY, this.streetLength, newLanes);
  }

  /**
   * Detects collision between the player and the obstacles in all lanes.
   * @param {number} playerX - The x coordinate of the player.
   * @param {number} playerY - The y coordinate of the player.
   * @returns {boolean} - True if there is a collision, false otherwise.
   */
  public detectCollision(player: Player): boolean {
    for (const lane of this.lanes) {
      if (lane.detectCollision(player)) {
        return true;
      }
    }
    return false;
  }

  /**
   * Draws the street on the canvas with all lanes and obstacles.
   * @param {CanvasRenderingContext2D} ctx - The canvas rendering context to draw on.
   * @returns {void}
   */
  public draw(ctx: CanvasRenderingContext2D): void {
    for (const lane of this.lanes) {
      lane.draw(ctx);
    }
  }

  public getStreetWidth(): number {
    return this.lanes.reduce(
      (totalWidth, lane) => totalWidth + lane.laneWidth,
      0,
    );
  }

  /**
   * Gets all obstacles from all lanes.
   * @returns An array of all obstacles.
   */
  public getAllObstacles(): readonly Obstacle[] {
    return this.lanes.flatMap((lane) => lane.obstacles);
  }
  
}
