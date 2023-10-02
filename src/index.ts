import { Street, Lane, Obstacle } from "./street";
import { Player } from "./player";

// Get the canvas element and context
const canvas = document.getElementById("gameCanvas") as HTMLCanvasElement;
const ctx = canvas.getContext("2d");

let player = new Player(canvas.width / 2, canvas.height - 50, 50, 50);

// Initialize the street with 2 lanes, one in each direction
let street = new Street()
    .addLane(new Lane(-1))
    .addLane(new Lane(1));

// Event listener for keyboard input
document.addEventListener("keydown", function (event) {
    switch (event.code) {
        case "ArrowUp":
            player = player.moveUp();
            break;
        case "ArrowDown":
            player = player.moveDown();
            break;
        case "ArrowLeft":
            player = player.moveLeft();
            break;
        case "ArrowRight":
            player = player.moveRight();
            break;
    }

    // Update the canvas
    updateCanvas();
});

function updateCanvas() {
    // clear the canvas
    if (ctx != null) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw the player
        player.draw(ctx);
        street.draw(ctx);
    }
}

// Initial canvas update and obstacle generation
setInterval(updateCanvas, 50);
