import { Street, Lane, Obstacle, LaneDirection } from "./street";

describe("Street.detectCollision", () => {
  let street: Street;

  beforeEach(() => {
    // Create a new street with one lane and one obstacle
    const lane = new Lane(LaneDirection.Right, 50, 600, 100, [
      new Obstacle(200, 50, 50, 10, LaneDirection.Right),
    ]);
    street = new Street(0, 600, [lane]);
  });

  it("should return true if player collides with an obstacle", () => {
    // Player is inside the obstacle
    expect(street.detectCollision(225, 125)).toBe(true);

    // Player is partially inside the obstacle
    expect(street.detectCollision(225, 100)).toBe(true);
    expect(street.detectCollision(225, 150)).toBe(true);

    // Player is outside the obstacle
    expect(street.detectCollision(150, 125)).toBe(false);
    expect(street.detectCollision(300, 125)).toBe(false);
  });

  it("should return false if player does not collide with any obstacle", () => {
    // Player is above the obstacle
    expect(street.detectCollision(225, 50)).toBe(false);

    // Player is below the obstacle
    expect(street.detectCollision(225, 200)).toBe(false);

    // Player is to the left of the obstacle
    expect(street.detectCollision(100, 125)).toBe(false);

    // Player is to the right of the obstacle
    expect(street.detectCollision(400, 125)).toBe(false);
  });
});