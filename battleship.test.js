import { Ship, Gameboard } from "./battleship.js";
import promptSync from "prompt-sync";

jest.mock(
    "prompt-sync",
    () => () =>
        jest
            .fn()
            .mockReturnValueOnce("A9-A10") // Patrol (length 2)
            .mockReturnValueOnce("B3-B5") // Submarine (length 3)
            .mockReturnValueOnce("C7-E7") // Destroyer (length 3)
            .mockReturnValueOnce("D10-G10") // Battleship (length 4)
            .mockReturnValueOnce("H4-H8"), // Carrier (length 5) // Default mock response
);

let mockPrompt;

beforeAll(() => {
    mockPrompt = jest.fn();
    jest.mock("prompt-sync", () => () => mockPrompt);
});

test("Ship exists", () => {
    const testDestroyer = new Ship(
        5,
        ["A2", "A3", "A4", "A5", "A6"],
        "destroyer",
        "horizontal",
    );

    expect(testDestroyer).toEqual({
        damage: 0,
        length: 5,
        placement: ["A2", "A3", "A4", "A5", "A6"],
        sunk: false,
        targetedSquares: [],
        type: "destroyer",
        orientation: "horizontal",
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

//   Gameboard instantiation

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

//   Board generation logic

test("Gameboard is the correct length", () => {
    const testGameBoard = new Gameboard();

    expect(testGameBoard.board.length).toBe(11);
    expect(testGameBoard.board[0].length).toBe(11);
});

test("has correct column headers", () => {
    const testGameBoard = new Gameboard();

    expect(testGameBoard.board[0]).toStrictEqual([
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

//   Ship placement validation

describe("Gameboard - placeShip", () => {
    let testGameBoard;

    beforeEach(() => {
        // 3. Initialize mock with implementation
        mockPrompt.mockReset();
        mockPrompt = jest
            .fn()
            .mockReturnValueOnce("A9-A10")
            .mockReturnValueOnce("H10-J10")
            .mockReturnValueOnce("A1-A3")
            .mockReturnValueOnce("G1-J1")
            .mockReturnValueOnce("E4-E8");
        testGameBoard = new Gameboard();
        testGameBoard.placeShip();
    });

    test("Ship exists", () => {
        // Verify ship placement
        expect(testGameBoard.ships).toHaveLength(5);
        expect(testGameBoard.occupiedCells).toEqual([
            "A9",
            "A10",
            "H10",
            "I10",
            "J10",
            "A1",
            "A2",
            "A3",
            "G1",
            "H1",
            "I1",
            "J1",
            "E4",
            "E5",
            "E6",
            "E7",
            "E8",
        ]);
    });

    //   A ship should be placed only within valid board coordinates.
    //   The board should correctly update when a ship is placed.
    test("Ship is placed in valid board coordinates", () => {
        // Patrol (A9-A10) - vertical
        expect(testGameBoard.board[9][1]).toBe("P"); // A9 (row 10)
        expect(testGameBoard.board[10][1]).toBe("P"); // A10 (row 11)

        // Submarine (B3-B5) - vertical
        expect(testGameBoard.board[3][2]).toBe("S"); // B3 (row 4)
        expect(testGameBoard.board[4][2]).toBe("S"); // B4 (row 5)
        expect(testGameBoard.board[5][2]).toBe("S"); // B5 (row 6)

        // Destroyer (C7-E7) - horizontal
        expect(testGameBoard.board[7][3]).toBe("D"); // C7 (column 3)
        expect(testGameBoard.board[7][4]).toBe("D"); // D7 (column 4)
        expect(testGameBoard.board[7][5]).toBe("D"); // E7 (column 5)

        // Battleship (D10-G10) - horizontal
        expect(testGameBoard.board[10][4]).toBe("B"); // D10 (column 4)
        expect(testGameBoard.board[10][5]).toBe("B"); // E10 (column 5)
        expect(testGameBoard.board[10][6]).toBe("B"); // F10 (column 6)
        expect(testGameBoard.board[10][7]).toBe("B"); // G10 (column 7)

        // Carrier (H4-H8) - vertical
        expect(testGameBoard.board[4][8]).toBe("C"); // H4 (row 5)
        expect(testGameBoard.board[5][8]).toBe("C"); // H5 (row 6)
        expect(testGameBoard.board[6][8]).toBe("C"); // H6 (row 7)
        expect(testGameBoard.board[7][8]).toBe("C"); // H7 (row 8)
        expect(testGameBoard.board[8][8]).toBe("C"); // H8 (row 9)
    });

    //     The length of the ship must match the expected ship type.

    test("Ships have the correct length", () => {
        //Patrol ship
        expect(testGameBoard.ships[0].length).toBe(2);

        //Submarine ship
        expect(testGameBoard.ships[1].length).toBe(3);

        //Destroyer ship
        expect(testGameBoard.ships[2].length).toBe(3);

        //Battleship ship
        expect(testGameBoard.ships[3].length).toBe(4);

        //Carrier ship
        expect(testGameBoard.ships[4].length).toBe(5);
    });

    //     Ships should be placed either horizontally or vertically but never diagonally.
    test("Ship is placed correctly horizontal or vertical", () => {
        //Patrol ship
        expect(testGameBoard.ships[0].orientation).toBe("vertical");

        //Submarine ship
        expect(testGameBoard.ships[1].orientation).toBe("horizontal");

        //Destroyer ship
        expect(testGameBoard.ships[2].orientation).toBe("vertical");

        //Battleship ship
        expect(testGameBoard.ships[3].orientation).toBe("horizontal");

        //Carrier ship
        expect(testGameBoard.ships[4].orientation).toBe("vertical");
    });
});

//   Out-of-bounds detection

//   Coordinate parsing and validation
//   Error handling scenarios

// [
//     Ship {
//       damage: 0,
//       sunk: false,
//       targetedSquares: [],
//       length: 2,
//       placement: [ 'A9', 'A10' ],
//       type: 'patrol',
//       orientation: 'vertical'
//     },
//     Ship {
//       damage: 0,
//       sunk: false,
//       targetedSquares: [],
//       length: 3,
//       placement: [ 'H10', 'I10', 'J10' ],
//       type: 'submarine',
//       orientation: 'horizontal'
//     },
//     Ship {
//       damage: 0,
//       sunk: false,
//       targetedSquares: [],
//       length: 3,
//       placement: [ 'A1', 'A2', 'A3' ],
//       type: 'destroyer',
//       orientation: 'vertical'
//     },
//     Ship {
//       damage: 0,
//       sunk: false,
//       targetedSquares: [],
//       length: 4,
//       placement: [ 'G1', 'H1', 'I1', 'J1' ],
//       type: 'battleship',
//       orientation: 'horizontal'
//     },
//     Ship {
//       damage: 0,
//       sunk: false,
//       targetedSquares: [],
//       length: 5,
//       placement: [ 'E4', 'E5', 'E6', 'E7', 'E8' ],
//       type: 'carrier',
//       orientation: 'vertical'
//     }
//   ]
//   [
//     'A9',  'A10', 'H10', 'I10',
//     'J10', 'A1',  'A2',  'A3',
//     'G1',  'H1',  'I1',  'J1',
//     'E4',  'E5',  'E6',  'E7',
//     'E8'
//   ]
