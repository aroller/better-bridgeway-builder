/**
 * Represents a player in the game.
 */
import { GameObject } from "./game";

export const enum PlayerSpeed {
  SLOW,
  NORMAL,
}
export class Player extends GameObject {

  /** Keeps track of the time last moved.  Since the player is read-only, we assume
   * it has moved when constructed.  
   */
    private readonly lastMovedAt: number = Date.now(); // Keeps track of the last time the player moved

  /**
   * Creates a new player instance.  See GameObject for parameter descriptions.
   * @param x The x-coordinate of the player's position.
   * @param y The y-coordinate of the player's position.
   * @param width The width of the player's rectangle.
   * @param height The height of the player's rectangle.
   * @param image The image to be displayed for the player.
   * @param pixelsPerMove Distance per move to relocate the player to match the movement of the image flipping simulating walking.
   * @param flipHorizontally Whether or not to flip the image horizontally when being drawn.
   * @param speedLimit The maximum number of pixels per second the player can move.
   * @param angle The angle in which to rotate this player, in radians. 0 -> up.
   * @param speed The maximum number of pixels per second the player can move.
   */
  constructor(
    public readonly x: number,
    public readonly y: number,
    public readonly width: number,
    public readonly height: number,
    public readonly image: HTMLImageElement,
    public readonly pixelsPerMove: number,
    public readonly flipHorizontally: boolean = false,
    public readonly speedLimit: number = PlayerSpeed.NORMAL,
    public readonly angle: number = 0,
    public readonly speed: PlayerSpeed = PlayerSpeed.NORMAL, 
  ) {
    super(x, y, width, height, image, flipHorizontally, angle);
  }

  /**
   * Changes the player's image to a red splat when a collision is detected.
   */
  public static getSquashedImage(): HTMLImageElement {
    const redImage = new Image();
    redImage.src = "images/players/squashed.svg";
    return redImage;
  }

  public onCollisionDetected(): Player {
    // show the squashed image
    const redImage = Player.getSquashedImage();
    return new Player(
      this.x,
      this.y,
      this.width,
      this.height,
      redImage,
      this.pixelsPerMove,
      this.flipHorizontally,
      this.speed,
    );
  }

  private canMove(x: number, y: number): boolean {
    const now = Date.now();
    const timeSinceLastMove = now - this.lastMovedAt;

    // Calculate the actual distance the player wants to move
    const distance = Math.sqrt(Math.pow(x - this.x, 2) + Math.pow(y - this.y, 2));

    // Calculate the maximum distance the player can move
    const speedLimit:number = this.speed === PlayerSpeed.NORMAL ? 200 : 30;
    const maxDistance = (speedLimit * timeSinceLastMove) / 1000;
    if (distance <= maxDistance) {
      return true;
    }
    return false;
  }

  private move(x: number, y: number, angle: number) {
    if (this.canMove(x,y)) {
      return new Player(
        x,
        y,
        this.width,
        this.height,
        this.image,
        this.pixelsPerMove,
        !this.flipHorizontally, // flip the image per move to simulate walking
        this.speedLimit,
        angle,
        this.speed,
        );
    }
    return this;
  }
  public moveUp(): Player {
    return this.move(this.x, this.y - this.pixelsPerMove, 0);
  }

  public moveDown(): Player {
    return this.move(this.x, this.y + this.pixelsPerMove, Math.PI);
  }

  public moveLeft(): Player {
    return this.move(this.x - this.pixelsPerMove, this.y, -Math.PI / 2);
  }

  public moveRight(): Player {
    return this.move(this.x + this.pixelsPerMove, this.y, Math.PI / 2);
  }
}
