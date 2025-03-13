import { Ship } from "./battleship.js";

test("Ship exists", () => {
    const testDestroyer = new Ship(
        5,
        ["A2", "A3", "A4", "A5", "A6"],
        "destroyer",
    );

    expect(testDestroyer).toEqual({
        damage: 0,
        length: 5,
        placement: ["A2", "A3", "A4", "A5", "A6"],
        sunk: false,
        targetedSquares: [],
        type: "destroyer",
    });
    expect(testDestroyer.length).toBe(5);
    expect(testDestroyer.placement).toEqual(["A2", "A3", "A4", "A5", "A6"]);
    expect(testDestroyer.placement).toHaveLength(5);
    expect(testDestroyer.sunk).toBe(false);
    expect(testDestroyer.damage).toBe(0);
    expect(testDestroyer.type).toBe("destroyer");
    expect(testDestroyer.hit("A2")).toBe(true);
    expect(testDestroyer.hit("B4")).toBe(false);

    testDestroyer.targetedSquares = ["A2", "A3", "A4", "A5", "A6"];

    expect(testDestroyer.isSunk()).toBe(true);
    expect(testDestroyer.sunk).toBe(true);
});
