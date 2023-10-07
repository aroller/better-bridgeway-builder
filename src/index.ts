import { Scene } from "./scene";

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
