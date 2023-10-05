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
    // Create a new image element with a red rectangle
    const redImage = new Image();
    redImage.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect x='0' y='0' width='100' height='100' fill='red'/%3E%3C/svg%3E";
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
    return new Player(this.x + 10, this.y, this.width, this.height, this.image);
  }
}
