import { Creature } from "./creatures";
import { Drone } from "./drone";

export class Game {
    creatureCount: number;
    creatures: Map<number, Creature> = new Map();
    score: number;
    foeScore: number;
    myScanCount: number;
    creatureScannedIds: number[];
    foeScanCount: number;
    foeScannedIds: number[];
    myDroneCount: number;
    myDrone: Map<number, Drone> = new Map();
    foeDroneCount: number;
    foeDrone: Drone[];
    droneScanCount: number;
    droneScan: Drone[];
    radarBlipCount: number;
    radarBlip: Map<number, RadarBlip> = new Map();

    printGameState() {
        console.error("My Drones:", this.myDrone);

        console.error("Creature Count:", this.creatureCount);
        console.error("Creatures:", this.creatures);
        // console.error("Score:", this.score);
        // console.error("Foe Score:", this.foeScore);
        console.error("My Scan Count:", this.myScanCount);
        console.error("Creature Scanned IDs:", this.creatureScannedIds);
        // console.error("Foe Scan Count:", this.foeScanCount);
        // console.error("Foe Scanned IDs:", this.foeScannedIds);
        // console.error("My Drone Count:", this.myDroneCount);
        
        // console.error("Foe Drone Count:", this.foeDroneCount);
        // console.error("Foe Drones:", this.foeDrone);
        // console.error("Drone Scan Count:", this.droneScanCount);
        // console.error("Drone Scan:", this.droneScan);
        console.error("Radar Blip Count:", this.radarBlipCount);
        console.error("Radar Blip IDs:", Array.from(this.radarBlip.keys()));

    }

    parseSetupInput() {

        this.creatureCount = parseInt(readline());
        for (let i = 0; i < this.creatureCount; i++) {
            var inputs: string[] = readline().split(' ');
            const creatureId: number = parseInt(inputs[0]);
            const color: number = parseInt(inputs[1]);
            const type: number = parseInt(inputs[2]);
            let creature: Creature = {
                creatureId, color, type 
            }
            this.creatures.set(creatureId,creature);
        }
    }
    parseGameState() {
        this.score = parseInt(readline());
        this.foeScore = parseInt(readline());
        this.myScanCount = parseInt(readline());
        this.creatureScannedIds = []
        for (let i = 0; i < this.myScanCount; i++) {
            const creatureId: number = parseInt(readline());
            this.creatureScannedIds.push(creatureId);
        }
        this.foeScanCount = parseInt(readline());
        this.foeScannedIds = [];
        for (let i = 0; i < this.foeScanCount; i++) {
            const creatureId: number = parseInt(readline());
            this.foeScannedIds.push(creatureId);
        }
        this.myDroneCount = parseInt(readline());
        this.updateDroneState()
        this.foeDroneCount = parseInt(readline());
        this.foeDrone = [];
        for (let i = 0; i < this.foeDroneCount; i++) {
            var inputs: string[] = readline().split(' ');
            const droneId: number = parseInt(inputs[0]);
            const droneX: number = parseInt(inputs[1]);
            const droneY: number = parseInt(inputs[2]);
            const emergency: number = parseInt(inputs[3]);
            const battery: number = parseInt(inputs[4]);
            let drone = new Drone(
                droneId,
                {
                    x: droneX,
                    y: droneY
                },
                battery,
                emergency
            )
            this.foeDrone.push(drone);
        }
        this.droneScanCount = parseInt(readline());
        this.droneScan = [];
        for (let i = 0; i < this.droneScanCount; i++) {
            var inputs: string[] = readline().split(' ');
            const droneId: number = parseInt(inputs[0]);
            const creatureId: number = parseInt(inputs[1]);
        }
        const visibleCreatureCount: number = parseInt(readline());
        for (let i = 0; i < visibleCreatureCount; i++) {
            var inputs: string[] = readline().split(' ');
            const creatureId: number = parseInt(inputs[0]);
            const creatureX: number = parseInt(inputs[1]);
            const creatureY: number = parseInt(inputs[2]);
            const creatureVx: number = parseInt(inputs[3]);
            const creatureVy: number = parseInt(inputs[4]);
            if(this.creatures.has(creatureId)) {
                let creature = this.creatures.get(creatureId);
                creature = {
                    ...creature!,
                    creatureX,
                    creatureY,
                    creatureVx,
                    creatureVy
                }
                this.creatures.set(creatureId, creature);
            } else {
                // No creature found ????
                console.error("No creature found...")
            }
        }
        this.radarBlipCount = parseInt(readline());
        this.radarBlip.clear();
        for (let i = 0; i < this.radarBlipCount; i++) {
            var inputs: string[] = readline().split(' ');
            const droneId: number = parseInt(inputs[0]);
            const creatureId: number = parseInt(inputs[1]);
            const radar: string = inputs[2];
        }
    }

    update() {
        for (let i = 0; i < game.myDroneCount; i++) {
            this.myDrone.get(i)!.update(this);
        }
    }
    printAction(i: number) {
        if(i<this.myDroneCount) {
            console.log(this.myDrone.get(i)!.nextAction); 
        }        // MOVE <x> <y> <light (1|0)> | WAIT <light (1|0)>
    }

    updateDroneState() {
        // Update drones positions
        for (let i = 0; i < this.myDroneCount; i++) {
            var inputs: string[] = readline().split(' ');
            const droneId: number = parseInt(inputs[0]);
            const droneX: number = parseInt(inputs[1]);
            const droneY: number = parseInt(inputs[2]);
            const emergency: number = parseInt(inputs[3]);
            const battery: number = parseInt(inputs[4]);
            let newDrone: Drone = new Drone(
                droneId,
                {
                    x: droneX,
                    y: droneY
                },
                battery,
                emergency
            )
            if( !this.myDrone.has(droneId) ) {
                this.myDrone.set(droneId, newDrone);
            } else {
                let drone = this.myDrone.get(droneId)!;
                drone.position = {
                    x: droneX,
                    y: droneY
                };
                drone.emergency = emergency;
                drone.battery = battery;
            }
        }
    }

    
}

