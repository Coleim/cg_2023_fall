import { Creature } from "./creatures";
import { Drone } from "./drone";
import { Point } from "./point";
import { RadarBlip } from "./radarblip";


export class Game {
    surface = 500;
    mapSize = 10000;

    creatureCount: number;
    creatures: Map<number, Creature> = new Map();
    monsters: Map<number, Creature> = new Map();
    creaturesToHunt: Map<number, Creature> = new Map();
    monstersToAvoid: Map<number, Creature> = new Map();
        
    score: number;
    foeScore: number;
    myScanCount: number;
    creatureScannedIds: number[];
    foeScanCount: number;
    foeScannedIds: number[];
    myDroneCount: number;
    myDrones: Map<number, Drone> = new Map();
    foeDroneCount: number;
    foeDrone: Drone[];
    droneScanCount: number;
    droneScan: Drone[];
    radarBlipCount: number;
    radarBlip: Map<number, RadarBlip> = new Map();


    printGameState() {
        // console.error("My Drones:", this.myDrones);

        // console.error("Creature Count:", this.creatureCount);
        // console.error("Creatures:", this.creatures);
        // console.error(">>> MONSTERS:", this.monsters);
        // console.error("My Drones:", this.myDrones);
        // console.error("Score:", this.score);
        // console.error("Foe Score:", this.foeScore);
        // console.error("My Scan Count:", this.myScanCount);
        // console.error("Creature Scanned IDs:", this.creatureScannedIds);
        // console.error("Foe Scan Count:", this.foeScanCount);
        // console.error("Foe Scanned IDs:", this.foeScannedIds);
        // console.error("My Drone Count:", this.myDroneCount);
        
        // console.error("Foe Drone Count:", this.foeDroneCount);
        // console.error("Foe Drones:", this.foeDrone);
        // console.error("Drone Scan Count:", this.droneScanCount);
        // console.error("Drone Scan:", this.droneScan);
        // console.error("Radar Blip Count:", this.radarBlipCount);
        // console.error("Radar Blip:", this.radarBlip);

    }

    parseSetupInput() {

        // @ts-ignore
        this.creatureCount = parseInt(readline());
        for (let i = 0; i < this.creatureCount; i++) {
            // @ts-ignore
            var inputs: string[] = readline().split(' ');
            const creatureId: number = parseInt(inputs[0]);
            const color: number = parseInt(inputs[1]);
            const type: number = parseInt(inputs[2]);
            let creature: Creature = {
                creatureId, color, type 
            }
            if(type === -1) {
                this.monsters.set(creatureId,creature);
            } else {
                this.creatures.set(creatureId,creature);
            }
        }
    }
    parseGameState() {
        // @ts-ignore
        this.score = parseInt(readline());
        // @ts-ignore
        this.foeScore = parseInt(readline());
        // @ts-ignore
        this.myScanCount = parseInt(readline());
        this.creatureScannedIds = []
        for (let i = 0; i < this.myScanCount; i++) {
            // @ts-ignore
            const creatureId: number = parseInt(readline());
            this.creatureScannedIds.push(creatureId);
        }
        // @ts-ignore
        this.foeScanCount = parseInt(readline());
        this.foeScannedIds = [];
        for (let i = 0; i < this.foeScanCount; i++) {
            // @ts-ignore
            const creatureId: number = parseInt(readline());
            this.foeScannedIds.push(creatureId);
        }

        // @ts-ignore
        this.myDroneCount = parseInt(readline());
        this.updateDroneState()

        // @ts-ignore
        this.foeDroneCount = parseInt(readline());
        this.foeDrone = [];
        for (let i = 0; i < this.foeDroneCount; i++) {
            // @ts-ignore
            var inputs: string[] = readline().split(' ');
            const droneId: number = parseInt(inputs[0]);
            const droneX: number = parseInt(inputs[1]);
            const droneY: number = parseInt(inputs[2]);
            const emergency: number = parseInt(inputs[3]);
            const battery: number = parseInt(inputs[4]);
            let drone = new Drone(
                droneId,
                new Point(droneX, droneY),
                battery,
                emergency
            )
            this.foeDrone.push(drone);
        }
        // @ts-ignore
        this.droneScanCount = parseInt(readline());
        this.droneScan = [];
        for (let i = 0; i < this.droneScanCount; i++) {
            // @ts-ignore
            var inputs: string[] = readline().split(' ');
            const droneId: number = parseInt(inputs[0]);
            const creatureId: number = parseInt(inputs[1]);
            this.myDrones.get(droneId)?.creaturesScanned.push(creatureId);
        }
        // @ts-ignore
        const visibleCreatureCount: number = parseInt(readline());
        for (let i = 0; i < visibleCreatureCount; i++) {
            // @ts-ignore
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
                // It's a monster !
                if(this.monsters.has(creatureId)) {
                    let monster = this.monsters.get(creatureId);
                    monster = {
                        ...monster!,
                        creatureX,
                        creatureY,
                        creatureVx,
                        creatureVy
                    }
                    this.monsters.set(creatureId, monster);
                } else {
                    console.error(" !!!!!!!!!!!!!!!!!!!!!!!!!!!!! No creature found... !!!!!!!!!!!!!!!!!!!!!!!! ")
                }
            }
        }
        // Build list of creatures not scanned
        this.buildListOfCreaturesToHunt()
        this.buildListOfMonstersToAvoid()
        
        // @ts-ignore
        this.radarBlipCount = parseInt(readline());
        this.radarBlip.clear();
        for (let i = 0; i < this.radarBlipCount; i++) {
            // @ts-ignore
            var inputs: string[] = readline().split(' ');
            const droneId: number = parseInt(inputs[0]);
            const creatureId: number = parseInt(inputs[1]);
            const radar: string = inputs[2];
            let blip = {
                creatureId,
                direction: radar
            }
            this.radarBlip.set(creatureId, blip)
            this.myDrones.get(droneId)?.radar.push(blip)
        }
    }

    update() {
        this.myDrones.forEach( drone => {
            drone.update(this);
        })
    }
    printAction() {
        this.myDrones.forEach( drone => {
            console.log(drone.nextAction);
        })
    }

    updateDroneState() {
        // Update drones positions
        for (let i = 0; i < this.myDroneCount; i++) {
            // @ts-ignore
            var inputs: string[] = readline().split(' ');
            const droneId: number = parseInt(inputs[0]);
            const droneX: number = parseInt(inputs[1]);
            const droneY: number = parseInt(inputs[2]);
            const emergency: number = parseInt(inputs[3]);
            const battery: number = parseInt(inputs[4]);
            let newDrone: Drone = new Drone(
                droneId,
                new Point(droneX, droneY),
                battery,
                emergency
            )
            if( !this.myDrones.has(droneId) ) {
                this.myDrones.set(droneId, newDrone);
            } else {
                let drone = this.myDrones.get(droneId)!;
                drone.position = new Point(droneX, droneY);
                drone.emergency = emergency;
                drone.battery = battery;
                drone.creaturesScanned = [];
                drone.radar = [];
            }
        }
    }


    buildListOfCreaturesToHunt() {
        this.creaturesToHunt.clear();
        let allCreaturesScanned = this.creatureScannedIds;
        this.myDrones.forEach( drone => {
            allCreaturesScanned.push(...drone.creaturesScanned);
        })
        this.creatures.forEach( c => {
            if(c.creatureX && !allCreaturesScanned.includes(c.creatureId)) {
                this.creaturesToHunt.set(c.creatureId, c);
            }
        })
    }

    buildListOfMonstersToAvoid() {
        this.monstersToAvoid.clear();
        this.monsters.forEach( c => {
            if(c.creatureX) {
                this.monstersToAvoid.set(c.creatureId, c);
            }
        })

    }

    
}

