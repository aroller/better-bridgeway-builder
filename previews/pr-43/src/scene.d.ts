import { ScenarioKey } from "./scenario";
export declare class Point {
    readonly x: number;
    readonly y: number;
    constructor(x: number, y: number);
}
export declare class Scene {
    private ctx;
    private street;
    private level;
    private player;
    private deadPlayers;
    private topOfStreetY;
    private playerDestination;
    private gameAttempts;
    private scenario;
    private scenarioProducer;
    private crashedEmergencyVehicles;
    private promoUrlArea;
    constructor(ctx: CanvasRenderingContext2D, scenarioKey?: ScenarioKey | string);
    private playNextLevel;
    private handleKeyDown;
    private handleKeyUp;
    private handleMouseDown;
    private handleMouseUp;
    private handleTouchStart;
    private handleScreenEvent;
    private handleTouchEnd;
    private navigateToDestination;
    private updateCanvas;
    private nextAttemptOrLevelIfReady;
    displayScoreboard(): void;
    displayDialogWithHtmlFromFile(scenarioKey: string): void;
    copyUrlToClipboard(): void;
    static getLevelHttpParamKey(): string;
    static getLevelHttpParamValue(): string | null;
    static getLevelHttpUrl(level: string): string;
    static show(ctx: CanvasRenderingContext2D): Scene;
    private displayPromoUrl;
}
