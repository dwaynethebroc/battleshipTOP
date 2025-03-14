export { Ship, Gameboard };
import promptSync from "prompt-sync";

const prompt = promptSync();

class Ship {
    constructor(length, placement, type) {
        //properties
        this.damage = 0;
        this.sunk = false;
        this.targetedSquares = [];

        //public properties
        this.length = length;
        this.placement = placement;
        this.type = type;
    }

    hit(square) {
        const hitShip = this.placement.includes(square);
        const alreadyHit = this.targetedSquares.includes(square);

        if (alreadyHit) {
            // this.message(
            //     `You have already selected ${square} before, choose another tile to hit`,
            // );

            return;
        } else if (hitShip && !alreadyHit) {
            this.damage++;
            this.targetedSquares.push(square);

            // this.message(
            //     `Battleship is hit: ${this.type} \n Damage: ${this.damage} \n Squares hit: ${this.targetedSquares}`,
            // );

            return true;
        } else {
            // this.message(`MISS: no Battleship was hit`);
            return false;
        }
    }

    isSunk() {
        if (this.targetedSquares.length === this.placement.length) {
            // this.message(this.targetedSquares);
            // this.message(this.placement);

            this.sunk = true;
            return true;
        } else {
            return false;
        }
    }

    message(message) {
        console.log(message);
    }
}

class Gameboard {
    constructor() {
        this.board = this.createBoard();
    }

    createBoard() {
        const board = [];
        const uppercaseLetters = [
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
        ];

        for (let i = 0; i < uppercaseLetters.length + 1; i++) {
            const row = [];
            for (let j = 0; j <= 10; j++) {
                if (i === 0 && j === 0) {
                    row.push("  ");
                } else if (i === 0) {
                    row.push(`${uppercaseLetters[j - 1]}`);
                } else if (j === 0) {
                    row.push(String(i).padStart(2, " ")); // Row headers (1-10) with padding
                } else {
                    row.push(`~`);
                }
            }
            board.push(row);
        }
        return board;
    }

    printBoard(board) {
        board.forEach((row) => console.log(row.join(" ")));
    }

    placeShip() {
        const shipTypes = [
            { length: 2, type: "patrol" },
            { length: 3, type: "submarine" },
            { length: 3, type: "destroyer" },
            { length: 4, type: "battleship" },
            { length: 5, type: "carrier" },
        ];
        const shipCoordinates = [];

        const coordinateRegex = /^([A-Z]+)(\d+)-([A-Z]+)(\d+)$/; // Matches format like "A2-A5"

        shipTypes.forEach((ship) => {
            this.printBoard(this.board);

            console.log(
                `Enter coordinates for \nship type: ${ship.type.toUpperCase()}\nlength: ${ship.length}\n(Provide ${ship.length} grid coordinates in the format {startingCoordinate}-{endCoordinate}, such as: A2-A5)\n`,
            );

            let shipPlacement = prompt("Enter your coordinate: ")
                .trim()
                .toUpperCase();

            console.log(`\n Your answer is: "${shipPlacement}" \n`);

            let match = shipPlacement.match(coordinateRegex);

            const boatLength = Number(match[4]) - Number(match[2]);
            let lengthsMatch = false;

            if (boatLength === ship.length) {
                lengthsMatch = true;
            }

            while (!match) {
                if (lengthsMatch === false) {
                    console.error(
                        `You're coordinates are the incorrect length. \n
                  Your coordinate lenght: ${boatLength}\n
                  Boat length: ${ship.length}\n`,
                    );
                }
                console.error(
                    "Invalid coordinate format. Please use the format 'A2-A5'.",
                );

                shipPlacement = prompt("Enter your coordinate: ")
                    .trim()
                    .toUpperCase();
            }

            const startingCoordinate = match[1] + match[2]; // e.g., "A2"
            const endCoordinate = match[3] + match[4]; // e.g., "A5"

            console.log("Starting coordinate: " + startingCoordinate);
            console.log("Ending coordinate: " + endCoordinate);

            this.changeBoard(
                startingCoordinate,
                endCoordinate,
                this.board,
                ship,
            );

            console.log("Finished changing board");

            this.printBoard(this.board);
        });
    }

    // placeShip() {
    //     const shipTypes = [
    //         { length: 2, type: "patrol" },
    //         { length: 3, type: "submarine" },
    //         { length: 3, type: "destroyer" },
    //         { length: 4, type: "battleship" },
    //         { length: 5, type: "carrier" },
    //     ];
    //     const shipCoordinates = [];

    //     shipTypes.forEach((ship) => {
    //         this.printBoard(this.board);

    //         console.log(
    //             `Enter coordinates for \nship type: ${ship.type.toUpperCase()}\nlength: ${ship.length}\n(Provide ${ship.length} grid coordinates in the format { {startingCoordinate}-{endCoordinate} such as: (A2-A3))\n`,
    //         );

    //         const shipPlacement = prompt("Enter your coordinate: ");

    //         console.log(`\n Your answer is: "${shipPlacement}" \n`);

    //         const startingCoordinate = shipPlacement.slice(0, 2);
    //         const endCoordinate = shipPlacement.slice(-2);

    //         // console.log("Starting coordinate " + startingCoordinate);
    //         // console.log("Ending coordinate " + endCoordinate);

    //         this.changeBoard(
    //             startingCoordinate,
    //             endCoordinate,
    //             this.board,
    //             ship,
    //         );

    //         console.log("finished changing board");

    //         this.printBoard(this.board);
    //     });
    // }

    // changeBoard(startCoords, endCoords, board, ship) {
    //     const rowStart = startCoords.slice(0, 1);
    //     const rowEnd = endCoords.slice(0, 1);
    //     const columnStart = Number(startCoords.slice(1));
    //     const columnEnd = Number(endCoords.slice(1));

    //     const uppercaseLetters = [
    //         " ",
    //         "A",
    //         "B",
    //         "C",
    //         "D",
    //         "E",
    //         "F",
    //         "G",
    //         "H",
    //         "I",
    //         "J",
    //     ];

    //     console.log(rowStart);
    //     console.log(rowEnd);
    //     console.log(columnStart);
    //     console.log(columnEnd);

    //     if (rowStart === rowEnd) {
    //         console.log("horizontal");

    //         //length of boat
    //         const boatLength = columnEnd - columnStart;

    //         console.log(boatLength);

    //         //find row in array and save index
    //         const rowLetter = uppercaseLetters.find(
    //             (element) => element === rowStart,
    //         );
    //         const rowIndex = uppercaseLetters.indexOf(rowLetter);

    //         console.log(rowIndex);

    //         //change cells the ship will occupy to the starting letter of the ship
    //         for (let i = columnStart; i <= columnEnd; i++) {
    //             //edit each cell of the corresponding row and column between beginning and end row
    //             board[i][rowIndex] = ship.type.slice(0, 1).toUpperCase();
    //         }
    //     } else if (columnStart === columnEnd) {
    //         console.log("vertical");

    //         //find index of starting letter
    //         const rowLetterStart = uppercaseLetters.find(
    //             (element) => element === rowStart,
    //         );
    //         const rowIndexStart = uppercaseLetters.indexOf(rowLetterStart);

    //         //find index of ending letter
    //         const rowLetterEnd = uppercaseLetters.find(
    //             (element) => element === rowEnd,
    //         );

    //         const rowIndexEnd = uppercaseLetters.indexOf(rowLetterEnd);

    //         //find boat length from beginning and end
    //         const boatLength = rowIndexEnd - rowIndexStart;

    //         console.log(boatLength);

    //         console.log(columnStart);

    //         for (let i = rowIndexStart; i <= rowIndexEnd; i++) {
    //             //edit each cell of the corresponding row and column between beginning and end row
    //             board[columnStart][i] = ship.type.slice(0, 1).toUpperCase();
    //         }
    //     }
    // }

    changeBoard(startCoords, endCoords, board, ship) {
        const matchStart = startCoords.match(/^([A-Z]+)(\d+)$/);
        const matchEnd = endCoords.match(/^([A-Z]+)(\d+)$/);

        if (!matchStart || !matchEnd) {
            console.error("Invalid coordinates format");
            return;
        }

        const columnStart = matchStart[1]; // Letter part (Columns)
        const columnEnd = matchEnd[1];
        const rowStart = Number(matchStart[2]); // Number part (Rows)
        const rowEnd = Number(matchEnd[2]);

        const uppercaseLetters = [
            " ",
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
        ];

        console.log(columnStart, columnEnd, rowStart, rowEnd);

        if (columnStart === columnEnd) {
            console.log("vertical");

            // Find column index
            const columnIndex = uppercaseLetters.indexOf(columnStart);

            console.log("Column index:", columnIndex);

            // Change board cells for vertical placement
            for (let i = rowStart; i <= rowEnd; i++) {
                board[i][columnIndex] = ship.type.slice(0, 1).toUpperCase();
            }
        } else if (rowStart === rowEnd) {
            console.log("horizontal");

            // Find column indexes
            const columnIndexStart = uppercaseLetters.indexOf(columnStart);
            const columnIndexEnd = uppercaseLetters.indexOf(columnEnd);

            console.log("Column indexes:", columnIndexStart, columnIndexEnd);

            // Change board cells for horizontal placement
            for (let i = columnIndexStart; i <= columnIndexEnd; i++) {
                board[rowStart][i] = ship.type.slice(0, 1).toUpperCase();
            }
        }
    }
}

const gameboard = new Gameboard();
gameboard.placeShip();
