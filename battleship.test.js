import { Ship, Gameboard } from "./battleship.js";

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

test("Gameboard exists", () => {
    const testBoard = new Gameboard();

    expect(testBoard.board).toStrictEqual([
        ["  ", "A", "B", "C", "D", "E", "F", "G", "H", "I", "J"],
        [" 1", "~", "~", "~", "~", "~", "~", "~", "~", "~", "~"],
        [" 2", "~", "~", "~", "~", "~", "~", "~", "~", "~", "~"],
        [" 3", "~", "~", "~", "~", "~", "~", "~", "~", "~", "~"],
        [" 4", "~", "~", "~", "~", "~", "~", "~", "~", "~", "~"],
        [" 5", "~", "~", "~", "~", "~", "~", "~", "~", "~", "~"],
        [" 6", "~", "~", "~", "~", "~", "~", "~", "~", "~", "~"],
        [" 7", "~", "~", "~", "~", "~", "~", "~", "~", "~", "~"],
        [" 8", "~", "~", "~", "~", "~", "~", "~", "~", "~", "~"],
        [" 9", "~", "~", "~", "~", "~", "~", "~", "~", "~", "~"],
        ["10", "~", "~", "~", "~", "~", "~", "~", "~", "~", "~"],
    ]);
});

test("Gameboard is the correct length", () => {
    const testBoard = new Gameboard();

    expect(testBoard.board.length).toBe(11);
    expect(testBoard.board[0].length).toBe(11);
});

test("has correct column headers", () => {
    const testBoard = new Gameboard();

    expect(testBoard.board[0]).toStrictEqual([
        "  ",
        "A",
        "B",
        "C",
        "D",
        "E",
        "F",
        "G",
        "H",
        "I",
        "J",
    ]);
});

//Mock ship placement
// //[
//     Ship {
//         damage: 0,
//         sunk: false,
//         length: 2,
//         placement: 'A2-A3',
//         type: 'patrol',
//         orientation: 'vertical'
//       },
//       Ship {
//         damage: 0,
//         sunk: false,
//         length: 3,
//         placement: 'B3-D3',
//         type: 'submarine',
//         orientation: 'horizontal'
//       },
//       Ship {
//         damage: 0,
//         sunk: false,
//         length: 3,
//         placement: 'D4-D6',
//         type: 'destroyer',
//         orientation: 'vertical'
//       },
//       Ship {
//         damage: 0,
//         sunk: false,
//         length: 4,
//         placement: 'D7-G7',
//         type: 'battleship',
//         orientation: 'horizontal'
//       },
//       Ship {
//         damage: 0,
//         sunk: false,
//         length: 5,
//         placement: 'C6-C10',
//         type: 'carrier',
//         orientation: 'vertical'
//       }
//     ]

// Occupied Cells test array
//     [
//       'A2',  'A3', 'B3', 'C3',
//       'D3',  'D4', 'D5', 'D6',
//       'D7',  'E7', 'F7', 'G7',
//       'C6',  'C7', 'C8', 'C9',
//       'C10'
//     ]
