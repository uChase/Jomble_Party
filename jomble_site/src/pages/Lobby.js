import React, { useState, useEffect, useContext } from "react";
import { WebSocketContext } from '../WebSocketContext';


export default function Lobby() {
    const { connected, sessionId, joinSession, setMessage, sendMessage, messages, players, error } = useContext(WebSocketContext);
    const [localMessage, setLocalMessage] = useState('');
    if (!connected) {
        return;
    }
    
    return ( <div className="flex flex-col items-center">
        <h1 className="text-2xl font-bold mb-4">Game Session: {sessionId}</h1>
        <div className="flex mb-4">
            <input
                type="text"
                value={localMessage}
                onChange={(e) => setLocalMessage(e.target.value)}
                placeholder="Type your message here"
                className="p-2 border border-gray-300 rounded-l-md"
            />
            <button
                onClick={sendMessage}
                className="p-2 bg-blue-500 text-white rounded-r-md hover:bg-blue-600"
            >
                Send
            </button>
        </div>
        <ul className="list-none p-0 mb-4">
            {messages.map((msg, index) => (
                <li key={index} className="p-2 mb-2 bg-white border border-gray-200 rounded-md shadow-sm">
                    {msg}
                </li>
            ))}
        </ul>
        <h2 className="text-xl font-bold mb-2">Players</h2>
        <ul className="list-none p-0">
            {players.map((player, index) => (
                <li key={index} className="p-2 mb-2 bg-white border border-gray-200 rounded-md shadow-sm">
                    {player}
                </li>
            ))}
        </ul>
    </div>)
}