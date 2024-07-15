import React, { createContext, useState, useEffect, useRef } from "react";


export const GameStateContext = createContext();

function GameStateContextProvider({ children }) {

  return (
    <GameStateContext.Provider value={{}}>
        {children}
    </GameStateContext.Provider>
  )
}

export default GameStateContextProvider