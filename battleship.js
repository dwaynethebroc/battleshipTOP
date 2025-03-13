export { Ship };

class Ship {
    constructor(length, placement) {
        this.hit = 0;

        this.length = length;
        this.placement = placement;
        this.sunk = false;
    }
}
