import { Player } from "./player";
import { Street } from "./street";
export declare class Scenario {
    readonly key: ScenarioKey;
    readonly title: string;
    readonly description: string;
    readonly street: Street;
    readonly player: Player;
    readonly finishLineY: number;
    readonly background: string;
    constructor(key: ScenarioKey, title: string, description: string, street: Street, player: Player, finishLineY: number, background: string);
    get nextScenarioKey(): ScenarioKey;
    get previousScenarioKey(): ScenarioKey;
}
export declare enum ScenarioKey {
    LIGHT_TRAFFIC = "light-traffic",
    HEAVY_TRAFFIC = "heavy-traffic",
    SLOW_MOVING = "slow-moving",
    CARS_STOP = "cars-stop",
    PARKED_CARS = "parked-cars",
    BICYCLES_SHARED_LANE = "bicycles-shared-lane",
    CARS_PASS_BICYCLES = "cars-pass-bicycles",
    CENTER_LANE_DELIVERY = "center-lane-delivery",
    CENTER_LANE_AMBULANCE = "center-lane-ambulance",
    CURBSIDE_DELIVERY = "curbside-delivery",
    CROSSWALK = "crosswalk",
    CROSSWALK_DAYLIGHT = "crosswalk-daylight",
    CROSSWALK_RFB = "crosswalk-rfb",
    BIKE_LANES = "bike-lanes",
    BIKE_LANES_AMBULANCE = "bike-lanes-ambulance",
    BIKE_LANES_PARKING = "bike-lanes-parking",
    CYCLE_TRACK = "cycle-track",
    CYCLE_TRACK_AMBULANCE = "cycle-track-ambulance",
    GAME_OVER = "game-over"
}
export declare enum DeliveryType {
    CENTER_LANE = "center-lane",
    CURBSIDE = "curbside",
    NONE = "none"
}
export declare enum Background {
    EXISTING = "images/scene/better-bridgeway-background.png",
    CURBSIDE = "images/scene/better-bridgeway-background-curbside.png",
    CROSSWALK = "images/scene/better-bridgeway-background-crosswalk.png",
    CROSSWALK_DAYLIGHT = "images/scene/better-bridgeway-background-daylight.png",
    ACCESSIBLE = "images/scene/better-bridgeway-background-accessible.png",
    BIKE_LANES = "images/scene/better-bridgeway-background-bike-lanes.png",
    CYCLETRACK = "images/scene/better-bridgeway-background-cycletrack.png"
}
export declare enum CrosswalkType {
    NONE = "none",
    BASIC = "basic",
    DAYLIGHT = "daylight",
    SIGNAL = "signal"
}
export declare class ScenarioProducer {
    readonly streetWidth: number;
    readonly streetLength: number;
    readonly topOfStreetY: number;
    constructor(streetWidth: number, streetLength: number, topOfStreetY: number);
    static getScenarioKeyForLevel(level: number): ScenarioKey;
    static getLevelForScenarioKey(scenarioKey: ScenarioKey | string): number;
    getScenario(key: string | ScenarioKey): Scenario;
    private frogPlayer;
    private curbsideDeliveryPlayer;
    private wheelchairPlayer;
}
