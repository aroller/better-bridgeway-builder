import { Street } from "./street";
import { Player } from "./player";
import { Scenario, ScenarioProducer, ScenarioKey } from "./scenario";
import { GameAttempts } from "./game";

/**
 * Represents a point on the canvas with x and y coordinates.
 */
export class Point {
  constructor(
    public readonly x: number,
    public readonly y: number,
  ) {}
}

/**
 * The Scene class manages the rendering of the canvas for the game,
 * as well as the street and player objects.
 * This is a mutable class that changes state for convenience and performance.
 */
export class Scene {
  private ctx: CanvasRenderingContext2D;
  /** The current view of the street, initially provided by scenario. */
  private street: Street;
  /** The current view of the player, initially provided by scenario. */
  private player: Player;
  private deadPlayers: Player[] = [];
  private topOfStreetY: number;
  private playerDestination: Point | null = null;
  private gameAttempts: GameAttempts;
  private scenario: Scenario;
  private scenarioProducer: ScenarioProducer;

  /**
   * Creates a new Scene instance.
   * @param ctx - The CanvasRenderingContext2D to use for rendering.
   */
  constructor(
    ctx: CanvasRenderingContext2D,
    scenarioKey: ScenarioKey | string = ScenarioKey.LIGHT_TRAFFIC,
  ) {
    this.ctx = ctx;
    // requires a fixed background size to work
    this.topOfStreetY = 220;
    const canvas = this.ctx.canvas;
    const streetLength = canvas.width;
    const streetWidth = 170; //emperically determined to match the background image up to parking lane
    this.scenarioProducer = new ScenarioProducer(
      streetWidth,
      streetLength,
      this.topOfStreetY,
    );
    //assign defaults to make instances happy
    this.scenario = this.scenarioProducer.getScenario(scenarioKey);
    this.player = this.scenario.player;
    this.street = this.scenario.street;
    this.gameAttempts = new GameAttempts().startNewLevel();

    this.playNextLevel(scenarioKey);
    // The background image shows the familar street scene.
    canvas.style.backgroundImage =
      "url('images/scene/better-bridgeway-background.svg')";
    canvas.style.backgroundSize = "cover";
    // Create the street object with four lanes, two for vehicles and two for bikes.

    // Listen for keyboard input to move the player.
    document.addEventListener("keydown", this.handleKeyDown.bind(this));
    document.addEventListener("keyup", this.handleKeyUp.bind(this));
    document.addEventListener("mousedown", this.handleMouseDown.bind(this));
    document.addEventListener("mouseup", this.handleMouseUp.bind(this));
    document.addEventListener("touchstart", this.handleTouchStart.bind(this));
    document.addEventListener("touchend", this.handleTouchEnd.bind(this));

    // Update the game every 50 milliseconds.
    setInterval(() => {
      this.updateCanvas();
    }, 50);
    setInterval(() => {
      this.street = this.street.generateObstacles(this.player);
    }, 100);
  }

  /**
   * 
   * @param scenarioKey - The scenario key to play. If not provided, the next level will be played.
   */
  private playNextLevel(scenarioKey?: ScenarioKey | string) {
    const level = this.gameAttempts.currentLevel;
    //start the next scenario
    this.deadPlayers = [];
    if (!scenarioKey) {
      scenarioKey = ScenarioProducer.getScenarioKeyForLevel(level);
    }
    this.scenario = this.scenarioProducer.getScenario(scenarioKey);
    this.street = this.scenario.street;
    this.player = this.scenario.player;
    this.displayDialogWithHtmlFromFile(
      `dialogs/${scenarioKey}.html`,
      "Play",
      () => {},
    );
  }

  /**
   * Handles keyboard input to move the player.
   * @param event - The KeyboardEvent object representing the key press.
   */
  private handleKeyDown(event: KeyboardEvent) {
    if (this.gameAttempts.getCurrentLevelAttempt().isInProgress()) {
      const pixelsToMove = this.player.pixelsPerMove;

      let x = this.playerDestination?.x
        ? this.playerDestination.x
        : this.player.x;
      let y = this.playerDestination?.y
        ? this.playerDestination.y
        : this.player.y;

      switch (event.code) {
        case "ArrowUp":
          y -= pixelsToMove;
          break;
        case "ArrowDown":
          y += pixelsToMove;
          break;
        case "ArrowLeft":
          x -= pixelsToMove;
          break;
        case "ArrowRight":
          x += pixelsToMove;
          break;
      }
      this.playerDestination = new Point(x, y);
    }
  }

  /** Stop moving when the key is no longer pressed. */
  private handleKeyUp(event: KeyboardEvent) {
    this.playerDestination = null;
  }

  /**
   * Handles mouse input to move the player towards the point being clicked.
   * @param event - The MouseEvent object representing the mouse click.
   */
  private handleMouseDown(event: MouseEvent) {
    this.handleScreenEvent(event.clientX, event.clientY);
  }

  /**
   * Handles mouse input to set the player destination to null when the mouse button is released.
   * @param event - The MouseEvent object representing the mouse click.
   */
  private handleMouseUp(event: MouseEvent) {
    this.playerDestination = null;
  }

  /**
   * Handles touch input to move the player towards the point being touched.
   * @param event - The TouchEvent object representing the touch.
   */
  private handleTouchStart(event: TouchEvent) {
    const touch = event.touches[0];
    this.handleScreenEvent(touch.clientX, touch.clientY);
  }

  private handleScreenEvent(clientX: number, clientY: number) {
    const rect = this.ctx.canvas.getBoundingClientRect();
    const scaleX = this.ctx.canvas.width / rect.width;
    const scaleY = this.ctx.canvas.height / rect.height;
    const x = (clientX - rect.left) * scaleX;
    const y = (clientY - rect.top) * scaleY;
    this.playerDestination = new Point(x, y);
  }
  /**
   * Handles touch input to set the player destination to null when the touch ends.
   * @param event - The TouchEvent object representing the touch.
   */
  private handleTouchEnd(event: TouchEvent) {
    this.playerDestination = null;
  }

  /**
   * Navigates the player to their destination if they are not squashed and a destination is set.
   * This is useful for touch input for mobile devices and creating consistent speed capabilities.
   * @returns void
   */

  private navigateToDestination() {
    if (
      this.gameAttempts.getCurrentLevelAttempt().isInProgress() &&
      this.playerDestination !== null
    ) {
      //avoid flopping when the player reaches the destination
      const destinationTolerance = 5;
      const x = this.playerDestination.x;
      const y = this.playerDestination.y;
      const dx = x - this.player.x;
      const dy = y - this.player.y;

      if (Math.abs(dx) > Math.abs(dy)) {
        if (dx > destinationTolerance) {
          this.player = this.player.moveRight();
        } else if (dx < -destinationTolerance) {
          this.player = this.player.moveLeft();
        } else {
          this.playerDestination = null;
        }
      } else {
        if (dy > destinationTolerance) {
          this.player = this.player.moveDown();
        } else if (dy < -destinationTolerance) {
          this.player = this.player.moveUp();
        } else {
          this.playerDestination = null;
        }
      }
    }
  }

  /**
   * Updates the canvas with the current state of the game.
   * Called periodically, this function clears the canvas,
   * updates the street and player objects, and draws them.
   */
  private updateCanvas() {
    // Update the street obstacles.
    this.street = this.street.updateObstacles(
      this.player,
      this.street.getAllObstacles(),
    );

    // move to the position if controls instruct to do so
    this.navigateToDestination();

    this.nextAttemptOrLevelIfReady();

    // Clear the canvas.
    this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    // Draw the player and street.
    this.player.draw(this.ctx);
    this.deadPlayers.forEach((player) => {
      player.draw(this.ctx);
    });

    // debug code displaying x,y for the player
    // this.ctx.fillText(
    //     `x: ${this.player.x}, y: ${this.player.y}`,
    //     this.player.x,
    //     this.player.y - 10,
    // );
    this.street.draw(this.ctx);
    this.displayScoreboard();
  }

  private nextAttemptOrLevelIfReady() {
    if (this.gameAttempts.getCurrentLevelAttempt().isInProgress()) {
      //check for the goal of reaching the finish
      //Fixme: it seems the player height should be used to reach the sidewalk
      if (this.player.y + this.player.height / 2 < this.topOfStreetY) {
        this.gameAttempts = this.gameAttempts.completeCurrentLevelAttempt(true);
        this.playNextLevel();
      } else if (this.street.detectCollision(this.player)) {
        this.player = this.player.onCollisionDetected();
        //keep track of the dead players so the spots remain on the street
        this.deadPlayers.push(this.player);
        const currentLevel = this.gameAttempts.currentLevel;
        this.gameAttempts =
          this.gameAttempts.completeCurrentLevelAttempt(false);
        // automatically goes next level if max failure count reach
        if (this.gameAttempts.currentLevel !== currentLevel) {
          console.log(`too many failures, going to next level`);
          this.playNextLevel();
        } else {
          //reset the current player to the scenario start
          this.player = this.scenario.player;
        }
      }
    }
  }

  public displayScoreboard() {
    // Add a fixed rectangular background.
    this.ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
    this.ctx.fillRect(0, 0, this.ctx.canvas.width, 100);
    const currentAttempts = this.gameAttempts.getCurrentLevelAttempts();
    const currentLevel = currentAttempts.level;
    const failedAttempts = currentAttempts.failureCount;
    const scenarioTitle = this.scenario.title;
    // Display the current level number and scenario title.
    this.ctx.font = "bold 24px sans-serif";
    this.ctx.fillStyle = "white";
    this.ctx.fillText(`Level ${currentLevel} - ${scenarioTitle}`, 10, 30);

    // Display the failed attempts and time elapsed.
    let x = 10;
    let y = 50;
    for (let i = 0; i < failedAttempts; i++) {
      const image = Player.getSquashedImage();
      this.ctx.drawImage(image, x, y, 50, 50);
      x += 60;
    }

    const timeElapsed = Math.trunc(
      this.gameAttempts.getCurrentLevelAttempt().durationInSeconds,
    );
    this.ctx.font = "bold 24px sans-serif";
    this.ctx.fillStyle = "white";
    this.ctx.fillText(`${timeElapsed}`, x, y + 30);
  }

  public displayDialogWithHtmlFromFile(
    filePath: string,
    buttonText: string,
    callback: () => void,
  ) {
    // Create a div element for the dialog.
    const dialog = document.createElement("div");
    dialog.style.position = "absolute";
    dialog.style.top = "50%";
    dialog.style.left = "50%";
    dialog.style.transform = "translate(-50%, -50%)";
    dialog.style.width = "75%";
    dialog.style.backgroundColor = "white";
    dialog.style.border = "1px solid black";
    dialog.style.padding = "20px";
    dialog.style.textAlign = "center";

    // Create an iframe element for the HTML page.
    const iframe = document.createElement("iframe");
    iframe.style.width = "100%";
    iframe.style.height = "400px";
    iframe.src = filePath;
    dialog.appendChild(iframe);

    // Add the continue button to the dialog.
    const button = document.createElement("button");
    button.textContent = buttonText;
    button.addEventListener("click", () => {
      // Remove the dialog from the DOM.
      dialog.remove();
      // Call the callback function.
      callback();
    });
    dialog.appendChild(button);

    // Add the dialog to the DOM.
    document.body.appendChild(dialog);

    // Close the dialog by pressing any key.
    document.addEventListener("keydown", (event) => {
      if (
        event.key === "Enter" ||
        event.key === " " ||
        event.key === "Escape"
      ) {
        dialog.remove();
        callback();
      }
    });
  }

  /** The key in the http url to indicate if a level is to be played upon visiting. */
  public static getLevelHttpParamKey(): string  {
    return "level";
  }

  /**
   * Returns the value of the 'level' parameter in the current URL's query string.
   * @returns The value of the 'level' parameter, or null if it is not present.
   */
  public static getLevelHttpParamValue(): string | null {
    const urlParams = new URLSearchParams(window.location.search);
    const level = urlParams.get('level');
    return level;
  }

  /**
   * Returns the URL with the specified level parameter added to the query string.
   * @param level - The level to add to the query string.
   * @returns The URL with the specified level parameter added to the query string.
   */
  public static getLevelHttpUrl(level: string) {
    const url = new URL(window.location.href);
    url.searchParams.set(Scene.getLevelHttpParamKey(), level);
    return url.toString();
  }

  /** Entry point into the game, this will create a scene.
   * Optionally a level can be specified in the URL query string with values matching the ScenarioKey enum.
   * Example: http://localhost:8080/?level=light-traffic
   * 
   * @param ctx - The CanvasRenderingContext2D to use for rendering.
   */
  public static show(ctx: CanvasRenderingContext2D): Scene{
    const level = Scene.getLevelHttpParamValue();
    if (level) {
      console.log(`Starting with Level: ${level}`);
      return new Scene(ctx, level); // pass ctx and level as arguments
    } else {
      return new Scene(ctx);
    }
  }
}
