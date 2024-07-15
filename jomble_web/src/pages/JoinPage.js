import React, { useState, useEffect, useContext } from "react";
import { NetworkContext } from "../context/NetworkContext";

export default function JoinPage() {
    const { socketConnected, rtcConnected, sessionId, error, joinSession, setError } = useContext(NetworkContext);
    const [localSessionId, setLocalSessionId] = useState('');
    const [localName, setLocalName] = useState('');

    if (rtcConnected) {
        return;
    }

    const handleJoin = () => {
        // // if (localSessionId.length !== 6) {
        // //     setError('Session ID must be 6 characters long');
        // //     return;
        // // }
        if (localName.length === 0) {
            setError('Name cannot be empty');
            return;
        }
        if (localName.length > 10) {
            setError('Name cannot be longer than 10 characters');
            return;
        }
        setError('');
        joinSession(localSessionId, localName);
    };


    return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-700">
        <div className="flex flex-col items-center">
        <h1 className="text-2xl font-bold mb-4 text-white">Join Game Session</h1>
        {error && <div className="text-red-500 mb-4">{error}</div>}
        <input
            type="text"
            value={localSessionId}
            onChange={(e) => setLocalSessionId(e.target.value)}
            placeholder="Session Code"
            className="p-2 border border-gray-300 rounded-md mb-2"
            maxLength={6}
        />
        <input
            type="text"
            value={localName}
            onChange={(e) => setLocalName(e.target.value)}
            placeholder="Name"
            className="p-2 border border-gray-300 rounded-md mb-2"
            maxLength={10}
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
