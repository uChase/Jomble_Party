import { NetworkContextProvider } from "./context/NetworkContext";
import JoinPage from "./pages/JoinPage";
import React, {useState, useContext} from "react";

function App() {
  return (
    <NetworkContextProvider>
      <JoinPage />
    </NetworkContextProvider>
  );
}

export default App;
