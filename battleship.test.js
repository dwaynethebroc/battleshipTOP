import { Ship } from "./battleship.js";

test("Ship exists", () => {
    const testDestroyer = new Ship(5, ["A2", "A3", "A4", "A5", "A6"]);

    expect(testDestroyer).toEqual({
        hit: 0,
        length: 5,
        placement: ["A2", "A3", "A4", "A5", "A6"],
        sunk: false,
    });
    expect(testDestroyer.length).toBe(5);
    expect(testDestroyer.placement).toEqual(["A2", "A3", "A4", "A5", "A6"]);
    expect(testDestroyer.placement).toHaveLength(5);
    expect(testDestroyer.sunk).toBe(false);
    expect(testDestroyer.hit).toBe(0);
});
