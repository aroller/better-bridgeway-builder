import { GameObject } from "./game";

describe("GameObject", () => {
  describe("GameObject", () => {
    describe("intersects", () => {
      it("should return true if the two game objects intersect", () => {
        const gameObject1 = new GameObject(10, 10, 20, 20);
        const gameObject2 = new GameObject(15, 15, 20, 20);
        expect(gameObject1.intersects(gameObject2)).toBeTruthy();
        expect(gameObject2.intersects(gameObject1)).toBeTruthy();
      });

      it("should return false if the two game objects do not intersect", () => {
        const gameObject1 = new GameObject(10, 10, 20, 20);
        const gameObject2 = new GameObject(40, 40, 20, 20);
        expect(gameObject1.intersects(gameObject2)).toBeFalsy();
        expect(gameObject2.intersects(gameObject1)).toBeFalsy();
      });

      it("should return true if only one corner point intersects", () => {
        const gameObject1 = new GameObject(10, 10, 20, 20);
        const gameObject2 = new GameObject(30, 30, 20, 20);
        expect(gameObject1.intersects(gameObject2)).toBeTruthy();
        expect(gameObject2.intersects(gameObject1)).toBeTruthy();
      });

      it("should return true if one rectangle completely contains another rectangle with no lines intersecting", () => {
        const gameObject1 = new GameObject(10, 10, 40, 40);
        const gameObject2 = new GameObject(15, 15, 20, 20);
        expect(gameObject1.intersects(gameObject2)).toBeTruthy();
        expect(gameObject2.intersects(gameObject1)).toBeTruthy();
      });
    });
  });
});
