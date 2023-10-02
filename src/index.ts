import { Street, Lane, LaneDirection } from "./street";
import { Player } from "./player";

function init(ctx: CanvasRenderingContext2D) {
  const canvas = ctx.canvas;

  const streetLength = canvas.width;
  const vehicleLaneWidth = 100;
  const bikeLaneWidth = 40;
  const street = new Street()
    .addLane(new Lane(LaneDirection.LEFT, bikeLaneWidth, streetLength))
    .addLane(new Lane(LaneDirection.LEFT, vehicleLaneWidth, streetLength))
    .addLane(new Lane(LaneDirection.RIGHT, vehicleLaneWidth, streetLength))
    .addLane(new Lane(LaneDirection.RIGHT, bikeLaneWidth, streetLength));

    const playerSize = 50;
    let player = new Player(streetLength / 2, street.getStreetWidth() + playerSize, playerSize, playerSize);

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
    updateCanvas(ctx, player, street);
  });

  // Initial canvas update and obstacle generation
  setInterval(() => updateCanvas(ctx, player, street), 50);
}

function updateCanvas(
  ctx: CanvasRenderingContext2D,
  player: Player,
  street: Street
) {
  // clear the canvas
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  // Draw the scene
  player.draw(ctx);
  street.draw(ctx);
}

// Get the canvas element and context
const canvas = document.getElementById("gameCanvas") as HTMLCanvasElement;

if (canvas) {
  const ctx = canvas.getContext("2d");

  if (ctx) {
    // Initialize canvas and obstacles
    init(ctx);
  } else {
    console.error("Canvas context is null");
  }
} else {
  console.error("Canvas element is null");
}
