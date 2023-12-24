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
    message: string;

    nextAction: string = "";
    nextLight: boolean = false;
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
        this.message = "";
        
        // MOVE <x> <y> <light (1|0)>
        // WAIT <light (1|0)>

        console.error(">>>>>>>>>>>> [", this.droneId , "] >>>>>>>>> ")
        console.error("[", this.droneId , "] >>>> BEFORE UPDATE ", this.destination)
        console.error("[", this.droneId , "] >>>> >>>> DEST ", this.destination)
        console.error("[", this.droneId , "] >>>> >>>> STATE ", this.state)

        if(this.destination && this.destination.x === this.position.x && this.destination.y === this.position.y) {
            this.destination = undefined;
        }

        this.state = DroneState.SEARCH;
        
        // console.error("[", this.droneId , "] >>>> >>>> CREATURE TO HUNT: ", this.game.creaturesToHunt)
        if(this.game.creaturesToHunt.size > 0) {
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
                    this.destination = new Point(this.position.x, game.surface)
                }
                break;
                case DroneState.SEARCH: {
                    this.destination = this.searchCreatures();
                }
                break;
                case DroneState.HUNT: {
                    let closestCreature = this.findClosestCreature(this.game.creaturesToHunt);
                    if(closestCreature) {
                        this.destination = new Point(closestCreature.creatureX!, closestCreature.creatureY!);
                    }
                }
                break;
            }
        }
    
        // Compute Path (avoid monsters etc...)
        let nextPosition = this.destination;

        // console.error("[", this.droneId , "] >>>> MONSTER TO AVOID ? ", this.game.monstersToAvoid)
        // console.error("[", this.droneId , "] >>>> MONSTER TO AVOID SIZE ? ", this.game.monstersToAvoid.size)
        if(this.game.monstersToAvoid.size !== 0) {
            let nextPosAlt = this.getNextPointToDestinationAvoidingCreatures(this.game.monstersToAvoid)
            console.error("[", this.droneId , "] >>>> ALTERNATE POSITION ", nextPosAlt)
        }

        
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

        console.error("[", this.droneId , "] >>>> AFTER UPDATE ", this.destination)
        console.error("[", this.droneId , "] >>>> >>>> DEST ", this.destination)
        console.error("[", this.droneId , "] >>>> >>>> STATE ", this.state)
    }




    searchCreatures(): Point {
        let nextPosition: Point = this.position;
        if(this.game.creaturesToHunt.size > 0) {
            let closestCreature = this.findClosestCreature(this.game.creaturesToHunt);
            if(closestCreature) {
                nextPosition = new Point(closestCreature.creatureX!, closestCreature.creatureY!);
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
                this.destination = new Point(this.position.x, this.game.surface);
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
                if(this.game.monsters.has(blip.creatureId)) {
                    // Build monster density ? Or not needed ?
                    console.error("[", this.droneId , "] >>>> >>>> IGNORE THIS ONE : ", blip)
                } else {
                    const { direction } = blip;
                    if (directionCount[direction]) {
                        directionCount[direction]++;
                    } else {
                        directionCount[direction] = 1;
                    }
                }
            }
        })
        console.error("[", this.droneId , "] >>>> >>>> DIRECTION COUNT : ", directionCount)
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


    getNextPointToDestinationAvoidingCreatures(monsters: Map<number, Creature>): Point {
        const distanceToDestination = Math.sqrt(
            Math.pow(this.destination!.x - this.position.x, 2) +
            Math.pow(this.destination!.y - this.position.y, 2)
        );

        const directionVector = {
            x: (this.destination!.x - this.position.x) / distanceToDestination,
            y: (this.destination!.y - this.position.y) / distanceToDestination
        };

        let closestApproachDistance = Infinity;

        monsters.forEach((creature) => {
            if(creature.creatureX) {
                const relativeX = creature.creatureX! - this.position.x;
                const relativeY = creature.creatureY! - this.position.y;
                const distanceToCreature = Math.sqrt(relativeX * relativeX + relativeY * relativeY);
    
                const monsterSpeed = 540; // Speed of monster per turn
                const monsterCylinderRadius = monsterSpeed * this.speed; // Cylinder radius based on monster's speed
    
                const distanceToCylinder = distanceToCreature - monsterCylinderRadius;
    
                if (distanceToCylinder < 0) {
                    // Drone is within the cylinder, adjust direction away from the cylinder
                    const awayFromCylinderX = this.position.x - creature.creatureX!;
                    const awayFromCylinderY = this.position.y - creature.creatureY!;
    
                    const distanceFromCylinder = Math.sqrt(
                        awayFromCylinderX * awayFromCylinderX + awayFromCylinderY * awayFromCylinderY
                    );
    
                    directionVector.x += awayFromCylinderX / distanceFromCylinder;
                    directionVector.y += awayFromCylinderY / distanceFromCylinder;
                } else {
                    // Calculate the closest distance the monster will approach to the drone
                    const timeToClosestApproach = distanceToCylinder / (monsterSpeed + this.speed);
    
                    // Find the closest approach distance among all monsters
                    closestApproachDistance = Math.min(closestApproachDistance, timeToClosestApproach);
    
                    if (timeToClosestApproach < distanceToDestination / this.speed) {
                        // If the closest approach happens before reaching the destination,
                        // adjust the direction away from the monster's future position
                        const futureMonsterX = creature.creatureX! + creature.creatureVx! * timeToClosestApproach;
                        const futureMonsterY = creature.creatureY! + creature.creatureVy! * timeToClosestApproach;
    
                        const awayFromMonsterX = this.position.x - futureMonsterX;
                        const awayFromMonsterY = this.position.y - futureMonsterY;
    
                        const distanceFromMonster = Math.sqrt(
                            awayFromMonsterX * awayFromMonsterX + awayFromMonsterY * awayFromMonsterY
                        );
    
                        directionVector.x += awayFromMonsterX / distanceFromMonster;
                        directionVector.y += awayFromMonsterY / distanceFromMonster;
                    }
                }
            }
        });

        // Normalize direction vector
        const directionMagnitude = Math.sqrt(directionVector.x * directionVector.x + directionVector.y * directionVector.y);
        directionVector.x /= directionMagnitude;
        directionVector.y /= directionMagnitude;

        const nextPoint: Point = {
            x: this.position.x + directionVector.x * this.speed * closestApproachDistance,
            y: this.position.y + directionVector.y * this.speed * closestApproachDistance
        };

        return nextPoint;
    }

    



}