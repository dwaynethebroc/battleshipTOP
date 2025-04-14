// export { Ship, Gameboard };
// import promptSync from "prompt-sync";
// import { styleText } from "node:util";

// const prompt = promptSync();

class Ship {
    constructor(length, placement, type, orientation) {
        //properties
        this.damage = 0;
        this.sunk = false;
        this.targetedSquares = [];

        //public properties
        this.length = length;
        this.placement = placement;
        this.type = type;
        this.orientation = orientation;
    }

    hit(square) {
        if (this.targetedSquares.includes(square)) {
            console.log(
                "square has already been targeted, choose another square",
            );
            return square;
        }

        const hitShip = this.placement.includes(square);

        if (hitShip) {
            this.damage++;
            this.targetedSquares.push(square);
            if (this.isSunk()) {
                console.log(`${this.type.toUpperCase()} has been sunk!`);
            }
            return true;
        } else {
            return false;
        }
    }

    isSunk() {
        const sortedTarget = [...this.targetedSquares].sort();
        const sortedPlacement = [...this.placement].sort();

        if (JSON.stringify(sortedTarget) === JSON.stringify(sortedPlacement)) {
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
    constructor(player, name, gameMode) {
        this.playerType = player;
        this.name = name;
        this.gameMode = gameMode;

        this.board = this.createBoard();
        this.opponentsBoard = this.createBoard();
        this.ships = [];
        this.occupiedCells = [];
        this.playersGuesses = [];
        this.missedAttacks = [];
        this.opponentsGuesses = [];

        //Computer only controls

        this.temporaryHit = [];
        this.educatedGuesses = [];

        //references
        this.uppercaseLetters = [
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
        if (
            board === this.board &&
            this.playerType === "human" &&
            this.gameMode === "vsComputer"
        ) {
            console.log(`\n      Your Board      \n`);
        } else if (
            board === this.opponentsBoard &&
            this.playerType === "human" &&
            this.gameMode === "vsComputer"
        ) {
            console.log(`\n      Your Guesses \n`);
        } else if (
            board === this.board &&
            this.playerType === "computer" &&
            this.gameMode === "vsComputer"
        ) {
            console.log(`\n      Opponents Board \n`);
        } else if (
            board === this.opponentsBoard &&
            this.playerType === "computer" &&
            this.gameMode === "vsComputer"
        ) {
            console.log(`\n      Opponents Guesses \n`);
        } else if (
            board === this.opponentsBoard &&
            this.playerType === "human" &&
            this.gameMode === "PVP"
        ) {
            console.log(`\n      ${this.name}'s Guesses \n`);
        }

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

            while (!match || shipPlacement === "") {
                this.printBoard(this.board);
                shipPlacement = this.promptShip(ship);
                match = shipPlacement.match(coordinateRegex);
            }

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

            let outOfBounds = this.outOfBounds(
                boatLength,
                startingCoordinate,
                endCoordinate,
            );

            let alreadyPlaced = this.alreadyPlaced(
                startingCoordinate,
                endCoordinate,
            );

            while (!lengthsMatch || outOfBounds || alreadyPlaced) {
                this.printBoard(this.board);

                this.errorMessage(
                    match,
                    lengthsMatch,
                    boatLength,
                    ship.length,
                    outOfBounds,
                    alreadyPlaced,
                );

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

                outOfBounds = this.outOfBounds(
                    boatLength,
                    startingCoordinate,
                    endCoordinate,
                );

                alreadyPlaced = this.alreadyPlaced(
                    startingCoordinate,
                    endCoordinate,
                );
            }

            let orientation = this.orientation(
                startingCoordinate,
                endCoordinate,
            );

            const placement = this.changeBoard(
                startingCoordinate,
                endCoordinate,
                this.board,
                ship,
            );

            this.ships.push(
                new Ship(boatLength, placement, ship.type, orientation),
            );
            this.printBoard(this.board);
        });
    }

    promptShip(ship) {
        console.log(
            `Enter coordinates for \nship type: ${ship.type.toUpperCase()}, length: ${ship.length}\n(Provide ${ship.length} grid coordinates in the format {startingCoordinate}-{endCoordinate}, such as: A2-A5)\n`,
        );

        const response = prompt("Enter your coordinate: ");

        return response.trim().toUpperCase();
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

        const placement = [];

        if (columnStart === columnEnd) {
            // Find column index
            const columnIndex = this.uppercaseLetters.indexOf(columnStart);

            // Change board cells for vertical placement
            for (let i = rowStart; i <= rowEnd; i++) {
                board[i][columnIndex] = ship.type.slice(0, 1).toUpperCase();
                this.occupiedCells.push(
                    `${this.uppercaseLetters[columnIndex]}${i}`,
                );
                placement.push(`${this.uppercaseLetters[columnIndex]}${i}`);
            }
        } else if (rowStart === rowEnd) {
            // Find column indexes
            const columnIndexStart = this.uppercaseLetters.indexOf(columnStart);
            const columnIndexEnd = this.uppercaseLetters.indexOf(columnEnd);

            // Change board cells for horizontal placement
            for (let i = columnIndexStart; i <= columnIndexEnd; i++) {
                board[rowStart][i] = ship.type.slice(0, 1).toUpperCase();
                this.occupiedCells.push(
                    `${this.uppercaseLetters[i]}${rowStart}`,
                );
                placement.push(`${this.uppercaseLetters[i]}${rowStart}`);
            }
        }
        return placement;
    }

    lengthOfBoat(startCoords, endCoords) {
        const matchStart = startCoords.match(/^([A-Z]+)(\d+)$/);
        const matchEnd = endCoords.match(/^([A-Z]+)(\d+)$/);

        const columnStart = matchStart[1]; // Letter part (Columns)
        const columnEnd = matchEnd[1];
        const rowStart = Number(matchStart[2]); // Number part (Rows)
        const rowEnd = Number(matchEnd[2]);

        // Find column indexes
        const columnIndexStart = this.uppercaseLetters.indexOf(columnStart);
        const columnIndexEnd = this.uppercaseLetters.indexOf(columnEnd);

        let boatLength = 0;

        if (columnStart === columnEnd) {
            for (let i = rowStart; i <= rowEnd; i++) {
                boatLength++;
            }
        } else if (rowStart === rowEnd) {
            for (let i = columnIndexStart; i <= columnIndexEnd; i++) {
                boatLength++;
            }
        } else if (rowEnd > rowStart && columnIndexEnd > columnIndexStart) {
            for (let i = rowStart; i <= rowEnd; i++) {
                boatLength++;
            }
        }

        return boatLength;
    }

    boatLengthEqualsShipType(boatLength, shipTypeLength) {
        if (boatLength === shipTypeLength) {
            return true;
        } else {
            return false;
        }
    }

    errorMessage(
        match,
        length,
        userInput,
        shipLength,
        outOfBounds,
        alreadyPlaced,
    ) {
        if (!length && match[1] != match[3] && match[2] != match[4]) {
            console.error(`It's not possible to place pieces diagonally`);
        } else if (Number(match[4]) < Number(match[2])) {
            console.error(
                "Make sure to place ships with coordinates Left to Right, Top to Bottom",
            );
        } else if (!match || match === null) {
            console.error(
                "Invalid coordinate format. Please use the format 'A2-A5'.",
            );
        } else if (!length) {
            console.error(
                `Your coordinates are the incorrect length.\nYour coordinate length: ${userInput}\nBoat length: ${shipLength}\n`,
            );
        } else if (outOfBounds) {
            console.error(
                `Your coordinates are out of the bounds of the grid. Pick gridpoints between A-J and 1-10`,
            );
        } else if (alreadyPlaced) {
            console.error(
                `You have already placed a ship on atleast one of your chosen squares. Pick a new coordinate range.`,
            );
        }
    }

    outOfBounds(boatLength, startCoords, endCoords) {
        const matchStart = startCoords.match(/^([A-Z]+)(\d+)$/);
        const matchEnd = endCoords.match(/^([A-Z]+)(\d+)$/);

        const columnStart = matchStart[1]; // Letter part (Columns)
        const columnEnd = matchEnd[1];
        const rowStart = Number(matchStart[2]); // Number part (Rows)
        const rowEnd = Number(matchEnd[2]);

        // Find column indexes
        const columnIndexStart = this.uppercaseLetters.indexOf(columnStart);

        if (columnStart === columnEnd) {
            if (rowStart + boatLength <= 11 && rowStart > 0) {
                return false;
            } else {
                return true;
            }
        } else if (rowStart === rowEnd) {
            if (
                columnIndexStart + boatLength <= this.uppercaseLetters.length &&
                columnIndexStart > 0
            ) {
                return false;
            } else {
                return true;
            }
        }
    }

    orientation(startCoords, endCoords) {
        const matchStart = startCoords.match(/^([A-Z]+)(\d+)$/);
        const matchEnd = endCoords.match(/^([A-Z]+)(\d+)$/);

        const columnStart = matchStart[1]; // Letter part (Columns)
        const columnEnd = matchEnd[1];
        const rowStart = Number(matchStart[2]); // Number part (Rows)
        const rowEnd = Number(matchEnd[2]);

        const columnIndexStart = this.uppercaseLetters.indexOf(columnStart);
        const columnIndexEnd = this.uppercaseLetters.indexOf(columnEnd);

        if (columnStart === columnEnd) {
            return "vertical";
        } else if (rowStart === rowEnd) {
            return "horizontal";
        } else if (rowEnd > rowStart && columnIndexEnd > columnIndexStart) {
            return "diagonal";
        }
    }

    alreadyPlaced(startCoords, endCoords) {
        const matchStart = startCoords.match(/^([A-Z]+)(\d+)$/);
        const matchEnd = endCoords.match(/^([A-Z]+)(\d+)$/);

        const columnStart = matchStart[1]; // Letter part (Columns)
        const columnEnd = matchEnd[1];
        const rowStart = Number(matchStart[2]); // Number part (Rows)
        const rowEnd = Number(matchEnd[2]);

        const placement = [];

        if (columnStart === columnEnd) {
            // Find column index
            const columnIndex = this.uppercaseLetters.indexOf(columnStart);

            // Push coordinates of gridpoint to placement array
            for (let i = rowStart; i <= rowEnd; i++) {
                placement.push(`${this.uppercaseLetters[columnIndex]}${i}`);
            }
        } else if (rowStart === rowEnd) {
            // Find column indexes
            const columnIndexStart = this.uppercaseLetters.indexOf(columnStart);
            const columnIndexEnd = this.uppercaseLetters.indexOf(columnEnd);

            // Push coordinates of gridpoint to placement array
            for (let i = columnIndexStart; i <= columnIndexEnd; i++) {
                placement.push(`${this.uppercaseLetters[i]}${rowStart}`);
            }
        }

        //go through each gridpoint and see if one of them has is already occupied by a ship
        let set1 = new Set(this.occupiedCells);
        return placement.some((item) => set1.has(item));
    }

    allSunk() {
        let allSunk = [];

        this.ships.forEach((ship) => {
            allSunk.push(ship.sunk);
        });

        if (allSunk.includes(false)) {
            console.log("All ships not sunk yet");
            return false;
        } else {
            console.log("All ships have been sunk");
            return true;
        }
    }

    boardSetupHuman() {
        //Setup the board
        this.placeShip();
    }

    verticalOrHorizontal() {
        const vertHorizontal = ["vertical", "horizontal"];

        const verticalOrHorizontal = vertHorizontal[Math.round(Math.random())];

        return verticalOrHorizontal;
    }

    boardSetupComputer() {
        const shipTypes = [
            { length: 2, type: "patrol" },
            { length: 3, type: "submarine" },
            { length: 3, type: "destroyer" },
            { length: 4, type: "battleship" },
            { length: 5, type: "carrier" },
        ];

        shipTypes.forEach((ship) => {
            let outOfBounds = true;
            let alreadyPlaced = true;
            let orientationOfShip = "";
            let startCoords = "";
            let endCoords = "";

            while (outOfBounds || alreadyPlaced) {
                const startRow = Math.floor(Math.random() * 10) + 1; //Numbers
                const startCol =
                    this.uppercaseLetters[Math.floor(Math.random() * 10) + 1]; //Letters

                orientationOfShip = this.verticalOrHorizontal();

                let endRow = 0;
                let endCol = "";

                if (orientationOfShip === "horizontal") {
                    endRow = startRow; //Numbers

                    const endIndex = this.uppercaseLetters.indexOf(startCol);
                    const endAdjust = endIndex + ship.length - 1;
                    if (endAdjust < this.uppercaseLetters.length) {
                        endCol = this.uppercaseLetters[endAdjust]; //Letters
                    } else {
                        continue;
                    }
                } else {
                    endRow = startRow + ship.length - 1; //Numbers
                    endCol = startCol; //Letters
                    if (endRow > 10) continue;
                }

                startCoords = `${startCol}${startRow.toString()}`;
                endCoords = `${endCol}${endRow.toString()}`;

                outOfBounds = this.outOfBounds(
                    ship.length,
                    startCoords,
                    endCoords,
                );

                alreadyPlaced = this.alreadyPlaced(startCoords, endCoords);
            }

            const placement = this.changeBoard(
                startCoords,
                endCoords,
                this.board,
                ship,
            );

            this.ships.push(
                new Ship(ship.length, placement, ship.type, orientationOfShip),
            );
        });
    }

    promptAttack() {
        let guess = prompt(
            "Enter the coordinate you want to attack (for example: 'C7')",
        )
            .trim()
            .toUpperCase();

        while (guess === "" || !guess.match(/^([A-Z]+)(\d+)$/)) {
            guess = prompt(
                "Enter the coordinate you want to attack (for example: 'C7')",
            )
                .trim()
                .toUpperCase();
        }

        console.log(`\n Your answer is: "${guess}" \n`);

        return guess;
    }

    promptAttackComputer() {
        let alreadyGuessed = true;
        let row;
        let col;

        if (this.educatedGuesses.length > 0) {
            //while the guess has already been made, use the first array index for coordinates, check if its been guessed, if not, return those coordinates, or remove coordinates from array and try next one
            while (alreadyGuessed && this.educatedGuesses.length > 0) {
                row = this.educatedGuesses[0][0]; //number
                col = this.uppercaseLetters[this.educatedGuesses[0][1]]; //letter

                alreadyGuessed = this.playersGuesses.includes(`${col}${row}`);
                this.educatedGuesses.shift();
            }
        } else if (
            this.educatedGuesses.length === 0 &&
            this.temporaryHit.length > 0 &&
            (!col || !row)
        ) {
            row = this.temporaryHit[0];
            col = this.uppercaseLetters[this.temporaryHit[0][1]];
            let tempCol = this.temporaryHit[1];

            //create an array of guesses off all adjacent tiles if they are not out of bounds
            const arrayOfAdjacentGridPositions = [
                [1, 0],
                [0, 1],
                [-1, 0],
                [0, -1],
                [1, 1],
                [-1, -1],
                [-1, 1],
                [1, -1],
            ];

            arrayOfAdjacentGridPositions.forEach((position) => {
                const newRow = row + position[0];
                const newColIndx = tempCol + position[1];
                const newCol = this.uppercaseLetters[newColIndx];

                //check if it is out of Bounds
                if (
                    newRow > 0 &&
                    newRow <= 10 &&
                    newColIndx > 0 &&
                    newColIndx <= 10
                ) {
                    //check if it has already been guessed
                    if (!this.playersGuesses.includes(`${newCol}${newRow}`)) {
                        //push to saved guesses
                        this.educatedGuesses.push([newRow, newColIndx]);
                    }
                }
            });
            //clear temporary hit class object
            this.temporaryHit = [];
        } else {
            //if no educated guess make a random guess
            if (!col || !row) {
                do {
                    row = Math.floor(Math.random() * 10) + 1;
                    col =
                        this.uppercaseLetters[
                            Math.floor(Math.random() * 10) + 1
                        ];
                } while (this.playersGuesses.includes(`${col}${row}`));
            }
            // Fallback to random
        }
        console.log(`Computer guessing: ${col}${row}`);
        return `${col}${row}`;
    }

    receiveAttack(coordinates) {
        const matchStart = coordinates.match(/^([A-Z]+)(\d+)$/);
        if (!matchStart) {
            return { result: "invalid", coordinates };
        }

        const col = matchStart[1];
        const row = Number(matchStart[2]);
        const colIndex = this.uppercaseLetters.indexOf(col);

        if (colIndex === -1 || row < 1 || row > 10) {
            return { result: "invalid", coordinates };
        }

        const alreadyGuessed = this.playersGuesses.includes(coordinates);
        if (alreadyGuessed) {
            return { result: "alreadyGuessed", coordinates };
        }

        this.playersGuesses.push(coordinates);

        const hitFlag = this.occupiedCells.includes(coordinates);
        if (hitFlag) {
            let shipHit = null;
            for (const ship of this.ships) {
                if (ship.placement.includes(coordinates)) {
                    shipHit = ship;
                    break;
                }
            }
            if (shipHit) {
                shipHit.hit(coordinates);
                return { result: "hit", coordinates };
            }
        }

        this.missedAttacks.push(coordinates);
        return { result: "miss", coordinates };
    }
}

class Player {
    constructor(playerType, name, gameMode) {
        this.playerBoard = new Gameboard(playerType, name, gameMode);
        this.name = name;
        this.gameMode = gameMode;

        this.playerType = playerType;
    }

    gameSetup() {
        if (this.playerType === "human") {
            this.playerBoard.boardSetupHuman();
        } else if (this.playerType === "computer") {
            this.playerBoard.boardSetupComputer();
        } else {
            throw new Error("player type needs to be 'computer' or 'human'");
        }
    }
}

class DOM {
    constructor() {
        this.player1 = null;
        this.player2 = null;

        this.messages = [];
        this.lastPressedCell = "";
        this.gameMode = "";

        this.anchorCell = null;
        this.hoveredCells = [];
        this.placementActive = true;
        this.firstCell = null;
        this.tempHighlightedCells = [];
    }

    setupDOM() {
        const form = document.querySelector("form");
        form.addEventListener("submit", (event) => {
            event.preventDefault(); // Prevent form refresh
            this.getInput();
        });

        this.setupBoards();
        this.setupShips();
        this.setupCommandLine();

        this.printMessage(
            `Welcome to Battleship. Is this a 1 player or 2 player game admiral? Press the corresponding button above`,
        );
    }

    setupBoards() {
        //board 1
        const board1 = document.getElementById("player1Board");

        const container1 = document.createElement("div");
        container1.classList.add("board1");
        const headers = ["", "A", "B", "C", "D", "E", "F", "G", "H", "I", "J"];

        for (let row = 0; row < 11; row++) {
            const gridRow = document.createElement("div");
            for (let col = 0; col < 11; col++) {
                const cell = document.createElement("div");
                cell.classList.add("cell");

                if (row === 0 && col === 0) {
                    cell.textContent = ""; // Top-left empty cell
                } else if (row === 0) {
                    cell.textContent = col; // Column headers
                } else if (col === 0) {
                    cell.textContent = headers[row]; // Row headers
                } else {
                    cell.textContent = "~"; // Grid content
                    cell.id = `${headers[row]}${col}`;
                    cell.dataset.col = `${headers[row]}`; //Letter / Column
                    cell.dataset.row = `${col}`; //Number / Row
                    cell.dataset.colIndex = row;
                    cell.dataset.rowIndex = col;
                    cell.addEventListener("click", () =>
                        this.receiveInput(cell),
                    );
                    cell.classList.add("coordinate");
                }
                cell.style.color = "#00E626";
                gridRow.appendChild(cell);
            }
            container1.appendChild(gridRow);
        }
        board1.appendChild(container1);

        //board2
        const board2 = document.getElementById("player2Board");

        const container2 = document.createElement("div");
        container2.classList.add("board2");

        for (let row = 0; row < 11; row++) {
            const gridRow = document.createElement("div");
            for (let col = 0; col < 11; col++) {
                const cell = document.createElement("div");
                cell.classList.add("cell");

                if (row === 0 && col === 0) {
                    cell.textContent = ""; // Top-left empty cell
                } else if (row === 0) {
                    cell.textContent = col; // Column headers
                } else if (col === 0) {
                    cell.textContent = headers[row]; // Row headers
                } else {
                    cell.textContent = "~"; // Grid content
                    cell.id = `${headers[row]}${col}`;
                    cell.dataset.col = `${headers[row]}`; //Letter / Column
                    cell.dataset.row = `${col}`; //Number / Row
                    cell.dataset.colIndex = row;
                    cell.dataset.rowIndex = col;
                    cell.addEventListener("click", () =>
                        this.receiveInput(cell),
                    );
                    cell.classList.add("coordinate");
                }

                cell.style.color = "#00E626";
                gridRow.appendChild(cell);
            }
            container2.appendChild(gridRow);
        }
        board2.appendChild(container2);
    }

    setupShips() {
        //ships
        const shipTypes = [
            { length: 2, type: "Patrol" },
            { length: 3, type: "Submarine" },
            { length: 3, type: "Destroyer" },
            { length: 4, type: "Battleship" },
            { length: 5, type: "Carrier" },
        ];
        const shipBox1 = document.getElementById("player1ships");
        const shipBox2 = document.getElementById("player2ships");

        //shipBox 1
        shipTypes.forEach((ship) => {
            const container = document.createElement("div");
            const healthContainer = document.createElement("div");
            healthContainer.classList.add("health");
            container.classList.add("ship");
            container.id = ship.type;

            for (let i = 0; i <= ship.length; i++) {
                if (i === 0) {
                    const div = document.createElement("div");
                    div.textContent = `${ship.type}:`;
                    div.classList.add("shipName");
                    container.appendChild(div);
                } else {
                    const div = document.createElement("div");
                    div.textContent = "";
                    div.classList.add("healthBox");
                    div.classList.add(`${ship.type.toLowerCase()}HPP1`);
                    healthContainer.appendChild(div);
                }
            }
            container.appendChild(healthContainer);
            shipBox1.appendChild(container);
        });

        //shipBox2
        shipTypes.forEach((ship) => {
            const container = document.createElement("div");
            const healthContainer = document.createElement("div");
            healthContainer.classList.add("health");
            container.classList.add("ship");
            container.id = ship.type;

            for (let i = 0; i <= ship.length; i++) {
                if (i === 0) {
                    const div = document.createElement("div");
                    div.textContent = `${ship.type}:`;
                    div.classList.add("shipName");
                    container.appendChild(div);
                } else {
                    const div = document.createElement("div");
                    div.textContent = "";
                    div.classList.add("healthBox");
                    div.classList.add(`${ship.type.toLowerCase()}HPP2`);
                    healthContainer.appendChild(div);
                }
            }
            container.appendChild(healthContainer);
            shipBox2.appendChild(container);
        });
    }

    setupCommandLine() {
        const submitButton = document.getElementById("submit");
        submitButton.addEventListener("click", () => this.getInput);
    }

    async gameModeDOM() {
        return new Promise((resolve) => {
            const button1 = document.getElementById("control1");
            const button2 = document.getElementById("control2");
            const controls = document.getElementById("controls");

            button1.textContent = "Human vs Computer";
            button2.textContent = "Player vs Player";

            button1.addEventListener(
                "click",
                () => {
                    this.gameMode = "vsComputer";
                    this.printMessage("Human vs Computer mode selected");
                    controls.textContent = "";
                    resolve(this.gameMode);
                },
                { once: true },
            );

            button2.addEventListener(
                "click",
                () => {
                    this.gameMode = "PVP";
                    this.printMessage("Player vs Player mode selected");
                    controls.textContent = "";
                    resolve(this.gameMode);
                },
                { once: true },
            );
        });
    }

    async getInput(mode = "both") {
        return new Promise((resolve) => {
            const text = document.getElementById("answer");
            text.value = "";
            const submit = document.getElementById("submit");
            const cells = document.querySelectorAll(".coordinate");
            let firstClick = null;

            const handleGrid = (e) => {
                // if we’re in text‑only or wrong‑player mode, ignore
                if (mode === "commandLineOnly") return;
                const cell = e.target;
                // restrict to the correct board
                if (
                    (mode === "player1" && !cell.closest("#player1Board")) ||
                    (mode === "player2" && !cell.closest("#player2Board"))
                )
                    return;

                const { col, row } = cell.dataset;

                if (
                    mode === "gridOnly" ||
                    mode === "player1" ||
                    mode === "player2"
                ) {
                    // single‑click grid mode
                    cleanup();
                    resolve({ col, row });
                } else if (mode === "both") {
                    // two‑click range mode
                    if (!firstClick) {
                        firstClick = cell;
                        firstClick.classList.add("anchor");
                    } else {
                        cleanup();
                        firstClick.classList.remove("anchor");
                        resolve([
                            {
                                col: firstClick.dataset.col,
                                row: firstClick.dataset.row,
                            },
                            { col, row },
                        ]);
                    }
                }
            };

            const handleSubmit = () => {
                if (mode === "gridOnly") return;
                const val = text.value.trim().toUpperCase();
                if (!val) return;
                cleanup();
                resolve(val);
            };

            function cleanup() {
                submit.removeEventListener("click", handleSubmit);
                cells.forEach((c) =>
                    c.removeEventListener("click", handleGrid),
                );
            }

            // attach listeners
            if (mode !== "commandLineOnly") {
                cells.forEach((c) => c.addEventListener("click", handleGrid));
            }
            if (mode !== "gridOnly") {
                submit.addEventListener("click", handleSubmit);
            }
        });
    }

    printMessage(input) {
        const messageBox = document.getElementById("messages");
        messageBox.textContent = "";

        while (this.messages.length > 3) {
            this.messages.shift();
        }

        this.messages.push(input);

        this.messages.forEach((message) => {
            const div = document.createElement("div");
            div.classList.add("message");
            div.textContent = `${message}`;

            messageBox.appendChild(div);
        });
    }

    receiveInput(cell) {
        // First click
        if (!this.firstCell) {
            this.firstCell = cell;
            this.firstCell.classList.add("anchor");

            // Attach hover event to all coordinate cells
            document.querySelectorAll(".coordinate").forEach((c) => {
                c.addEventListener(
                    "mouseover",
                    (this.hoverPreviewBound = this.hoverPreview.bind(this)),
                );
            });
        } else {
            // Second click (confirm)
            // Remove mouseover listeners
            document.querySelectorAll(".coordinate").forEach((c) => {
                c.removeEventListener("mouseover", this.hoverPreviewBound);
            });

            // Remove temp highlights
            this.tempHighlightedCells.forEach((c) =>
                c.classList.remove("highlight"),
            );
            this.tempHighlightedCells = [];

            // Pass input (start + end cell) to getInput
            this.getInput([this.firstCell, cell]);

            // Reset anchor cell
            this.firstCell.classList.remove("anchor");
            this.firstCell = null;
        }
    }

    hoverPreview(event) {
        if (!this.firstCell) return; // Do nothing if no anchor set

        // Get hovered cell
        const hoverCell = event.target;

        // Parse anchor and hovered cell positions
        const startRow = parseInt(this.firstCell.dataset.row);
        const startCol = this.firstCell.dataset.col;
        const endRow = parseInt(hoverCell.dataset.row);
        const endCol = hoverCell.dataset.col;

        // Clear previous highlights
        this.tempHighlightedCells.forEach((cell) =>
            cell.classList.remove("highlight"),
        );
        this.tempHighlightedCells = [];

        // Get new range and highlight it
        this.tempHighlightedCells = this.getCellsBetween(
            startRow,
            startCol,
            endRow,
            endCol,
        );
        this.tempHighlightedCells.forEach((cell) =>
            cell.classList.add("highlight"),
        );
    }

    getCellsBetween(startRow, startCol, endRow, endCol) {
        const cells = [];

        if (startCol === endCol) {
            // Vertical selection (same column, different rows)
            const minRow = Math.min(startRow, endRow);
            const maxRow = Math.max(startRow, endRow);
            for (let row = minRow; row <= maxRow; row++) {
                const cell = document.querySelector(
                    `[data-col='${startCol}'][data-row='${row}']`,
                );
                if (cell) cells.push(cell);
            }
        } else if (startRow === endRow) {
            // Horizontal selection (same row, different columns)
            const minCol = Math.min(
                startCol.charCodeAt(0),
                endCol.charCodeAt(0),
            );
            const maxCol = Math.max(
                startCol.charCodeAt(0),
                endCol.charCodeAt(0),
            );
            for (let col = minCol; col <= maxCol; col++) {
                const colLetter = String.fromCharCode(col);
                const cell = document.querySelector(
                    `[data-col='${colLetter}'][data-row='${startRow}']`,
                );
                if (cell) cells.push(cell);
            }
        }

        return cells;
    }

    async humanSetupDOM(player) {
        const shipTypes = [
            { length: 2, type: "patrol" },
            { length: 3, type: "submarine" },
            { length: 3, type: "destroyer" },
            { length: 4, type: "battleship" },
            { length: 5, type: "carrier" },
        ];

        const coordinateRegex = /^([A-Z]+)(\d+)-([A-Z]+)(\d+)$/; // Matches format "A2-A5"

        for (const ship of shipTypes) {
            let shipPlacement = await this.promptShipDOM(ship);
            let match = shipPlacement.match(coordinateRegex);

            console.log(shipPlacement);

            while (!match || shipPlacement === "") {
                shipPlacement = await this.promptShipDOM(ship);
                match = shipPlacement.match(coordinateRegex);
            }

            let startingCoordinate = match[1] + match[2]; // e.g., "A2"
            let endCoordinate = match[3] + match[4]; // e.g., "A5"

            let boatLength = player.playerBoard.lengthOfBoat(
                startingCoordinate,
                endCoordinate,
            );

            let lengthsMatch = player.playerBoard.boatLengthEqualsShipType(
                boatLength,
                ship.length,
            );

            let outOfBounds = player.playerBoard.outOfBounds(
                boatLength,
                startingCoordinate,
                endCoordinate,
            );

            let alreadyPlaced = player.playerBoard.alreadyPlaced(
                startingCoordinate,
                endCoordinate,
            );

            let orientation = player.playerBoard.orientation(
                startingCoordinate,
                endCoordinate,
            );

            let isDiagonal = orientation === "diagonal";

            while (
                !lengthsMatch ||
                outOfBounds ||
                alreadyPlaced ||
                isDiagonal
            ) {
                this.errorMessageDOM(
                    match,
                    lengthsMatch,
                    boatLength,
                    ship.length,
                    outOfBounds,
                    alreadyPlaced,
                );
                shipPlacement = await this.promptShipDOM(ship);

                match = shipPlacement.match(coordinateRegex);

                startingCoordinate = match[1] + match[2]; // e.g., "A2"
                endCoordinate = match[3] + match[4]; // e.g., "A5"

                boatLength = player.playerBoard.lengthOfBoat(
                    startingCoordinate,
                    endCoordinate,
                );

                lengthsMatch = player.playerBoard.boatLengthEqualsShipType(
                    boatLength,
                    ship.length,
                );

                outOfBounds = player.playerBoard.outOfBounds(
                    boatLength,
                    startingCoordinate,
                    endCoordinate,
                );

                alreadyPlaced = player.playerBoard.alreadyPlaced(
                    startingCoordinate,
                    endCoordinate,
                );

                orientation = player.playerBoard.orientation(
                    startingCoordinate,
                    endCoordinate,
                );
                isDiagonal = orientation === "diagonal";
            }

            // Clear highlights once ship is placed
            this.tempHighlightedCells.forEach((cell) =>
                cell.classList.remove("highlight"),
            );
            this.tempHighlightedCells = [];

            orientation = player.playerBoard.orientation(
                startingCoordinate,
                endCoordinate,
            );

            const placement = player.playerBoard.changeBoard(
                startingCoordinate,
                endCoordinate,
                player.playerBoard.board,
                ship,
            );

            player.playerBoard.ships.push(
                new Ship(boatLength, placement, ship.type, orientation),
            );

            this.updateBoardDOM(player, player.playerBoard.board);
        }

        console.log(this.player1.playerBoard.board);
        console.log(this.player2.playerBoard.board);
    }

    showFinalBoards(player1, player2) {
        // Player 1's board with Player 2's guesses
        this.updateBoardDOM(
            player1,
            player1.playerBoard.board,
            player2.playerBoard.playersGuesses,
        );

        // Player 2's board with Player 1's guesses
        this.updateBoardDOM(
            player2,
            player2.playerBoard.board,
            player1.playerBoard.playersGuesses,
        );

        this.printMessage(
            "Game Over! Here's how each player's board looked with opponent guesses:",
        );
    }

    async promptShipDOM(ship) {
        return new Promise(async (resolve) => {
            const coordinateRegex = /^([A-Z]+)(\d+)-([A-Z]+)(\d+)$/; // Matches format "A2-A5"
            this.printMessage(
                `Enter coordinates for ${ship.type} of ship length ${ship.length}. (Example: (A2-A3) \n You can either press the start and end points on the board OR enter the coordinates on the command line below.`,
            );

            const shipPlacement = await this.getInput();

            if (typeof shipPlacement === "object") {
                this.printMessage(
                    `You have selected ${shipPlacement[0].col}${shipPlacement[0].row} - ${shipPlacement[1].col}${shipPlacement[1].row}`,
                );
                resolve(
                    `${shipPlacement[0].col}${shipPlacement[0].row}-${shipPlacement[1].col}${shipPlacement[1].row}`,
                );
            } else if (typeof shipPlacement === "string") {
                let match = shipPlacement.match(coordinateRegex);
                this.printMessage(
                    `You have selected ${match[1]}${match[2]} - ${match[3]}${match[4]}`,
                );
                resolve(`${match[1]}${match[2]}-${match[3]}${match[4]}`);
            }
        });
    }

    async gameModeDOMMasterSetup() {
        this.setupDOM();
        const selectedGameMode = await this.gameModeDOM();

        let playerName, playerName2;

        const nameDiv1 = document.getElementById("player1name");
        const nameDiv2 = document.getElementById("player2name");

        if (selectedGameMode === "vsComputer") {
            this.printMessage("What is your name admiral?");
            playerName = await this.getInput("commandLine");

            nameDiv1.textContent = playerName;
            nameDiv2.textContent = "Computer";

            this.player1 = new Player("human", playerName, "vsComputer");
            this.player2 = new Player("computer", "computer", "vsComputer");

            this.player2.playerBoard.boardSetupComputer();
            await this.humanSetupDOM(this.player1);

            this.updateBoardDOM(this.player1, this.player1.playerBoard.board);

            this.gameTurnVsComputerDOM(this.player1, this.player2);
        } else if (selectedGameMode === "PVP") {
            this.printMessage("What is player 1's name admiral?");
            playerName = await this.getInput("commandLine");

            nameDiv1.textContent = playerName;

            this.printMessage("What is player 2's name admiral?");
            playerName2 = await this.getInput("commandLine");

            nameDiv2.textContent = playerName2;

            this.player1 = new Player("human", playerName, "PVP");
            this.player2 = new Player("human", playerName2, "PVP");

            this.printMessage(
                `Give the computer to ${playerName} for placing ships. No peeking admiral!`,
            );
            await this.humanSetupDOM(this.player1);
            this.updateBoardDOM(
                this.player1,
                this.player1.playerBoard.opponentsBoard,
            );
            this.printMessage(
                `Give the computer to ${playerName2} for placing ships. No peeking admiral!`,
            );
            await this.humanSetupDOM(this.player2);

            this.gameTurnPVPDOM(this.player1, this.player2);
        }
    }

    updateBoardDOM(player, board, overlayGuesses = []) {
        //determine which player it is, then update the correct board and display it
        const headers = ["", "A", "B", "C", "D", "E", "F", "G", "H", "I", "J"];

        if (player === this.player1) {
            //board 1
            const board1 = document.getElementById("player1Board");

            board1.textContent = ""; //clear board

            const container1 = document.createElement("div");
            container1.classList.add("board1");

            //update board with player board data
            for (let row = 0; row < 11; row++) {
                const gridRow = document.createElement("div");
                for (let col = 0; col < 11; col++) {
                    const cell = document.createElement("div");
                    cell.classList.add("cell");

                    if (row === 0 && col === 0) {
                        cell.textContent = ""; // Top-left empty cell
                    } else if (row === 0) {
                        cell.textContent = col; // Column headers
                    } else if (col === 0) {
                        cell.textContent = headers[row]; // Row headers
                    } else {
                        const cellValue = board[col][row];
                        const coord = `${headers[row]}${col}`;
                        if (overlayGuesses.includes(coord)) {
                            const occupied =
                                player.playerBoard.occupiedCells.includes(
                                    coord,
                                );

                            if (occupied) {
                                cell.textContent = "X";
                                cell.classList.add("hit");
                            } else {
                                cell.textContent = "O";
                                cell.classList.add("miss");
                            }
                        } else {
                            cell.textContent = cellValue; // Only apply original cell content if not overwritten by guess
                        }

                        cell.id = `${headers[row]}${col}`;
                        cell.dataset.col = `${headers[row]}`; //Letter / Column
                        cell.dataset.row = `${col}`; //Number / Row
                        cell.dataset.colIndex = row;
                        cell.dataset.rowIndex = col;
                        cell.addEventListener("click", () =>
                            this.receiveInput(cell),
                        );
                        cell.classList.add("coordinate");

                        if (cellValue === "X") {
                            cell.classList.add("hit");
                        } else if (cellValue === "O") {
                            cell.classList.add("miss");
                        } else if (cellValue !== "~") {
                            cell.classList.add("shipSquare");
                        }
                    }

                    cell.style.color = "#00E626";
                    gridRow.appendChild(cell);
                }
                container1.appendChild(gridRow);
            }
            board1.appendChild(container1);
        } else if (player === this.player2) {
            //board2
            const board2 = document.getElementById("player2Board");

            board2.textContent = ""; //clear board

            const container2 = document.createElement("div");
            container2.classList.add("board2");

            //update board with player board data
            for (let row = 0; row < 11; row++) {
                const gridRow = document.createElement("div");
                for (let col = 0; col < 11; col++) {
                    const cell = document.createElement("div");
                    cell.classList.add("cell");

                    if (row === 0 && col === 0) {
                        cell.textContent = ""; // Top-left empty cell
                    } else if (row === 0) {
                        cell.textContent = col; // Column headers
                    } else if (col === 0) {
                        cell.textContent = headers[row]; // Row headers
                    } else {
                        const cellValue = board[col][row];
                        const coord = `${headers[row]}${col}`;
                        if (overlayGuesses.includes(coord)) {
                            const occupied =
                                player.playerBoard.occupiedCells.includes(
                                    coord,
                                );

                            if (occupied) {
                                cell.textContent = "X";
                                cell.classList.add("hit");
                            } else {
                                cell.textContent = "O";
                                cell.classList.add("miss");
                            }
                        } else {
                            cell.textContent = cellValue; // Only apply original cell content if not overwritten by guess
                        }
                        cell.id = `${headers[row]}${col}`;
                        cell.dataset.col = `${headers[row]}`; //Letter / Column
                        cell.dataset.row = `${col}`; //Number / Row
                        cell.dataset.colIndex = row;
                        cell.dataset.rowIndex = col;
                        cell.addEventListener("click", () =>
                            this.receiveInput(cell),
                        );
                        cell.classList.add("coordinate");

                        if (cellValue === "X") {
                            cell.classList.add("hit");
                        } else if (cellValue === "O") {
                            cell.classList.add("miss");
                        } else if (cellValue !== "~") {
                            cell.classList.add("shipSquare");
                        }
                    }

                    cell.style.color = "#00E626";
                    gridRow.appendChild(cell);
                }
                container2.appendChild(gridRow);
            }
            board2.appendChild(container2);
        }
    }

    updateShipsDOM(player) {
        const ships = player.playerBoard.ships;

        if (player === this.player1) {
            ships.forEach((ship) => {
                if (ship.sunk === true) {
                    const healthBoxes = document.getElementsByClassName(
                        `${ship.type}HPP1`,
                    );
                    Array.from(healthBoxes).forEach((healthBox) => {
                        healthBox.classList.add("hit");
                    });
                }
            });
        } else if (player === this.player2) {
            ships.forEach((ship) => {
                if (ship.sunk === true) {
                    const healthBoxes = document.getElementsByClassName(
                        `${ship.type}HPP2`,
                    );
                    Array.from(healthBoxes).forEach((healthBox) => {
                        healthBox.classList.add("hit");
                    });
                }
            });
        }
    }

    errorMessageDOM(
        match,
        length,
        userInput,
        shipLength,
        outOfBounds,
        alreadyPlaced,
    ) {
        if (!length && match[1] != match[3] && match[2] != match[4]) {
            this.printMessage(`It's not possible to place pieces diagonally`);
        } else if (Number(match[4]) < Number(match[2])) {
            this.printMessage(
                "Make sure to place ships with coordinates Left to Right, Top to Bottom",
            );
        } else if (!match || match === null) {
            this.printMessage(
                "Invalid coordinate format. Please use the format 'A2-A5'.",
            );
        } else if (!length) {
            this.printMessage(
                `Your coordinates are the incorrect length.\nYour coordinate length: ${userInput}\nBoat length: ${shipLength}\n`,
            );
        } else if (outOfBounds) {
            this.printMessage(
                `Your coordinates are out of the bounds of the grid. Pick gridpoints between A-J and 1-10`,
            );
        } else if (alreadyPlaced) {
            this.printMessage(
                `You have already placed a ship on atleast one of your chosen squares. Pick a new coordinate range.`,
            );
        }
    }

    async promptAttackDOM(playerMode) {
        // Show instructions
        this.printMessage(
            `Make a guess against your opponent on their board by either typing a coordinate (Example: "A2") or by pressing on your board.`,
        );

        // Get raw input (restricted to the right board or command line)
        const raw = await this.getInput(playerMode);

        // Normalize to string
        const guess =
            typeof raw === "string"
                ? raw.trim().toUpperCase()
                : `${raw.col}${raw.row}`;

        // Validate A–J and 1–10
        if (!/^([A-J])([1-9]|10)$/.test(guess)) {
            this.printMessage("Invalid coordinate. Try again.");
            // Recursively re-prompt until valid
            return this.promptAttackDOM(playerMode);
        }

        // Return the clean string
        return guess;
    }

    // computerSetup() {

    // }

    async gameTurnVsComputerDOM(human, computer) {
        const messages = document.getElementById("messages");
        messages.textContent = "";
        this.messages = [];

        let whosTurn = Math.random() < 0.5 ? human : computer;
        let gameOver = false;

        computer.playerBoard.opponentsBoard = human.playerBoard.board;
        console.log(human.playerBoard.ships);

        while (!gameOver) {
            if (whosTurn === human) {
                // Human's turn

                //print boards
                this.updateBoardDOM(human, human.playerBoard.opponentsBoard);
                this.updateBoardDOM(
                    computer,
                    computer.playerBoard.opponentsBoard,
                );

                this.updateShipsDOM(human);
                this.updateShipsDOM(computer);

                //human prompt
                const guess = await this.promptAttackDOM("player1");
                const result = computer.playerBoard.receiveAttack(guess);

                console.log(result);

                if (result.result === "hit") {
                    const [col, row] = [
                        result.coordinates[0],
                        parseInt(result.coordinates.slice(1)),
                    ];
                    const colIndex =
                        human.playerBoard.uppercaseLetters.indexOf(col);
                    // human.playerBoard.opponentsBoard[row][colIndex] = "X";
                    human.playerBoard.opponentsBoard[row][colIndex] = "X";
                    this.printMessage(`Hit at ${result.coordinates}!`);
                } else if (result.result === "miss") {
                    const [col, row] = [
                        result.coordinates[0],
                        parseInt(result.coordinates.slice(1)),
                    ];
                    const colIndex =
                        human.playerBoard.uppercaseLetters.indexOf(col);
                    human.playerBoard.opponentsBoard[row][colIndex] = "O";

                    this.printMessage(`Miss at ${result.coordinates}.`);
                } else {
                    this.printMessage("Invalid or already guessed coordinate.");
                    continue;
                }

                if (computer.playerBoard.allSunk()) {
                    this.printMessage("All enemy ships sunk! You win!");
                    //update boards
                    this.updateBoardDOM(
                        human,
                        human.playerBoard.opponentsBoard,
                    );
                    this.updateBoardDOM(
                        computer,
                        computer.playerBoard.opponentsBoard,
                    );

                    this.updateShipsDOM(human);
                    this.updateShipsDOM(computer);

                    gameOver = true;
                }

                whosTurn = computer;
            } else {
                // Computer's turn
                const guess = computer.playerBoard.promptAttackComputer();
                const result = human.playerBoard.receiveAttack(guess);

                this.updateShipsDOM(human);
                this.updateShipsDOM(computer);

                if (result.result === "hit") {
                    const [col, row] = [
                        result.coordinates[0],
                        parseInt(result.coordinates.slice(1)),
                    ];
                    const colIndex =
                        computer.playerBoard.uppercaseLetters.indexOf(col);
                    computer.playerBoard.opponentsBoard[row][colIndex] = "X";

                    //if there are no educated guesses to be made on next attack and there are no new initial guesses, queue up next educated guess coordinate
                    if (
                        computer.playerBoard.educatedGuesses.length === 0 &&
                        computer.playerBoard.temporaryHit.length === 0
                    ) {
                        computer.playerBoard.temporaryHit = [row, colIndex];
                    }
                    this.printMessage(`Computer hit at ${result.coordinates}!`);
                } else if (result.result === "miss") {
                    const [col, row] = [
                        result.coordinates[0],
                        parseInt(result.coordinates.slice(1)),
                    ];
                    const colIndex =
                        computer.playerBoard.uppercaseLetters.indexOf(col);
                    computer.playerBoard.opponentsBoard[row][colIndex] = "O";
                    this.printMessage(
                        `Computer missed at ${result.coordinates}.`,
                    );
                }

                if (human.playerBoard.allSunk()) {
                    //update boards
                    this.updateBoardDOM(
                        human,
                        human.playerBoard.opponentsBoard,
                    );
                    this.updateBoardDOM(
                        computer,
                        computer.playerBoard.opponentsBoard,
                    );

                    this.updateShipsDOM(human);
                    this.updateShipsDOM(computer);

                    this.printMessage(
                        "All your ships are sunk! Computer wins!",
                    );

                    gameOver = true;
                }
                whosTurn = human;
            }
        }
    }

    async gameTurnPVPDOM(player1, player2) {
        const messages = document.getElementById("messages");
        messages.textContent = "";
        this.messages = [];

        let whosTurn = Math.random() < 0.5 ? player1 : player2;
        let gameOver = false;

        while (!gameOver) {
            if (whosTurn === player1) {
                // Player 1's turn
                this.updateBoardDOM(
                    player1,
                    player1.playerBoard.opponentsBoard,
                );
                this.updateBoardDOM(
                    player2,
                    player2.playerBoard.opponentsBoard,
                );

                this.updateShipsDOM(player1);
                this.updateShipsDOM(player2);

                this.printMessage(`${player1.name.toUpperCase()}'s TURN`);

                const guess = await this.promptAttackDOM("player1");
                const result = player2.playerBoard.receiveAttack(guess);

                if (result.result === "hit") {
                    const [col, row] = [
                        result.coordinates[0],
                        parseInt(result.coordinates.slice(1)),
                    ];
                    const colIndex =
                        player1.playerBoard.uppercaseLetters.indexOf(col);
                    player1.playerBoard.opponentsBoard[row][colIndex] = "X";
                    this.printMessage(`Hit at ${result.coordinates}!`);
                } else if (result.result === "miss") {
                    const [col, row] = [
                        result.coordinates[0],
                        parseInt(result.coordinates.slice(1)),
                    ];
                    const colIndex =
                        player1.playerBoard.uppercaseLetters.indexOf(col);
                    player1.playerBoard.opponentsBoard[row][colIndex] = "O";

                    this.printMessage(`Miss at ${result.coordinates}.`);
                } else {
                    this.printMessage("Invalid or already guessed coordinate.");
                    continue;
                }

                if (player2.playerBoard.allSunk()) {
                    player1.playerBoard.printBoard(
                        player1.playerBoard.opponentsBoard,
                    );
                    player2.playerBoard.printBoard(
                        player2.playerBoard.opponentsBoard,
                    );

                    this.updateShipsDOM(player1);
                    this.updateShipsDOM(player2);
                    this.printMessage(
                        `All enemy ships sunk! ${player1.name} wins!`,
                    );

                    this.showFinalBoards(player1, player2);
                    gameOver = true;
                }
                whosTurn = player2;
            } else if (whosTurn === player2) {
                // Player 2's turn
                this.updateBoardDOM(
                    player1,
                    player1.playerBoard.opponentsBoard,
                );
                this.updateBoardDOM(
                    player2,
                    player2.playerBoard.opponentsBoard,
                );

                this.updateShipsDOM(player1);
                this.updateShipsDOM(player2);

                this.printMessage(`${player2.name.toUpperCase()}'s TURN`);

                const guess = await this.promptAttackDOM("player2");
                const result = player1.playerBoard.receiveAttack(guess);

                if (result.result === "hit") {
                    const [col, row] = [
                        result.coordinates[0],
                        parseInt(result.coordinates.slice(1)),
                    ];
                    const colIndex =
                        player2.playerBoard.uppercaseLetters.indexOf(col);
                    player2.playerBoard.opponentsBoard[row][colIndex] = "X";
                    this.printMessage(`Hit at ${result.coordinates}!`);
                } else if (result.result === "miss") {
                    const [col, row] = [
                        result.coordinates[0],
                        parseInt(result.coordinates.slice(1)),
                    ];
                    const colIndex =
                        player2.playerBoard.uppercaseLetters.indexOf(col);
                    player2.playerBoard.opponentsBoard[row][colIndex] = "O";

                    this.printMessage(`Miss at ${result.coordinates}.`);
                } else {
                    this.printMessage("Invalid or already guessed coordinate.");
                    continue;
                }

                if (player1.playerBoard.allSunk()) {
                    this.printMessage(
                        `All enemy ships sunk! ${player2.name} wins!`,
                    );

                    this.updateBoardDOM(
                        player1,
                        player1.playerBoard.opponentsBoard,
                    );
                    this.updateBoardDOM(
                        player2,
                        player2.playerBoard.opponentsBoard,
                    );

                    this.updateShipsDOM(player1);
                    this.updateShipsDOM(player2);

                    this.showFinalBoards(player1, player2);

                    gameOver = true;
                }
                whosTurn = player1;
            }
        }
    }

    // resetDOM() {}
}

function gameModeTerminal() {
    let gameType;
    let name;
    let name1;
    let name2;

    do {
        gameType = prompt(
            "\nWhat kind of game do you want to play?\nPress 2 or 2 and then hit enter:\n" +
                "1) Player vs Computer\n" +
                "2) Player vs Player\n" +
                "Enter here:",
        );

        if (gameType === null) return; // Handle cancel action

        gameType = gameType.trim();

        console.log(`Game type: ${gameType}`);
    } while (!gameType.match(/^[12]$/));

    switch (gameType) {
        case "1":
            do {
                name = prompt("\nWhat is your name admiral \n Enter here: ");

                if (name === null) return; // Handle cancel action

                name = name.trim();

                console.log(`Game type: ${name}`);
            } while (!name.match(/^\w+$/));

            console.log("You have chosen 'Vs Computer game mode'");
            const human = new Player("human", name, "vsComputer");
            const computer = new Player("computer", "computer", "vsComputer");

            human.gameSetup();
            computer.gameSetup();

            gameTurnHumanVsComputerTerminal(human, computer);
            break;

        case "2":
            do {
                name1 = prompt("\nWhat is player 1's name \n Enter here: ");

                if (name1 === null) return; // Handle cancel action

                name1 = name1.trim();

                console.log(`You have selected the name: ${name1}`);
            } while (!name1.match(/^\w+$/));

            do {
                name2 = prompt("\nWhat is player 2's name \n Enter here: ");

                if (name2 === null) return; // Handle cancel action

                name2 = name2.trim();

                console.log(`You have selected the name: ${name2}`);
            } while (!name2.match(/^\w+$/));

            console.log("You have chosen 'PVP game mode'");
            const player1 = new Player("human", name1, "PVP");
            const player2 = new Player("human", name2, "PVP");

            player1.gameSetup();
            player2.gameSetup();

            gameTurnPlayerVsPlayerTerminal(player1, player2);
            break;
    }
}

function gameTurnHumanVsComputerTerminal(human, computer) {
    let whosTurn = Math.random() < 0.5 ? human : computer;
    let gameOver = false;

    computer.playerBoard.opponentsBoard = human.playerBoard.board;

    while (!gameOver) {
        if (whosTurn === human) {
            // Human's turn
            human.playerBoard.printBoard(human.playerBoard.opponentsBoard);
            computer.playerBoard.printBoard(
                computer.playerBoard.opponentsBoard,
            );
            const guess = human.playerBoard.promptAttack();
            const result = computer.playerBoard.receiveAttack(guess);

            if (result.result === "hit") {
                const [col, row] = [
                    result.coordinates[0],
                    parseInt(result.coordinates.slice(1)),
                ];
                const colIndex =
                    human.playerBoard.uppercaseLetters.indexOf(col);
                // human.playerBoard.opponentsBoard[row][colIndex] = "X";
                human.playerBoard.opponentsBoard[row][colIndex] = styleText(
                    "red",
                    "X",
                );
                console.log(`Hit at ${result.coordinates}!`);
            } else if (result.result === "miss") {
                const [col, row] = [
                    result.coordinates[0],
                    parseInt(result.coordinates.slice(1)),
                ];
                const colIndex =
                    human.playerBoard.uppercaseLetters.indexOf(col);
                // human.playerBoard.opponentsBoard[row][colIndex] = "O";
                human.playerBoard.opponentsBoard[row][colIndex] = styleText(
                    "blue",
                    "O",
                );

                console.log(`Miss at ${result.coordinates}.`);
            } else {
                console.log("Invalid or already guessed coordinate.");
                continue;
            }

            if (computer.playerBoard.allSunk()) {
                console.log("All enemy ships sunk! You win!");
                human.playerBoard.printBoard(human.playerBoard.opponentsBoard);
                computer.playerBoard.printBoard(
                    computer.playerBoard.opponentsBoard,
                );
                gameOver = true;
            }
            whosTurn = computer;
        } else {
            // Computer's turn
            const guess = computer.playerBoard.promptAttackComputer();
            const result = human.playerBoard.receiveAttack(guess);

            if (result.result === "hit") {
                const [col, row] = [
                    result.coordinates[0],
                    parseInt(result.coordinates.slice(1)),
                ];
                const colIndex =
                    computer.playerBoard.uppercaseLetters.indexOf(col);
                computer.playerBoard.opponentsBoard[row][colIndex] = styleText(
                    "red",
                    "X",
                );

                //if there are no educated guesses to be made on next attack and there are no new initial guesses, queue up next educated guess coordinate
                if (
                    computer.playerBoard.educatedGuesses.length === 0 &&
                    computer.playerBoard.temporaryHit.length === 0
                ) {
                    computer.playerBoard.temporaryHit = [row, colIndex];
                }
                console.log(`Computer hit at ${result.coordinates}!`);
            } else if (result.result === "miss") {
                const [col, row] = [
                    result.coordinates[0],
                    parseInt(result.coordinates.slice(1)),
                ];
                const colIndex =
                    computer.playerBoard.uppercaseLetters.indexOf(col);
                computer.playerBoard.opponentsBoard[row][colIndex] = styleText(
                    "blue",
                    "O",
                );
                console.log(`Computer missed at ${result.coordinates}.`);
            }

            if (human.playerBoard.allSunk()) {
                human.playerBoard.printBoard(human.playerBoard.opponentsBoard);
                computer.playerBoard.printBoard(
                    computer.playerBoard.opponentsBoard,
                );
                console.log("All your ships are sunk! Computer wins!");
                gameOver = true;
            }
            whosTurn = human;
        }
    }
}

function gameTurnPlayerVsPlayerTerminal(player1, player2) {
    let whosTurn = Math.random() < 0.5 ? player1 : player2;
    let gameOver = false;

    console.log(`${whosTurn.name} goes first`);

    while (!gameOver) {
        if (whosTurn === player1) {
            // Player 1's turn
            player1.playerBoard.printBoard(player1.playerBoard.opponentsBoard);
            player2.playerBoard.printBoard(player2.playerBoard.opponentsBoard);
            const guess = player1.playerBoard.promptAttack();
            const result = player2.playerBoard.receiveAttack(guess);

            if (result.result === "hit") {
                const [col, row] = [
                    result.coordinates[0],
                    parseInt(result.coordinates.slice(1)),
                ];
                const colIndex =
                    player1.playerBoard.uppercaseLetters.indexOf(col);
                player1.playerBoard.opponentsBoard[row][colIndex] = styleText(
                    "red",
                    "X",
                );
                console.log(`Hit at ${result.coordinates}!`);
            } else if (result.result === "miss") {
                const [col, row] = [
                    result.coordinates[0],
                    parseInt(result.coordinates.slice(1)),
                ];
                const colIndex =
                    player1.playerBoard.uppercaseLetters.indexOf(col);
                player1.playerBoard.opponentsBoard[row][colIndex] = styleText(
                    "blue",
                    "O",
                );

                console.log(`Miss at ${result.coordinates}.`);
            } else {
                console.log("Invalid or already guessed coordinate.");
                continue;
            }

            if (player2.playerBoard.allSunk()) {
                player1.playerBoard.printBoard(
                    player1.playerBoard.opponentsBoard,
                );
                player2.playerBoard.printBoard(
                    player2.playerBoard.opponentsBoard,
                );
                console.log(`All enemy ships sunk! ${player1.name} wins!`);
                gameOver = true;
            }
            whosTurn = player2;
        } else if (whosTurn === player2) {
            // Player 2's turn
            player1.playerBoard.printBoard(player2.playerBoard.opponentsBoard);
            player2.playerBoard.printBoard(player1.playerBoard.opponentsBoard);
            const guess = player2.playerBoard.promptAttack();
            const result = player1.playerBoard.receiveAttack(guess);

            if (result.result === "hit") {
                const [col, row] = [
                    result.coordinates[0],
                    parseInt(result.coordinates.slice(1)),
                ];
                const colIndex =
                    player2.playerBoard.uppercaseLetters.indexOf(col);
                player2.playerBoard.opponentsBoard[row][colIndex] = styleText(
                    "red",
                    "X",
                );
                console.log(`Hit at ${result.coordinates}!`);
            } else if (result.result === "miss") {
                const [col, row] = [
                    result.coordinates[0],
                    parseInt(result.coordinates.slice(1)),
                ];
                const colIndex =
                    player2.playerBoard.uppercaseLetters.indexOf(col);
                player2.playerBoard.opponentsBoard[row][colIndex] = styleText(
                    "blue",
                    "O",
                );

                console.log(`Miss at ${result.coordinates}.`);
            } else {
                console.log("Invalid or already guessed coordinate.");
                continue;
            }

            if (player1.playerBoard.allSunk()) {
                console.log(`All enemy ships sunk! ${player2.name} wins!`);
                player1.playerBoard.printBoard(
                    player2.playerBoard.opponentsBoard,
                );
                player2.playerBoard.printBoard(
                    player1.playerBoard.opponentsBoard,
                );
                gameOver = true;
            }
            whosTurn = player1;
        }
    }
}

const display = new DOM();
display.gameModeDOMMasterSetup();

//for terminal game play
// gameModeTerminal();
