/**
 * Base class for all game objects like the player, obstacles, etc.
 * The shape is a rectangle starting from left,right (adjusted from x,y which is the centerpoint)
 * and extending to the right (width) and down (height) to match canvas coordinates.
 *
 */
export class GameObject {
  /**
   * Creates a new game object.  The coordinates are the center point of the object.
   * This is different than a typical rectangle coordinates which are the top-left point.
   * The reason for this is that it makes it easier to center the objects in the lane.
   * It also makes it easier to rotate around the center.
   *
   * @param x The x-coordinate of the object which is the center point of the object.
   * @param y The y-coordinate of the object which is the center point of the object.
   * @param width The width of the object as measured right from x - 1/2 width.
   * @param height The height of the object as measured down from y - 1/2 height.
   * @param image The image to be displayed for the object. Optionally provide nothing drawn if undefined.
   * @param flipHorizontally Whether or not to flip the image horizontally when being drawn.
   * @param angle The angle in which this object should be rotated, in radians.
   */
  constructor(
    public readonly x: number,
    public readonly y: number,
    public readonly width: number,
    public readonly height: number,
    public readonly image?: HTMLImageElement,
    public readonly flipHorizontally: boolean = false,
    public readonly angle: number = 0,
  ) {}

  protected get left(): number {
    return this.x - this.width / 2;
  }

  protected get right(): number {
    return this.x + this.width / 2;
  }

  protected get top(): number {
    return this.y - this.height / 2;
  }

  protected get bottom(): number {
    return this.y + this.height / 2;
  }

  /**
   * Updates the game object based on the current state of the game.
   * @param others The other game objects in the game that may affect. 
   * @returns The updated game object which may be the same object or a new object.
   */
  public update(others:readonly GameObject[]): GameObject {
    return this;
  }

  /**
   * Draws the game object on the canvas, if the image exists.
   * @param ctx The canvas rendering context to draw on.
   */
  public draw(ctx: CanvasRenderingContext2D): void {
    if (this.image) {
      if (this.image.complete) {
        const x = this.left;
        const y = this.top;
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
          ctx.drawImage(
            this.image,
            -this.width / 2,
            -this.height / 2,
            this.width,
            this.height,
          );

          // Restore the original state
          ctx.restore();
        } else {
          // Draw without transformations
          ctx.drawImage(this.image, x, y, this.width, this.height);
        }
      } else {
        this.image.onload = () => {
          this.draw(ctx);
        };
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
    const thisX1 = this.left;
    const thisY1 = this.top;
    const thisX2 = this.right;
    const thisY2 = this.bottom;

    const otherX1 = other.left;
    const otherY1 = other.top;
    const otherX2 = other.right;
    const otherY2 = other.bottom;

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
  constructor(
    public readonly attempts: ReadonlyArray<LevelAttempts> = [],
    public readonly maxAttemptCount: number = 2,
  ) {}

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
    //for some resason maxAttemptCount requires a +1 to work correctly
    if (
      success ||
      this.getCurrentLevelAttempts().failureCount >= this.maxAttemptCount
    ) {
      const updatedAttempts = [
        ...this.attempts.slice(0, -1),
        updatedLevelAttempts,
      ];
      return new GameAttempts(updatedAttempts).startNewLevel();
    } else {
      const updatedAttempts = [
        ...this.attempts.slice(0, -1),
        updatedLevelAttempts.startNewAttempt(),
      ];
      return new GameAttempts(updatedAttempts);
    }
  }
}
