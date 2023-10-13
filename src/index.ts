import { Scene } from "./scene";

const canvas = document.getElementById("gameCanvas") as HTMLCanvasElement;

if (canvas) {
  const ctx = canvas.getContext("2d");

  if (ctx) {
    const urlParams = new URLSearchParams(window.location.search);
    const level = urlParams.get('level');
    if (level) {
      console.log(`Starting with Level: ${level}`);
      new Scene(ctx, level); // pass ctx and level as arguments
    } else {
      new Scene(ctx);
    }
  } else {
    console.error("Canvas context is null");
  }
} else {
  console.error("Canvas element is null");
}
