import { Game } from "./game";

enum Direction {
    LEFT,
    RIGHT,
    UP,
    DOWN
}

export class Drone {
    nextAction: string = "";
    nextPosition: Point;
    nextLight: boolean = false;
    moveDirection = Direction.DOWN;

    constructor(private droneId: number, public position: Point, public emergency: number, public battery: number) {

    }
    update(game: Game) {
        if(this.nextAction) {
            this.nextLight = false;
        } else {
            this.nextLight = true;
        }
        this.emergency;
        switch (this.moveDirection) {
            case Direction.DOWN: this.moveDown(); break;
            case Direction.RIGHT: this.moveRight(); break;
            case Direction.LEFT: this.moveLeft(); break;
            case Direction.UP: this.moveUp(); break;
        }
        this.nextAction = `MOVE ${this.nextPosition.x} ${this.nextPosition.y} ${(this.nextLight? '1': '0')}`;
    }
    moveUp() {
        this.nextPosition = {
            x: this.position.x,
            y: 200
        } 
        if (this.position.y < 200) {
            this.nextPosition = {
                x: this.position.x,
                y: 10000
            }
            this.moveDirection = Direction.DOWN
        }
    }
    moveLeft() {
        if (this.position.x > 2500) {
            this.nextPosition = {
                x: this.position.x - 5000,
                y: this.position.y
            }
            this.moveDirection = Direction.LEFT
        } else {
            this.nextPosition = {
                x: this.position.x,
                y: 200
            }
            this.moveDirection = Direction.UP
        } 
    }
    moveRight() {
        if (this.position.x < 8500) {
            this.nextPosition = {
                x: this.position.x + 5000,
                y: this.position.y
            }
            this.moveDirection = Direction.RIGHT
        } else {
            this.nextPosition = {
                x: this.position.x,
                y: 200
            }
            this.moveDirection = Direction.UP
        } 
    }
    moveDown() {
        if (this.position.y < 8600 && this.moveDirection === Direction.DOWN) {
            this.nextPosition = {
                x: this.position.x,
                y: 10000
            }
            
        } else if (this.position.y >= 8600) {
            if (this.position.x < 5000) {
                this.nextPosition = {
                    x: this.position.x + 5000,
                    y: this.position.y
                }
                this.moveDirection = Direction.RIGHT
            } else {
                this.nextPosition = {
                    x: this.position.x - 5000,
                    y: this.position.y
                }
                this.moveDirection = Direction.LEFT
            }
            this.nextLight = true;
        }
    }
}