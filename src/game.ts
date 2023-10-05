import { matrix } from "mathjs";
import { matricesIntersect } from "./math";

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
   */
  constructor(
    public readonly x: number,
    public readonly y: number,
    public readonly width: number,
    public readonly height: number,
    public readonly image: HTMLImageElement,
  ) { }

  /**
   * Draws the game object on the canvas.
   * @param ctx The canvas rendering context to draw on.
   */
  public draw(ctx: CanvasRenderingContext2D): void {
    if (this.image.complete) {
      ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
    } else {
      this.image.onload = () => {
        ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
      };
    }
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
    return matrix([
      [this.x, this.y],
      [this.x + this.width, this.y],
      [this.x + this.width, this.y + this.height],
      [this.x, this.y + this.height],
    ]);
  }
}