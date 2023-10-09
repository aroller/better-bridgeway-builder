
/**
 * Base class for all game objects like the player, obstacles, etc.
 * The shape is a rectangle starting from x,y (top-left) and extending to the right and down.
 */
export class GameObject {
  /**
   * Creates a new game object.
   * @param x The x-coordinate of the object which is the left-most value.
   * @param y The y-coordinate of the object which is the top-most value.
   * @param width The width of the object as measured right from x.
   * @param height The height of the object as measured down from y.
   * @param image The image to be displayed for the object. Optionally provide nothing drawn if undefined.
   * @param flipHorizontally Whether or not to flip the image horizontally when being drawn.
   * @param angle The angle in which to rotate the object
   */
  constructor(
    public readonly x: number,
    public readonly y: number,
    public readonly width: number,
    public readonly height: number,
    public readonly image?: HTMLImageElement,
    public readonly flipHorizontally: boolean = true,
    public readonly angle: number = 0,
  ) {}

  /**
   * Draws the game object on the canvas, if the image exists.
   * @param ctx The canvas rendering context to draw on.
   */
  public draw(ctx: CanvasRenderingContext2D): void {
    if (this.image.complete) {
      const x = this.x - this.width / 2;
      const y = this.y - this.height / 2;
      const shouldTransform = this.angle !== 0 || this.flipHorizontally;

      if (shouldTransform) {
        // Save the current state
        ctx.save();

        // Translate to the center of the object
        ctx.translate(x + this.width / 2, y + this.height / 2);

        // Rotate based on this.angle
        if (this.angle !== 0) {
          ctx.rotate(this.angle);
        }

        if (this.flipHorizontally) {
          // Flip horizontally
          ctx.scale(-1, 1);
        }

        // Draw the image at (0, 0) relative to the translated and rotated context
        ctx.drawImage(this.image, -this.width / 2, -this.height / 2, this.width, this.height);

        // Restore the original state
        ctx.restore();
      } else {
        // Draw without transformations
        ctx.drawImage(this.image, x, y, this.width, this.height);
      }
    }
  }

  /**
   * Checks if this game object intersects with another game object.
   * @param other The other game object to check for intersection.
   * @returns True if the two game objects intersect, false otherwise.
   */
  public intersects(other: GameObject): boolean {
    // Calculate the coordinates of the rectangles
    const thisX1 = this.x;
    const thisY1 = this.y;
    const thisX2 = this.x + this.width;
    const thisY2 = this.y + this.height;

    const otherX1 = other.x;
    const otherY1 = other.y;
    const otherX2 = other.x + other.width;
    const otherY2 = other.y + other.height;

    // Check for intersection
    return (
      thisX1 <= otherX2 &&
      thisX2 >= otherX1 &&
      thisY1 <= otherY2 &&
      thisY2 >= otherY1
    );
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
