export { Ship };

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

        if (hitShip) {
            this.damage++;
            this.targetedSquares.push(square);

            this.message(
                `Battleship is hit: ${this.type} \n Damage: ${this.damage} \n Squares hit: ${this.targetedSquares}`,
            );

            return true;
        } else {
            this.message(`MISS: no Battleship was hit`);
            return false;
        }
    }

    message(message) {
        console.log(message);
    }
}
