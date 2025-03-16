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

//   Ship placement validation

describe('Gameboard - placeShip', () => {
    const testGameBoard = new Gameboard();
    
    beforeEach(() => {
        jest.spyOn(testGameBoard, 'promptShip') // Mocks function
            .mockImplementationOnce(() => "A9-A10"); //ship 1 placement
            .mockImplementationOnce(() => "H10-J10"); //ship 2 placement
            .mockImplementationOnce(() => "H1-J1"); //etc
            .mockImplementationOnce(() => "A1-A4");
            .mockImplementationOnce(() => "C6-G6");
    });

    afterEach(() => {
        jest.restoreAllMocks(); //reset mocks after each test
    })

    //   A ship should be placed only within valid board coordinates.
    test('Ship is placed in valid board coordinates', () => {
        testGameboard.placeShip(); //starts mock response

        //Patrol ship
        expect(testGameBoard.board[10][1]).toBe("P");
        expect(testGameBoard.board[11][1]).toBe("P");
        
        //Submarine ship
        expect(testGameBoard.board[10][8]).toBe("S");
        expect(testGameBoard.board[10][9]).toBe("S");
        expect(testGameBoard.board[10][10]).toBe("S");
        
        //Destroyer ship
        expect(testGameBoard.board[1][8]).toBe("D");
        expect(testGameBoard.board[1][9]).toBe("D");
        expect(testGameBoard.board[1][10]).toBe("D");

        //Battleship ship
        expect(testGameBoard.board[1][1]).toBe("B");
        expect(testGameBoard.board[1][2]).toBe("B");
        expect(testGameBoard.board[1][3]).toBe("B");
        expect(testGameBoard.board[1][4]).toBe("B");

        //Carrier ship
        expect(testGameBoard.board[3][6]).toBe("C");
        expect(testGameBoard.board[4][6]).toBe("C");
        expect(testGameBoard.board[5][6]).toBe("C");
        expect(testGameBoard.board[6][6]).toBe("C");
        expect(testGameBoard.board[7][6]).toBe("C");

    });

    //     The length of the ship must match the expected ship type.
    test('Ship is placed in valid board coordinates', () => {
        testGameboard.placeShip(); //starts mock response

        //Patrol ship
        expect(testGameboard.ships[0].length).toBe(2)
        
        //Submarine ship
        expect(testGameboard.ships[1].length).toBe(3)
        
        //Destroyer ship
        expect(testGameboard.ships[2].length).toBe(3)


        //Battleship ship
        expect(testGameboard.ships[3].length).toBe(4)


        //Carrier ship
        expect(testGameboard.ships[4].length).toBe(5)
    });


    //     Ships should not overlap.
    test('Ship is placed in valid board coordinates', () => {
        testGameboard.placeShip(); //starts mock response

        //Patrol ship
        expect(testGameboard.ships[0].length).toBe(2)
        
        //Submarine ship
        expect(testGameboard.ships[1].length).toBe(3)
        
        //Destroyer ship
        expect(testGameboard.ships[2].length).toBe(3)


        //Battleship ship
        expect(testGameboard.ships[3].length).toBe(4)


        //Carrier ship
        expect(testGameboard.ships[4].length).toBe(5)
    });
    //     Ships should be placed either horizontally or vertically but never diagonally.
    //     The board should correctly update when a ship is placed.

});

    //   Collision detection
    //   Out-of-bounds detection
    //   Coordinate parsing and validation
    //   Error handling scenarios


//     const shipObjects = [
//         Ship {
//           damage: 0,
//           sunk: false,
//           length: 2,
//           placement: [ 'A9', 'A10' ],
//           type: 'patrol',
//           orientation: 'vertical'
//         },
//         Ship {
//           damage: 0,
//           sunk: false,
//           length: 3,
//           placement: [ 'H10', 'I10', 'J10' ],
//           type: 'submarine',
//           orientation: 'horizontal'
//         },
//         Ship {
//           damage: 0,
//           sunk: false,
//           length: 3,
//           placement: [ 'H1', 'I1', 'J1' ],
//           type: 'destroyer',
//           orientation: 'horizontal'
//         },
//         Ship {
//           damage: 0,
//           sunk: false,
//           length: 4,
//           placement: [ 'A1', 'A2', 'A3', 'A4' ],
//           type: 'battleship',
//           orientation: 'vertical'
//         },
//         Ship {
//           damage: 0,
//           sunk: false,
//           length: 5,
//           placement: [ 'C6', 'D6', 'E6', 'F6', 'G6' ],
//           type: 'carrier',
//           orientation: 'horizontal'
//         }
//       ]
// const occupiedCells =   [
//     'A9',  'A10', 'H10', 'I10',
//     'J10', 'H1',  'I1',  'J1',
//     'A1',  'A2',  'A3',  'A4',
//     'C6',  'D6',  'E6',  'F6',
//     'G6'
//   ]