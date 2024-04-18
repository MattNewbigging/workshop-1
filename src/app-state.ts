import { GameState } from "./game-state";

export class AppState {
  gameState?: GameState;

  constructor() {
    // Give loading UI time to mount
    setTimeout(() => this.startGame(), 10);
  }

  private startGame = () => {
    this.gameState = new GameState();
  };
}
