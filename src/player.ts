/**
 * Represents a player in the game.
 */
export class Player {
  /**
   * Creates a new player instance.
   * @param x The x-coordinate of the player's position.
   * @param y The y-coordinate of the player's position.
   * @param width The width of the player's rectangle.
   * @param height The height of the player's rectangle.
   * @param color The color of the player's rectangle. Defaults to "green".
   */
  constructor(
    public readonly x: number,
    public readonly y: number,
    public readonly width: number,
    public readonly height: number,
    public readonly color: string = "green",
  ) {}

  /**
   * Draws the player on the canvas.
   * @param ctx The canvas rendering context from the document.
   */
  public draw(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, this.width, this.height);
  }

  /**
   * Changes the player's color to red when a collision is detected.
   */
  public onCollisionDetected(): Player {
    return new Player(this.x, this.y, this.width, this.height, "red");
  }

  public moveUp(): Player {
    return new Player(this.x, this.y - 10, this.width, this.height, this.color);
  }

  public moveDown(): Player {
    return new Player(this.x, this.y + 10, this.width, this.height, this.color);
  }

  public moveLeft(): Player {
    return new Player(this.x - 10, this.y, this.width, this.height, this.color);
  }

  public moveRight(): Player {
    return new Player(this.x + 10, this.y, this.width, this.height, this.color);
  }
}
