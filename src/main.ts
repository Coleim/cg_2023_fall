import { Game } from "./game";

let game: Game = new Game();
game.parseSetupInput();

// game loop
while (true) {

    game.parseGameState();
    
    for (let i = 0; i < 1; i++) {

        // Write an action using console.log()
        // To debug: console.error('Debug messages...');

        console.log('WAIT 1');         // MOVE <x> <y> <light (1|0)> | WAIT <light (1|0)>

    }
}



