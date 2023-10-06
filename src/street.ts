import { GameObject } from "./game";

  export const enum LaneDirection {
    LEFT = -1,
    RIGHT = 1,
  }
  

  export class Obstacle extends GameObject {
    constructor(
      x: number,
      y: number,
      width: number,
      height: number,
      public readonly speed: number,
      public readonly direction: LaneDirection,
      image: HTMLImageElement,
    ) {
      super(x, y, width, height, image, direction === LaneDirection.LEFT);
      this.speed = speed;
      this.direction = direction;
    }

    public moveObstacle(): Obstacle {
      const newX = this.x + this.speed * this.direction;
      return new Obstacle(
        newX,
        this.y,
        this.width,
        this.height,
        this.speed,
        this.direction,
        this.image,
      );
    }
  }
  

  export class Lane {
    private obstacles: Obstacle[];

    constructor(
      public readonly direction: LaneDirection,
      public readonly laneWidth: number = 50,
      public readonly streetLength: number,
      public readonly centerY: number,
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
        this.centerY,
        newObstacles,
      );
    }

    public updateObstacles(): Lane {
      const newObstacles = this.obstacles
        .map((obstacle) => obstacle.moveObstacle())
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
        newObstacles,
      );
    }

    /**
     * Draws the lane on the canvas with lane lines and obstacles.
     * @param {CanvasRenderingContext2D} ctx - The canvas rendering context to draw on.
     * @returns {void}
     */
    public draw(ctx: CanvasRenderingContext2D): void {
      // Calculate the top position of the lane
      const positionY = this.centerY - this.laneWidth / 2;

      // Draw lane lines
      ctx.strokeStyle = "black";
      ctx.lineWidth = 2;

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
        obstacle.draw(ctx);
      }
    }

    /**
     * Detects collision between the player and the obstacles in the lane.
     * @param {number} playerX - The x coordinate of the player.
     * @param {number} playerY - The y coordinate of the player.
     * @returns {boolean} - True if there is a collision, false otherwise.
     */
    public detectCollision(playerX: number, playerY: number): boolean {
      // Calculate the top position of the lane
      const positionY = this.centerY - this.laneWidth / 2;

      for (const obstacle of this.obstacles) {
        // console.log(`playerX: ${playerX}, playerY: ${playerY} obstacle: ${obstacle.x}, ${obstacle.y}`);
        if (
          playerX > obstacle.x &&
          playerX < obstacle.x + obstacle.width &&
          playerY >  positionY + (this.laneWidth - obstacle.height) / 2 &&
          playerY <  positionY + (this.laneWidth - obstacle.height) / 2 + obstacle.height
        ) {
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

    public addLane(direction: LaneDirection, laneWidth: number): Street {
      const newLanes = [...this.lanes, new Lane(
        direction,
        laneWidth,
        this.streetLength,
        this.getCenterY(laneWidth),
      )];
      return new Street(
        this.topOfStreetY,
        this.streetLength,
        newLanes,
      );
    }

    private getCenterY(laneWidth: number): number {
      const streetWidth = this.getStreetWidth();
      return this.topOfStreetY + streetWidth + laneWidth / 2;
    }

    public generateObstacles(): Street {
      const randomLaneIndex = Math.floor(Math.random() * this.lanes.length);
      const newLanes = this.lanes.map((lane, index) => {
        if (index === randomLaneIndex) {
          // Place obstacles at the beginning or end of the lane based on the lane direction.
          const imageScale = 0.1;
          const objectWidth = 706.12 * imageScale;
          const objectHeight = 314.33 * imageScale;
          const offsetOffCanvas = 3 * objectWidth;
          const x = 
            lane.direction === LaneDirection.LEFT
            ? lane.streetLength + offsetOffCanvas
              : 0 - offsetOffCanvas;
          const y = lane.centerY - objectHeight / 2;
          const image = new Image();
          image.src = "images/obstacles/car-wagon.svg";
          return lane.addObstacle(
            new Obstacle(x, y, objectWidth, objectHeight,5, lane.direction,image),
          );
        }
        return lane;
      });
      return new Street(
        this.topOfStreetY,
        this.streetLength,
        newLanes,
      );
    }

    public updateObstacles(): Street {
      const newLanes = this.lanes.map((lane) => lane.updateObstacles());
      return new Street(
        this.topOfStreetY,
        this.streetLength,
        newLanes,
      );
    }

    /**
     * Detects collision between the player and the obstacles in all lanes.
     * @param {number} playerX - The x coordinate of the player.
     * @param {number} playerY - The y coordinate of the player.
     * @returns {boolean} - True if there is a collision, false otherwise.
     */
    public detectCollision(playerX: number, playerY: number): boolean {
      for (const lane of this.lanes) {
        if (lane.detectCollision(playerX, playerY)) {
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
  }
