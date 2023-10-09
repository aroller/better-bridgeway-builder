/**
 * Represents a player in the game.
 */
import { GameObject } from "./game";

export class Player extends GameObject {
  /**
   * Creates a new player instance.  See GameObject for parameter descriptions.
   * @param x The x-coordinate of the player's position.
   * @param y The y-coordinate of the player's position.
   * @param width The width of the player's rectangle.
   * @param height The height of the player's rectangle.
   * @param image The image to be displayed for the player.
   * @param flipHorizontally Whether or not to flip the image horizontally when being drawn.
   * @param pixelsPerMove Distance per move to relocate the player to match the movement of the image flipping simulating walking.
   */
  constructor(
    public readonly x: number,
    public readonly y: number,
    public readonly width: number,
    public readonly height: number,
    public readonly image: HTMLImageElement,
    public readonly pixelsPerMove: number,
    public readonly flipHorizontally: boolean = false,
  ) {
    super(x, y, width, height, image, flipHorizontally);
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
    );
  }

  private move(x: number, y: number) {
    return new Player(
      x,
      y,
      this.width,
      this.height,
      this.image,
      this.pixelsPerMove,
      !this.flipHorizontally, // flip the image per move to simulate walking
    );
  }
  public moveUp(): Player {
    return this.move(this.x, this.y - this.pixelsPerMove);
  }

  public moveDown(): Player {
    return this.move(this.x, this.y + this.pixelsPerMove);
  }

  public moveLeft(): Player {
    return this.move(this.x - this.pixelsPerMove, this.y);
  }

  public moveRight(): Player {
    return this.move(this.x + this.pixelsPerMove, this.y);
  }
}
