export declare class GameObject {
    readonly x: number;
    readonly y: number;
    readonly width: number;
    readonly height: number;
    readonly image?: HTMLImageElement | undefined;
    readonly flipHorizontally: boolean;
    readonly angle: number;
    constructor(x: number, y: number, width: number, height: number, image?: HTMLImageElement | undefined, flipHorizontally?: boolean, angle?: number);
    protected get left(): number;
    protected get right(): number;
    protected get top(): number;
    protected get bottom(): number;
    update(others: readonly GameObject[]): GameObject;
    draw(ctx: CanvasRenderingContext2D): void;
    intersects(other: GameObject): boolean;
}
export declare class LevelAttempt {
    readonly success: boolean | undefined;
    readonly startTime: Date;
    readonly endTime: Date | undefined;
    constructor(success?: boolean | undefined, startTime?: Date, endTime?: Date | undefined);
    get durationInSeconds(): number;
    isInProgress(): boolean;
    completeAttempt(success: boolean): LevelAttempt;
}
export declare class LevelAttempts {
    readonly level: number;
    readonly attempts: ReadonlyArray<LevelAttempt>;
    constructor(level: number, attempts?: ReadonlyArray<LevelAttempt>);
    get successCount(): number;
    get failureCount(): number;
    get averageDurationInSeconds(): number;
    startNewAttempt(): LevelAttempts;
    completeCurrentAttempt(success: boolean): LevelAttempts;
    getCurrentAttempt(): LevelAttempt;
}
export declare class GameAttempts {
    readonly attempts: ReadonlyArray<LevelAttempts>;
    readonly maxAttemptCount: number;
    constructor(attempts?: ReadonlyArray<LevelAttempts>, maxAttemptCount?: number);
    get successCount(): number;
    get failureCount(): number;
    get averageLevelAttempts(): number;
    get averageLevelSuccessRate(): number;
    get currentLevel(): number;
    startNewLevel(): GameAttempts;
    getCurrentLevelAttempt(): LevelAttempt;
    getCurrentLevelAttempts(): LevelAttempts;
    completeCurrentLevelAttempt(success: boolean): GameAttempts;
}
