export enum LaneDirection {
  LEFT = -1,
  RIGHT = 1,
}

/**
 * Any object traveling in a lane that may conflict with the frog.
 */
export class Obstacle {
  constructor(
    public readonly x: number,
    public readonly y: number,
    public readonly width: number,
    public readonly height: number,
    public readonly speed: number,
    public readonly direction: LaneDirection,
  ) {}

  public moveObstacle(): Obstacle {
    const newX = this.x + this.speed * this.direction;
    return new Obstacle(
      newX,
      this.y,
      this.width,
      this.height,
      this.speed,
      this.direction,
    );
  }
}

export class Lane {
  private obstacles: Obstacle[];

  constructor(
    public readonly direction: LaneDirection,
    public readonly laneWidth: number = 50,
    public readonly streetLength: number = 600,
    obstacles: Obstacle[] = [],
  ) {
    this.obstacles = obstacles;
  }

  public addObstacle(obstacle: Obstacle): Lane {
    const newObstacles = [...this.obstacles, obstacle];
    return new Lane(
      this.direction,
      this.laneWidth,
      this.streetLength,
      newObstacles,
    );
  }

  public updateObstacles(): Lane {
    const newObstacles = this.obstacles.map((obstacle) =>
      obstacle.moveObstacle(),
    );
    return new Lane(
      this.direction,
      this.laneWidth,
      this.streetLength,
      newObstacles,
    );
  }

  /**
   * Draws the lane on the canvas with lane lines and obstacles.
   * @param {CanvasRenderingContext2D} ctx - The canvas rendering context to draw on.
   * @param {number} centerY - The canvas y position for the center of the lane.
   * @returns {void}
   */
  public draw(ctx: CanvasRenderingContext2D, centerY: number): void {
    // Calculate the top position of the lane
    const positionY = centerY - this.laneWidth / 2;

    // Draw lane lines
    ctx.strokeStyle = "black";
    ctx.lineWidth = 5;

    // Draw left lane line
    ctx.beginPath();
    ctx.moveTo(0, positionY);
    ctx.lineTo(this.streetLength, positionY);
    ctx.stroke();

    // Draw right lane line
    ctx.beginPath();
    ctx.moveTo(0, positionY + this.laneWidth);
    ctx.lineTo(this.streetLength, positionY + this.laneWidth);
    ctx.stroke();

    // Draw obstacles
    for (const obstacle of this.obstacles) {
      ctx.fillStyle = "red";
      const obstacleWidth = this.laneWidth * 0.75;
      const obstacleHeight = obstacleWidth * (obstacle.height / obstacle.width);
      ctx.fillRect(
        obstacle.x,
        obstacle.y + positionY + (this.laneWidth - obstacleHeight) / 2,
        obstacleWidth,
        obstacleHeight,
      );
    }
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

  constructor() {
    this.lanes = [];
  }

  public addLane(lane: Lane): Street {
    const newLanes = [...this.lanes, lane];
    return this.withLanes(newLanes);
  }

  public withLanes(lanes: Lane[]): Street {
    const newStreet = new Street();
    newStreet.lanes = lanes;
    return newStreet;
  }

  public generateObstacles(): Street {
    const newLanes = this.lanes.map((lane) => {
      // Place obstacles at the beginning or end of the lane based on the lane direction.
      const objectWidth = 40;
      const offsetOffCanvas = 3 * objectWidth;
      const x = lane.direction === LaneDirection.LEFT ? lane.streetLength + offsetOffCanvas : 0 - offsetOffCanvas;
      return lane.addObstacle(new Obstacle(x, 0, objectWidth, 25, 5, lane.direction)); 
    });
    return this.withLanes(newLanes);
  }

  public updateObstacles(): Street {
    const newLanes = this.lanes.map((lane) => lane.updateObstacles());
    return this.withLanes(newLanes);
  }

  /**
   * Draws the street on the canvas with all lanes and obstacles.
   * @param {CanvasRenderingContext2D} ctx - The canvas rendering context to draw on.
   * @param {number} topOfStreetY - The canvas y position for the top of the street.
   * @returns {void}
   */
  public draw(ctx: CanvasRenderingContext2D, topOfStreetY: number = 0): void {
    let centerY = topOfStreetY;
    for (const lane of this.lanes) {
      lane.draw(ctx, centerY + lane.laneWidth / 2);
      centerY += lane.laneWidth;
    }
  }

  public getStreetWidth(): number {
    return this.lanes.reduce(
      (totalWidth, lane) => totalWidth + lane.laneWidth,
      0,
    );
  }
}
