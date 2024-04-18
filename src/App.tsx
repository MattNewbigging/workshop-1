import "./app.scss";

import React from "react";
import { observer } from "mobx-react-lite";

import { AppState } from "./app-state";
interface AppProps {
  appState: AppState;
}

export const App: React.FC<AppProps> = observer(({ appState }) => {
  console.log("score", appState.gameState?.score);

  return (
    <div id="canvas-root" className="app">
      <div className="score">Score: {appState.gameState?.score}</div>
    </div>
  );
});
