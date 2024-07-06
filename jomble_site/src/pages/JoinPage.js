import React, { useState, useEffect, useContext } from "react";
import { WebSocketContext } from '../WebSocketContext';

export default function JoinPage() {
    const { connected, sessionId, joinSession, setMessage, sendMessage, messages, players, error } = useContext(WebSocketContext);
    const [localSessionId, setLocalSessionId] = useState('');

    if (connected) {
        return;
    }

    const handleJoin = () => {
        joinSession(localSessionId);
    };


    return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
        <div className="flex flex-col items-center">
        <h1 className="text-2xl font-bold mb-4">Join Game Session</h1>
        {error && <div className="text-red-500 mb-4">{error}</div>}
        <input
            type="text"
            value={localSessionId}
            onChange={(e) => setLocalSessionId(e.target.value)}
            placeholder="Session ID"
            className="p-2 border border-gray-300 rounded-md mb-2"
        />
        <button
            onClick={handleJoin}
            className="p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
        >
            Join
        </button>
        </div>
    </div>
    );
}
