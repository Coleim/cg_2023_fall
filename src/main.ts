import { Game } from "./game";

let game: Game = new Game();
game.parseSetupInput();

// game loop
while (true) {

    game.parseGameState();
    game.printGameState();
    game.update(); 
    for (let i = 0; i < game.myDroneCount; i++) {
        game.printAction(i);
    }
}



