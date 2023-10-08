/**
 * Represents a player in the game.
 */
import { GameObject } from "./game";

export class Player extends GameObject {
  /**
   * Creates a new player instance.
   * @param x The x-coordinate of the player's position.
   * @param y The y-coordinate of the player's position.
   * @param width The width of the player's rectangle.
   * @param height The height of the player's rectangle.
   * @param image The image to be displayed for the player.
   * @param angle The angle in which to rotate the player.
   */
  constructor(
    public readonly x: number,
    public readonly y: number,
    public readonly width: number,
    public readonly height: number,
    public readonly image: HTMLImageElement,
    public readonly flipHorizontally: boolean = false,
    public readonly speedInPixelsPerMove: number = 10,
    public readonly angle: number = 0,
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
      this.flipHorizontally,
      this.speedInPixelsPerMove,
    );
  }

  public moveUp(): Player {
    return new Player(
      this.x,
      this.y - this.speedInPixelsPerMove,
      this.width,
      this.height,
      this.image,
      !this.flipHorizontally,
      this.speedInPixelsPerMove,
    );
  }

  public moveDown(): Player {
    return new Player(
      this.x,
      this.y + this.speedInPixelsPerMove,
      this.width,
      this.height,
      this.image,
      !this.flipHorizontally,
      this.speedInPixelsPerMove,
      -Math.PI,
    );
  }

  public moveLeft(): Player {
    return new Player(
      this.x - this.speedInPixelsPerMove,
      this.y,
      this.width,
      this.height,
      this.image,
      !this.flipHorizontally,
      this.speedInPixelsPerMove,
      -Math.PI / 2,
    );
  }

  public moveRight(): Player {
    return new Player(
      this.x + this.speedInPixelsPerMove,
      this.y,
      this.width,
      this.height,
      this.image,
      !this.flipHorizontally,
      this.speedInPixelsPerMove,
      Math.PI / 2,
    );
  }
}
