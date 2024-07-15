import GameStateContextProvider from "./context/GameStateContext";
import { NetworkContextProvider } from "./context/NetworkContext";
import { PlayerContextProvider } from "./context/PlayerContext";
import ChooseAvatar from "./pages/ChooseAvatar";
import GameManager from "./pages/GameManager";
import JoinPage from "./pages/JoinPage";
import React, { useState, useContext } from "react";

function App() {
  return (
    <NetworkContextProvider>
      <GameStateContextProvider>
        <JoinPage />
        <GameManager />
      </GameStateContextProvider>
    </NetworkContextProvider>
  );
}

export default App;
