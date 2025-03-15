export { Ship, Gameboard };
import promptSync from "prompt-sync";

const prompt = promptSync();

class Ship {
    constructor(length, placement, type, orientation) {
        //properties
        this.damage = 0;
        this.sunk = false;

        //public properties
        this.length = length;
        this.placement = placement;
        this.type = type;
        this.orientation = orientation;
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
        this.ships = [];
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
        this.printBoard(this.board);
        const shipTypes = [
            { length: 2, type: "patrol" },
            { length: 3, type: "submarine" },
            { length: 3, type: "destroyer" },
            { length: 4, type: "battleship" },
            { length: 5, type: "carrier" },
        ];

        const coordinateRegex = /^([A-Z]+)(\d+)-([A-Z]+)(\d+)$/; // Matches format "A2-A5"

        shipTypes.forEach((ship) => {
            let shipPlacement = this.promptShip(ship);
            let match = shipPlacement.match(coordinateRegex);

            console.log(`Match? : ${match}`);

            let startingCoordinate = match[1] + match[2]; // e.g., "A2"
            let endCoordinate = match[3] + match[4]; // e.g., "A5"

            let boatLength = this.lengthOfBoat(
                startingCoordinate,
                endCoordinate,
            );

            let lengthsMatch = this.boatLengthEqualsShipType(
                boatLength,
                ship.length,
            );

            while (!match || !lengthsMatch || match === null) {
                this.printBoard(this.board);

                if (!match || match === null) {
                    console.error(
                        "Invalid coordinate format. Please use the format 'A2-A5'.",
                    );
                } else if (!lengthsMatch) {
                    console.error(
                        `You're coordinates are the incorrect length.\nYour coordinate length: ${boatLength}\nBoat length: ${ship.length}\n`,
                    );
                } else if (
                    !lengthsMatch &&
                    match[1] != match[3] &&
                    match[2] != match[4]
                ) {
                    console.error(
                        `It's not possible to place pieces diagonally`,
                    );
                }
                shipPlacement = this.promptShip(ship);

                match = shipPlacement.match(coordinateRegex);

                startingCoordinate = match[1] + match[2]; // e.g., "A2"
                endCoordinate = match[3] + match[4]; // e.g., "A5"

                boatLength = this.lengthOfBoat(
                    startingCoordinate,
                    endCoordinate,
                );

                lengthsMatch = this.boatLengthEqualsShipType(
                    boatLength,
                    ship.length,
                );
            }
            console.log("Starting coordinate: " + startingCoordinate);
            console.log("Ending coordinate: " + endCoordinate);

            const orientation = this.changeBoard(
                startingCoordinate,
                endCoordinate,
                this.board,
                ship,
            );

            this.ships.push(
                new Ship(
                    boatLength,
                    `${startingCoordinate}-${endCoordinate}`,
                    ship.type,
                    orientation,
                ),
            );
            this.printBoard(this.board);
        });
    }

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

        let orientation = "";

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

        if (columnStart === columnEnd) {
            orientation = "vertical";

            // Find column index
            const columnIndex = uppercaseLetters.indexOf(columnStart);

            console.log("Column index:", columnIndex);

            // Change board cells for vertical placement
            for (let i = rowStart; i <= rowEnd; i++) {
                board[i][columnIndex] = ship.type.slice(0, 1).toUpperCase();
            }
        } else if (rowStart === rowEnd) {
            orientation = "horizontal";

            // Find column indexes
            const columnIndexStart = uppercaseLetters.indexOf(columnStart);
            const columnIndexEnd = uppercaseLetters.indexOf(columnEnd);

            console.log("Column indexes:", columnIndexStart, columnIndexEnd);

            // Change board cells for horizontal placement
            for (let i = columnIndexStart; i <= columnIndexEnd; i++) {
                board[rowStart][i] = ship.type.slice(0, 1).toUpperCase();
            }
        }
        return orientation;
    }

    lengthOfBoat(startCoords, endCoords) {
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

        const matchStart = startCoords.match(/^([A-Z]+)(\d+)$/);
        const matchEnd = endCoords.match(/^([A-Z]+)(\d+)$/);

        const columnStart = matchStart[1]; // Letter part (Columns)
        const columnEnd = matchEnd[1];
        const rowStart = Number(matchStart[2]); // Number part (Rows)
        const rowEnd = Number(matchEnd[2]);

        console.log(columnStart, columnEnd, rowStart, rowEnd);

        let boatLength = 0;

        if (columnStart === columnEnd) {
            console.log("vertical");

            for (let i = rowStart; i <= rowEnd; i++) {
                boatLength++;
            }
        } else if (rowStart === rowEnd) {
            console.log("horizontal");

            // Find column indexes
            const columnIndexStart = uppercaseLetters.indexOf(columnStart);
            const columnIndexEnd = uppercaseLetters.indexOf(columnEnd);

            console.log("Column indexes:", columnIndexStart, columnIndexEnd);

            for (let i = columnIndexStart; i <= columnIndexEnd; i++) {
                boatLength++;
            }
        }

        console.log("boat length:", boatLength);
        return boatLength;
    }

    boatLengthEqualsShipType(boatLength, shipTypeLength) {
        console.log(
            `boat length: ${boatLength}, ship length: ${shipTypeLength}`,
        );
        if (boatLength === shipTypeLength) {
            return true;
        } else {
            return false;
        }
    }

    promptShip(ship) {
        console.log(
            `Enter coordinates for \nship type: ${ship.type.toUpperCase()}, length: ${ship.length}\n(Provide ${ship.length} grid coordinates in the format {startingCoordinate}-{endCoordinate}, such as: A2-A5)\n`,
        );

        let shipPlacement = prompt("Enter your coordinate: ")
            .trim()
            .toUpperCase();

        console.log(`\n Your answer is: "${shipPlacement}" \n`);

        return shipPlacement;
    }

    errorMessage(match, length) {}
}

const gameboard = new Gameboard();
gameboard.placeShip();
console.log(gameboard.ships);
