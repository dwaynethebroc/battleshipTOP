// export { Ship, Gameboard };
import promptSync from "prompt-sync";
import { styleText } from "node:util";

const prompt = promptSync();

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
            // this.printBoard(this.board);
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
        while (alreadyGuessed) {
            row = Math.floor(Math.random() * 10) + 1; //Numbers
            col = this.uppercaseLetters[Math.floor(Math.random() * 10) + 1]; //Letters

            alreadyGuessed = this.playersGuesses.includes(`${col}${row}`);
        }

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
    constructor() {}

    setupDOM(board) {
        for (let i = 0; i < 121; i++) {
            // 11x11 = 121
            const gridDiv = document.createElement("div");
        }
    }
}

function gameMode() {
    let gameType;
    let name;
    let name1;
    let name2;

    do {
        gameType = prompt(
            "\nWhat kind of game do you want to play?\nPress 1 or 2 and then hit enter:\n" +
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

            gameTurnHumanVsComputer(human, computer);
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

            gameTurnPlayerVsPlayer(player1, player2);
            break;
    }
}

function gameTurnHumanVsComputer(human, computer) {
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
                // computer.playerBoard.opponentsBoard[row][colIndex] = "X";
                computer.playerBoard.opponentsBoard[row][colIndex] = styleText(
                    "red",
                    "X",
                );
                console.log(`Computer hit at ${result.coordinates}!`);
            } else if (result.result === "miss") {
                const [col, row] = [
                    result.coordinates[0],
                    parseInt(result.coordinates.slice(1)),
                ];
                const colIndex =
                    computer.playerBoard.uppercaseLetters.indexOf(col);
                // computer.playerBoard.opponentsBoard[row][colIndex] = "O";
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

function gameTurnPlayerVsPlayer(player1, player2) {
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

gameMode();
