import { Game } from "./game";

let game: Game = new Game();
game.parseSetupInput();

// game loop
while (true) {

    game.parseGameState();
    game.printGameState();
    game.update();
    game.printAction();
}



