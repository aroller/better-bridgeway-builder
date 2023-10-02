export enum LaneDirection {
	LEFT = -1,
	RIGHT = 1,
}

/**
 * Any object traveling in a lane that may conflict with the frog.
 */
export class Obstacle {
	constructor(
		public readonly x: number,
		public readonly y: number,
		public readonly width: number,
		public readonly height: number,
		public readonly speed: number
	) {}

	public moveObstacle(speed: number): Obstacle {
		return new Obstacle(this.x + speed, this.y, this.width, this.height, this.speed);
	}
}

export class Lane {
	private obstacles: Obstacle[];

	constructor(
		public readonly direction: LaneDirection,
		public readonly laneWidth: number = 50,
		public readonly streetLength: number = 600,
		obstacles: Obstacle[] = []
	) {
		this.obstacles = obstacles;
	}

	public addObstacle(obstacle: Obstacle): Lane {
		const newObstacles = [...this.obstacles, obstacle];
		return new Lane(this.direction, this.laneWidth, this.streetLength, newObstacles);
	}

	public updateObstacles(): Lane {
		const newObstacles = this.obstacles.map((obstacle) => obstacle.moveObstacle(obstacle.speed));
		return new Lane(this.direction, this.laneWidth, this.streetLength, newObstacles);
	}

	/**
	 * Draws the street on the canvas with lane lines and obstacles.
	 * @param {CanvasRenderingContext2D} ctx - The canvas rendering context to draw on.
	 * @param {number} positionY - The canvas y position for the top side of the lane.
	 * @returns {void}
	 */
	public draw(ctx: CanvasRenderingContext2D, positionY: number): void {
		// Draw lane lines
		ctx.strokeStyle = "black";
		ctx.lineWidth = 5;

		// Draw left lane line
		ctx.beginPath();
		ctx.moveTo(0, positionY);
		ctx.lineTo(this.streetLength, positionY);
		ctx.stroke();

		// Draw right lane line
		ctx.beginPath();
		ctx.moveTo(0, positionY + this.laneWidth);
		ctx.lineTo(this.streetLength, positionY + this.laneWidth);
		ctx.stroke();

		// Draw obstacles
		for (const obstacle of this.obstacles) {
			ctx.fillStyle = "red";
			ctx.fillRect(obstacle.x, obstacle.y + positionY, obstacle.width, obstacle.height);
		}
	}
}

/**
 * A street consists of lanes that travel horizontally across the canvas.
 * The lanes may have obstacles that travel in the same direction as the lane.
 * The obstacles may conflict with the player.
 * @class
 */
export class Street {
	private lanes: Lane[];

	constructor() {
		this.lanes = [];
	}

	public addLane(lane: Lane): Street {
		const newLanes = [...this.lanes, lane];
		return this.withLanes(newLanes);
	}

	public withLanes(lanes: Lane[]): Street {
		const newStreet = new Street();
		newStreet.lanes = lanes;
		return newStreet;
	}

	public generateObstacles(): Street {
		const newLanes = this.lanes.map((lane) => lane.addObstacle(new Obstacle(0, 0, 50, 50, 5)));
		return this.withLanes(newLanes);
	}

	public updateObstacles(): Street {
		const newLanes = this.lanes.map((lane) => lane.updateObstacles());
		return this.withLanes(newLanes);
	}

	public draw(ctx: CanvasRenderingContext2D): void {
		let positionY = 0;
		for (const lane of this.lanes) {
			lane.draw(ctx, positionY);
			positionY += lane.laneWidth;
		}
	}

	public getStreetWidth(): number {
		return this.lanes.reduce((totalWidth, lane) => totalWidth + lane.laneWidth, 0);
	}
}