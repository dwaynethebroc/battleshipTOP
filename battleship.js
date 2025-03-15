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
        const shipTypes = [
            { length: 2, type: "patrol" },
            { length: 3, type: "submarine" },
            { length: 3, type: "destroyer" },
            { length: 4, type: "battleship" },
            { length: 5, type: "carrier" },
        ];

        const coordinateRegex = /^([A-Z]+)(\d+)-([A-Z]+)(\d+)$/; // Matches format "A2-A5"

        shipTypes.forEach((ship) => {
            let shipPlacement = this.promptShip();
            let match = shipPlacement.match(coordinateRegex);

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

            while (!match && !lengthsMatch) {
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

                shipPlacement = this.promptShip();

                match = shipPlacement.match(coordinateRegex);

                startingCoordinate = match[1] + match[2]; // e.g., "A2"
                endCoordinate = match[3] + match[4]; // e.g., "A5"

                let boatLength = this.lengthOfBoat(
                    startingCoordinate,
                    endCoordinate,
                );

                let lengthsMatch = this.boatLengthEqualsShipType(
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

            return "vertical";
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

            return "horizontal";
        }
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

        let boatLength = 0;

        if (columnStart === columnEnd) {
            console.log("horizontal");

            boatLength = rowEnd - rowStart;
        } else if (rowStart === rowEnd) {
            console.log("vertical");

            // Find column indexes
            const columnIndexStart = uppercaseLetters.indexOf(columnStart);
            const columnIndexEnd = uppercaseLetters.indexOf(columnEnd);

            console.log("Column indexes:", columnIndexStart, columnIndexEnd);

            boatLength = columnIndexEnd - columnIndexStart;
        }

        return boatLength;
    }

    boatLengthEqualsShipType(boatLength, shipType) {
        if (boatLength === shipType) {
            return true;
        } else {
            return false;
        }
    }

    promptShip() {
        this.printBoard(this.board);

        console.log(
            `Enter coordinates for \nship type: ${ship.type.toUpperCase()}\nlength: ${ship.length}\n(Provide ${ship.length} grid coordinates in the format {startingCoordinate}-{endCoordinate}, such as: A2-A5)\n`,
        );

        let shipPlacement = prompt("Enter your coordinate: ")
            .trim()
            .toUpperCase();

        console.log(`\n Your answer is: "${shipPlacement}" \n`);

        return shipPlacement;
    }
}

const gameboard = new Gameboard();
gameboard.placeShip();
