import { Street, LaneDirection } from "./street";
import { Player } from "./player";

/**
 * Represents a game scene with a canvas, street, and player.
 */
/**
 * The Scene class manages the rendering of the canvas for the game, as well as the street and player objects.
 */
class Scene {
    private ctx: CanvasRenderingContext2D;
    private street: Street;
    private player: Player;
    private topOfStreetY: number;
    private isGameOver: boolean;

    /**
     * Creates a new Scene instance.
     * @param ctx - The CanvasRenderingContext2D to use for rendering.
     */
    constructor(ctx: CanvasRenderingContext2D) {
        this.ctx = ctx;
        this.topOfStreetY = canvas.height / 10;
        this.isGameOver = false;

        const streetLength = canvas.width;
        const vehicleLaneWidth = 120;
        const bikeLaneWidth = 50;

        // Create the street object with four lanes, two for vehicles and two for bikes.
        this.street = new Street(this.topOfStreetY, streetLength)
            .addLane(LaneDirection.LEFT, bikeLaneWidth)
            .addLane(LaneDirection.RIGHT, bikeLaneWidth)
            .addLane(LaneDirection.LEFT, vehicleLaneWidth)
            .addLane(LaneDirection.RIGHT, vehicleLaneWidth);

        // Create the player object in the middle of the street.
        const playerSize = 20;
        this.player = new Player(
            streetLength / 2,
            this.street.getStreetWidth() + playerSize + this.topOfStreetY,
            playerSize,
            playerSize,
        );

        // Listen for keyboard input to move the player.
        document.addEventListener("keydown", this.handleKeyDown.bind(this));
        document.addEventListener("mousedown", this.handleMouseDown.bind(this));

        // Update the game every 50 milliseconds.
        setInterval(() => {
            this.street = this.street.updateObstacles();
            this.updateCanvas();
        }, 50);
        setInterval(() => {
            this.street = this.street.generateObstacles();
        }, 1000);
    }

    /**
     * Handles keyboard input to move the player.
     * @param event - The KeyboardEvent object representing the key press.
     */
    private handleKeyDown(event: KeyboardEvent) {
        if (!this.isGameOver) {
            switch (event.code) {
                case "ArrowUp":
                    this.player = this.player.moveUp();
                    break;
                case "ArrowDown":
                    this.player = this.player.moveDown();
                    break;
                case "ArrowLeft":
                    this.player = this.player.moveLeft();
                    break;
                case "ArrowRight":
                    this.player = this.player.moveRight();
                    break;
            }

            this.updateCanvas();
        }
    }

      /**
     * Handles mouse input to move the player towards the point being clicked.
     * @param event - The MouseEvent object representing the mouse click.
     */
      private handleMouseDown(event: MouseEvent) {
        const x = event.clientX - canvas.offsetLeft;
        const y = event.clientY - canvas.offsetTop;
        this.navigateToPosition(x, y);
    }

    private navigateToPosition(x: number, y: number) {
        if (!this.isGameOver) {
            const dx = x - this.player.x;
            const dy = y - this.player.y;

            if (Math.abs(dx) > Math.abs(dy)) {
                if (dx > 0) {
                    this.player = this.player.moveRight();
                } else {
                    this.player = this.player.moveLeft();
                }
            } else {
                if (dy > 0) {
                    this.player = this.player.moveDown();
                } else {
                    this.player = this.player.moveUp();
                }
            }

            this.updateCanvas();
        }
    }

    /**
     * Updates the canvas with the current state of the game.
     */
    private updateCanvas() {
        // Clear the canvas.
        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);

        // Update the street obstacles.
        this.street = this.street.updateObstacles();

        if (this.street.detectCollision(this.player.x, this.player.y)) {
            this.player = this.player.onCollisionDetected();
            this.isGameOver = true;
        }

        // Draw the player and street.
        this.player.draw(this.ctx);
        this.ctx.fillText(
            `x: ${this.player.x}, y: ${this.player.y}`,
            this.player.x,
            this.player.y - 10,
        );
        this.street.draw(this.ctx);
    }
}

const canvas = document.getElementById("gameCanvas") as HTMLCanvasElement;

if (canvas) {
    const ctx = canvas.getContext("2d");

    if (ctx) {
        new Scene(ctx);
    } else {
        console.error("Canvas context is null");
    }
} else {
    console.error("Canvas element is null");
}
