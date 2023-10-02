/**
 * Any object traveling in a lane that may conflict with the frog.
 */
export class Obstacle {
  constructor(
    public readonly x: number,
    public readonly y: number,
    public readonly width: number,
    public readonly height: number,
    public readonly speed: number
  ) {}

  public moveObstacle(speed: number): Obstacle {
    const newX = this.x + speed;
    return new Obstacle(newX, this.y, this.width, this.height, this.speed);
  }
}

export class Lane {
  private obstacles: Obstacle[];

  constructor(
    public readonly laneId: number,
    public readonly direction: number,
    public readonly laneWidth: number = 600,
    public readonly laneHeight: number = 50
  ) {
    this.obstacles = [];
  }

  public generateObstacle(): void {
    const obstacleWidth = this.laneHeight;
    const obstacleHeight = this.laneHeight;
    const speed = Math.random() * 5 + 2;
    let obstacleX;

    if (this.direction === 1) {
      obstacleX = this.laneWidth;
    } else {
      obstacleX = 0;
    }

    const newObstacle = new Obstacle(
      obstacleX,
      this.laneId * this.laneHeight,
      obstacleWidth,
      obstacleHeight,
      this.direction === 1 ? -speed : speed
    );

    for (let obstacle of this.obstacles) {
      if (Math.abs(obstacle.x - newObstacle.x) <= newObstacle.width) {
        return;
      }
    }

    this.obstacles.push(newObstacle);
  }

  public updateObstacles(): void {
    const newObstacles = this.obstacles.map((obstacle) =>
      obstacle.moveObstacle(obstacle.speed)
    );
    this.obstacles = newObstacles.filter(
      (obstacle) =>
        !(obstacle.x > this.laneWidth || obstacle.x < -obstacle.width)
    );

    for (let i = 0; i < this.obstacles.length; i++) {
      for (let j = i + 1; j < this.obstacles.length; j++) {
        if (
          Math.abs(this.obstacles[i].x - this.obstacles[j].x) <
          this.obstacles[i].width
        ) {
          if (this.obstacles[i].x > this.obstacles[j].x) {
            this.obstacles[j] = this.obstacles[j].moveObstacle(
              this.obstacles[i].speed
            );
          } else {
            this.obstacles[i] = this.obstacles[i].moveObstacle(
              this.obstacles[j].speed
            );
          }
        }
      }
    }
  }

  public drawObstacles(ctx: CanvasRenderingContext2D): void {
    for (const obstacle of this.obstacles) {
      ctx.fillStyle = "red";
      ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
    }
  }
}
export class Street {
  private lanes: Lane[];

  constructor(public readonly laneCount: number) {
    this.lanes = [];

    // Instantiate the lanes
    for (let i = 0; i < laneCount; i++) {
      let direction = i % 2 == 0 ? -1 : 1; // Alternate direction for each lane
      this.lanes[i] = new Lane(i, direction);
    }
  }

  public generateObstacles(): void {
    for (const lane of this.lanes) {
      lane.generateObstacle();
    }
  }

  public updateObstacles(): void {
    for (const lane of this.lanes) {
      lane.updateObstacles();
    }
  }

  public drawObstacles(ctx: CanvasRenderingContext2D): void {
    for (const lane of this.lanes) {
      lane.drawObstacles(ctx);
    }
  }
}
