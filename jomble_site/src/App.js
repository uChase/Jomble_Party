import React, { useState, useEffect } from 'react';
import { getLocalStorage, setLocalStorage } from './helpers/local_storage';
import { closeWebSocket } from './helpers/socket_logic';
import JoinPage from './pages/JoinPage';
import Lobby from './pages/Lobby';
import { WebSocketProvider } from './WebSocketContext';


function App() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
            <WebSocketProvider >
                <JoinPage />
                <Lobby />
            </WebSocketProvider>
        </div>
    );
}

export default App;
