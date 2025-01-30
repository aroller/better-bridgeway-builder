import { GameObject } from "./game";
import { Player } from "./player";
export declare const enum LaneDirection {
    LEFT = -1,
    RIGHT = 1
}
export declare const enum ObstacleSpeeds {
    STOPPED = 0,
    SLOW = 4,
    MEDIUM = 10,
    FAST = 14
}
export declare enum ObstacleAvoidanceType {
    NONE = 0,
    BRAKE = 1,
    PASS = 2
}
export declare class LaneLineStyle {
    readonly color: string;
    readonly dashed: boolean;
    readonly hidden: boolean;
    readonly lineWidth: number;
    readonly dashLength: number;
    readonly dashOffLength: number;
    constructor(color?: string, dashed?: boolean, hidden?: boolean, lineWidth?: number, dashLength?: number, dashOffLength?: number);
}
export declare class LaneLinesStyles {
    readonly top: LaneLineStyle;
    readonly bottom: LaneLineStyle;
    constructor(top?: LaneLineStyle, bottom?: LaneLineStyle);
}
interface ObstacleSpeedCalculator {
    calculateSpeed(target: Obstacle, player: Player, obstacles: readonly Obstacle[]): number;
}
export interface ObstacleYCalculator {
    calculateY(target: Obstacle, player: Player, obstacles: readonly Obstacle[]): number;
}
export declare class PassObstacleYCalculator implements ObstacleYCalculator {
    calculateY(target: Obstacle, player: Player, obstacles: readonly Obstacle[]): number;
}
export declare class Obstacle extends GameObject {
    readonly speed: number;
    readonly direction: LaneDirection;
    readonly avoidance: ObstacleAvoidanceType;
    readonly detectCollisions: boolean;
    readonly emergencyVehicle: boolean;
    readonly originalSpeed: ObstacleSpeeds;
    readonly originalY: number;
    readonly speedCalculators: ObstacleSpeedCalculator[];
    readonly yCalculators: ObstacleYCalculator[];
    readonly crashed: boolean;
    constructor(x: number, y: number, width: number, height: number, speed: number, direction: LaneDirection, image?: HTMLImageElement, avoidance?: ObstacleAvoidanceType, detectCollisions?: boolean, emergencyVehicle?: boolean, originalSpeed?: ObstacleSpeeds, originalY?: number, speedCalculators?: ObstacleSpeedCalculator[], yCalculators?: ObstacleYCalculator[]);
    static getCrashedImageSrc(): string;
    static getCrashedImage(): HTMLImageElement;
    clone(x?: number, y?: number): Obstacle;
    cloneAsCrashed(): Obstacle;
    moveObstacle(player: Player, obstacles: readonly Obstacle[], crashCallback: (obstacle: Obstacle) => void): Obstacle;
    collisionDetected(obstacles: readonly Obstacle[]): boolean;
    getClosestObject(gameObjects: readonly GameObject[]): GameObject | undefined;
    calculateTimeToCollision(gameObjects: GameObject[]): number | undefined;
    getDistanceTo(gameObject: GameObject): number;
    calculateDistanceToClosestObject(gameObjects: GameObject[]): number;
    private calculateSpeed;
    emergencyVehicleDetected(obstacles: readonly Obstacle[]): boolean;
    yToMoveRight(): number;
    yToMoveLeft(): number;
    calculateY(player: Player, obstacles: readonly Obstacle[]): number;
}
export declare class ObstacleProducer {
    readonly template: Obstacle;
    readonly maxFrequencyInSeconds: number;
    readonly assignX: boolean;
    readonly randomizeTraffic: boolean;
    private lastObstacleTime;
    constructor(template: Obstacle, maxFrequencyInSeconds?: number, assignX?: boolean, randomizeTraffic?: boolean);
    readyForNext(objects: readonly GameObject[]): boolean;
    next(x: number): Obstacle;
}
export declare class TargetObstacleProducer extends ObstacleProducer {
    readonly target: GameObject;
    constructor(template: Obstacle, maxFrequencyInSeconds: number, assignX: boolean, target: GameObject);
    readyForNext(objects: readonly GameObject[]): boolean;
}
export declare class Lane {
    readonly direction: LaneDirection;
    readonly laneWidth: number;
    readonly streetLength: number;
    readonly centerY: number;
    readonly lineStyle: LaneLinesStyles;
    readonly obstacleProducers: readonly ObstacleProducer[];
    readonly obstacles: readonly Obstacle[];
    constructor(direction: LaneDirection, laneWidth: number, streetLength: number, centerY: number, lineStyle?: LaneLinesStyles, obstacleProducers?: readonly ObstacleProducer[], obstacles?: readonly Obstacle[]);
    addObstacle(obstacle: Obstacle): Lane;
    updateObstacles(player: Player, obstacles: readonly Obstacle[], crashCallback: (obstacle: Obstacle) => void): Lane;
    draw(ctx: CanvasRenderingContext2D): void;
    private drawLaneLine;
    detectCollision(player: Player): boolean;
}
export declare class Street {
    readonly topOfStreetY: number;
    readonly streetLength: number;
    readonly lanes: readonly Lane[];
    readonly sceneObjects: readonly GameObject[];
    constructor(topOfStreetY?: number, streetLength?: number, lanes?: readonly Lane[], sceneObjects?: readonly GameObject[]);
    clone(lanes?: readonly Lane[], sceneObjects?: readonly GameObject[]): Street;
    addLane(direction: LaneDirection, laneWidth: number, style: LaneLinesStyles, obstacleProducers?: readonly ObstacleProducer[]): Street;
    addSceneObject(sceneObject: GameObject): Street;
    private getCenterY;
    generateObstacles(player: Player): Street;
    updateObstacles(player: Player, obstacles: readonly Obstacle[], crashCallback: (obstacle: Obstacle) => void): Street;
    detectCollision(player: Player): boolean;
    draw(ctx: CanvasRenderingContext2D): void;
    getStreetWidth(): number;
    getAllObstacles(): readonly Obstacle[];
}
export declare class CrosswalkSign extends GameObject {
    readonly direction: LaneDirection;
    readonly crosswalk: GameObject;
    readonly flashing: boolean;
    readonly flashingSequence: boolean;
    readonly timestampOfPreviousFlash: number;
    readonly notFlashingImage: HTMLImageElement;
    readonly flashingImage: HTMLImageElement;
    constructor(x: number, y: number, direction: LaneDirection, crosswalk: GameObject, flashing?: boolean, flashingSequence?: boolean, timestampOfPreviousFlash?: number, notFlashingImage?: HTMLImageElement, flashingImage?: HTMLImageElement);
    flash(sequence: boolean): CrosswalkSign;
    update(others: readonly GameObject[]): GameObject;
    private static calculateFlipHorizontal;
    private static calculateAngle;
    private static getImageScale;
    private static getImageHeight;
    private static getImageWidth;
    private static getNotFlashinImage;
    private static getFlashingImage;
    private static getFlashIntervalInMilliseconds;
}
export declare class CrosswalkObstacleProducer extends ObstacleProducer {
    constructor(template: Obstacle);
    readyForNext(objects: readonly GameObject[]): boolean;
}
export declare class ParkingCarObstacle extends Obstacle {
    readonly parkingSpotX: number;
    readonly parkingSpotY: number;
    private readonly doorsOpen;
    constructor(y: number, parkingSpotX: number, parkingSpotY: number, doorsOpen?: boolean, closedDoorImage?: HTMLImageElement, openDoorImage?: HTMLImageElement);
    private static getClosesDoorImage;
    private static getOpenDoorImage;
}
export declare class ParkingCarObstacleCalculator implements ObstacleSpeedCalculator, ObstacleYCalculator {
    readonly parkingSpotX: number;
    readonly parkingSpotY: number;
    readonly parkingTimeInSeconds: number;
    readonly distanceAwayFromSpotBeforeParking: number;
    private parkedAtTime;
    private exitingParkingSpot;
    constructor(parkingSpotX: number, parkingSpotY: number, parkingTimeInSeconds?: number, distanceAwayFromSpotBeforeParking?: number);
    calculateY(target: Obstacle, player: Player, obstacles: readonly Obstacle[]): number;
    private parked;
    calculateSpeed(target: Obstacle, player: Player, obstacles: readonly Obstacle[]): number;
}
export {};
