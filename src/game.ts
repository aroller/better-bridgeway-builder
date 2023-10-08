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
   * @param flipHorizontally Whether or not to flip the image horizontally when being drawn.
   */
  constructor(
    public readonly x: number,
    public readonly y: number,
    public readonly width: number,
    public readonly height: number,
    public readonly image: HTMLImageElement,
    public readonly flipHorizontally: boolean = true,
  ) {}

  /**
   * Draws the game object on the canvas.
   * @param ctx The canvas rendering context to draw on.
   */
  public draw(ctx: CanvasRenderingContext2D): void {
    if (this.image.complete) {
      const y = this.y - this.height / 2;
      if (this.flipHorizontally) {
        ctx.save();
        ctx.translate(this.x + this.width, y);
        ctx.scale(-1, 1);
        ctx.drawImage(this.image, 0, 0, this.width, this.height);
        ctx.restore();
      } else {
        ctx.drawImage(this.image, this.x, y, this.width, this.height);
      }
    } else {
      this.image.onload = () => {
        this.draw(ctx);
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
    return matricesIntersect(rect1, rect2);
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

/**
 * Represents a single attempt by a player to complete a level.
 */
export class LevelAttempt {
  constructor(
    public readonly success: boolean | undefined = undefined,
    public readonly startTime: Date = new Date(),
    public readonly endTime: Date | undefined = undefined,
  ) {}

  public get durationInSeconds(): number {
    if (!this.endTime) {
      return (new Date().getTime() - this.startTime.getTime()) / 1000;
    }
    return (this.endTime.getTime() - this.startTime.getTime()) / 1000;
  }

  public isInProgress(): boolean {
    return !this.endTime;
  }

  public completeAttempt(success: boolean): LevelAttempt {
    return new LevelAttempt(success, this.startTime, new Date());
  }
}

/**
 * Represents a set of attempts by a player to complete a level.
 */
export class LevelAttempts {
  constructor(
    public readonly level: number,
    public readonly attempts: ReadonlyArray<LevelAttempt> = [],
  ) {}

  public get successCount(): number {
    return this.attempts.filter((attempt) => attempt.success === true).length;
  }

  public get failureCount(): number {
    return this.attempts.filter((attempt) => attempt.success === false).length;
  }

  public get averageDurationInSeconds(): number {
    if (this.attempts.length === 0) {
      return 0;
    }
    const totalDuration = this.attempts.reduce(
      (sum, attempt) => sum + attempt.durationInSeconds,
      0,
    );
    return totalDuration / this.attempts.length;
  }

  /**
   * Starts a new attempt for this level.
   * @returns The new LevelAttempts object with the new attempt added to it.
   */
  public startNewAttempt(): LevelAttempts {
    const newAttempt = new LevelAttempt();
    const newAttempts = [...this.attempts, newAttempt];
    return new LevelAttempts(this.level, newAttempts);
  }

  /**
   * Completes the current attempt, which is the last attempt in the array.
   * @param success Whether or not the attempt was successful.
   * @returns The new LevelAttempts object with the completed attempt updated.
   */
  public completeCurrentAttempt(success: boolean): LevelAttempts {
    const currentAttempt = this.getCurrentAttempt();
    const updatedAttempt = currentAttempt.completeAttempt(success);
    const newAttempts = [...this.attempts.slice(0, -1), updatedAttempt];
    return new LevelAttempts(this.level, newAttempts);
  }

  /**
   * Gets the current attempt, which is the last attempt in the array.
   * @returns The current LevelAttempt object.
   */
  public getCurrentAttempt(): LevelAttempt {
    if (this.attempts.length === 0) {
      throw new Error("No attempts have been started yet.");
    }
    return this.attempts[this.attempts.length - 1];
  }
}

/**
 * Represents a set of attempts by a player to complete a game.
 */
export class GameAttempts {
  constructor(public readonly attempts: ReadonlyArray<LevelAttempts> = []) {}

  public get successCount(): number {
    return this.attempts.reduce(
      (sum, levelAttempts) => sum + levelAttempts.successCount,
      0,
    );
  }

  public get failureCount(): number {
    return this.attempts.reduce(
      (sum, levelAttempts) => sum + levelAttempts.failureCount,
      0,
    );
  }

  public get averageLevelAttempts(): number {
    if (this.attempts.length === 0) {
      return 0;
    }
    const totalLevelAttempts = this.attempts.length;
    return totalLevelAttempts / this.attempts.length;
  }

  public get averageLevelSuccessRate(): number {
    if (this.attempts.length === 0) {
      return 0;
    }
    const totalSuccessCount = this.successCount;
    const totalAttempts = this.attempts.reduce(
      (sum, levelAttempts) => sum + levelAttempts.attempts.length,
      0,
    );
    return totalSuccessCount / totalAttempts;
  }

  public get currentLevel(): number {
    return this.attempts.length;
  }

  /**
   * Starts a new level attempt.
   * @returns The new GameAttempts object with the new level attempt added to it.
   */
  public startNewLevel(): GameAttempts {
    const newLevel = this.currentLevel + 1;
    const newLevelAttempts = new LevelAttempts(newLevel);
    const newAttempts = [...this.attempts, newLevelAttempts.startNewAttempt()];
    return new GameAttempts(newAttempts);
  }

  /**
   * Gets the current level attempt, which is the last attempt of the last level in the array.
   * @returns The current LevelAttempt object.
   * @throws An error if no attempts have been started yet.
   */
  public getCurrentLevelAttempt(): LevelAttempt {
    if (this.attempts.length === 0) {
      throw new Error("No attempts have been started yet.");
    }
    const lastLevelAttempts = this.attempts[this.attempts.length - 1];
    return lastLevelAttempts.getCurrentAttempt();
  }

  /**
   * Gets the current level attempts, which is the last level attempts in the array.
   * @returns The current LevelAttempts object.
   * @throws An error if no attempts have been started yet.
   */
  public getCurrentLevelAttempts(): LevelAttempts {
    if (this.attempts.length === 0) {
      throw new Error("No attempts have been started yet.");
    }
    const lastLevelAttempts = this.attempts[this.attempts.length - 1];
    return lastLevelAttempts;
  }

  /**
   * Completes the current level attempt, which is the last attempt of the last level in the array.
   * If succesful, starts a new level.  If failure, starts a new attempt for the current level.
   *
   * @param success Whether or not the attempt was successful.
   * @returns The new GameAttempts object with the completed attempt updated.
   * @throws An error if no attempts have been started yet.
   */
  public completeCurrentLevelAttempt(success: boolean): GameAttempts {
    const currentLevelAttempts = this.getCurrentLevelAttempts();
    const updatedLevelAttempts =
      currentLevelAttempts.completeCurrentAttempt(success);
    let updatedAttempts;
    if (success) {
      updatedAttempts = [...this.attempts.slice(0, -1), updatedLevelAttempts];
      return new GameAttempts(updatedAttempts).startNewLevel();
    } else {
      updatedAttempts = [
        ...this.attempts.slice(0, -1),
        updatedLevelAttempts.startNewAttempt(),
      ];
      return new GameAttempts(updatedAttempts);
    }
  }
}
