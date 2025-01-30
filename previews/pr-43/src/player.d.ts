import { GameObject } from "./game";
export declare const enum PlayerSpeed {
    STOPPED = 0,
    SLOW = 1,
    NORMAL = 2
}
export declare class Player extends GameObject {
    readonly x: number;
    readonly y: number;
    readonly width: number;
    readonly height: number;
    readonly image: HTMLImageElement;
    readonly pixelsPerMove: number;
    readonly flipHorizontally: boolean;
    readonly speed: PlayerSpeed;
    readonly angle: number;
    private readonly lastMovedAt;
    constructor(x: number, y: number, width: number, height: number, image: HTMLImageElement, pixelsPerMove: number, flipHorizontally?: boolean, speed?: PlayerSpeed, angle?: number);
    static getSquashedImage(): HTMLImageElement;
    onCollisionDetected(): Player;
    private canMove;
    private move;
    moveUp(): Player;
    moveDown(): Player;
    moveLeft(): Player;
    moveRight(): Player;
}
