// (base: https://www.typescriptlang.org/play/)
import { Other } from "./other";
import { Street } from "./street";
import  { Player }  from "./player";

// Get the canvas element and context
const canvas = document.getElementById("gameCanvas") as HTMLCanvasElement;
const ctx = canvas.getContext("2d");


const player = new Player(canvas.width / 2,  canvas.height - 50, 50, 50);

// Event listener for keyboard input
document.addEventListener("keydown", function(event) {
    switch(event.code) {
        case "ArrowUp":
            // player.moveUp();frogY -= 10;
            break;
        case "ArrowDown":
            // frogY += 10;
            break;
        case "ArrowLeft":
            // frogX -= 10;
            break;
        case "ArrowRight":
            // frogX += 10;
            break;
    }

    // Update the canvas
    updateCanvas();
});

function updateCanvas() {
    // clear the canvas
    if(ctx != null){
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        player.draw(ctx)
    }

}


// Initial canvas update and obstacle generation

setInterval(updateCanvas, 50);




class Greeter {
  greeting: string;
  constructor(message: string) {
    this.greeting = message;
  }
  greet(): string {
    return `Hello, ${this.greeting}`;
  }
}

const greeter = new Greeter("world");

const button = document.getElementById('myButton')!;
button.onclick = () => {
  alert(greeter.greet());
};

const other = new Other();