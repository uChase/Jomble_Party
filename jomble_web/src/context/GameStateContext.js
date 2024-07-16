import React, { createContext, useState, useEffect, useRef } from "react";


export const GameStateContext = createContext();

function GameStateContextProvider({ children }) {
  const [gameState, setGameState] = useState("lobby");


  return (
    <GameStateContext.Provider value={{gameState}}>
        {children}
    </GameStateContext.Provider>
  )
}

export default GameStateContextProvider