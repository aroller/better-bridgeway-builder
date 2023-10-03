import { Street, Lane, Obstacle, LaneDirection } from './street';

describe('Street', () => {
  let street: Street;

  beforeEach(() => {
    street = new Street();
  });

  describe('addLane', () => {
    it('should add a lane to the street', () => {
      const lane = new Lane(LaneDirection.LEFT);
      street.addLane(lane);
      expect(street['lanes']).toContain(lane);
    });
  });

  describe('detectCollision', () => {
    it('should return true if player collides with an obstacle', () => {
      const lane = new Lane(LaneDirection.LEFT);
      const obstacle = new Obstacle(100, 100, 50, 50, 5, LaneDirection.LEFT);
      lane.addObstacle(obstacle);
      street.addLane(lane);
      expect(street.detectCollision(110, 110)).toBe(true);
    });

    it('should return false if player does not collide with any obstacles', () => {
      const lane = new Lane(LaneDirection.LEFT);
      const obstacle = new Obstacle(100, 100, 50, 50, 5, LaneDirection.LEFT);
      lane.addObstacle(obstacle);
      street.addLane(lane);
      expect(street.detectCollision(50, 50)).toBe(false);
    });
  });
});