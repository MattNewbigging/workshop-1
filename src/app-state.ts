import { makeAutoObservable, observable } from "mobx";
import { GameState } from "./game-state";

export class AppState {
  @observable gameState?: GameState;

  constructor() {
    makeAutoObservable(this);

    // Give loading UI time to mount
    setTimeout(() => this.startGame(), 10);
  }

  private startGame = () => {
    this.gameState = new GameState();
  };
}
