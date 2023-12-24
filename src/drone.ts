import { Game } from "./game";
import { Point } from "./point";
import { Creature } from "./creatures";
import { calculateDistance } from "./utils";
import { RadarBlip } from "./radarblip";

enum Direction {
    LEFT,
    RIGHT,
    UP,
    DOWN
}

enum DroneState {
    HUNT,
    SAVE,
    SEARCH
}

export class Drone {
    speed: number = 600;
    droneId: number;
    position: Point;
    emergency: number;
    battery: number;
    creaturesScanned: number[] = [];
    radar: RadarBlip[] = [];
    creaturesToHunt: Map<number, Creature> = new Map();
    message: string;

    nextAction: string = "";
    nextLight: boolean = false;
    moveDirection = Direction.DOWN;


    destination: Point | undefined;

    state: DroneState = DroneState.SEARCH;

    game: Game;

    constructor(droneId: number, position: Point, emergency: number, battery: number) {
        this.droneId = droneId;
        this.position = position;
        this.emergency = emergency;
        this.battery = battery;
    }

    update(game: Game) {
        this.game = game;
        this.buildListOfCreaturesToHunt();
        this.message = "";
        
        // MOVE <x> <y> <light (1|0)>
        // WAIT <light (1|0)>

        
        console.error(`[ ${this.droneId} ] >>>> BEFORE UPDATE`)
        console.error(`[ ${this.droneId} ] >>>> >>>> DEST: ${this.destination}`)
        console.error(`[ ${this.droneId} ] >>>> >>>> STATE: ${this.state}`)

        if(this.destination && this.destination.x === this.position.x && this.destination.y === this.position.y) {
            this.destination = undefined;
        }

        this.state = DroneState.SEARCH;
        if(this.creaturesToHunt.size > 0) {
            this.state = DroneState.HUNT;
            this.destination = undefined;
        }
        if(this.creaturesScanned.length > 5) {
            this.state = DroneState.SAVE;
            this.destination = undefined;
        }

        if(!this.destination ) {
            switch(this.state) {
                case DroneState.SAVE: {
                    this.destination = {
                        x: this.position.x,
                        y: game.surface
                    }
                }
                break;
                case DroneState.SEARCH: {
                    this.destination = this.searchCreatures();
                }
                break;
                case DroneState.HUNT: {
                    let closestCreature = this.findClosestCreature(this.creaturesToHunt);
                    if(closestCreature) {
                        this.destination = {
                            x: closestCreature.creatureX!,
                            y: closestCreature.creatureY!
                        }
                    }
                }
                break;
            }
        }
    
        // Compute Path (avoid monsters etc...)
        let nextPosition = this.destination;

        
        switch(this.state) {
            case DroneState.SEARCH: this.message = "SEARCH"; break;
            case DroneState.SAVE: this.message = "SAVE"; break;
            case DroneState.HUNT: this.message = "HUNT"; break;
        }

        if(nextPosition && nextPosition != this.position) {
            this.nextAction = `MOVE ${nextPosition.x.toFixed()} ${nextPosition.y.toFixed()} ${(this.nextLight? '1': '0')} ${this.message}`;
        } else {
            this.nextAction = `WAIT ${(this.nextLight? '1': '0')}`;
            this.state = DroneState.SEARCH;
        }

        this.nextLight = !this.nextLight;

        console.error(`[ ${this.droneId} ] >>>> AFTER UPDATE`)
        console.error(`[ ${this.droneId} ] >>>> >>>> DEST: ${this.destination}`)
        console.error(`[ ${this.droneId} ] >>>> >>>> STATE: ${this.state}`)
    }




    searchCreatures(): Point {
        let nextPosition: Point = this.position;
        if(this.creaturesToHunt.size > 0) {
            let closestCreature = this.findClosestCreature(this.creaturesToHunt);
            if(closestCreature) {
                nextPosition = {
                    x: closestCreature.creatureX!,
                    y: closestCreature.creatureY!
                }
            }
            this.state = DroneState.HUNT;
        } else {
            const directionDensity = this.getDirectionDensity();
            if(Object.keys(directionDensity).length > 0) {
                const mostFrequentDirection = Object.keys(directionDensity).reduce((a, b) =>
                    directionDensity[a] > directionDensity[b] ? a : b
                );
                nextPosition = this.computeNextPosition(this.position, mostFrequentDirection);
            } else {
                this.destination = {
                    x: this.position.x,
                    y: game.surface
                }
                this.state = DroneState.SAVE;
            }
        }
        return nextPosition;
    }

    computeNextPosition(position: Point, direction: string): Point {
        const nextDronePosition: Point = { ...position };
      
        switch (direction) {
          case 'TR':
            nextDronePosition.x = 8800;
            nextDronePosition.y = 3800;
            break;
          case 'TL':
            nextDronePosition.x = 1800;
            nextDronePosition.y = 3800;
            break;
          case 'BR':
            nextDronePosition.x = 8800;
            nextDronePosition.y = 8800;
            break;
          case 'BL':
            nextDronePosition.x = 1800;
            nextDronePosition.y = 8800;
            break;
          default:
            break;
        }
        return nextDronePosition;
      }

    getDirectionDensity() {
        const directionCount: Record<string, number> = {};
        this.radar.forEach( blip => {
            let allCreaturesScanned = this.game.creatureScannedIds;
            allCreaturesScanned.push(...this.creaturesScanned);
            if( !allCreaturesScanned.includes(blip.creatureId) ) {
                const { direction } = blip;
                if (directionCount[direction]) {
                directionCount[direction]++;
                } else {
                directionCount[direction] = 1;
                }
            }
        })
        return directionCount;
    }
    findClosestCreature(creatures: Map<number, Creature>): Creature | null {
        let closestCreature: Creature | null = null;
        let closestDistance = Number.MAX_VALUE;

        for (const [_, creature] of creatures) {
            if (creature.creatureX !== undefined && creature.creatureY !== undefined) {
                const distance = calculateDistance(this.position, {x: creature.creatureX, y: creature.creatureY });
                if (distance < closestDistance) {
                    closestDistance = distance;
                    closestCreature = creature;
                }
            }
        }

        return closestCreature;
    }

    
    buildListOfCreaturesToHunt() {
        this.creaturesToHunt.clear();
        let allCreaturesScanned = this.game.creatureScannedIds;
        allCreaturesScanned.push(...this.creaturesScanned)
        this.game.creatures.forEach( c => {
            if(c.creatureX && !allCreaturesScanned.includes(c.creatureId)) {
                this.creaturesToHunt.set(c.creatureId, c);
            }
        })
    }


}