import { matricesIntersect } from "./math";
import * as math from "mathjs";

/**
 * Base class for all game objects like the player, obstacles, etc.
 */
export abstract class GameObject {

  /**
   * Creates a new game object.
   * @param x The x-coordinate of the object.
   * @param y The y-coordinate of the object.
   * @param width The width of the object.
   * @param height The height of the object.
   * @param image The image to be displayed for the object.
   * @param flipHorizontally Whether or not to flip the image horizontally when being drawn.
   * @param angle The angle the image is rotated.
   */
  protected constructor(
    public readonly x: number,
    public readonly y: number,
    public readonly width: number,
    public readonly height: number,
    public readonly image: HTMLImageElement,
    public readonly flipHorizontally: boolean = true,
    public readonly angle: number = 0,
  ) { }

  /**
   * Draws the game object on the canvas.
   * @param ctx The canvas rendering context to draw on.
   */
  public draw(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    if (this.image.complete) {
      // Translate to the center of the image
      ctx.translate(this.x + this.width / 2, this.y + this.height / 2);

      // Rotate the canvas
      ctx.rotate(this.angle);

      // Apply horizontal flip if needed
      if (this.flipHorizontally) {
        ctx.scale(-1, 1);
      }

      // Draw the image centered at the origin
      ctx.drawImage(this.image, -this.width / 2, -this.height / 2, this.width, this.height);
    } else {
      this.image.onload = () => {
        this.draw(ctx);
      };
    }
    ctx.restore();
  }


  /**
   * Checks if this game object intersects with another game object.
   * @param other The other game object to check for intersection.
   * @returns True if the two game objects intersect, false otherwise.
   */
  public intersects(other: GameObject): boolean {
    const rect1 = this.getRectMatrix();
    const rect2 = other.getRectMatrix();
    return matricesIntersect(rect1,rect2)
  }

  /**
   * Returns the matrix representing the rectangle occupied by the game object.
   * @returns The matrix representing the rectangle occupied by the game object.
   */
  private getRectMatrix(): math.Matrix {
    return math.matrix([
      [this.x, this.y],
      [this.x + this.width, this.y],
      [this.x + this.width, this.y + this.height],
      [this.x, this.y + this.height],
    ]);
  }
}