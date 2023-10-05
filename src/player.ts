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
   */
  constructor(
    public readonly x: number,
    public readonly y: number,
    public readonly width: number,
    public readonly height: number,
    public readonly image: HTMLImageElement,
    public readonly flipHorizontally: boolean = false
  ) {
    super(x, y, width, height, image, flipHorizontally);
  }

  /**
   * Changes the player's image to a red rectangle when a collision is detected.
   */
  public onCollisionDetected(): Player {
    // show the squashed image
    const redImage = new Image();
    redImage.src = "images/players/squashed.svg";
    return new Player(this.x, this.y, this.width, this.height, redImage, !this.flipHorizontally);
  }

  public moveUp(): Player {
    return new Player(this.x, this.y - 10, this.width, this.height, this.image, !this.flipHorizontally);
  }

  public moveDown(): Player {
    return new Player(this.x, this.y + 10, this.width, this.height, this.image, !this.flipHorizontally);
  }

  public moveLeft(): Player {
    return new Player(this.x - 10, this.y, this.width, this.height, this.image, !this.flipHorizontally);
  }

  public moveRight(): Player {
    return new Player(this.x + 10, this.y, this.width, this.height, this.image, !this.flipHorizontally);
  }
}
